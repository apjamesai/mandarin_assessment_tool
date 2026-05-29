// POST /api/sessions/submit
// Public endpoint. Accepts a completed assessment session and stores it in
// Netlify Blobs at sessions/{id}.json. Also maintains a per-user index at
// users/{emailHash}.json so the magic-link "show me all my sessions" path
// can list them without scanning every session in the store.

import { getStore } from "@netlify/blobs";
import { userIndexKey, normaliseEmail } from "../lib/auth.mjs";

const MAX_PAYLOAD_BYTES = 64 * 1024; // 64KB — generous, real sessions ~3-5KB

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (!body || typeof body !== "object") return json({ error: "Body must be a JSON object" }, 400);

  if (!body.completed_at || !body.archetype) {
    return json({ error: "Missing required fields: completed_at, archetype" }, 400);
  }

  const id = typeof body.id === "string" && body.id.length > 0 && body.id.length < 100
    ? body.id
    : crypto.randomUUID();

  const session = { ...body, id, server_received_at: new Date().toISOString() };
  const serialized = JSON.stringify(session);
  if (serialized.length > MAX_PAYLOAD_BYTES) return json({ error: "Payload too large" }, 413);

  try {
    const store = getStore("sessions");
    await store.setJSON(`sessions/${id}.json`, session);
    // Maintain per-user index for magic-link lookups (best-effort).
    const email = normaliseEmail(body.email);
    if (email) {
      const idxKey = userIndexKey(email);
      let idx = await store.get(idxKey, { type: "json" });
      if (!idx || typeof idx !== "object") idx = { email, session_ids: [], updated_at: null };
      if (!idx.session_ids.includes(id)) {
        idx.session_ids.push(id);
        idx.updated_at = new Date().toISOString();
        await store.setJSON(idxKey, idx);
      }
    }
  } catch (e) {
    console.error("Failed to write session to Blobs:", e);
    return json({ error: "Storage write failed" }, 500);
  }

  return json({ ok: true, id }, 200);
};

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export const config = { path: "/api/sessions/submit" };
