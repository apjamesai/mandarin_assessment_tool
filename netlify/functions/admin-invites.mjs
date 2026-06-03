// /api/admin/invites
// GET  → list all invites with funnel status (opened, started, completed N times)
// POST → upsert an invite { email } and email the invite link.
//        Used for both new invites AND resends — semantically identical:
//        each call appends to send_history and re-emails the link.

import { getStore } from "@netlify/blobs";
import {
  requireAdminToken,
  jsonResponse,
  normaliseEmail,
  mintInviteToken,
  requireMagicLinkSecret,
  inviteIndexKey,
  userIndexKey,
  inviteCodeForEmail
} from "../lib/auth.mjs";
import { buildInviteEmailHTML } from "../lib/email-template.mjs";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

async function sendResend(apiKey, payload) {
  try {
    const resp = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { "authorization": "Bearer " + apiKey, "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    return { ok: resp.ok, status: resp.status };
  } catch (e) {
    console.error("Resend invite send failed:", e);
    return { ok: false, status: 0, error: e.message };
  }
}

// Build a fresh invite URL for the given email. Caller embeds it in the
// email body and exposes it via the GET response so admins can copy it.
function buildInviteUrl(email, secret) {
  const siteUrl = (Netlify.env.get("SITE_URL") || "https://strategic-force-assessment.netlify.app").replace(/\/+$/, "");
  const token = mintInviteToken(email, secret, 90);
  return { url: `${siteUrl}/?invite=${encodeURIComponent(token)}`, token };
}

// Read the user index for `email` and return how many sessions they've
// completed. Returns 0 if no index exists yet.
async function readCompletions(store, email) {
  try {
    const key = userIndexKey(email);
    const idx = await store.get(key, { type: "json" });
    if (idx && Array.isArray(idx.session_ids)) {
      return { count: idx.session_ids.length, last_at: idx.updated_at || null };
    }
  } catch (e) {
    console.warn("readCompletions failed for", email, e.message);
  }
  return { count: 0, last_at: null };
}

export default async (req) => {
  const auth = requireAdminToken(req);
  if (!auth.ok) return jsonResponse({ error: auth.error || "Unauthorized" }, auth.status || 401);

  const store = getStore("sessions");

  if (req.method === "GET") {
    // List invites + cross-reference completions
    try {
      const list = await store.list({ prefix: "invites/" });
      const out = [];
      for (const item of (list.blobs || [])) {
        try {
          const rec = await store.get(item.key, { type: "json" });
          if (!rec || !rec.email) continue;
          const comp = await readCompletions(store, rec.email);
          out.push({
            email: rec.email,
            created_at: rec.created_at || null,
            send_count: Array.isArray(rec.send_history) ? rec.send_history.length : (rec.send_count || 0),
            last_sent_at: (rec.send_history && rec.send_history.length > 0)
              ? rec.send_history[rec.send_history.length - 1].sent_at
              : (rec.last_sent_at || null),
            invited_by: (rec.send_history && rec.send_history.length > 0)
              ? rec.send_history[rec.send_history.length - 1].by
              : null,
            opened_at: rec.first_opened_at || null,
            started_at: rec.first_started_at || null,
            completions: comp.count,
            last_completed_at: comp.last_at,
            invite_url: rec.last_invite_url || null,
            invite_code: inviteCodeForEmail(rec.email)
          });
        } catch (_) { /* skip malformed records */ }
      }
      // Sort: most recently invited first
      out.sort((a, b) => String(b.last_sent_at || "").localeCompare(String(a.last_sent_at || "")));
      return jsonResponse({ invites: out, count: out.length }, 200);
    } catch (e) {
      console.error("Failed to list invites:", e);
      return jsonResponse({ error: "Storage read failed" }, 500);
    }
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
    const email = normaliseEmail(body && body.email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: "A valid email is required" }, 400);
    }

    let secret;
    try { secret = requireMagicLinkSecret(); }
    catch (e) { return jsonResponse({ error: e.message }, 500); }

    const { url: inviteUrl } = buildInviteUrl(email, secret);

    // Read existing record (if any) and append to history
    const key = inviteIndexKey(email);
    let rec = await store.get(key, { type: "json" }).catch(() => null);
    const now = new Date().toISOString();
    if (!rec || typeof rec !== "object") {
      rec = {
        email,
        created_at: now,
        send_history: [],
        first_opened_at: null,
        first_started_at: null
      };
    }
    rec.last_invite_url = inviteUrl;
    rec.send_history = Array.isArray(rec.send_history) ? rec.send_history : [];
    rec.send_history.push({ sent_at: now, by: auth.email || null });
    // Keep history reasonable
    if (rec.send_history.length > 50) rec.send_history = rec.send_history.slice(-50);

    try {
      await store.setJSON(key, rec);
    } catch (e) {
      console.error("Failed to persist invite record:", e);
      return jsonResponse({ error: "Storage write failed" }, 500);
    }

    // Send the email
    const resendKey = Netlify.env.get("RESEND_API_KEY");
    const from = Netlify.env.get("EMAIL_FROM");
    if (!resendKey || !from) {
      return jsonResponse({ error: "Email sending not configured", url: inviteUrl }, 500);
    }
    const inviteCode = inviteCodeForEmail(email);
    const result = await sendResend(resendKey, {
      from,
      to: [email],
      subject: "You're invited · Mandarin Strategic Capability Assessment",
      html: buildInviteEmailHTML(email, inviteUrl, inviteCode),
      text: `You've been invited to take Mandarin's Strategic Capability Assessment.\n\nBegin here: ${inviteUrl}\n\nIf the link doesn't work, enter this code at https://assessment.teammandarin.com/invite-required.html:\n\n  ${inviteCode}\n\nThe link is valid for 90 days.`
    });
    if (!result.ok) {
      console.error(`admin-invites POST: Resend returned ${result.status}`);
      return jsonResponse({ error: "Failed to send invite email", url: inviteUrl, code: inviteCode }, 502);
    }

    return jsonResponse({
      ok: true,
      email,
      url: inviteUrl,
      code: inviteCode,
      send_count: rec.send_history.length,
      last_sent_at: now
    }, 200);
  }

  if (req.method === "DELETE") {
    // Remove an invite record. Does NOT cascade to user sessions — those
    // stay archived. The invitee's existing invite token still works (we
    // can't revoke HMAC-signed tokens without rotating the secret); this
    // only clears the bookkeeping row from Charlie's Invites table.
    let email;
    try {
      const url = new URL(req.url);
      email = normaliseEmail(url.searchParams.get("email") || "");
    } catch { return jsonResponse({ error: "Bad URL" }, 400); }
    if (!email) return jsonResponse({ error: "Missing email" }, 400);
    const key = inviteIndexKey(email);
    try {
      await store.delete(key);
      return jsonResponse({ ok: true, email }, 200);
    } catch (e) {
      console.error("admin-invites DELETE failed:", e);
      return jsonResponse({ error: "Storage delete failed" }, 500);
    }
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/admin/invites" };
