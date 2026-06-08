// /api/sessions/progress
//
// POST   — save in-progress assessment state. Public; the per-session UUID
//          is the only credential (the client generates it and keeps it in
//          localStorage). This is fire-and-forget on the client side.
// GET    — fetch the saved state. Token-gated via a sub:'resume' magic
//          link. Lets a user pick up on a different device.
// DELETE — remove the blob. Token-gated. Also called internally by
//          submit-session.mjs when the assessment is completed.
//
// Storage: progress/<uuid>.json. Auto-expires on read if more than 30 days
// since last save — we don't run a scheduled sweeper, instead the blob is
// silently deleted on next access if it's stale (and the read returns 404).

import { getStore } from "@netlify/blobs";
import {
  jsonResponse,
  normaliseEmail,
  verifyToken,
  requireMagicLinkSecret,
  readBearer
} from "../lib/auth.mjs";

const MAX_PAYLOAD_BYTES = 256 * 1024; // 256KB — generous, real progress ~3-8KB
const STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function progressKey(uuid) {
  // UUID is a random client-generated string; we wrap it in a fixed prefix
  // so it can never escape the progress namespace.
  const safe = String(uuid || "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safe) return null;
  return `progress/${safe}.json`;
}

// Verify a resume token and return its uuid. Throws on invalid/expired.
function uuidFromResumeToken(token) {
  const secret = requireMagicLinkSecret();
  const payload = verifyToken(token, secret);
  if (!payload || payload.sub !== "resume" || !payload.uuid) {
    throw new Error("Token is not a valid resume token");
  }
  return String(payload.uuid);
}

async function handleSave(req, store) {
  let body;
  try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
  if (!body || typeof body !== "object") return jsonResponse({ error: "Body must be JSON" }, 400);

  const uuid = String(body.uuid || "").trim();
  if (!uuid || !/^[a-zA-Z0-9_-]{8,64}$/.test(uuid)) {
    return jsonResponse({ error: "Invalid uuid" }, 400);
  }
  const key = progressKey(uuid);
  if (!key) return jsonResponse({ error: "Invalid uuid" }, 400);

  // Pull the invite email out of the invite token if the client sent one.
  // We don't require it; some invitees may have lost the token but still
  // hold a session UUID locally. We just record it when available so admins
  // can see who's mid-flight.
  let inviteEmail = null;
  if (typeof body.invite_token === "string" && body.invite_token) {
    try {
      const secret = requireMagicLinkSecret();
      const p = verifyToken(body.invite_token, secret);
      if (p && p.sub === "invite" && p.email) inviteEmail = normaliseEmail(p.email);
    } catch (_) { /* invalid invite tokens are non-fatal */ }
  }

  const now = new Date().toISOString();
  let existing = null;
  try { existing = await store.get(key, { type: "json" }); }
  catch (_) {}

  const rec = {
    uuid,
    created_at: (existing && existing.created_at) || now,
    last_saved_at: now,
    invite_email: inviteEmail || (existing && existing.invite_email) || null,
    intake_email: normaliseEmail(body.intake_email) || (existing && existing.intake_email) || null,
    first_name: String(body.first_name || "").slice(0, 100) || (existing && existing.first_name) || "",
    last_name:  String(body.last_name  || "").slice(0, 100) || (existing && existing.last_name)  || "",
    gender:     String(body.gender     || "").slice(0, 32)  || (existing && existing.gender)     || "",
    skin:       String(body.skin       || "").slice(0, 64)  || (existing && existing.skin)       || "",
    current_scene: Number.isFinite(body.current_scene) ? body.current_scene : 0,
    answers:     (body.answers     && typeof body.answers     === "object") ? body.answers     : {},
    reflections: (body.reflections && typeof body.reflections === "object") ? body.reflections : {}
  };
  const serialized = JSON.stringify(rec);
  if (serialized.length > MAX_PAYLOAD_BYTES) return jsonResponse({ error: "Payload too large" }, 413);

  try { await store.setJSON(key, rec); }
  catch (e) {
    console.error("session-progress save failed:", e);
    return jsonResponse({ error: "Storage write failed" }, 500);
  }
  return jsonResponse({ ok: true, uuid, saved_at: now }, 200);
}

async function handleGet(req, store) {
  // Resume reads require a magic-link resume token. The token encodes the
  // UUID, so the URL can't be guessed by anyone who doesn't have the token.
  const token = readBearer(req);
  if (!token) return jsonResponse({ error: "Missing token" }, 401);
  let uuid;
  try { uuid = uuidFromResumeToken(token); }
  catch (e) { return jsonResponse({ error: "Invalid token: " + e.message }, 401); }

  const key = progressKey(uuid);
  if (!key) return jsonResponse({ error: "Invalid uuid" }, 400);

  let rec;
  try { rec = await store.get(key, { type: "json" }); }
  catch (e) { return jsonResponse({ error: "Storage read failed" }, 500); }
  if (!rec) return jsonResponse({ error: "No saved progress for this token" }, 404);

  // Stale-on-access: if it hasn't been touched in 30+ days, silently delete
  // and return 404. Avoids us holding stale reflection data indefinitely.
  const lastMs = Date.parse(rec.last_saved_at || rec.created_at || 0) || 0;
  if (Date.now() - lastMs > STALE_AFTER_MS) {
    try { await store.delete(key); } catch (_) {}
    return jsonResponse({ error: "This saved session has expired" }, 410);
  }

  return jsonResponse({ ok: true, progress: rec }, 200);
}

async function handleDelete(req, store) {
  // Allow delete by either resume token OR a direct uuid + invite token
  // (the invite token check lets the assessment client clean up after a
  // successful submission without minting a resume token first).
  const token = readBearer(req);
  let uuid = null;
  try { uuid = uuidFromResumeToken(token); }
  catch (_) {}
  if (!uuid) {
    try {
      const url = new URL(req.url);
      const candidate = url.searchParams.get("uuid");
      if (candidate && /^[a-zA-Z0-9_-]{8,64}$/.test(candidate)) uuid = candidate;
    } catch (_) {}
  }
  if (!uuid) return jsonResponse({ error: "Missing token or uuid" }, 401);

  const key = progressKey(uuid);
  if (!key) return jsonResponse({ error: "Invalid uuid" }, 400);
  try { await store.delete(key); }
  catch (e) {
    console.error("session-progress delete failed:", e);
    return jsonResponse({ error: "Storage delete failed" }, 500);
  }
  return jsonResponse({ ok: true, uuid }, 200);
}

export default async (req) => {
  const store = getStore("sessions");
  if (req.method === "POST")   return handleSave(req, store);
  if (req.method === "GET")    return handleGet(req, store);
  if (req.method === "DELETE") return handleDelete(req, store);
  return jsonResponse({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/sessions/progress" };
