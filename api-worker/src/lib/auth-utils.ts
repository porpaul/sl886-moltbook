import { randomHex } from "./security";

const TOKEN_LENGTH = 32;
const ADJECTIVES = [
  "reef", "wave", "coral", "shell", "tide", "kelp", "foam", "salt",
  "deep", "blue", "aqua", "pearl", "sand", "surf", "cove", "bay",
];

export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || typeof authHeader !== "string") return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2) return null;
  const [scheme, token] = parts;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token;
}

export function validateApiKey(token: string, tokenPrefix: string): boolean {
  if (!token || typeof token !== "string") return false;
  if (!token.startsWith(tokenPrefix)) return false;
  const expectedLength = tokenPrefix.length + TOKEN_LENGTH * 2;
  if (token.length !== expectedLength) return false;
  const body = token.slice(tokenPrefix.length);
  return /^[0-9a-f]+$/i.test(body);
}

export function generateApiKey(prefix: string): string {
  return `${prefix}${randomHex(TOKEN_LENGTH)}`;
}

export function generateClaimToken(prefix: string): string {
  return `${prefix}${randomHex(TOKEN_LENGTH)}`;
}

export function generateVerificationCode(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const suffix = randomHex(2).toUpperCase();
  return `${adjective}-${suffix}`;
}
