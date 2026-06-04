// POST /api/admin/invites/seats
// Body: { email, seats }
//
// Adjusts the seat allowance on an existing invite WITHOUT re-emailing the
// invitee. Used when Charlie wants to bump or trim seats from the Invites
// table without firing a fresh invitation. Admins only.

import { getStore } from "@netlify/blobs";
import {
  requireAdminToken,
  jsonResponse,
  normaliseEmail,
  inviteIndexKey
} from "../lib/auth.mjs";

const MIN_SEATS = 1;
const MAX_SEATS = 50;

export default async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  const auth = requireAdminToken(req);
  if (!auth.ok) return jsonResponse({ error: auth.error || "Unauthorized" }, auth.status || 401);

  let body;
  try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
  const email = normaliseEmail(body && body.email);
  const seats = parseInt(body && body.seats, 10);
  if (!email) return jsonResponse({ error: "email is required" }, 400);
  if (!Number.isFinite(seats) || seats < MIN_SEATS || seats > MAX_SEATS) {
    return jsonResponse({ error: `seats must be a number between ${MIN_SEATS} and ${MAX_SEATS}` }, 400);
  }

  const store = getStore("sessions");
  const key = inviteIndexKey(email);
  let rec;
  try { rec = await store.get(key, { type: "json" }); }
  catch (e) { return jsonResponse({ error: "Storage read failed" }, 500); }
  if (!rec || typeof rec !== "object") {
    return jsonResponse({ error: "No invite found for " + email }, 404);
  }

  rec.seats = seats;
  rec.seats_updated_at = new Date().toISOString();
  try { await store.setJSON(key, rec); }
  catch (e) { return jsonResponse({ error: "Storage write failed" }, 500); }

  return jsonResponse({ ok: true, email, seats }, 200);
};

export const config = { path: "/api/admin/invites/seats" };
