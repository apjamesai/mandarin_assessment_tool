// DELETE /api/sessions/delete?id=<session-id>
// (Accepts POST too, since some clients can't easily emit DELETE.)
// Admin auth via shared helper so the new admin magic-link JWTs work.

import { getStore } from "@netlify/blobs";
import { requireAdminToken, jsonResponse } from "../lib/auth.mjs";

export default async (req) => {
  if (req.method !== "DELETE" && req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const auth = requireAdminToken(req);
  if (!auth.ok) return jsonResponse({ error: auth.error || "Unauthorized" }, auth.status || 401);

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return jsonResponse({ error: "Missing id" }, 400);

  try {
    const store = getStore("sessions");
    await store.delete(`sessions/${id}.json`);
  } catch (e) {
    console.error("Failed to delete session from Blobs:", e);
    return jsonResponse({ error: "Storage delete failed" }, 500);
  }

  return jsonResponse({ ok: true, id }, 200);
};

export const config = {
  path: "/api/sessions/delete"
};
