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
export const INVITE_INDEX_PEPPER = "mandarin-invite-index-v1";
// Separate pepper for the user-facing invite CODE (printed in invite emails
// and entered on the lock page as a fallback when the URL doesn't work).
// Deterministic per-email so existing invitees already have a code we can
// compute on demand without any data migration.
export const INVITE_CODE_PEPPER = "mandarin-invite-code-v1";

// Hardcoded admin allowlist. Adding/removing admins is a code change on
// purpose — admin access is rare and high-trust, and we don't want a
// stored-config exploit to grant new admin rights.
export const ADMIN_ALLOWLIST = [
  "charlie@teammandarin.com",
  "email@alexpond.com"
];

export function isAdminEmail(email) {
  return ADMIN_ALLOWLIST.includes(normaliseEmail(email));
}

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

// Separate hash space from userIndexKey so a leak of one doesn't expose the
// other. Invites are stored at invites/{hash(email)}.json.
export function inviteIndexKey(email) {
  const norm = normaliseEmail(email);
  if (!norm) return null;
  const hex = createHmac("sha256", INVITE_INDEX_PEPPER).update(norm).digest("hex");
  return `invites/${hex}.json`;
}

// Crockford base32 (no I, L, O, U — they're easy to confuse). We deliberately
// avoid lower case so codes are easy to read out over the phone and to type.
const CROCKFORD_B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

// Deterministic typeable code per email. Same email → same code, forever, so
// every existing invitee automatically has a code we can compute on demand
// (no data migration). 12 chars / 60 bits of entropy in the printed form;
// formatted as XXXX-XXXX-XXXX for readability.
//
// To redeem, the server iterates the small invite list and matches in
// constant time. Codes never leave the server unless they're shown to an
// admin or printed in an invitation email — they're effectively credentials
// for the invite, the same trust level as the URL.
export function inviteCodeForEmail(email) {
  const norm = normaliseEmail(email);
  if (!norm) return null;
  const buf = createHmac("sha256", INVITE_CODE_PEPPER).update(norm).digest();
  let out = "";
  for (let i = 0; i < 12; i++) {
    // Take a byte and mod-down to 32. Slight bias is fine — we only need
    // unguessability, not perfect uniformity.
    out += CROCKFORD_B32[buf[i] & 31];
  }
  return out.slice(0, 4) + "-" + out.slice(4, 8) + "-" + out.slice(8, 12);
}

// Strip whitespace/hyphens and uppercase the input, then map common
// look-alike characters back to their canonical form so the user can type
// `O0L1IU` etc. without the system rejecting the code.
export function normaliseInviteCode(input) {
  return String(input || "")
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .toUpperCase()
    .replace(/O/g, "0")
    .replace(/I/g, "1")
    .replace(/L/g, "1")
    .replace(/U/g, "V");
}

// Compare two codes constant-time so a timing attack can't be used to map
// out which codes are close to valid. Both inputs are normalised first.
export function inviteCodesEqual(a, b) {
  const na = normaliseInviteCode(a);
  const nb = normaliseInviteCode(b);
  if (na.length !== nb.length || na.length === 0) return false;
  const bufA = Buffer.from(na, "utf8");
  const bufB = Buffer.from(nb, "utf8");
  try { return timingSafeEqual(bufA, bufB); }
  catch { return false; }
}

export function mintUserMagicToken(email, secret, ttlDays = 30) {
  const exp = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
  return signToken({ iss: TOKEN_ISSUER, sub: "user", email: normaliseEmail(email), exp }, secret);
}

export function mintAdminMagicToken(email, secret, ttlDays = 30) {
  const exp = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
  return signToken({ iss: TOKEN_ISSUER, sub: "admin", email: normaliseEmail(email), exp }, secret);
}

// Invite tokens live longer (90 days default) and carry the invitee's email
// so completions can be attributed back to the invite even if the user
// types a slightly different email at intake (we don't enforce match — we
// just attribute the funnel for that token).
export function mintInviteToken(email, secret, ttlDays = 90) {
  const exp = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
  return signToken({ iss: TOKEN_ISSUER, sub: "invite", email: normaliseEmail(email), exp }, secret);
}

// Resume tokens carry a per-session UUID, not an email. Anyone holding the
// token can fetch and continue that specific in-progress assessment. 30-day
// TTL — long enough for the user to come back after a holiday, short enough
// to be a reasonable privacy expiry for mid-flight reflections.
export function mintResumeToken(uuid, secret, ttlDays = 30) {
  const exp = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
  return signToken({ iss: TOKEN_ISSUER, sub: "resume", uuid: String(uuid || ""), exp }, secret);
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

// Admin auth accepts EITHER:
//   1. ADMIN_API_TOKEN bearer (legacy, kept as emergency override)
//   2. A valid sub='admin' magic-link token whose email is in ADMIN_ALLOWLIST
//
// Returns { ok: true, viaMagicLink, email? } on success so callers can log
// who acted (handy for audit / future per-admin features).
export function requireAdminToken(req) {
  const token = readBearer(req);
  if (!token) return { ok: false, status: 401, error: "Unauthorized" };

  const expected = Netlify.env.get("ADMIN_API_TOKEN");
  if (expected && token === expected) {
    return { ok: true, viaMagicLink: false };
  }

  const secret = Netlify.env.get("MAGIC_LINK_SECRET");
  if (secret) {
    try {
      const payload = verifyToken(token, secret);
      if (payload.sub === "admin" && isAdminEmail(payload.email)) {
        return { ok: true, viaMagicLink: true, email: normaliseEmail(payload.email) };
      }
    } catch (_) { /* fall through to 401 */ }
  }

  return { ok: false, status: 401, error: "Unauthorized" };
}

export function jsonResponse(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...extra }
  });
}
// Trigger redeploy for fresh Lambdas 2026-05-29T08:03Z (Resend env)
