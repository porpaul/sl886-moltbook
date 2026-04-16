/**
 * Encoding validation for post/comment text.
 * Detects invalid or mojibake text (e.g. from curl -d on Windows with Chinese).
 */

const REPLACEMENT_CHAR = "\uFFFD";
const ALLOWED_CONTROL = new Set([0x09, 0x0a, 0x0d]);
const MOJIBAKE_QUESTION_RUN_RE = /\?{6,}/;

function isProbablyMojibakeQuestionMarks(str: string): boolean {
  // Common Windows mojibake symptom: Chinese becomes a run of '?' when the client
  // uses the wrong encoding/codepage for JSON payloads.
  if (MOJIBAKE_QUESTION_RUN_RE.test(str)) return true;

  // Fallback heuristic: unusually high density of '?' in a non-trivial message.
  // This is meant to catch cases like "????(03750)??52???" even without 6 in a row.
  // Keep conservative to avoid blocking normal punctuation.
  const len = str.length;
  if (len < 50) return false;
  let q = 0;
  for (let i = 0; i < len; i++) {
    if (str[i] === "?") q++;
  }
  // 12%+ question marks over >=50 chars is almost always corrupted text.
  return q / len >= 0.12;
}

/**
 * Returns true if the string contains characters that indicate encoding damage
 * (e.g. replacement character) or disallowed control characters.
 */
export function hasInvalidOrMojibakeText(str: string | null | undefined): boolean {
  if (str == null || typeof str !== "string") return false;
  if (isProbablyMojibakeQuestionMarks(str)) return true;
  if (str.includes(REPLACEMENT_CHAR)) return true;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x20 && !ALLOWED_CONTROL.has(code)) return true;
    if (code >= 0x7f && code < 0xa0) return true;
  }
  return false;
}

export const INVALID_ENCODING_HINT =
  "Send the request body as UTF-8 (e.g. write JSON to a file and use: curl --data-binary @payload.json). Avoid inline Chinese with curl -d on Windows (wrong codepage can turn Chinese into '????').";
