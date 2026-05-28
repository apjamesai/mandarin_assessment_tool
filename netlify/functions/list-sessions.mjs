// GET /api/sessions/list
// Admin-only. Returns every stored session, newest first.
// Requires header: Authorization: Bearer <ADMIN_API_TOKEN>

import { getStore } from "@netlify/blobs";

export default async (req) => {
  const auth = requireAdmin(req);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  let blobs;
  try {
    const store = getStore("sessions");
    const result = await store.list({ prefix: "sessions/" });
    blobs = result.blobs || [];
  } catch (e) {
    console.error("Failed to list Blobs:", e);
    return json({ error: "Storage list failed" }, 500);
  }

  // Fetch each session. For low volume (hundreds), one round-trip each is fine.
  // If this ever runs slow, we can add a separate "index" blob.
  const store = getStore("sessions");
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

  return json({ sessions, count: sessions.length }, 200);
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
  path: "/api/sessions/list"
};
