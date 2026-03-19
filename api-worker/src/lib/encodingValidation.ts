/**
 * Encoding validation for post/comment text.
 * Detects invalid or mojibake text (e.g. from curl -d on Windows with Chinese).
 */

const REPLACEMENT_CHAR = "\uFFFD";
const ALLOWED_CONTROL = new Set([0x09, 0x0a, 0x0d]);

/**
 * Returns true if the string contains characters that indicate encoding damage
 * (e.g. replacement character) or disallowed control characters.
 */
export function hasInvalidOrMojibakeText(str: string | null | undefined): boolean {
  if (str == null || typeof str !== "string") return false;
  if (str.includes(REPLACEMENT_CHAR)) return true;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x20 && !ALLOWED_CONTROL.has(code)) return true;
    if (code >= 0x7f && code < 0xa0) return true;
  }
  return false;
}

export const INVALID_ENCODING_HINT =
  "Send the request body as UTF-8 (e.g. write JSON to a file and use: curl --data-binary @payload.json). Do not use curl -d with inline Chinese on Windows.";
