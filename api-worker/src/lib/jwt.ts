/**
 * Minimal HS256 JWT sign/verify using Web Crypto for email magic links.
 * Payload: { claimToken: string; email: string; exp: number; iat?: number }
 */

function base64UrlEncode(bytes: ArrayBuffer): string {
  const b = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < b.length; i++) binary += String.fromCharCode(b[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4;
  if (pad) str += "=".repeat(4 - pad);
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export interface EmailClaimJwtPayload {
  claimToken: string;
  email: string;
  exp: number;
  iat?: number;
}

export async function signEmailClaimJwt(
  secret: string,
  payload: Omit<EmailClaimJwtPayload, "exp" | "iat">,
  expiresInSeconds: number
): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload = { ...payload, iat, exp };
  const headerB64 = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(header))
  );
  const payloadB64 = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(fullPayload))
  );
  const message = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return `${message}.${base64UrlEncode(sig)}`;
}

export async function verifyEmailClaimJwt(
  secret: string,
  token: string
): Promise<EmailClaimJwtPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  const [, payloadB64, sigB64] = parts;
  const message = `${parts[0]}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sigBytes = base64UrlDecode(sigB64);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(message)
  );
  if (!valid) throw new Error("Invalid JWT signature");
  const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
  const payload = JSON.parse(payloadJson) as EmailClaimJwtPayload & { iat?: number };
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("JWT expired");
  }
  if (!payload.claimToken || !payload.email) {
    throw new Error("Missing claimToken or email in JWT");
  }
  return {
    claimToken: payload.claimToken,
    email: payload.email,
    exp: payload.exp,
    iat: payload.iat,
  };
}
