# Setup & Run, The Strategic Force Assessment

This is the single document you need. Two parts:

1. **Publish the site** to Netlify (5 minutes).
2. **Generate the concept art** for each skin (10–15 minutes per skin).

---

## A · Publish to Netlify

A Netlify project has already been created for you:

- **Project name:** `strategic-force-assessment`
- **Site ID:** `f1cb6c00-4de2-4010-a043-fd8c6915f5d1`
- **Primary URL (once deployed):** https://strategic-force-assessment.netlify.app
- **Admin URL:** https://app.netlify.com/projects/strategic-force-assessment

The site exists but is empty until you push the files. Pick one of the three paths below, drag-and-drop is the fastest.

### A1 · Drag-and-drop (fastest, 60 seconds)

1. Open the ZIP I built for you: `strategic-force-assessment-deploy.zip` (in your outputs folder).
2. **Unzip it.** You now have a folder containing `index.html`, the four skin JSONs, the image studio, the build scripts, etc.
3. Go to https://app.netlify.com/projects/strategic-force-assessment/deploys
4. **Drag the unzipped folder** onto the "Deploy manually" drop zone on that page.
5. Wait ~10 seconds. The site goes live at `https://strategic-force-assessment.netlify.app`.

### A2 · Drag-and-drop without the existing project

If you want a fresh URL instead:

1. Go to https://app.netlify.com/drop
2. Drag the unzipped folder onto the page.
3. You get a new URL like `https://random-name-abc123.netlify.app`.

### A3 · Netlify CLI (preferred for repeat deploys)

```bash
# install once
npm install -g netlify-cli

# log in once
netlify login

# from the unzipped folder
netlify deploy --site f1cb6c00-4de2-4010-a043-fd8c6915f5d1 --dir=. --prod
```

After the first run, `netlify deploy --prod` from inside the folder will redeploy.

### A4 · One-shot deploy via the Netlify MCP CLI

```bash
cd /path/to/the/unzipped/folder
npx -y @netlify/mcp@latest --site-id f1cb6c00-4de2-4010-a043-fd8c6915f5d1
```

This bundles the folder, uploads it, runs Netlify's build, and reports a live URL. The MCP-generated proxy URL in your transcript is already authenticated to your account.

---

## B · Generate the concept art

Every skin uses **hand-drawn SVG art as a fallback**, so the assessment looks complete from the moment it deploys. The PNGs are an upgrade, they make each scene cinematic. The Image Studio handles **all four skins in one batch** and can push the results straight into the live Netlify site without leaving the page.

### B1 · Browser-based generator (one batch, all skins)

This is the path most people will pick. No terminal required.

1. **Get a Gemini API key.**
   1. Visit https://aistudio.google.com/apikey
   2. Sign in with a Google account.
   3. Click **Create API key**, pick or create a project, copy the key.
   4. (Free tier covers a full pass, ~88 images across the four skins.)

2. **Open the Image Studio on your live site.**
   - https://strategic-force-assessment.netlify.app/image-studio.html
   - Or locally via `python3 -m http.server` (don't open via `file://`, `fetch()` is blocked).

3. **The studio auto-loads every skin's prompts on boot.** You'll see four cards, Force Trial, Apollo 11, Twelve Ships · Yi, Filament · Latimer, each with its palette swatch and a count of how many archetype/scene prompts are inside.

4. **Paste your Gemini API key** into section 1 → **Save locally** to remember it for next time.

5. **Tick the skins you want** in section 2. By default all four are checked. Pick gender variants (She/Her, He/Him, They/Them), all three are on by default.

6. **Click *Generate everything*.** Tiles fill in as images return. ~88 images × 1.2s pacing ≈ ~2 minutes for the full set. Errors are caught per-tile, click *Generate missing only* to retry failures.

### B2 · Push everything to Netlify atomically, preserves existing images

This is the recommended workflow once the first deploy is up. Section 4 of the studio has **one button**: *Sync to Netlify*. It does an atomic deploy that merges your local files with whatever is already live, so:

- Code updates push without losing previously-generated images.
- New images push without overwriting old ones.
- Files Netlify already has are never re-uploaded (it deduplicates by SHA-1).

#### Setup, once
1. Open https://app.netlify.com/user/applications#personal-access-tokens → **New access token**, give it a name, copy the value.
2. Open the Image Studio (instructions just below) and paste it in *Netlify Personal Access Token* → **Save locally**.
3. The **Site ID** and **Site URL** fields are already prefilled. Change them if you're deploying to a different site.

#### Running the studio so it can push code (important)
Code updates only push when the studio is reading your **local** files. To do that:

```bash
cd /path/to/your/unzipped/deploy/folder
python3 -m http.server 8000
```

Then open `http://localhost:8000/image-studio.html` in your browser. The studio fetches its sibling files (HTML, JSONs, scripts) from `localhost`, hashes them, and pushes whatever's changed.

If you open the studio from the live URL (`https://strategic-force-assessment.netlify.app/image-studio.html`) it can only "see" the files that are already on Netlify, so the *Sync* button will only push new images. Use the local-server path whenever you've edited code.

#### Pushing
1. Make any code changes locally and save them in your deploy folder.
2. (Optional) Generate new images via section 3.
3. Click **Sync to Netlify**. The status line reports each step:
   - Reading local code files…
   - Hashing generated images…
   - Fetching current Netlify deploy manifest…
   - Creating new deploy…
   - Uploading {N} files…
   - ✓ Synced. Live at …

Typical times: code-only update ≈ 5 seconds (one or two files uploaded); fresh batch of 88 images ≈ 30 seconds.

#### What gets preserved
The studio is conservative: anything in the current Netlify deploy that you didn't touch locally stays put. Specifically, **already-deployed images that aren't in `STATE.imagesB64` (i.e. you didn't re-generate them this session) are preserved**. To delete an image from the live site, do it via the Netlify dashboard.

#### Alternative, Download ZIP

If you'd rather build a ZIP and upload manually, the *Download images as ZIP* button bundles every PNG you've generated this session into the right subdirectory layout (`images/`, `images/skin-apollo/`, etc.). Drop the unzipped contents into your deploy folder before redeploying.

> **Warning:** dragging your unzipped deploy folder onto Netlify's drop zone *replaces* the entire deploy, any images on the live site that aren't in your folder will be deleted. Use the Sync button instead.

### B3 · Local Node script (headless, for CI)

If you prefer terminal:

```bash
cd /path/to/the/unzipped/folder
export GEMINI_API_KEY="paste-your-key"

# Default skin (Force Trial), generates into ./images/
node generate-images.js

# To run a non-default skin, copy its prompts file in first
cp skin-apollo-11.json image-prompts.json
node generate-images.js --only=all
```

This is single-skin and image-only, use the Image Studio for multi-skin batches.

---

## C · Verify the live site

Open https://strategic-force-assessment.netlify.app and:

- [ ] Landing card renders.
- [ ] Visit `?admin=1` and confirm 4 skins appear in **Skins** tab, Force Trial, Apollo, Yi, Latimer.
- [ ] Switch between each skin from the admin: theme palette swaps, font changes, choreo + disc art reskin.
- [ ] Each prologue uses its own style: film crawl (Force Trial), mission briefing (Apollo), memorial scroll (Yi), broadsheet (Latimer).
- [ ] Take an assessment to the end on any skin, results page shows **both** primary archetype **and** secondary pattern (either "ACTIVE" if a trigger fired, or "TILT · NEAREST" if not).
- [ ] If you generated images: confirm portraits + disc-art on the results page swap from SVG to PNG.

---

## D · Common errors

**Image Studio shows "Could not load image-prompts.json, TypeError"** → You opened the page via `file://`. Use `python3 -m http.server` (or any static server) and visit via `http://localhost:8000/`.

**Gemini returns 403 / "PROHIBITED_CONTENT"** → The prompt tripped Google's content filter. The packaged prompts are pre-cleaned per the safety rules, but if you've edited them, run them back through the de-brand pass. Common offenders: real proper names, franchise references, real-artist names.

**Gemini returns 429** → You're rate-limited. Bump the *Pacing* field in Image Studio to 2000ms and click *Generate missing only* to resume.

**Deploy from `npx @netlify/mcp` says "fetch failed"** → Either no network or the proxy URL has expired (they're time-limited). Re-deploy via the Netlify CLI: `netlify deploy --site f1cb6c00-4de2-4010-a043-fd8c6915f5d1 --dir=. --prod`.

**Site loads, but admin won't open** → Make sure you visited `?admin=1` in the URL bar (it's a deliberate gate, not a button).

---

## E · After you're live, rotate the API key

If you tested image generation, the Gemini key you pasted into Image Studio is now in your browser's localStorage. To remove it: open Image Studio → click *Clear* next to the API key field.

If you committed any key to a git repo or pasted it into chat (as happened earlier): rotate it at https://aistudio.google.com/apikey and pick a new one for next time.

---

## Files in the deploy ZIP

| File | Purpose |
|---|---|
| `index.html` | The assessment (root URL serves it) |
| `strategic-force-assessment.html` | Same file, accessible by its original name |
| `image-studio.html` | Browser-based image generator |
| `image-prompts.json` | Default (Force Trial) image prompts |
| `skin-apollo-11.json` | Apollo 11 skin (carries its own prompts inside) |
| `skin-yi.json` | Yi Sun-sin skin |
| `skin-latimer.json` | Lewis Latimer skin |
| `build-{skin}.js` | Generators for each skin, edit these to remix |
| `generate-images.js` | Headless Node version of the image generator |
| `netlify.toml` | Static-site config |
| `SKIN-SPEC.md` | Schema for authoring new skins |
| `DEPLOY.md` | The longer deployment doc (CLI flags, etc.) |
| `README.md` | One-paragraph quickstart |
| `images/` | Empty placeholder, drop generated PNGs here |
