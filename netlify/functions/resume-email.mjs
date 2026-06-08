// POST /api/sessions/resume-email
// Body: { uuid, email }
//
// The "Save & continue later" path. The client calls this when the user
// clicks Save & exit during the assessment. We mint a sub:'resume' magic
// link pointing at the given UUID and email it to the address the user
// provided (typically the one they typed at intake).
//
// Public endpoint, but with two guards:
//   - the UUID must correspond to an existing progress blob (so people
//     can't spam arbitrary UUIDs)
//   - the email address must match the one stored on the progress blob
//     (so a user can only mail the resume link to the intake email, not
//     redirect it to someone else)

import { getStore } from "@netlify/blobs";
import {
  jsonResponse,
  normaliseEmail,
  mintResumeToken,
  requireMagicLinkSecret
} from "../lib/auth.mjs";
import { buildResumeEmailHTML } from "../lib/email-template.mjs";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function progressKey(uuid) {
  const safe = String(uuid || "").replace(/[^a-zA-Z0-9_-]/g, "");
  return safe ? `progress/${safe}.json` : null;
}

async function sendResend(apiKey, payload) {
  try {
    const resp = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { "authorization": "Bearer " + apiKey, "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    return { ok: resp.ok, status: resp.status };
  } catch (e) {
    console.error("Resend resume-email failed:", e);
    return { ok: false, status: 0, error: e.message };
  }
}

export default async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
  const uuid = String(body && body.uuid || "").trim();
  const email = normaliseEmail(body && body.email);
  if (!uuid || !/^[a-zA-Z0-9_-]{8,64}$/.test(uuid)) return jsonResponse({ error: "Invalid uuid" }, 400);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: "A valid email is required" }, 400);
  }

  const store = getStore("sessions");
  const key = progressKey(uuid);
  if (!key) return jsonResponse({ error: "Invalid uuid" }, 400);

  let rec;
  try { rec = await store.get(key, { type: "json" }); }
  catch (_) {}
  if (!rec) return jsonResponse({ error: "No saved progress for that session" }, 404);

  // Enforce email match — the resume link can only be mailed to the email
  // the user typed at intake. Prevents the endpoint being used to redirect
  // someone else's progress to an attacker's inbox.
  const intake = normaliseEmail(rec.intake_email || "");
  if (intake && intake !== email) {
    return jsonResponse({ error: "Email does not match this assessment" }, 403);
  }

  let secret;
  try { secret = requireMagicLinkSecret(); }
  catch (e) { return jsonResponse({ error: e.message }, 500); }
  const token = mintResumeToken(uuid, secret, 30);
  const siteUrl = (Netlify.env.get("SITE_URL") || "https://strategic-force-assessment.netlify.app").replace(/\/+$/, "");
  const resumeUrl = `${siteUrl}/assessment.html?resume=${encodeURIComponent(token)}`;

  const resendKey = Netlify.env.get("RESEND_API_KEY");
  const from = Netlify.env.get("EMAIL_FROM");
  if (!resendKey || !from) return jsonResponse({ error: "Email sending not configured" }, 500);

  const firstName = rec.first_name || "there";
  const result = await sendResend(resendKey, {
    from,
    to: [email],
    subject: "Your saved Strategic Capability Assessment, ready when you are",
    html: buildResumeEmailHTML(firstName, resumeUrl),
    text: `Hi ${firstName},\n\nYou paused your Strategic Capability Assessment partway through. Pick up where you left off here:\n\n${resumeUrl}\n\nThe link is valid for 30 days.`
  });
  if (!result.ok) return jsonResponse({ error: "Failed to send resume email" }, 502);

  return jsonResponse({ ok: true, email }, 200);
};

export const config = { path: "/api/sessions/resume-email" };
