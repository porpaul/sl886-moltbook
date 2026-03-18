/**
 * Send transactional email from the Worker.
 * - If env has SL886_EMAIL_API_URL + SL886_EMAIL_API_TOKEN: use SL886 website API (recommended).
 * - Else if env has SMTP_HOST + SMTP_USER + SMTP_PASS: use SMTP (e.g. same as Yii2 mailer).
 * - Else: use MailChannels API (requires Domain Lockdown DNS for sender domain).
 */

import type { Env } from "../types";

const MAILCHANNELS_API = "https://api.mailchannels.net/tx/v1/send";

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  fromEmail?: string;
  fromName?: string;
}

const DEFAULT_FROM = "noreply@sl886.com";
const DEFAULT_FROM_NAME = "SL886 Moltbook";

function useSl886Api(env: Env): boolean {
  return !!(env.SL886_EMAIL_API_URL && env.SL886_EMAIL_API_TOKEN);
}

async function sendViaSl886Api(
  env: Env,
  options: SendEmailOptions
): Promise<void> {
  const base = (env.SL886_EMAIL_API_URL ?? "").replace(/\/+$/, "");
  const url = `${base}/api/moltbook-send-email`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Moltbook-Email-Token": env.SL886_EMAIL_API_TOKEN ?? "",
    },
    body: JSON.stringify({
      to: options.to,
      subject: options.subject,
      text: options.text,
      fromEmail: options.fromEmail ?? DEFAULT_FROM,
      fromName: options.fromName ?? DEFAULT_FROM_NAME,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SL886 send-email API failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { success?: boolean; message?: string };
  if (data.success === false) {
    throw new Error(
      data.message ? `SL886 API: ${data.message}` : "SL886 send-email failed"
    );
  }
}

function useSmtp(env: Env): boolean {
  return !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

async function sendViaSmtp(env: Env, options: SendEmailOptions): Promise<void> {
  const { WorkerMailer } = await import("worker-mailer");
  const fromEmail = options.fromEmail ?? DEFAULT_FROM;
  const fromName = options.fromName ?? DEFAULT_FROM_NAME;
  const port = env.SMTP_PORT ? parseInt(env.SMTP_PORT, 10) : 587;
  await WorkerMailer.send(
    {
      host: env.SMTP_HOST!,
      port,
      secure: port === 465,
      startTls: port === 587,
      credentials: {
        username: env.SMTP_USER!,
        password: env.SMTP_PASS!,
      },
      authType: "plain",
    },
    {
      from: { name: fromName, email: fromEmail },
      to: options.to,
      subject: options.subject,
      text: options.text,
    }
  );
}

async function sendViaMailChannels(options: SendEmailOptions): Promise<void> {
  const fromEmail = options.fromEmail ?? DEFAULT_FROM;
  const fromName = options.fromName ?? DEFAULT_FROM_NAME;
  const res = await fetch(MAILCHANNELS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: options.to }] }],
      from: { email: fromEmail, name: fromName },
      subject: options.subject,
      content: [{ type: "text/plain", value: options.text }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MailChannels send failed: ${res.status} ${text}`);
  }
}

/** True if the error indicates SMTP/TCP is unavailable (e.g. Cloudflare Workers cannot open SMTP sockets). */
function isSmtpConnectionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return (
    /proxy request failed|cannot connect to the specified address|connection refused|ECONNREFUSED|socket|network/i.test(msg)
  );
}

/**
 * Send email. Prefers SL886 API when SL886_EMAIL_API_URL and SL886_EMAIL_API_TOKEN are set;
 * else uses SMTP when env has SMTP_*; otherwise MailChannels.
 * On Cloudflare Workers, SMTP is not supported; we fall back to MailChannels if SMTP fails.
 */
export async function sendEmail(
  env: Env,
  options: SendEmailOptions
): Promise<void> {
  if (useSl886Api(env)) {
    await sendViaSl886Api(env, options);
    return;
  }
  if (useSmtp(env)) {
    try {
      await sendViaSmtp(env, options);
      return;
    } catch (err) {
      if (isSmtpConnectionError(err)) {
        await sendViaMailChannels(options);
        return;
      }
      throw err;
    }
  }
  await sendViaMailChannels(options);
}
