// POST /api/sessions/submit
// Public endpoint. Accepts a completed assessment session and stores it in
// Netlify Blobs at sessions/{id}.json. Also maintains a per-user index at
// users/{emailHash}.json so the magic-link "show me all my sessions" path
// can list them without scanning every session in the store.
//
// If the body carries an `invite_token` (the JWT the invitee arrived with),
// we verify it server-side. If the email the invitee typed at intake is
// different from the email on the invite, we record the intake email as a
// `linked_email` on the invite blob so the Invites table can aggregate
// completions across the original-and-linked email pair.

import { getStore } from "@netlify/blobs";
import {
  userIndexKey,
  normaliseEmail,
  inviteIndexKey,
  verifyToken,
  requireMagicLinkSecret
} from "../lib/auth.mjs";

const MAX_PAYLOAD_BYTES = 64 * 1024; // 64KB — generous, real sessions ~3-5KB

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (!body || typeof body !== "object") return json({ error: "Body must be a JSON object" }, 400);

  if (!body.completed_at || !body.archetype) {
    return json({ error: "Missing required fields: completed_at, archetype" }, 400);
  }

  const id = typeof body.id === "string" && body.id.length > 0 && body.id.length < 100
    ? body.id
    : crypto.randomUUID();

  // Strip the invite_token and progress_uuid before persisting the session
  // blob — we don't want raw tokens or in-progress identifiers sitting in
  // the completed session record.
  const { invite_token, progress_uuid, ...sessionFields } = body;
  const session = { ...sessionFields, id, server_received_at: new Date().toISOString() };
  const serialized = JSON.stringify(session);
  if (serialized.length > MAX_PAYLOAD_BYTES) return json({ error: "Payload too large" }, 413);

  // Decode the invite token (if present) so we can capture the inviter's
  // email for cross-linking. Validation failures are non-fatal — we still
  // store the session, just without the linkage.
  let inviteEmail = null;
  if (typeof invite_token === "string" && invite_token.length > 0) {
    try {
      const secret = requireMagicLinkSecret();
      const payload = verifyToken(invite_token, secret);
      if (payload && payload.sub === "invite" && payload.email) {
        inviteEmail = normaliseEmail(payload.email);
        // Stamp on the session so the admin Results view can show "came in via X".
        session.invite_email = inviteEmail;
      }
    } catch (e) {
      console.log("submit-session: invite_token present but invalid:", e.message);
    }
  }

  try {
    const store = getStore("sessions");
    await store.setJSON(`sessions/${id}.json`, session);

    const intakeEmail = normaliseEmail(body.email);

    // Per-user index for magic-link lookups (best-effort).
    if (intakeEmail) {
      const idxKey = userIndexKey(intakeEmail);
      let idx = await store.get(idxKey, { type: "json" });
      if (!idx || typeof idx !== "object") idx = { email: intakeEmail, session_ids: [], updated_at: null };
      if (!idx.session_ids.includes(id)) {
        idx.session_ids.push(id);
        idx.updated_at = new Date().toISOString();
        await store.setJSON(idxKey, idx);
      }
    }

    // Cross-link the invite if the intake email differs from the invited email.
    // We mutate the invite blob to add the intake email to `linked_emails`,
    // so the Invites tab can aggregate completions across both addresses.
    if (inviteEmail && intakeEmail && inviteEmail !== intakeEmail) {
      try {
        const inviteKey = inviteIndexKey(inviteEmail);
        let inviteRec = await store.get(inviteKey, { type: "json" });
        if (inviteRec && typeof inviteRec === "object") {
          inviteRec.linked_emails = Array.isArray(inviteRec.linked_emails) ? inviteRec.linked_emails : [];
          if (!inviteRec.linked_emails.includes(intakeEmail)) {
            inviteRec.linked_emails.push(intakeEmail);
            inviteRec.linked_at = new Date().toISOString();
            await store.setJSON(inviteKey, inviteRec);
            console.log(`submit-session: linked ${intakeEmail} → invite for ${inviteEmail}`);
          }
        }
      } catch (e) {
        console.warn("submit-session: failed to update invite linkage:", e.message);
      }
    }
  } catch (e) {
    console.error("Failed to write session to Blobs:", e);
    return json({ error: "Storage write failed" }, 500);
  }

  // If this completion was the climax of a save-and-resume in-progress run,
  // clear the progress blob so it doesn't linger. Non-fatal on failure.
  if (typeof progress_uuid === "string" && /^[a-zA-Z0-9_-]{8,64}$/.test(progress_uuid)) {
    try {
      const store = getStore("sessions");
      await store.delete(`progress/${progress_uuid}.json`);
    } catch (e) {
      console.warn("submit-session: failed to clear progress blob:", e.message);
    }
  }

  return json({ ok: true, id }, 200);
};

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export const config = { path: "/api/sessions/submit" };
