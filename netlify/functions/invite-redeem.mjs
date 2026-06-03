// POST /api/invite/redeem
// Body: { code: string }
//
// The "last line of defence" path for an invitee whose magic-link URL didn't
// work (it was stripped by a corporate email gateway, they typed it wrong,
// the button was unclickable, whatever). They get the 12-character code
// printed in their invitation email, type it on the /invite-required.html
// page, and the server mints them a fresh invite token.
//
// Codes are derived deterministically from the invitee's email via
// inviteCodeForEmail(), so we don't need to store them — we compute the
// code for each known invite and look for a match. With small lists (we
// expect dozens at most), this is instant. The comparison is constant-time
// per record to avoid timing oracles.
//
// On success, the client stores the returned invite JWT under
// `mandarin.assessment.inviteToken` and redirects to /, the same outcome
// as clicking the URL in the email.

import { getStore } from "@netlify/blobs";
import {
  jsonResponse,
  normaliseInviteCode,
  inviteCodeForEmail,
  inviteCodesEqual,
  mintInviteToken,
  requireMagicLinkSecret
} from "../lib/auth.mjs";

export default async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
  const code = normaliseInviteCode(body && body.code);
  if (!code || code.length !== 12) {
    return jsonResponse({ error: "That code doesn't look right. Codes are 12 characters long." }, 400);
  }

  // Match against every persisted invite. With a small invitee list this is
  // microseconds. If the system ever scales beyond a few hundred invites,
  // swap this for a code→email reverse index blob written at invite time.
  const store = getStore("sessions");
  let matchedEmail = null;
  try {
    const list = await store.list({ prefix: "invites/" });
    for (const item of (list.blobs || [])) {
      let rec;
      try { rec = await store.get(item.key, { type: "json" }); }
      catch (_) { continue; }
      if (!rec || !rec.email) continue;
      const expected = inviteCodeForEmail(rec.email);
      if (expected && inviteCodesEqual(expected, code)) {
        matchedEmail = rec.email;
        break;
      }
    }
  } catch (e) {
    console.error("invite-redeem: failed to list invites:", e);
    return jsonResponse({ error: "Storage read failed. Try again in a moment." }, 500);
  }

  if (!matchedEmail) {
    return jsonResponse({ error: "That code isn't valid. Double-check it, or ask whoever sent your invitation to resend it." }, 404);
  }

  // Mint a fresh 90-day invite token for this email. The client stores it
  // exactly like it would store the token harvested from a clicked URL.
  let secret;
  try { secret = requireMagicLinkSecret(); }
  catch (e) { return jsonResponse({ error: e.message }, 500); }
  const token = mintInviteToken(matchedEmail, secret, 90);

  return jsonResponse({ ok: true, token, email: matchedEmail }, 200);
};

export const config = { path: "/api/invite/redeem" };
