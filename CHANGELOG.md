# Changelog

A running record of changes to the Mandarin Strategic Capability Assessment, newest at the top. Use this to see what changed when and to roll back if anything goes wrong.

## How to use this file

- Each entry has the **date**, a **short summary**, the **commit SHA** in backticks, and (where relevant) a **what changed** breakdown.
- To roll back a single change: `git revert <sha>` then `git push origin main`. Netlify will rebuild automatically.
- To roll back to a specific point in time: `git checkout <sha>`, then either `git push --force-with-lease origin main` (destructive — undoes everything since), or branch off for a hotfix.
- Every meaningful change going forward should add an entry at the top. Group multiple small commits into a single entry when they're part of the same feature.

---

## 2026-06-08

### PDF: full first + last name on cover and in filename
**`ef5af07`** — Two adjustments so multiple participants with the same first name produce distinguishable artifacts. (1) PDF cover now shows a "Prepared for ALEX POND" row at 22px directly under the eyebrow, surname bolded — previously the name only appeared at 18px inside the overall-capability tile. (2) Server-side email attachment filename now includes the last name as well, so `mandarin-tom-baker-2026-06-08.pdf` and `mandarin-tom-mathews-2026-06-08.pdf` never collide. The in-browser download already used both names; this aligns the server path.

### Save & exit lightbox replaces native prompt/alert
**`604b4a6`** — The Save & exit flow previously used `window.prompt()` for the email and `window.alert()` for confirmation/error, which broke the cinematic surface. Replaced with `#saveExitOverlay`, a themed lightbox mirroring the resume prompt vocabulary (oxide backdrop, amber stripe, INTER caps title, serif input). Renders four step states in-place: form → sending (spinner) → success → error-with-retry. Inherits the active skin's `--amber` CSS var so it adapts per-skin without skin-specific styles. Dismissable via Esc, backdrop click, or the X. The "nothing to save yet" branch also uses the lightbox so the app never falls back to a native dialog.

### Save & exit button: stack below Mandarin logo
**`fb20c81`** — Button at `top: 2.4vh` sat at the same y-coordinate as the Mandarin logo (logo at `3.4vh`, ~30–40px tall) and the two visually collided. Moved to `top: 9vh` on desktop, `7.5vh` on small screens, so the button always sits clear under the logo on the right rail.

### Save & resume mid-assessment
**`2c64b94`** — Users can now pause partway through and pick up later. Three layers working together. (1) Auto-save: after every answer and reflection, the in-progress state is written to localStorage immediately and to a cloud blob at `progress/<uuid>.json` (debounced ~1.1s). (2) Passive resume prompt: when the assessment loads and a local save is present, a full-screen prompt asks "Continue where you left off, or start over?" before any cinematic landing fires. (3) Save & exit button: a fixed top-right control mints a `sub:'resume'` magic link via `/api/sessions/resume-email` and emails it to the user's intake address, so they can finish on any device by clicking the link. Resume blobs auto-expire 30 days after last write (checked on read, no sweeper needed). Completion clears both the local save and the cloud blob. Admin previews and viewer mode never auto-save.

### Resume token type added
**`2c64b94`** — New `sub:'resume'` magic-link variant in `auth.mjs` (30-day TTL by default). Carries a per-session UUID, not an email, so anyone with the link can resume that specific session but not impersonate the user.

---

## 2026-06-04

### Duration estimate: 20 → 30 minutes
**`36b2362`** — Hero stat on the brand landing, the line on every skin's cinematic landing, the invite email body, and the legacy strategic-force-assessment.html all now say `30 min` / `30 minutes`. Zero remaining 20-minute references.

### Yi skin not applying when picked from brand landing
**`dc8fac6`** — The Yi JSON skin's internal `id` was `yi_sunsin` while the brand-landing card stored `yi` in localStorage. assessment.html looked up `SKINS['yi']` (undefined) and silently fell back to force_trial. Single-line fix: rename the JSON id to `yi`. No data migration needed.

### Multi-seat invites
**`8fb0287`** — Each invite can now have N seats (default 2, 1–50). Multiple people with the same link can complete under their own emails. Step 1 form gains a Seats number input; each table row shows used/allowed seats with inline +/− buttons; rows over quota are flagged. New `POST /api/admin/invites/seats` endpoint adjusts seats without re-sending an email. `submit-session` never blocks based on seats — fail-open + flag in admin.

### Back-fill endpoint for invite ↔ completion links
**`c9ceee6`** — `POST /api/admin/invites/link` adds a `linked_email` to an existing invite record. Used to back-fill cases where the completion happened before automatic linking was in place, or to manually correct a misattributed completion.

### Admin Results blank + invite-to-completion cross-linking
**`b6402ef`** —
1. `/api/sessions/list`, `/api/sessions/get`, `/api/sessions/delete` were using an inline auth check that only accepted the static `ADMIN_API_TOKEN`. After admin magic-link auth shipped, magic-link JWTs were 401'd by these endpoints, so the Results tab fell back to showing only the demo row. All three endpoints now use the shared `requireAdminToken` helper.
2. When a user enters a different email at intake than the one the invite was sent to (e.g. invited at `agnes.cserhati@…` but completes as `acserhati@icloud.com`), the server reads the invite token they arrived with, records the intake email in `linked_emails` on the invite blob, and the admin GET aggregates completions across the primary + linked addresses. Invite table shows "Also completed as <email>".

---

## 2026-06-03

### Invite-code fallback for users whose link doesn't work
**`f6eb5a8`** — Every invite email now also prints a 12-character code (`XXXX-XXXX-XXXX`, Crockford base32). The lock page (`/invite-required.html`) gains a "Have a code?" form that redeems the code to a fresh invite token. Codes are derived deterministically from the email so every existing invitee automatically has one — no data migration. Admin Invites table shows the code per row with a Copy button.

### Invites list optimistic updates
**`42dfc94`** — Send / Resend / Delete now reflect on the table instantly via optimistic UI updates, with a background reconcile a few seconds later. Fixes the bug where new invitees didn't show up until you refreshed.

### Apollo CC edits v2 (Apollo only)
**`d9f8af5`** — Setup rewrites for ~18 Apollo scenes (Q15–Q36 + interludes), Q19 setup + answers C and F, the Action Console quote, and the confrontation quote. Other skins untouched.

### Invites tab UI redesign
**`2545147`, `1c49075`** — Rebuilt Invites tab on the cream admin theme with proper contrast and clear workflow. Step 1 / Step 2 hero structure, 5-stat summary panel, redesigned funnel pips. Admin sign-in lands on Invites by default (was Archetypes).

### Admin Invites: delete row capability
**`75eb88e`** — `DELETE /api/admin/invites?email=…` removes the bookkeeping row. Existing invite token still works for the invitee until it expires (HMAC tokens are not revocable without rotating the secret).

### Invite-track resilience
**`5f5c23e`, `a254564`, `aba5cb2`** — "started" beacon now stamps `first_opened_at` too (avoids race on back-to-back beacons). Backoff retry up to ~6 s on Blobs reads. Fail-soft on missing records so the track endpoint never clobbers an admin-managed invite blob.

### Invite-only gate + admin Invites tab
**`ee116a0`** — Brand landing and `/assessment.html` are now invite-only. Anonymous visitors land on `/invite-required.html`. Admin Invites tab tracks the funnel (opened / started / completed N×) per invitee.

### QC fixes: Apollo Hale references + ranking ordinals
**`ea3aa1b`** — Apollo's variant outcome bodies still mentioned "Hale" (carryover from force_trial). Now use "Calhoun". Ranking renderer supports positions 5–N (`5th`, `6th`, etc.); previously only had hard-coded 1st–4th.

### Admin magic-link sign-in + admin email Q×A breakdown
**`fda5bcc`** — Admins now sign in via emailed magic links (no shared password). The admin notification email per completion includes every question + the user's exact answer, plus their free-text reflections, alongside the PDF attachment.

### Apply CC Apollo edits + propagate question/answer copy
**`4915782`** — First pass of Apollo edits with cross-skin propagation: question prompts + Likert scale labels + multi-choice answer copy applied to all four skins, preserving scoring weights by position.

---

## 2026-06-02

### Connect custom domain + Resend verified sender
**`554fbf5`** — Brand domain cutover. App now serves at `https://assessment.teammandarin.com`. EMAIL_FROM updated to `Mandarin <no-reply@assessment.teammandarin.com>`. SITE_URL set. DNS records on GoDaddy: CNAME for the subdomain, ownership-verification TXT, Resend DKIM/SPF/MX. (Original deploy was at `strategic-force-assessment.netlify.app`.)

---

## 2026-05-29

### Viewer-mode cinematic style + horizontal logo
**`1236c94`** — When viewing a stored session via admin "View" or /me deep-link, the results page now renders on the cinematic dark backdrop (was washing out to cream). Landing + /me pages now use the horizontal Mandarin SVG logo.

### Fix blank page on session View
**`34c3d05`** — Earlier flash-prevention CSS (`html.admin-mode #resultsStage { display: none !important }`) was also hiding the resultsStage when admins or /me viewers opened a stored session. Added a `session-viewer` class that overrides admin-mode's hide for the results page only.

### Preview banner: distinguish admin vs /me viewer
**`2386fcf`** — Admin View now shows "Back to admin"; /me View shows "Back to my results"; legacy admin override still shows "PREVIEW · admin override" with Resume button.

### Skin landing CTA + mobile + admin/me View opens real results
**`c4c0f43`** — CTA button moved below the framing note on every skin's cinematic landing. Mobile responsiveness pass on the brand landing. Admin/Me "View" buttons now open the actual cinematic results page (was opening a JSON pre dump).

### Misc bootstrap + admin restyling + content/skin admin tabs
**`9feef1a`, `8c4bf41`** — Admin panel restyled to match the brand landing. Esc/Close returns to `/`. Skins tab links to image studio. Content tab gains per-skin switcher. Results tab is cloud-first across all users.

### /me + admin: rich 7-page PDF
**`be3a689`, `edb8bc1`** — PDF report expanded to 7 pages with the full results-page depth: archetype, scores, level grid, three risk overlays, four next steps, reflections, and a dedicated print template that mirrors the on-screen view.

### Magic-link infrastructure
**`689fbb1`, `036666e`, `6ecf9b1`, `5dc42e2`, `ab5c584`, `6b9e83f`, `2556b71`, `fdee821`** — Chunked rollout:
- **Chunk 1**: PDF results download with dedicated print template
- **Chunk 2**: Magic-link backend (token mint/verify, user index, read endpoints)
- **Chunk 3**: `/me` user area listing all sessions for the token's email
- **Chunk 4**: User result email via Resend with PDF attached + inline magic link
- **Chunk 5**: Admin email recipient config endpoint

### Per-skin pacing + inert-click fix + landing rename
**`82eda67`, `141670f`, `728fc3c`** — Admin Pacing tab gains per-skin crawl timing controls and CSS-keyframe entrance delays. Fixed inert option clicks during scene transitions. Landing title renamed + admin link relocated.

---

## 2026-05-28

### Duration estimate 12 → 20 minutes
**`87f8dc7`** — User-facing copy bumped (now superseded by `36b2362`, see 2026-06-04).

### Serve brand landing directly + strip em dashes
**`e729cfc`** — Removed em dashes app-wide per standing rule. Brand landing now served at `/` (was previously a deep link).

### Text legibility + brand-styled landing + initial commit
**`65b2892`, `6bcdea3`, `3a618b7`, `40ddd31`** — Initial commit of the assessment + Netlify Blobs storage. Brand-styled pre-assessment landing with skin picker. Improved text contrast across all four skins. Fixed `list-sessions` to pass `directories:true` so nested blob keys come back as blobs.

---

## Rollback cheatsheet

```bash
# Revert a single change (creates a new commit that undoes the named one)
git revert <sha>
git push origin main

# Roll the live site back to a specific point (destructive — undoes everything since)
git checkout <sha>
git push --force-with-lease origin main

# See exactly what was in a commit before deciding
git show <sha>
git diff <sha-before> <sha-after>
```

Netlify auto-deploys on push to `main`, so a rollback typically appears live within ~60 seconds.
