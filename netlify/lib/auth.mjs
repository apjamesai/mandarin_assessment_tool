// Shared helpers for magic-link tokens and user indexing across functions.
//
// Token shape: <base64url(payload-json)>.<base64url(hmac-sha256-of-payload)>
// Payload: { iss, sub, email, exp }   (exp is unix-ms)
//
// Verification is constant-time (timingSafeEqual) and checks issuer + expiry.
// User-index keys are derived with a static-pepper HMAC so two installs of the
// same code don't accidentally share user identities.

import { createHmac, timingSafeEqual } from "node:crypto";

export const TOKEN_ISSUER = "mandarin-assessment";
export const USER_INDEX_PEPPER = "mandarin-user-index-v1";

function b64urlEncode(buf) {
  return Buffer.from(buf).toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s) {
  s = String(s).replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

export function signToken(payload, secret) {
  const body = b64urlEncode(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = createHmac("sha256", secret).update(body).digest();
  return body + "." + b64urlEncode(sig);
}

export function verifyToken(token, secret) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2) throw new Error("Malformed token");
  const [body, sig] = parts;
  const expected = createHmac("sha256", secret).update(body).digest();
  const actual = b64urlDecode(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error("Bad signature");
  }
  let payload;
  try { payload = JSON.parse(b64urlDecode(body).toString("utf8")); }
  catch { throw new Error("Bad payload"); }
  if (payload.iss && payload.iss !== TOKEN_ISSUER) throw new Error("Wrong issuer");
  if (payload.exp && Date.now() > payload.exp) throw new Error("Expired");
  return payload;
}

export function normaliseEmail(email) {
  return String(email || "").toLowerCase().trim();
}

export function userIndexKey(email) {
  const norm = normaliseEmail(email);
  if (!norm) return null;
  const hex = createHmac("sha256", USER_INDEX_PEPPER).update(norm).digest("hex");
  return `users/${hex}.json`;
}

export function mintUserMagicToken(email, secret, ttlDays = 30) {
  const exp = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
  return signToken({ iss: TOKEN_ISSUER, sub: "user", email: normaliseEmail(email), exp }, secret);
}

export function requireMagicLinkSecret() {
  const s = Netlify.env.get("MAGIC_LINK_SECRET");
  if (!s) throw new Error("Server missing MAGIC_LINK_SECRET");
  return s;
}

// Bearer-token extraction. Also accepts ?token=<…> for convenience because
// magic links land on user pages via querystring.
export function readBearer(req) {
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (m) return m[1].trim();
  try {
    const url = new URL(req.url);
    const t = url.searchParams.get("token");
    if (t) return t.trim();
  } catch {}
  return null;
}

export function requireAdminToken(req) {
  const expected = Netlify.env.get("ADMIN_API_TOKEN");
  if (!expected) return { ok: false, status: 500, error: "Server is missing ADMIN_API_TOKEN" };
  const header = req.headers.get("authorization") || "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m || m[1] !== expected) return { ok: false, status: 401, error: "Unauthorized" };
  return { ok: true };
}

export function jsonResponse(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...extra }
  });
}
# Trigger redeploy for fresh Lambdas 2026-05-29T07:42:15Z
