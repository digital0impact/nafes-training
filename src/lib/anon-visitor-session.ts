/**
 * جلسة زائر مجهولة موقّعة — بدون `node:crypto` أو `Buffer`
 * حتى يعمل الاستيراد في Edge Runtime (middleware) وفي Node (API routes).
 */

export const ANON_VISITOR_COOKIE_NAME = "visitor_anon_session";

export type AnonVisitorSessionPayload = {
  visitorId: string;
  iat: number;
};

function utf8ToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToUtf8(b64url: string): string {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const binary = atob(b64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)!;
  return new TextDecoder().decode(bytes);
}

async function hmacSha256Base64Url(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const out = new Uint8Array(sig);
  let binary = "";
  for (let i = 0; i < out.length; i++) binary += String.fromCharCode(out[i]!);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function getCookieSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required for anonymous visitor sessions");
  }
  return secret;
}

export async function encodeAnonVisitorSession(
  payload: AnonVisitorSessionPayload,
): Promise<string> {
  const secret = getCookieSecret();
  const json = JSON.stringify(payload);
  const payloadB64 = utf8ToBase64Url(json);
  const sig = await hmacSha256Base64Url(secret, payloadB64);
  return `${payloadB64}.${sig}`;
}

export async function decodeAnonVisitorSession(
  cookieValue?: string | null,
): Promise<AnonVisitorSessionPayload | null> {
  if (!cookieValue) return null;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sig] = parts;
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  const expectedSig = await hmacSha256Base64Url(secret, payloadB64);
  if (sig !== expectedSig) return null;

  try {
    const json = base64UrlToUtf8(payloadB64);
    const parsed = JSON.parse(json) as AnonVisitorSessionPayload;
    if (!parsed?.visitorId || typeof parsed.visitorId !== "string") return null;
    if (!parsed?.iat || typeof parsed.iat !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}
