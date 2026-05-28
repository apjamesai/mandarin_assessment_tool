# Deploying The Strategic Force Assessment

Two short guides. Read them in order, generate the images first if you want them, then deploy.

---

## A. Generate the concept art via Google AI Studio (Nano Banana / Gemini)

**You need:** a Google account, ~5–10 minutes, ~$0 (free tier covers test runs).

### A1. Get an API key

1. Go to **https://aistudio.google.com/apikey**.
2. Sign in with a Google account.
3. Click **Create API key** → pick or create a Google Cloud project → copy the key.
4. Keep the key private. Never commit it to a repo or paste it into chat.

### A2. Confirm the model is available

Models in the Gemini 2.5 image family are typically named one of:
- `gemini-2.5-flash-image`
- `gemini-2.5-flash-image-preview`
- `gemini-2.0-flash-exp-image-generation`

The `generate-images.js` script defaults to `gemini-2.5-flash-image-preview`. If Google has renamed it, pass `--model=…` on the command line. To list what your key can reach:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" \
  | grep -i image
```

### A3. Run the generation

From the folder that holds `strategic-force-assessment.html`:

```bash
export GEMINI_API_KEY="paste-your-key-here"
node generate-images.js
```

This generates **15 archetype portraits** (5 × 3 genders) + **7 scene images** into `./images/`. Already-existing files are skipped, so you can rerun safely.

Flags:
```bash
node generate-images.js --only=archetypes        # archetypes only
node generate-images.js --only=scenes            # scenes only
node generate-images.js --genders=she,he         # subset
node generate-images.js --model=gemini-2.5-flash-image
```

### A4. Verify

Open `strategic-force-assessment.html` in a browser. The page probes for the PNGs on load; if found, they hot-swap the SVG fallbacks. If something is missing, the SVG still renders, so the page never breaks.

### A5. Free-tier quotas (May 2025)

- Free tier: ~1500 requests/day, rate-limited per minute.
- The script paces requests with a ~1.2-second gap, so 22 images take ~30 seconds.
- If you hit a quota error, wait a minute and rerun, already-generated files are skipped.

### A6. Rotate your key when done

In AI Studio: **API keys → … → Delete**. If the key has ever been pasted into chat, email, a config file you might commit, or any screenshot, rotate it.

---

## B. Deploy to Netlify (temporary host)

Three increasingly automated paths. Pick one.

### B1. Drag-and-drop deploy (fastest, 60 seconds)

1. Go to **https://app.netlify.com/drop**.
2. Sign in (free).
3. Drag the entire folder (`strategic-force-assessment.html`, `image-prompts.json`, `generate-images.js`, `images/`, `README-images.md`) onto the page.
4. Wait ~10 seconds. You'll get a URL like `https://random-name-abc123.netlify.app`.

To make the URL stable: in the dashboard, **Site settings → Change site name** → pick something memorable. To take it down later: **Site settings → Delete site**.

### B2. Netlify CLI (preferred for repeat deploys)

```bash
# install once
npm install -g netlify-cli

# from the folder
netlify deploy --dir=. --prod
```

First run will prompt you to authenticate in the browser and create a site. After that, `netlify deploy --prod` redeploys in one command.

### B3. Connect a Git repository (when you want the site to auto-rebuild)

1. `git init && git add . && git commit -m "Initial"` then push to GitHub.
2. Netlify dashboard → **Add new site → Import existing project** → connect repo.
3. Build settings: leave blank, this is a static site, no build step.
4. Publish directory: `.` (root).

Every push to the main branch redeploys.

---

## C. Important deployment notes

### C1. The `images/` folder is gitignored by default, but you want it deployed
If you generate the images then commit/push, **make sure `images/` is included** in the deploy. Drag-and-drop and `netlify deploy --dir=.` include it automatically. If you go the Git route, check your `.gitignore` does not exclude `images/`.

### C2. Don't deploy your API key
The HTML never reads the key, it only reads PNGs from `./images/`. Image generation is a one-time local step. Do **not** put `GEMINI_API_KEY` in the deployed environment.

### C3. localStorage is per-browser
The admin **Results** tab reads from this browser only. If you want centralised results storage, you'll need a small backend (Netlify Functions + a database). I can add a Supabase or Airtable adapter later if that becomes useful.

### C4. The admin is accessible to anyone who knows `?admin=1`
There's no auth, admin presence is detected by URL flag. If you're hosting publicly and want it private, either:
- Generate a deploy-time secret URL (e.g. `?admin=$RANDOM_TOKEN`) and gate behind that.
- Or add Netlify password protection: **Site settings → Visitor access → Password protection** (paid Pro feature), or use Netlify Identity for free.

### C5. Performance
The HTML is ~210 KB with SVG fallbacks. With all 22 generated PNGs at 1024×1024, expect ~5–10 MB total. Netlify will serve them from CDN, first load 2–3 s on a fresh device, cached afterwards.

---

## D. Quick sanity checklist before sharing the URL

- [ ] Visit the URL, landing scene loads, brand mark visible.
- [ ] Enter test details, pick gender, run a few scenes.
- [ ] Use the timer-ring "Skip" once to confirm.
- [ ] Use the back button on a question, change your answer, continue, score should recompute, not double-count.
- [ ] Reach the results page, wheel renders, secondary pattern (if triggered) shows under primary.
- [ ] Visit `?admin=1`, switch to each archetype in turn, confirm portraits and copy.
- [ ] Edit one piece of copy under Content, reload, change persists.
- [ ] Take the assessment fully, confirm session appears under Results.

Done. You're live.
