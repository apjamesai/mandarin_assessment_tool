// POST /api/email/result
// Public endpoint, called from the client after the user finishes the
// assessment. Mints a magic-link token, emails the user with the PDF
// attached (uploaded by the client as base64), and BCCs the configured
// admin recipient list.
//
// Body: { session: <full session object>, pdfBase64?: string }
//
// We accept the full session inline (rather than looking it up by id)
// because submit-session is fire-and-forget on the client and may not
// have hit eventual consistency by the time the email request lands.
//
// Env vars required:
//   RESEND_API_KEY     -- transactional sending
//   EMAIL_FROM         -- "Mandarin <assessment@yourverifieddomain>"
//   MAGIC_LINK_SECRET  -- to mint the user's /me link
//   SITE_URL           -- defaults to https://strategic-force-assessment.netlify.app
//
// Admin recipients live in Blobs at config/admin-emails.json. Chunk 5
// adds an admin UI for editing them. Until that's set, only the user
// receives email; admin send is silently skipped.

import { getStore } from "@netlify/blobs";
import { mintUserMagicToken, jsonResponse, ADMIN_ALLOWLIST } from "../lib/auth.mjs";
import { buildUserEmailHTML, buildAdminEmailHTML, buildEmailTextSummary } from "../lib/email-template.mjs";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export default async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
  const session = body && body.session;
  if (!session || typeof session !== "object") return jsonResponse({ error: "Missing session" }, 400);
  if (!session.email) return jsonResponse({ error: "Session has no email" }, 400);
  if (!session.archetype) return jsonResponse({ error: "Session has no archetype" }, 400);

  const resendKey = Netlify.env.get("RESEND_API_KEY");
  if (!resendKey) return jsonResponse({ error: "Server missing RESEND_API_KEY" }, 500);
  const from = Netlify.env.get("EMAIL_FROM");
  if (!from) return jsonResponse({ error: "Server missing EMAIL_FROM" }, 500);
  const magicSecret = Netlify.env.get("MAGIC_LINK_SECRET");
  if (!magicSecret) return jsonResponse({ error: "Server missing MAGIC_LINK_SECRET" }, 500);
  const siteUrl = (Netlify.env.get("SITE_URL") || "https://strategic-force-assessment.netlify.app").replace(/\/+$/, "");

  const store = getStore("sessions");

  // Mint magic-link token + URL
  const token = mintUserMagicToken(session.email, magicSecret, 30);
  const magicUrl = `${siteUrl}/me?token=${encodeURIComponent(token)}`;

  // Build attachment, if PDF supplied. Filename includes both first and
  // last name so two participants with the same first name (and the same
  // completion date) produce distinguishable files — for example
  // mandarin-tom-baker-2026-06-08.pdf vs mandarin-tom-mathews-2026-06-08.pdf.
  const attachments = [];
  if (typeof body.pdfBase64 === "string" && body.pdfBase64.length > 0) {
    const safe = s => String(s || "").replace(/[^a-z0-9-]+/gi, "-").toLowerCase().replace(/^-+|-+$/g, "");
    const first = safe(session.firstName);
    const last  = safe(session.lastName);
    const date  = (session.completed_at || "").slice(0, 10);
    const slug  = [first, last].filter(Boolean).join("-") || "result";
    attachments.push({
      filename: `mandarin-${slug}-${date}.pdf`.replace(/--+/g, "-"),
      content: body.pdfBase64
    });
  }

  // User email
  const userResult = await sendResend(resendKey, {
    from,
    to: [session.email],
    subject: `Your Strategic Capability Assessment result, ${session.archetype_name || session.archetype}`,
    html: buildUserEmailHTML(session, magicUrl),
    text: buildEmailTextSummary(session) + "\n\nFull results: " + magicUrl,
    attachments
  });

  // Admin email, optional. If the recipients config is empty, seed it with
  // ADMIN_ALLOWLIST so charlie + alex receive notifications by default. Admins
  // can still edit the list later via the admin panel's Email tab.
  let adminResult = null;
  try {
    let cfg = await store.get("config/admin-emails.json", { type: "json" });
    let recipients = (cfg && Array.isArray(cfg.recipients) ? cfg.recipients : []).filter(Boolean);
    if (recipients.length === 0 && Array.isArray(ADMIN_ALLOWLIST) && ADMIN_ALLOWLIST.length > 0) {
      recipients = ADMIN_ALLOWLIST.slice();
      try {
        await store.setJSON("config/admin-emails.json", { recipients, updated_at: new Date().toISOString(), seeded: true });
      } catch (e) { console.warn("Failed to persist seeded admin-emails config:", e); }
    }
    if (recipients.length > 0) {
      adminResult = await sendResend(resendKey, {
        from,
        to: recipients,
        subject: `[Mandarin] New assessment, ${session.firstName} ${session.lastName} (${session.archetype_name || session.archetype})`,
        html: buildAdminEmailHTML(session, magicUrl),
        text: buildEmailTextSummary(session) + "\n\nAdmin: " + magicUrl,
        attachments
      });
    }
  } catch (e) {
    console.warn("Admin email skipped:", e);
  }

  return jsonResponse({
    ok: true,
    user: { sent: !!userResult.ok, status: userResult.status },
    admin: adminResult ? { sent: !!adminResult.ok, status: adminResult.status, count: adminResult.count } : { sent: false, reason: "no recipients configured" }
  }, 200);
};

async function sendResend(apiKey, payload) {
  try {
    const resp = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { "authorization": "Bearer " + apiKey, "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await resp.json().catch(() => null);
    return { ok: resp.ok, status: resp.status, count: Array.isArray(payload.to) ? payload.to.length : 1, data };
  } catch (e) {
    console.error("Resend send failed:", e);
    return { ok: false, status: 0, error: e.message };
  }
}

export const config = { path: "/api/email/result" };
