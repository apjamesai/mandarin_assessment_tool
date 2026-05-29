// GET /api/user/session?token=<magic-link-token>&id=<session-id>
// Token-gated. Returns one session, but only if it belongs to the email in
// the token (checked against the user-index, so we can't accidentally hand
// a different user's session to a token bearer).

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

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return jsonResponse({ error: "Missing id" }, 400);

  const store = getStore("sessions");
  let idx, session;
  try {
    idx = await store.get(userIndexKey(payload.email), { type: "json" });
  } catch (e) {
    return jsonResponse({ error: "Storage read failed" }, 500);
  }
  if (!idx || !Array.isArray(idx.session_ids) || !idx.session_ids.includes(id)) {
    return jsonResponse({ error: "Not found" }, 404);
  }
  try {
    session = await store.get(`sessions/${id}.json`, { type: "json" });
  } catch (e) {
    return jsonResponse({ error: "Storage read failed" }, 500);
  }
  if (!session) return jsonResponse({ error: "Not found" }, 404);
  return jsonResponse({ session }, 200);
};

export const config = { path: "/api/user/session" };
