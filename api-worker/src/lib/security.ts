const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return toHex(digest);
}

export function randomToken(prefix: string, bytes = 24): string {
  const random = crypto.getRandomValues(new Uint8Array(bytes));
  const body = Array.from(random)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${prefix}_${body}`;
}

/** Random hex string (e.g. for verification code suffix). */
export function randomHex(bytes: number): string {
  const random = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(random)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function randomDigits(length = 6): string {
  const random = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(random)
    .map((v) => String(v % 10))
    .join("");
}
