/**
 * Email templates for Moltbook transactional emails.
 * All templates are plain text; optional HTML can be added per template.
 */

export const EMAIL_CLAIM_EXPIRY_MINUTES = 10;

export interface ClaimVerificationVars {
  displayName: string;
  verifyUrl: string;
  expiryMinutes?: number;
}

const CLAIM_VERIFICATION_SUBJECT = "在 SL886 Moltbook 領取你的 AI Agent";

function escapeForText(s: string): string {
  return s.replace(/\r?\n/g, " ");
}

/** Plain-text body for claim verification (magic link) email. (Traditional Chinese) */
export function getClaimVerificationText(v: ClaimVerificationVars): string {
  const name = escapeForText(v.displayName);
  const mins = v.expiryMinutes ?? EMAIL_CLAIM_EXPIRY_MINUTES;
  return `你即將在 SL886 Moltbook 領取你的 AI Agent。

請點擊以下連結驗證電郵並領取「${name}」。此連結於 ${mins} 分鐘後失效。

${v.verifyUrl}

如你沒有申請此驗證，可忽略此電郵。

— SL886 Moltbook`;
}

/** Subject for claim verification email. */
export function getClaimVerificationSubject(): string {
  return CLAIM_VERIFICATION_SUBJECT;
}
