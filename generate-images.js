#!/usr/bin/env node
/**
 * Local image generation for The Strategic Force Assessment.
 *
 * Usage:
 *   export GEMINI_API_KEY="your-key"
 *   node generate-images.js
 *
 * Optional:
 *   node generate-images.js --only=archetypes     # skip scenes
 *   node generate-images.js --only=scenes        # skip archetypes
 *   node generate-images.js --genders=she,he     # subset of genders
 *   node generate-images.js --model=gemini-2.5-flash-image-preview
 *
 * Generates 15 archetype portraits (5 archetypes × 3 genders) + 7 scene
 * images into ./images/ alongside the HTML. The HTML auto-detects them.
 *
 * Requires Node 18+ (has global fetch).
 */

const fs = require('node:fs');
const path = require('node:path');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('ERR: set GEMINI_API_KEY env var first. e.g. export GEMINI_API_KEY="..."');
  process.exit(1);
}

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--(\w+)=(.+)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
}));

const MODEL = args.model || 'gemini-2.5-flash-image-preview';
const ONLY = args.only || 'all';
const GENDERS_FILTER = (args.genders || 'she,he,they').split(',').map(s => s.trim());

const prompts = JSON.parse(fs.readFileSync(path.join(__dirname, 'image-prompts.json'), 'utf-8'));
const IMAGES_DIR = path.join(__dirname, 'images');
fs.mkdirSync(IMAGES_DIR, { recursive: true });

const GENDER_DESCS = prompts._genders;

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function generateOne(prompt, outFile) {
  if (fs.existsSync(outFile)) {
    console.log(`  skip (exists): ${path.basename(outFile)}`);
    return true;
  }
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE'] }
  };
  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errTxt = await res.text();
    console.error(`  ✗ HTTP ${res.status} for ${path.basename(outFile)}:`, errTxt.slice(0, 400));
    return false;
  }
  const json = await res.json();
  const parts = json.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find(p => p.inlineData?.data || p.inline_data?.data);
  if (!imgPart) {
    console.error(`  ✗ no image data for ${path.basename(outFile)}.`);
    console.error('  Response head:', JSON.stringify(json).slice(0, 500));
    return false;
  }
  const b64 = imgPart.inlineData?.data || imgPart.inline_data?.data;
  fs.writeFileSync(outFile, Buffer.from(b64, 'base64'));
  console.log(`  ✓ wrote ${path.basename(outFile)}`);
  return true;
}

async function genArchetypes() {
  console.log('\n=== ARCHETYPES ===');
  const entries = Object.entries(prompts.archetypes);
  for (const [key, spec] of entries) {
    for (const g of GENDERS_FILTER) {
      const desc = GENDER_DESCS[g];
      const prompt = spec.prompt_template.replace('{genderDesc}', desc);
      const file = path.join(IMAGES_DIR, spec.filename_template.replace('images/', '').replace('{gender}', g));
      console.log(`Generating ${key} · ${g} …`);
      await generateOne(prompt, file);
      await new Promise(r => setTimeout(r, 1200)); // rate-limit polite gap
    }
  }
}

async function genScenes() {
  console.log('\n=== SCENES ===');
  for (const [key, spec] of Object.entries(prompts.scenes)) {
    const file = path.join(IMAGES_DIR, spec.filename.replace('images/', ''));
    console.log(`Generating scene ${key} …`);
    await generateOne(spec.prompt, file);
    await new Promise(r => setTimeout(r, 1200));
  }
}

(async () => {
  console.log(`Model: ${MODEL}`);
  console.log(`Genders: ${GENDERS_FILTER.join(', ')}`);
  console.log(`Mode: ${ONLY}`);
  if (ONLY === 'all' || ONLY === 'archetypes') await genArchetypes();
  if (ONLY === 'all' || ONLY === 'scenes')     await genScenes();
  console.log('\nDone. Refresh the HTML to see them load.');
  console.log('Tip: rotate your API key in Google AI Studio now that the run is finished.');
})().catch(e => { console.error('FATAL:', e); process.exit(1); });
