// POST /api/email/retake-request
//
// Sent when a user clicks "Want to retake the assessment? Contact us" on
// the results page. We notify the admins via Resend so they can decide
// whether to issue a fresh invite, reset the user's record, or have a
// conversation first. The endpoint is intentionally lightweight — no
// auth, anyone can submit a request — because the worst-case is a bit of
// admin email noise, easily filtered. Sensitive fields (the user's
// reason text) are capped and HTML-escaped before send.

import { getStore } from "@netlify/blobs";
import {
  jsonResponse,
  normaliseEmail,
  ADMIN_ALLOWLIST
} from "../lib/auth.mjs";
import { buildRetakeRequestEmailHTML } from "../lib/email-template.mjs";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAX_REASON_CHARS = 2000;
const MAX_NAME_CHARS = 120;

async function sendResend(apiKey, payload) {
  try {
    const resp = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { "authorization": "Bearer " + apiKey, "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    return { ok: resp.ok, status: resp.status, count: Array.isArray(payload.to) ? payload.to.length : 1 };
  } catch (e) {
    console.error("Resend retake-request failed:", e);
    return { ok: false, status: 0, error: e.message };
  }
}

export default async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let body;
  try { body = await req.json(); }
  catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
  if (!body || typeof body !== "object") return jsonResponse({ error: "Body must be JSON" }, 400);

  const firstName = String(body.firstName || "").trim().slice(0, MAX_NAME_CHARS);
  const lastName  = String(body.lastName  || "").trim().slice(0, MAX_NAME_CHARS);
  const email     = normaliseEmail(body.email);
  const reason    = String(body.reason || "").trim().slice(0, MAX_REASON_CHARS);
  const archetype = String(body.archetype_name || body.archetype || "").trim().slice(0, 80);
  const completedAt = String(body.completed_at || "").slice(0, 30);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: "A valid email is required" }, 400);
  }
  if (!firstName) return jsonResponse({ error: "First name is required" }, 400);
  if (!reason) return jsonResponse({ error: "Please share a brief reason" }, 400);

  const resendKey = Netlify.env.get("RESEND_API_KEY");
  if (!resendKey) return jsonResponse({ error: "Email sending not configured" }, 500);
  const from = Netlify.env.get("EMAIL_FROM");
  if (!from) return jsonResponse({ error: "Server missing EMAIL_FROM" }, 500);

  // Recipient list — same source of truth as the per-completion admin
  // notification email. Reads the admin Blobs config first, falls back to
  // the hardcoded ADMIN_ALLOWLIST so the endpoint always has somewhere
  // to deliver to.
  let recipients = ADMIN_ALLOWLIST.slice();
  try {
    const store = getStore("sessions");
    const cfg = await store.get("admin/config.json", { type: "json" });
    if (cfg && Array.isArray(cfg.admin_email_recipients) && cfg.admin_email_recipients.length) {
      recipients = cfg.admin_email_recipients.map(normaliseEmail).filter(Boolean);
    }
  } catch (_) {}
  if (!recipients.length) return jsonResponse({ error: "No admin recipients configured" }, 500);

  const submittedAt = new Date().toISOString();
  const subject = `[Mandarin] Retake request — ${firstName} ${lastName}`.trim();
  const text = [
    `${firstName} ${lastName} <${email}> has requested a retake.`,
    "",
    `Their current archetype: ${archetype || "(unknown)"}`,
    `Completed at: ${completedAt || "(unknown)"}`,
    `Submitted at: ${submittedAt}`,
    "",
    "Reason given:",
    reason,
    "",
    "Reply directly to this email to start a conversation with them."
  ].join("\n");

  const result = await sendResend(resendKey, {
    from,
    to: recipients,
    reply_to: email,
    subject,
    html: buildRetakeRequestEmailHTML({ firstName, lastName, email, reason, archetype, completedAt, submittedAt }),
    text
  });
  if (!result.ok) return jsonResponse({ error: "Failed to send retake request" }, 502);

  // Also stash the request in Blobs so admins have a paper trail even if
  // the email is missed. Non-fatal on failure.
  try {
    const store = getStore("sessions");
    const id = `retake-${submittedAt.replace(/[^0-9]/g, "")}-${email.replace(/[^a-z0-9]/g, "")}`;
    await store.setJSON(`retake-requests/${id}.json`, {
      firstName, lastName, email, reason, archetype, completedAt, submittedAt, sent_to: recipients
    });
  } catch (e) {
    console.warn("retake-request: failed to write blob:", e.message);
  }

  return jsonResponse({ ok: true, sent_to: recipients.length }, 200);
};

export const config = { path: "/api/email/retake-request" };
