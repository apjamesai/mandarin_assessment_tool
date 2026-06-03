// POST /api/invite/track
// Body: { token: string, event: 'opened' | 'started' }
//
// Verifies the invite token (HMAC + expiry + sub=='invite') and stamps the
// corresponding invite record. Idempotent: first_opened_at / first_started_at
// only get set on the FIRST time the event fires for that invite. Completions
// are NOT tracked here — they're derived from the user-session index by the
// admin GET endpoint.
//
// Returns { ok: true } so the client knows the token was valid. Used by the
// gate code on the brand landing and the assessment to:
//   1. validate a freshly arrived invite token before storing it
//   2. mark "opened" / "started" so admins see funnel progress

import { getStore } from "@netlify/blobs";
import {
  jsonResponse,
  verifyToken,
  requireMagicLinkSecret,
  inviteIndexKey,
  normaliseEmail
} from "../lib/auth.mjs";

const VALID_EVENTS = new Set(["opened", "started"]);

export default async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
  const token = String((body && body.token) || "").trim();
  const event = String((body && body.event) || "opened").trim();
  if (!token) return jsonResponse({ error: "Missing token" }, 400);
  if (!VALID_EVENTS.has(event)) return jsonResponse({ error: "Invalid event" }, 400);

  let payload;
  try {
    const secret = requireMagicLinkSecret();
    payload = verifyToken(token, secret);
  } catch (e) {
    return jsonResponse({ error: "Invalid token: " + e.message }, 401);
  }
  if (payload.sub !== "invite") return jsonResponse({ error: "Token is not an invite" }, 401);

  const email = normaliseEmail(payload.email || "");
  if (!email) return jsonResponse({ error: "Token missing email" }, 401);

  const store = getStore("sessions");
  const key = inviteIndexKey(email);
  let rec = null;
  try { rec = await store.get(key, { type: "json" }); }
  catch (_) { /* fall through */ }

  // If there's no record (rare — invite was issued but never persisted, or
  // someone re-shared a stale token after the admin record was deleted), we
  // still accept the token and create a minimal record so the funnel works.
  if (!rec || typeof rec !== "object") {
    rec = {
      email,
      created_at: new Date().toISOString(),
      send_history: [],
      first_opened_at: null,
      first_started_at: null
    };
  }

  const now = new Date().toISOString();
  let changed = false;
  if (event === "opened" && !rec.first_opened_at) { rec.first_opened_at = now; changed = true; }
  if (event === "started" && !rec.first_started_at) { rec.first_started_at = now; changed = true; }
  // Always keep a counter so we can observe re-opens later if useful
  rec.event_counts = rec.event_counts || {};
  rec.event_counts[event] = (rec.event_counts[event] || 0) + 1;
  changed = true;

  if (changed) {
    try { await store.setJSON(key, rec); }
    catch (e) {
      console.error("invite-track: failed to write blob:", e);
      // Don't fail the request — the token is valid; admin can investigate later.
    }
  }

  return jsonResponse({ ok: true, email, event }, 200);
};

export const config = { path: "/api/invite/track" };
