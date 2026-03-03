/**
 * Send transactional email from the Worker.
 * - If env has SMTP_HOST + SMTP_USER + SMTP_PASS: use SMTP (e.g. same as Yii2 mailer).
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

/**
 * Send email. Uses SMTP when env.SMTP_HOST, env.SMTP_USER, and env.SMTP_PASS are set;
 * otherwise uses MailChannels (requires Domain Lockdown for sender domain).
 */
export async function sendEmail(
  env: Env,
  options: SendEmailOptions
): Promise<void> {
  if (useSmtp(env)) {
    await sendViaSmtp(env, options);
  } else {
    await sendViaMailChannels(options);
  }
}
