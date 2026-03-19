/**
 * Send transactional email from the Worker.
 * - If env has RESEND_API_KEY: use Resend (recommended).
 * - Else if env has SL886_EMAIL_API_URL + SL886_EMAIL_API_TOKEN: use SL886 website API.
 * - Else if env has SMTP_HOST + SMTP_USER + SMTP_PASS: use SMTP (e.g. same as Yii2 mailer).
 * - Else: use MailChannels API (requires Domain Lockdown DNS for sender domain).
 */

import { Resend } from "resend";
import type { Env } from "../types";

const MAILCHANNELS_API = "https://api.mailchannels.net/tx/v1/send";

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  fromEmail?: string;
  fromName?: string;
}

/** Must match SL886/Aliyun auth (no-reply@mail.sl886.com). */
const DEFAULT_FROM = "no-reply@mail.sl886.com";
const DEFAULT_FROM_NAME = "SL886 Moltbook";

function useResend(env: Env): boolean {
  return !!env.RESEND_API_KEY;
}

async function sendViaResend(
  env: Env,
  options: SendEmailOptions
): Promise<void> {
  const apiKey = env.RESEND_API_KEY!;
  const resend = new Resend(apiKey);
  const fromEmail = options.fromEmail ?? env.RESEND_FROM_EMAIL ?? DEFAULT_FROM;
  const fromName = options.fromName ?? env.RESEND_FROM_NAME ?? DEFAULT_FROM_NAME;
  const from = `${fromName} <${fromEmail}>`;

  const { data, error } = await resend.emails.send({
    from,
    to: [options.to],
    subject: options.subject,
    text: options.text,
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
  if (!data?.id) {
    throw new Error("Resend send returned no id");
  }
}

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
      "Accept": "application/json",
      "Content-Type": "application/json",
      "User-Agent": "MoltbookApiWorker/1.0",
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
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`SL886 send-email API failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) {
    throw new Error(
      `SL886 API returned non-JSON (e.g. HTML): ${res.status} ${trimmed.slice(0, 120)}`
    );
  }
  let data: { success?: boolean; message?: string };
  try {
    data = JSON.parse(trimmed) as { success?: boolean; message?: string };
  } catch {
    throw new Error(`SL886 API invalid JSON: ${trimmed.slice(0, 120)}`);
  }
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
 * Send email. Prefers Resend when RESEND_API_KEY is set; then SL886 API; then SMTP; else MailChannels.
 * On Cloudflare Workers, SMTP is not supported; we fall back to MailChannels if SMTP fails.
 */
export async function sendEmail(
  env: Env,
  options: SendEmailOptions
): Promise<void> {
  if (useResend(env)) {
    await sendViaResend(env, options);
    return;
  }
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
