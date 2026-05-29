// POST /api/magic-link/issue
// Admin-only. Mints a magic-link token for a given email and returns it.
// Used by the admin "Copy magic link" button to test the user flow without
// relying on the email mailer.
//
// Body: { "email": "...", "ttlDays": 30 }   (ttlDays optional, default 30)

import {
  requireAdminToken,
  requireMagicLinkSecret,
  mintUserMagicToken,
  normaliseEmail,
  jsonResponse
} from "../lib/auth.mjs";

export default async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const auth = requireAdminToken(req);
  if (!auth.ok) return jsonResponse({ error: auth.error }, auth.status);

  let body;
  try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
  const email = normaliseEmail(body && body.email);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: "Missing or invalid email" }, 400);
  }
  const ttlDays = Math.max(1, Math.min(365, Number(body && body.ttlDays) || 30));

  let secret;
  try { secret = requireMagicLinkSecret(); }
  catch (e) { return jsonResponse({ error: e.message }, 500); }

  const token = mintUserMagicToken(email, secret, ttlDays);
  const exp = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
  return jsonResponse({ ok: true, email, token, expires_at: new Date(exp).toISOString(), ttlDays }, 200);
};

export const config = { path: "/api/magic-link/issue" };
