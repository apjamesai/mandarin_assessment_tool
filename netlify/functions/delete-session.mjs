// DELETE /api/sessions/delete?id=<session-id>
// (Accepts POST too, since some clients can't easily emit DELETE.)
// Admin-only.

import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "DELETE" && req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const auth = requireAdmin(req);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return json({ error: "Missing id" }, 400);

  try {
    const store = getStore("sessions");
    await store.delete(`sessions/${id}.json`);
  } catch (e) {
    console.error("Failed to delete session from Blobs:", e);
    return json({ error: "Storage delete failed" }, 500);
  }

  return json({ ok: true, id }, 200);
};

function requireAdmin(req) {
  const expected = Netlify.env.get("ADMIN_API_TOKEN");
  if (!expected) {
    return { ok: false, status: 500, error: "Server is missing ADMIN_API_TOKEN" };
  }
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match || match[1] !== expected) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  return { ok: true };
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

export const config = {
  path: "/api/sessions/delete"
};
