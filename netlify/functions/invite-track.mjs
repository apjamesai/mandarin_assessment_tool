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

  // Netlify Blobs is eventually consistent on reads. If the admin just wrote
  // the invite record (admin-invites POST), an immediate read here may miss
  // it. Retry once after a short delay to give the write time to propagate
  // before falling back. We do NOT create a fresh record on miss — that
  // could clobber a concurrent admin record. Instead we fail-soft: the open
  // beacon is lost, the next one (or the admin's next POST) will catch up.
  // Backoff probe: 0ms, 1s, 3s, 6s. Total budget ~10s. This call is
  // fire-and-forget on the client so the user doesn't wait. In practice
  // real-world latency between admin send and invitee click is many
  // seconds to days; the retry only matters for synthetic test bursts.
  async function readRecWithRetry() {
    const waits = [0, 1000, 2000, 3000];
    for (const w of waits) {
      if (w) await new Promise((res) => setTimeout(res, w));
      try {
        const r = await store.get(key, { type: "json" });
        if (r && typeof r === "object") return r;
      } catch (_) {}
    }
    return null;
  }

  const rec = await readRecWithRetry();
  if (!rec) {
    // No invite record found even after retry. Token is valid but the admin
    // hasn't persisted (or someone is replaying a stale token). Acknowledge
    // the token without writing anything.
    console.log(`invite-track: no record for ${email}, skipping write`);
    return jsonResponse({ ok: true, email, event, recorded: false }, 200);
  }

  const now = new Date().toISOString();
  let changed = false;
  if (event === "opened" && !rec.first_opened_at) { rec.first_opened_at = now; changed = true; }
  if (event === "started" && !rec.first_started_at) { rec.first_started_at = now; changed = true; }
  rec.event_counts = rec.event_counts || {};
  rec.event_counts[event] = (rec.event_counts[event] || 0) + 1;
  changed = true;

  if (changed) {
    try { await store.setJSON(key, rec); }
    catch (e) { console.error("invite-track: failed to write blob:", e); }
  }

  return jsonResponse({ ok: true, email, event, recorded: true }, 200);
};

export const config = { path: "/api/invite/track" };
