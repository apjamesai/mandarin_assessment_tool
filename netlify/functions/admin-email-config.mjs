// /api/admin/config/emails
// Admin-only. GET returns the current admin recipient list. POST updates
// it. Stored at config/admin-emails.json in the same Blob store the
// sessions live in.
//
// Body for POST: { "recipients": ["a@b.com", "c@d.com", ...] }

import { getStore } from "@netlify/blobs";
import { requireAdminToken, jsonResponse } from "../lib/auth.mjs";

const KEY = "config/admin-emails.json";

export default async (req) => {
  const auth = requireAdminToken(req);
  if (!auth.ok) return jsonResponse({ error: auth.error }, auth.status);

  const store = getStore("sessions");

  if (req.method === "GET") {
    try {
      const cfg = await store.get(KEY, { type: "json" });
      return jsonResponse({
        recipients: (cfg && Array.isArray(cfg.recipients)) ? cfg.recipients : [],
        updated_at: cfg && cfg.updated_at ? cfg.updated_at : null
      }, 200);
    } catch (e) {
      console.error("Failed to read admin-emails config:", e);
      return jsonResponse({ error: "Storage read failed" }, 500);
    }
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
    const inputs = Array.isArray(body && body.recipients) ? body.recipients : [];
    const seen = new Set();
    const recipients = [];
    for (const raw of inputs) {
      const e = String(raw || "").trim().toLowerCase();
      if (!e) continue;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        return jsonResponse({ error: "Invalid email: " + e }, 400);
      }
      if (seen.has(e)) continue;
      seen.add(e);
      recipients.push(e);
    }
    if (recipients.length > 50) return jsonResponse({ error: "Too many recipients (max 50)" }, 400);

    const updated_at = new Date().toISOString();
    try {
      await store.setJSON(KEY, { recipients, updated_at });
    } catch (e) {
      console.error("Failed to write admin-emails config:", e);
      return jsonResponse({ error: "Storage write failed" }, 500);
    }
    return jsonResponse({ ok: true, recipients, updated_at }, 200);
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/admin/config/emails" };
