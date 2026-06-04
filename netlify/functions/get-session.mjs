// GET /api/sessions/get?id=<session-id>
// Admin auth via shared helper so the new admin magic-link JWTs work.

import { getStore } from "@netlify/blobs";
import { requireAdminToken, jsonResponse } from "../lib/auth.mjs";

export default async (req) => {
  const auth = requireAdminToken(req);
  if (!auth.ok) return jsonResponse({ error: auth.error || "Unauthorized" }, auth.status || 401);

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return jsonResponse({ error: "Missing id" }, 400);

  let session;
  try {
    const store = getStore("sessions");
    session = await store.get(`sessions/${id}.json`, { type: "json" });
  } catch (e) {
    console.error("Failed to read session from Blobs:", e);
    return jsonResponse({ error: "Storage read failed" }, 500);
  }

  if (!session) return jsonResponse({ error: "Not found" }, 404);
  return jsonResponse({ session }, 200);
};

export const config = {
  path: "/api/sessions/get"
};
