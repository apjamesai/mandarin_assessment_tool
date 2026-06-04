// POST /api/admin/invites/link
// Body: { email: invitee-email, linked_email: completion-email }
//
// Adds a `linked_email` to an existing invite record so the funnel can
// aggregate completions across the original invited email and any other
// emails the invitee used at intake. Used for two cases:
//   1. Back-filling historical completions that happened before automatic
//      linking was in place.
//   2. Manually correcting a mis-attributed completion from the admin UI.
//
// Admins only.

import { getStore } from "@netlify/blobs";
import {
  requireAdminToken,
  jsonResponse,
  normaliseEmail,
  inviteIndexKey
} from "../lib/auth.mjs";

export default async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  const auth = requireAdminToken(req);
  if (!auth.ok) return jsonResponse({ error: auth.error || "Unauthorized" }, auth.status || 401);

  let body;
  try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
  const email = normaliseEmail(body && body.email);
  const linkedEmail = normaliseEmail(body && body.linked_email);
  if (!email || !linkedEmail) return jsonResponse({ error: "email and linked_email are both required" }, 400);
  if (email === linkedEmail) return jsonResponse({ error: "Cannot link an email to itself" }, 400);

  const store = getStore("sessions");
  const key = inviteIndexKey(email);
  let rec;
  try { rec = await store.get(key, { type: "json" }); }
  catch (e) { return jsonResponse({ error: "Storage read failed" }, 500); }
  if (!rec || typeof rec !== "object") return jsonResponse({ error: "No invite found for " + email }, 404);

  rec.linked_emails = Array.isArray(rec.linked_emails) ? rec.linked_emails : [];
  if (!rec.linked_emails.includes(linkedEmail)) {
    rec.linked_emails.push(linkedEmail);
    rec.linked_at = new Date().toISOString();
    try { await store.setJSON(key, rec); }
    catch (e) { return jsonResponse({ error: "Storage write failed" }, 500); }
  }

  return jsonResponse({ ok: true, email, linked_emails: rec.linked_emails }, 200);
};

export const config = { path: "/api/admin/invites/link" };
