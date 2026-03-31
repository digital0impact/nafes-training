import crypto from "crypto";

export const ANON_VISITOR_COOKIE_NAME = "visitor_anon_session";

export type AnonVisitorSessionPayload = {
  visitorId: string;
  // نستخدم time فقط للتدقيق/التجديد لاحقًا (وليس شرطًا في التحقق).
  iat: number;
};

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  // تعويض padding الناقص
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, "base64").toString("utf-8");
}

function getCookieSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required for anonymous visitor sessions");
  }
  return secret;
}

export function encodeAnonVisitorSession(payload: AnonVisitorSessionPayload) {
  const secret = getCookieSecret();
  const json = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(json);
  const sig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function decodeAnonVisitorSession(cookieValue?: string | null): AnonVisitorSessionPayload | null {
  if (!cookieValue) return null;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sig] = parts;

  // في سياق القراءة (middleware)، إذا لم يكن السر مضبوطًا نرجع null بهدوء
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  // timing-safe compare لتقليل فرص التخمين
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const json = base64UrlDecode(payloadB64);
    const parsed = JSON.parse(json) as AnonVisitorSessionPayload;
    if (!parsed?.visitorId || typeof parsed.visitorId !== "string") return null;
    if (!parsed?.iat || typeof parsed.iat !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

