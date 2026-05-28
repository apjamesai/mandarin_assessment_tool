// GET /api/sessions/get?id=<session-id>
// Admin-only. Returns a single session.

import { getStore } from "@netlify/blobs";

export default async (req) => {
  const auth = requireAdmin(req);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return json({ error: "Missing id" }, 400);

  let session;
  try {
    const store = getStore("sessions");
    session = await store.get(`sessions/${id}.json`, { type: "json" });
  } catch (e) {
    console.error("Failed to read session from Blobs:", e);
    return json({ error: "Storage read failed" }, 500);
  }

  if (!session) return json({ error: "Not found" }, 404);
  return json({ session }, 200);
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
  path: "/api/sessions/get"
};
