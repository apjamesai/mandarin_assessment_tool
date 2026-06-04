// GET /api/sessions/list
// Admin-only. Returns every stored session, newest first.
// Auth accepts either the static ADMIN_API_TOKEN (legacy) OR a valid
// admin magic-link JWT (sub: 'admin', email in allowlist), via the shared
// requireAdminToken helper in lib/auth.mjs.

import { getStore } from "@netlify/blobs";
import { requireAdminToken, jsonResponse } from "../lib/auth.mjs";

export default async (req) => {
  const auth = requireAdminToken(req);
  if (!auth.ok) return jsonResponse({ error: auth.error || "Unauthorized" }, auth.status || 401);

  // Netlify Blobs treats keys with "/" as nested under a virtual directory.
  // List with `directories: true` so the full key (e.g. "sessions/abc.json")
  // comes back in `blobs[].key`, not in a separate `directories` array.
  const store = getStore("sessions");
  let blobs;
  try {
    const result = await store.list({ prefix: "sessions/", directories: true });
    blobs = result.blobs || [];
  } catch (e) {
    console.error("Failed to list Blobs:", e);
    return jsonResponse({ error: "Storage list failed" }, 500);
  }

  // Fetch each session. For low volume (hundreds), one round-trip each is fine.
  // If this ever runs slow, we can add a separate "index" blob.
  const sessions = [];
  for (const b of blobs) {
    try {
      const s = await store.get(b.key, { type: "json" });
      if (s) sessions.push(s);
    } catch (e) {
      console.warn(`Could not read ${b.key}`, e);
    }
  }

  sessions.sort((a, b) =>
    (b.completed_at || "").localeCompare(a.completed_at || "")
  );

  return jsonResponse({ sessions, count: sessions.length }, 200);
};

export const config = {
  path: "/api/sessions/list"
};
