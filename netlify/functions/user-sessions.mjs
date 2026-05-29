// GET /api/user/sessions?token=<magic-link-token>
// Token-gated. Returns the list of sessions for the email embedded in the
// magic-link token (newest first). Reads the users/{emailHash}.json index
// produced by submit-session, then fetches each session blob.

import { getStore } from "@netlify/blobs";
import { verifyToken, requireMagicLinkSecret, userIndexKey, readBearer, jsonResponse } from "../lib/auth.mjs";

export default async (req) => {
  const token = readBearer(req);
  if (!token) return jsonResponse({ error: "Missing token" }, 401);

  let payload;
  try {
    payload = verifyToken(token, requireMagicLinkSecret());
  } catch (e) {
    return jsonResponse({ error: "Invalid token: " + e.message }, 401);
  }
  if (payload.sub !== "user" || !payload.email) {
    return jsonResponse({ error: "Token is not a user magic-link" }, 403);
  }

  const store = getStore("sessions");
  let idx;
  try {
    idx = await store.get(userIndexKey(payload.email), { type: "json" });
  } catch (e) {
    console.error("Failed to read user index:", e);
    return jsonResponse({ error: "Storage read failed" }, 500);
  }
  if (!idx || !Array.isArray(idx.session_ids) || idx.session_ids.length === 0) {
    return jsonResponse({ email: payload.email, sessions: [], count: 0 }, 200);
  }

  const sessions = [];
  for (const id of idx.session_ids) {
    try {
      const s = await store.get(`sessions/${id}.json`, { type: "json" });
      if (s) sessions.push(s);
    } catch (e) {
      console.warn(`Could not read session ${id}`, e);
    }
  }
  sessions.sort((a, b) => (b.completed_at || "").localeCompare(a.completed_at || ""));

  return jsonResponse({ email: payload.email, sessions, count: sessions.length }, 200);
};

export const config = { path: "/api/user/sessions" };
