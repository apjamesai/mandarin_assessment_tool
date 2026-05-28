# Skin Spec, story-pluggable content for The Strategic Capability Assessment

A *skin* is a JSON file that wraps the 12-practice assessment in a different story. The scoring rubric, the four levels, the eleven archetypes, and the results page structure stay identical across every skin, so a user's saved sessions are comparable whether they took the **Force Trial** skin or a future one.

This document is the schema. The fastest way to author a new skin is:

1. Open the admin panel (`?admin=1`) → **Skins** tab.
2. Click **Export JSON** on *The Strategic Force Trial*, this dumps every editable field.
3. Edit the JSON in your favourite editor.
4. **Import** it back into the same Skins tab.
5. **Activate**.

Below is the full shape with annotated fields.

---

## Top-level object

```jsonc
{
  "id":          "the_courtroom",          // unique slug; lowercase, snake_case
  "name":        "The Courtroom",           // display name in admin + session record
  "tagline":     "A jurisdiction in crisis. A protégé chosen.",
  "description": "Set in a constitutional crisis…",
  "theme":       { /* see Theme */ },
  "characters":  { /* see Characters */ },
  "scenes":      [ /* see Scenes, required, this is the longest block */ ],
  "archetypes":  { /* see Archetypes */ },
  "secondaryPatterns": { /* see Secondary patterns */ },
  "riskCopy":    { /* see Risk copy */ },
  "nextSteps":   { /* see Next steps */ },
  "imageMap":    { /* see Images */ }
}
```

The only **required** fields for import to succeed are `id`, `name`, and a `scenes` array. Everything else falls back to the Force Trial defaults if omitted, useful for iterating.

---

## Theme

CSS custom properties applied to `:root` when the skin is activated. The minimum useful set:

```json
{
  "--amber":           "#7a15e5",
  "--amber-bright":    "#9b3df5",
  "--amber-deep":      "#5a0db5",
  "--amber-glow":      "rgba(122, 21, 229, 0.35)",
  "--brand-orange":    "#7a15e5",
  "--brand-tangerine": "#9b3df5",
  "--brand-yellow":    "#feab2b",
  "--bg":              "#0a0712",
  "--ink":             "#ece5d7"
}
```

The variable names are misleadingly named *amber/orange/tangerine* because the default skin is Mandarin Orange, but for your skin, they're just **accent slots**. You can put any colour in.

You can also override `--serif` and `--sans` font stacks if your skin loads different web fonts.

---

## Characters

```json
{ "commander": "Counsel Ferran", "mentor": "The Recluse" }
```

Surfaced in the session record + admin Skins cards. The names you use here also need to appear in your `scenes` copy, the skin system doesn't auto-substitute. (Variables like `{{firstName}}` and `{{they}}` still work for the user.)

---

## Scenes

The biggest block. Same shape as the default skin's `SCENES` array. There are 11 scene types, each renders differently. Order matters: scenes play top-to-bottom.

### Scene types

| `type` | Purpose | Required fields |
|---|---|---|
| `landing` | Title card with CTA | `title`, `sub`, `note`, `cta`, `locationLabel` |
| `intake` | Name/email/gender form | `eyebrow`, `title`, `sub`, `locationLabel` |
| `crawl` | Cinematic prologue | `preamble`, `title` (array), `episode`, `paragraphs` (array), `duration`, `locationLabel` |
| `narrative` | Act intro text card | `body` (array), `bodyAfter` (array), `eyebrow`, `duration`, `locationLabel`. **Optional:** `artId`, `layout` for a disc image alongside the text. |
| `narrative-scene` | Quote from a character with disc art | `quote`, `speaker`, `artId`, `layout`, `duration`, `locationLabel` |
| `question` | A scoring question | `kind` ('rating' / 'mc' / 'ranking' / 'short-text'), `practice`, `setup`, `prompt`, plus kind-specific fields |
| `midpoint` | Hermit-style reflection slide | `eyebrow`, `prompt`, `placeholder`, `hint`, `key`, `locationLabel`. Optionally `intro` and `showIntro: true` for the first slide. `isLast: true` on the last one. |
| `twist` | Reveal moment | `body` (array of paragraphs), `quote`, `speaker`, `duration`, `locationLabel`. Optionally `variants` for conditional copy. |
| `end-reflection` | Closing free-text prompt | `eyebrow`, `prompt`, `placeholder`, `key`, `locationLabel` |
| `results-launch` | "Read your profile" button | `locationLabel` only |

### Question scoring

**Scoring is fixed across skins.** When you author a question scene, copy the `scoring`, `options[].score`, `items[].score`, and `weights` from the equivalent question in the default skin. If you change the numbers, you break cross-skin comparability, sessions from your skin will land in different archetype bands than the same user would in another skin.

Skin authors **CAN** safely change:
- `setup`, the scenario before the prompt
- `prompt`, the question itself (keeping the same practice meaning)
- `options[].copy`, the answer text
- `items[].label`, the rankable item text
- `placeholder`, `hint`

Skin authors **MUST NOT** change:
- `kind`
- `practice` (the practice being measured)
- `scoring` / `options[].score` / `items[].score`
- `weights`
- the number of options / items / scale points

### Question example (multiple choice)

```jsonc
{
  "type": "question",
  "kind": "mc",
  "practice": "Listen Deeply",         // must match a framework practice name
  "locationLabel": "Q05 · LISTEN DEEPLY",
  "setup": "Three witnesses, called separately…",
  "prompt": "What do you do first?",
  "options": [
    {
      "copy": "Step into the room and announce yourself before they finish speaking.",
      "score": { "act_decisively": 45, "influence_effortlessly": 35, "listen_deeply": 15, "control_bias": 40 }
    },
    /* …five more options, same shape, scoring numbers preserved from default skin */
  ]
}
```

---

## Archetypes

```jsonc
{
  "reactive_defender": {
    "name":     "The Reactive Defender",
    "band":     "Strategic Infancy",
    "headline": "You care about protecting what matters, but pressure drives more of your strategy than you realise.",
    "body":     "Long paragraph of pattern interpretation…",
    "risk":     "Your risk is not lack of effort…",
    "focus":    "Start at Level 1, <em>Deepen Self-Awareness</em>…",
    "next":     "Your first breakthrough is likely to come from…"
  },
  /* tactical_survivor, hidden_drifter, strategic_operator, force_multiplier */
}
```

The five keys are fixed. The copy can be re-themed entirely for your story.

---

## Secondary patterns

Same shape as the default skin. The six keys (`architect_of_order`, `the_justifier`, etc.) are fixed; copy can be re-themed. Each has a `trigger` function in code that's **not** part of the skin, you can't change when each overlay fires, only what it says when it does.

```json
{
  "architect_of_order": {
    "name":     "The Architect of Order",
    "headline": "Drawn to clarity, control, and decisive action.",
    "body":     "You are highly effective in chaos…"
  }
  /* …five more */
}
```

---

## Risk copy

```json
{
  "control_bias": {
    "name": "Control Bias",
    "low":  "You appear able to pursue clarity without defaulting to control.",
    "mod":  "You may sometimes overvalue speed, certainty, or authority…",
    "high": "You may be at risk of mistaking <em>control for strategy</em>…",
    "q":    "Where might you be calling something <em>alignment</em> when it is actually compliance?"
  }
  /* moral_drift, detachment_pressure */
}
```

---

## Next steps

```json
{
  "reactive_defender": [
    { "icon": "pause",   "title": "The five-second pause", "body": "…", "test": "Try for 7 days." }
    /* exactly four steps per archetype */
  ]
  /* tactical_survivor, hidden_drifter, strategic_operator, force_multiplier */
}
```

Available icons: `notice`, `pause`, `invite`, `reframe`, `horizon`, `decide`, `experiment`, `multiply`, `question`, `doors`, `mirror`, `journal`.

---

## Images

```jsonc
{
  "scene": {
    "councilChamber":  "images/skin-courtroom/scene-council.png",
    "convoyArc":       "images/skin-courtroom/scene-convoy.png",
    /* …same scene-art keys as the default skin (or a subset) */
  }
}
```

The archetype portraits use the gender-suffix convention (`archetype-{key}-{gender}.png`) and are resolved automatically at runtime. If you set `imageMap.archetype` per skin, the assessment will read those filenames; if you don't, it falls back to the `images/archetype-{key}-{gender}.png` pattern.

To prepare gender-aware portraits for a skin, use the same Image Studio (`image-studio.html`), just edit `image-prompts.json` first with your skin's descriptions before running, then drop the output under `images/skin-<id>/` and adjust paths.

---

## Workflow

1. **Export** the Force Trial as your starting JSON.
2. Open it in an editor that highlights JSON (VS Code, Sublime).
3. Edit:
   - `id` and `name` first
   - `theme` colours (try a complementary palette to make the skin feel distinct)
   - `characters` to your antagonist + mentor
   - For every scene, replace the *story copy* (setup, prompt, body, quote, options' copy) but **never** touch the scoring numbers
   - Re-theme each archetype, secondary, risk, and nextStep entry
4. Save the file.
5. Admin → Skins → **Import skin JSON** → pick your file.
6. **Activate**.
7. Take the assessment end-to-end as a smoke test. Check the results render correctly with your new content + colours.
8. If you want generated portraits/scene art: tailor `image-prompts.json`, run Image Studio, drop the PNGs into the path your `imageMap` points to.

---

## Comparability, what's preserved across skins

A user who takes both your skin and the Force Trial will get:
- The same 12 practice scores (0–100)
- The same 4 level scores
- The same 3 risk overlay scores
- The same primary archetype (assuming the same answer choices)
- Potentially different *copy* describing those scores
- Potentially different *secondary pattern* names

That last point is intentional, the secondary patterns trigger from the same numeric thresholds, but each skin can rename them.

Every saved session in localStorage carries:
- `skin: "your_skin_id"` and `skin_name: "Your Story Title"`
- The full numeric breakdown
- The user's reflections (free text)

Cross-skin comparison reports are possible because the scoring rubric is identical, you can pivot the CSV export by skin and see whether the same person scored differently in two stories.
