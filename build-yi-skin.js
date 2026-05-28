#!/usr/bin/env node
/*
 * Build skin-yi.json — Admiral Yi Sun-sin / Joseon 1597 skin.
 * Setting: late summer 1597, before the Battle of Myeongnyang. Admiral Yi is
 * demoted and acting as private soldier; Admiral Won Gyun commands the fleet
 * and pushes for reckless engagement. You are a young naval officer caught
 * between them. Mentor figure (Hermit slot) is Admiral Yi himself, visited
 * during his disgrace. Antagonist (Marrick slot) is Won Gyun.
 *
 * Run from this directory:   node build-yi-skin.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.join(__dirname, 'strategic-force-assessment.html');
const OUT = path.join(__dirname, 'skin-yi.json');

const html = fs.readFileSync(SRC, 'utf-8');
let js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
js = js.replace(/\/\/ Particles[\s\S]*?animateParticles\(\);/, '// stripped');
js = js.replace(/probeAllImages\(\)\.finally\([\s\S]*?\}\);/, '// stripped');
js = js.replace(/document\.addEventListener\([\s\S]*?\n\}\);/g, '');

const stub = `
const document = { documentElement: { style: { setProperty: () => {} } }, getElementById: () => ({ style:{}, classList:{add:()=>{},remove:()=>{}}, addEventListener:()=>{}, innerHTML:'' }), addEventListener: () => {}, body:{classList:{add:()=>{},remove:()=>{},contains:()=>false}}, querySelectorAll:()=>[], querySelector:()=>null, createElement:()=>({classList:{add:()=>{},remove:()=>{}},style:{}}), head: { appendChild: () => {} } };
const window={innerWidth:1024,innerHeight:768,addEventListener:()=>{},scrollTo:()=>{},location:{search:'',hash:''}};
const URLSearchParams = function(){return {has:()=>false}};
const localStorage={_d:{},getItem(k){return this._d[k]||null},setItem(k,v){this._d[k]=v}};
const requestAnimationFrame=()=>0; const setTimeout=()=>0; const clearTimeout=()=>0; const devicePixelRatio=1;
const Image=function(){};
` + js + `
out = { SCENES, ARCHETYPES, SECONDARY_PATTERNS, RISK_COPY, NEXT_STEPS, IMAGE_MAP };
`;
const ctx = { out: null, console };
vm.createContext(ctx);
vm.runInContext(stub, ctx);
const { SCENES } = ctx.out;

// Korean ink seal carrying 忠 (chung, loyalty) — Yi Sun-sin's defining virtue.
// Drawn as proper Hanja stroke order rather than abstract bars.
const yiInkSeal = `<svg viewBox="0 0 200 200" aria-hidden="true">
  <!-- Vermillion outer seal block (slightly worn edges) -->
  <rect x="18" y="18" width="164" height="164" fill="#b53536" stroke="#7a1818" stroke-width="2"/>
  <rect x="22" y="22" width="156" height="156" fill="none" stroke="#7a1818" stroke-width="0.5" opacity="0.6"/>
  <!-- 忠 = upper 中 (middle) + lower 心 (heart) -->
  <g fill="#f1e6cb" stroke="none">
    <!-- 中: vertical box -->
    <rect x="72"  y="36"  width="56" height="6"/>
    <rect x="72"  y="76"  width="56" height="6"/>
    <rect x="72"  y="36"  width="6"  height="46"/>
    <rect x="122" y="36"  width="6"  height="46"/>
    <!-- 中: vertical stroke through the box -->
    <rect x="97"  y="26"  width="6"  height="76"/>
    <!-- 心: heart-shape strokes -->
    <!-- left curve -->
    <path d="M 56 130 Q 50 150 60 168 L 66 168 Q 60 152 64 134 Z"/>
    <!-- centre dot -->
    <rect x="86" y="118" width="8" height="10" transform="rotate(-22 90 123)"/>
    <!-- main heart base curve -->
    <path d="M 60 134 Q 100 178 140 134 L 142 142 Q 100 188 58 142 Z"/>
    <!-- right dot -->
    <rect x="124" y="120" width="8" height="10" transform="rotate(28 128 125)"/>
    <!-- top right dot -->
    <rect x="142" y="132" width="6" height="8" transform="rotate(-12 145 136)"/>
  </g>
  <!-- Aged highlight + shadow for vermillion stamp -->
  <line x1="22" y1="22"  x2="178" y2="22"  stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
  <line x1="22" y1="178" x2="178" y2="178" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
</svg>`;

// ─── Cultural sprite helpers (reusable inside disc art) ───
// Taegeuk roundel — yin-yang in the obangsaek palette
const taegeuk = (cx, cy, r) => `
  <g transform="translate(${cx} ${cy})">
    <circle cx="0" cy="0" r="${r}" fill="#f1e6cb" stroke="#b53536" stroke-width="${r*0.06}"/>
    <path d="M 0 -${r*0.92} A ${r*0.92} ${r*0.92} 0 0 1 0 ${r*0.92} A ${r*0.46} ${r*0.46} 0 0 0 0 0 A ${r*0.46} ${r*0.46} 0 0 1 0 -${r*0.92} Z" fill="#b53536"/>
    <circle cx="0" cy="-${r*0.46}" r="${r*0.16}" fill="#1a3e8c"/>
    <circle cx="0" cy="${r*0.46}"  r="${r*0.16}" fill="#b53536"/>
  </g>`;

// Plum blossom sprite — five petals
const plumBlossom = (cx, cy, r, opacity = 0.7) => `
  <g transform="translate(${cx} ${cy})" opacity="${opacity}">
    ${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-${r*0.6}" rx="${r*0.4}" ry="${r*0.5}" fill="#e8a7a0" stroke="#7a1818" stroke-width="0.3" transform="rotate(${a})"/>`).join('')}
    <circle cx="0" cy="0" r="${r*0.18}" fill="#b53536"/>
  </g>`;

// Bamboo segment silhouette
const bamboo = (x, y, h, segments = 4) => `
  <g transform="translate(${x} ${y})">
    <rect x="-3" y="-${h}" width="6" height="${h}" fill="#0a0d0a" opacity="0.85"/>
    ${Array.from({length: segments}, (_, i) => `<line x1="-6" y1="${-(i*h/segments) - 4}" x2="6" y2="${-(i*h/segments) - 4}" stroke="#1a3a18" stroke-width="0.8"/>`).join('')}
    <!-- Two leaves -->
    <path d="M -2 -${h*0.7} Q -22 -${h*0.78} -28 -${h*0.66} Q -18 -${h*0.62} -2 -${h*0.66} Z" fill="#1a3a18"/>
    <path d="M  2 -${h*0.45} Q  22 -${h*0.53}  28 -${h*0.41} Q  18 -${h*0.37}  2 -${h*0.41} Z" fill="#1a3a18"/>
  </g>`;

// Crane silhouette — flying
const crane = (x, y, w) => `
  <g transform="translate(${x} ${y})">
    <path d="M -${w*0.5} 0 Q -${w*0.2} -${w*0.18} 0 -${w*0.12} Q ${w*0.2} -${w*0.05} ${w*0.5} -${w*0.04} L ${w*0.5} 0 Q ${w*0.2} -${w*0.02} 0 -${w*0.08} Q -${w*0.2} -${w*0.14} -${w*0.5} 0 Z" fill="#f1e6cb" stroke="#1a0e08" stroke-width="0.3"/>
    <circle cx="${w*0.5}" cy="-${w*0.04}" r="${w*0.025}" fill="#1a0e08"/>
  </g>`;

// Korean Five-Cloud band (오색구름) — stylised auspicious clouds
const fiveCloud = (cx, cy, w) => `
  <g transform="translate(${cx} ${cy})" opacity="0.8">
    <path d="M -${w*0.5} 0 Q -${w*0.42} -${w*0.12} -${w*0.32} -${w*0.06} Q -${w*0.22} -${w*0.16} -${w*0.10} -${w*0.08} Q 0 -${w*0.18} ${w*0.12} -${w*0.08} Q ${w*0.22} -${w*0.16} ${w*0.34} -${w*0.06} Q ${w*0.42} -${w*0.14} ${w*0.5} 0 Q ${w*0.4} ${w*0.04} ${w*0.32} 0 Q ${w*0.22} ${w*0.04} ${w*0.12} 0 Q 0 ${w*0.04} -${w*0.12} 0 Q -${w*0.22} ${w*0.04} -${w*0.32} 0 Q -${w*0.4} ${w*0.04} -${w*0.5} 0 Z" fill="none" stroke="#b53536" stroke-width="0.7" opacity="0.5"/>
    <path d="M -${w*0.5} ${w*0.08} Q -${w*0.42} -${w*0.04} -${w*0.32} ${w*0.02} Q -${w*0.22} -${w*0.08} -${w*0.10} 0 Q 0 -${w*0.10} ${w*0.12} 0 Q ${w*0.22} -${w*0.08} ${w*0.34} ${w*0.02} Q ${w*0.42} -${w*0.06} ${w*0.5} ${w*0.08}" fill="none" stroke="#f1e6cb" stroke-width="0.5" opacity="0.6"/>
  </g>`;

// Geobukseon (turtle ship) silhouette — distant
const turtleShip = (x, y, w) => `
  <g transform="translate(${x} ${y})">
    <!-- Hull -->
    <path d="M -${w*0.5} 0 Q -${w*0.45} -${w*0.18} -${w*0.3} -${w*0.2} L ${w*0.3} -${w*0.2} Q ${w*0.45} -${w*0.18} ${w*0.5} 0 Z" fill="#0d0a06" stroke="#b53536" stroke-width="0.4"/>
    <!-- Spiked shell -->
    <path d="M -${w*0.32} -${w*0.2} Q -${w*0.2} -${w*0.36} 0 -${w*0.36} Q ${w*0.2} -${w*0.36} ${w*0.32} -${w*0.2}" fill="#0d0a06" stroke="#b53536" stroke-width="0.4"/>
    ${Array.from({length:7}, (_, i) => `<line x1="${-w*0.28 + i*w*0.08}" y1="-${w*0.26}" x2="${-w*0.26 + i*w*0.08}" y2="-${w*0.34}" stroke="#b53536" stroke-width="0.5"/>`).join('')}
    <!-- Dragon prow -->
    <path d="M -${w*0.5} 0 L -${w*0.6} -${w*0.06} L -${w*0.55} -${w*0.12} L -${w*0.5} -${w*0.06} Z" fill="#b53536"/>
    <circle cx="-${w*0.55}" cy="-${w*0.08}" r="${w*0.012}" fill="#f1e6cb"/>
  </g>`;

// Pine branch silhouette
const pine = (x, y, w) => `
  <g transform="translate(${x} ${y})">
    <path d="M 0 0 Q -${w*0.2} -${w*0.4} -${w*0.5} -${w*0.5}" fill="none" stroke="#1a0e08" stroke-width="${w*0.06}"/>
    ${Array.from({length:5}, (_, i) => {
      const t = i / 4;
      const px = -t*w*0.5; const py = -t*w*0.5;
      return `<g transform="translate(${px} ${py})">
        <line x1="0" y1="0" x2="-${w*0.1}" y2="-${w*0.06}" stroke="#1a3a18" stroke-width="${w*0.025}"/>
        <line x1="0" y1="0" x2="${w*0.05}" y2="-${w*0.12}" stroke="#1a3a18" stroke-width="${w*0.025}"/>
        <line x1="0" y1="0" x2="-${w*0.04}" y2="-${w*0.12}" stroke="#1a3a18" stroke-width="${w*0.025}"/>
      </g>`;
    }).join('')}
  </g>`;

// Korean pavilion silhouette with proper giwa (sloped tile) roof
const pavilion = (cx, baseY, w) => `
  <g transform="translate(${cx} ${baseY})">
    <!-- Roof: characteristic Korean upturned eaves -->
    <path d="M -${w*0.5} 0 Q -${w*0.55} -${w*0.04} -${w*0.45} -${w*0.06} L -${w*0.35} -${w*0.18} L 0 -${w*0.28} L ${w*0.35} -${w*0.18} L ${w*0.45} -${w*0.06} Q ${w*0.55} -${w*0.04} ${w*0.5} 0 Z" fill="#1a0e08" stroke="#b53536" stroke-width="0.4"/>
    <!-- Roof ridge tiles -->
    <line x1="-${w*0.35}" y1="-${w*0.18}" x2="${w*0.35}" y2="-${w*0.18}" stroke="#b53536" stroke-width="0.6"/>
    <!-- Dancheong band -->
    <rect x="-${w*0.4}" y="0" width="${w*0.8}" height="${w*0.04}" fill="#b53536" opacity="0.55"/>
    <!-- Body columns + walls -->
    <rect x="-${w*0.35}" y="${w*0.04}" width="${w*0.7}" height="${w*0.34}" fill="#1a0e08" stroke="#b53536" stroke-width="0.3"/>
    <line x1="-${w*0.18}" y1="${w*0.04}" x2="-${w*0.18}" y2="${w*0.38}" stroke="#b53536" stroke-width="0.3"/>
    <line x1="${w*0.18}"  y1="${w*0.04}" x2="${w*0.18}"  y2="${w*0.38}" stroke="#b53536" stroke-width="0.3"/>
  </g>`;

// ========================================================================
// SCENE OVERRIDES — keyed by scene index. We only set fields we change.
// ========================================================================
const SCENE_OVERRIDES = {
  // 0 · LANDING
  0: {
    location: 'Joseon · Autumn 1597',
    locationLabel: 'JOSEON · AUTUMN OF THE FIRE YEAR',
    title: ['Twelve', 'Ships', '·', '<em>Yi</em>'],
    sub: 'An assessment of how you think, decide, and lead when pressure enters the room',
    note: 'Set in the months before the Battle of Myeongnyang — to bypass familiar assumptions and reveal the pattern beneath',
    cta: 'Enter the court'
  },
  // 1 · INTAKE
  1: {
    locationLabel: 'NAVAL ROSTER · CONFIDENTIAL',
    eyebrow: 'Before we begin',
    title: 'Present yourself to the court.',
    sub: 'Used to address you correctly through the campaign and to render your portrait.'
  },
  // 2 · CRAWL — opening prologue (briefing style with Korean seal)
  2: {
    locationLabel: 'PROLOGUE · ROYAL DISPATCH',
    crawlStyle: 'scroll',
    // Tightened from 56400 → 43400 so the whoosh fires ~1s after the footer fades.
    duration: 43400,
    markSvg: yiInkSeal,
    preamble: '1597 · Hanseong · The Court of Joseon',
    title: ['Twelve', 'Ships'],
    episode: 'Prologue · The Memorial',
    countdown: 'AUTUMN OF THE FIRE YEAR · THIRTEEN SHIPS REMAIN',
    paragraphs: [
      "It is a time of fire. Five long years of invasion have stretched the Joseon court to its limit. Old certainties — order, loyalty, the very meaning of patience — are being asked to bend.",
      "In the shadow of the fleet's defeat, the Council has summoned one rare voice. The Admiral believes {{firstName}} can think clearly when others panic. The kingdom does not lack plans. It lacks people who can hold the line when those plans fail.",
      "Admiral Won Gyun has risen to restore order to the sea. He waits for {{firstName}} in the war chamber at Yeosu. He has already begun to choose...."
    ]
  },
  // 3 · ACT 1 — THE MEMORIAL
  3: {
    location: 'Yeosu · Naval Command',
    locationLabel: 'YEOSU · WAR CHAMBER OF THE FLEET',
    eyebrow: 'Act One · The Summons',
    body: ['The', 'sea', 'is', 'narrowing.'],
    bodyAfter: [
      'Coastal villages burn at night. Scouts return without their captains. The captains who remain are asking for another council.',
      'You have been summoned, {{firstName}} — because you are believed to think clearly when others panic.'
    ]
  },
  // 4 · WON GYUN INTRODUCTION (narrative-scene · councilChamber)
  4: {
    locationLabel: 'ADMIRAL WON GYUN',
    quote: '"The fleet does not lack captains. It lacks people who can think clearly when those plans fail."',
    speaker: 'Admiral Won Gyun'
  },
  // 5 · Q1 — Understand Self
  5: {
    locationLabel: 'Q01 · UNDERSTAND SELF',
    setup: 'Won Gyun studies you. The chamber falls silent. You feel the weight of being watched — by him, and by yourself.',
    prompt: 'When pressure rises, I am aware of how my thinking and behaviour are beginning to change.'
  },
  // 6 · Q2 — Master Emotions (mc)
  6: {
    locationLabel: 'Q02 · MASTER EMOTIONS',
    setup: 'A junior officer is humiliated in front of the whole council. The room goes still. Heat rises in your chest.',
    prompt: 'In the moment, what do you most notice happening inside you?',
    options: [
      'A clean composure — I detach from the heat and keep the room orderly.',
      'A defensive impulse to step in immediately and reassert the council\'s discipline.',
      'A flash of anger or shame that I can name, but not yet act on cleanly.',
      'A steady warmth and a clear breath — I feel the reaction, choose how to respond, and act.',
      'A blankness — I freeze, and I notice the freeze itself.',
      'I leave the chamber emotionally before my body does.'
    ]
  },
  // 7 · Q3 — Embed Practices (rating)
  7: {
    locationLabel: 'Q03 · EMBED PRACTICES',
    setup: 'Between councils the corridor of the headquarters empties. A single moment of stillness before the next dispatch.',
    prompt: 'I have daily rituals — reflection, ink and brush, deliberate pauses — that I rely on to stay aware of myself under load.'
  },
  // 8 · ACT 2 SCENE (narrative-scene · fracturedCity)
  8: {
    locationLabel: 'ADMIRAL WON GYUN',
    quote: '"We are rebuilding the kingdom\'s honour. But people confuse caution with cowardice. Tell me — what would you do first?"',
    speaker: 'Admiral Won Gyun'
  },
  // 9 · Q4 — Be Future-Focused (ranking)
  9: {
    locationLabel: 'Q04 · BE FUTURE-FOCUSED',
    setup: 'Smoke rises from a coastal village to the south. Scouts report the enemy fleet is regrouping. Won Gyun waits for your answer.',
    prompt: 'You are asked to stabilise a sea-route under threat. Rank these priorities from first to last.',
    itemLabels: [
      'Understand the root causes before acting',
      'Build the long-term coastal defence that prevents recurrence',
      'Restore immediate naval control of the strait',
      'Secure the most senior captains so the chain of command holds'
    ]
  },
  // 10 · ACT 2 — COUNCIL OF CAPTAINS (narrative · chaoticCouncil)
  10: {
    locationLabel: 'YEOSU · COUNCIL OF CAPTAINS',
    eyebrow: 'Act Two · The Council',
    body: ['You', 'meet', 'the', 'captains.'],
    bodyAfter: [
      'They speak over each other. Fear. Anger. Blame. Maps spread across a low table.',
      'Won Gyun says nothing. He watches you instead.'
    ]
  },
  // 11 · Q5 — Listen Deeply (mc)
  11: {
    locationLabel: 'Q05 · LISTEN DEEPLY',
    setup: 'Three captains. One is silent — staring at the chart. Another is shouting. A third keeps glancing at the door.',
    prompt: 'What do you do first?',
    options: [
      'Step in and direct the council toward a clear next step.',
      'Stay quiet and observe — track who speaks, who avoids, who repeats themselves.',
      'Ask each captain one specific clarifying question, especially the silent one.',
      'Align them quickly around a shared plan to halt the chaos.',
      'Mirror back what I am hearing beneath the words — fear, exhaustion, betrayal.',
      'Defer the council until I can speak with each captain at his post individually.'
    ]
  },
  // 12 · Q6 — Listen Deeply (rating)
  12: {
    locationLabel: 'Q06 · LISTEN DEEPLY',
    setup: 'Won Gyun leans toward your ear. "Look at the silent one," he murmurs. "What is he telling you that the others are not?"',
    prompt: 'When conversations become chaotic, my instinct is to take control quickly — rather than stay present and read the pattern.'
  },
  // 13 · Q7 — Be Curious (mc)
  13: {
    locationLabel: 'Q07 · BE CURIOUS',
    setup: 'One captain hands you a sketch — a strait you have never sailed, with notations in a fisherman\'s hand. "This is what the disagreement is really about," he says.',
    prompt: 'How do you respond to the unfamiliar chart?',
    options: [
      'Politely set it aside — the strait is not the priority right now.',
      'Examine it, then ask three questions about what it shows and where it came from.',
      'Acknowledge it and promise to come back to it after the immediate situation is resolved.',
      'Ask him to walk me through it, slowly, before I respond to anything else in the room.',
      'Recognise the place from my training and reference it back to him authoritatively.',
      'Notice my reaction to not-knowing, and stay with the discomfort before responding.'
    ]
  },
  // 14 · CONVOY ARC → fleet under fire (narrative-scene)
  14: {
    locationLabel: 'NIGHT WATCH · A FLEET UNDER FIRE',
    quote: '"We engage now. Or we wait."',
    speaker: 'Admiral Won Gyun'
  },
  // 15 · Q8 — Manage Uncertainty (mc)
  15: {
    locationLabel: 'Q08 · MANAGE UNCERTAINTY',
    setup: 'A coastal squadron has sent fragmentary signals. You have a third of the picture. You have minutes.',
    prompt: 'What do you choose?',
    options: [
      'Order the attack with what I have — momentum matters more than completeness.',
      'Hold until I can confirm one critical scout report.',
      'Delegate the decision to the squadron commander closest to the engagement.',
      'Split the force — partial action on what I know, hold reserve for what I don\'t.',
      'Make the smallest reversible move, then re-read the situation.',
      'Refuse the false choice and ask what assumptions are forcing it.'
    ]
  },
  // 16 · Q9 — Manage Uncertainty (rating)
  16: {
    locationLabel: 'Q09 · MANAGE UNCERTAINTY',
    setup: 'Won Gyun watches your face for the half-second of doubt before you answer. He has seen this moment in a hundred others.',
    prompt: 'I am comfortable making high-stakes decisions without full information.'
  },
  // 17 · ACT 3 — THE BURNING COAST (narrative · aftermathMedbay)
  17: {
    locationLabel: 'AFTERMATH · COASTAL DAWN',
    eyebrow: 'Act Three · The Burning Coast',
    body: ['The', 'engagement', 'is', 'over.', 'But', 'at', 'a', 'cost.'],
    bodyAfter: [
      'Coastal villages burned. Fishermen and farmers lost.',
      'Won Gyun remains calm. "Necessary," he says. You feel something shift.'
    ]
  },
  // 18 · Q10 — Master Emotions (mc)
  18: {
    locationLabel: 'Q10 · MASTER EMOTIONS',
    setup: 'You stand in the courtyard at dawn. A surgeon\'s hands are shaking. A list of names is being read. Won Gyun waits at the gate.',
    prompt: 'In moments with heavy moral consequence, you most often:',
    options: [
      'Stay composed and move forward — the campaign needs me functional now.',
      'Pause, reflect deeply, name what I feel, and only act once I have processed it.',
      'Question the decision afterwards — was it really the right call?',
      'Create deliberate distance from the emotion to think clearly.',
      'Sit with the people most affected before I sit with anything else.',
      'Channel the weight into a clearer commitment about what I will not do again.'
    ]
  },
  // 19 · Q11 — Think Critically (mc)
  19: {
    locationLabel: 'Q11 · THINK CRITICALLY',
    setup: 'You replay the engagement. Three different briefings before the order was given. Three different versions of what was true. One was the one Won Gyun handed you first.',
    prompt: 'You suspect a troubling pattern in how decisions are being framed for you. What do you do?',
    options: [
      'Challenge it directly in the next council.',
      'Quietly gather evidence across several decisions before raising anything.',
      'Run a small experiment — frame the next dispatch differently and see what happens.',
      'Set it aside — pattern recognition under stress is unreliable.',
      'Share my hypothesis with one trusted captain and ask them to challenge it.',
      'Send three scouts to ask the same question of different villages and triangulate.'
    ]
  },
  // 20 · Q12 — Be Curious (rating)
  20: {
    locationLabel: 'Q12 · BE CURIOUS',
    setup: 'A retired admiral from the southern province offers to teach you his model of tide and current — the old way, before the war. It will take three evenings.',
    prompt: 'When I encounter an idea that does not fit my model of the world, my first impulse is to lean in, not push back.'
  },
  // 21 · MIDPOINT 1 — Admiral Yi's modest cottage
  21: {
    locationLabel: "ADMIRAL YI'S COTTAGE · INTERLUDE · 01 / 03",
    eyebrow: 'Interlude · Admiral Yi',
    intro: 'You leave Yeosu under a moon. A long ride to a modest village. The cottage door is open. Admiral Yi Sun-sin is at a low desk, ink stick and brush in hand, copying a passage from the Analects. He does not ask you to sit. He does not ask you to answer aloud. He asks you three questions, one at a time. Write only what is true.',
    showIntro: true,
    prompt: 'What are you noticing about how you are <em>thinking</em>?',
    placeholder: 'The shape your thoughts have been taking…',
    hint: 'A line, a phrase, an image — whatever is true right now.'
  },
  // 22 · MIDPOINT 2
  22: {
    locationLabel: "ADMIRAL YI'S COTTAGE · INTERLUDE · 02 / 03",
    eyebrow: 'Interlude · Admiral Yi',
    prompt: 'What are you noticing about how you are <em>feeling</em>?',
    placeholder: 'Name it without judging it…',
    hint: 'Whatever it is — the Admiral is not surprised.'
  },
  // 23 · MIDPOINT 3
  23: {
    locationLabel: "ADMIRAL YI'S COTTAGE · INTERLUDE · 03 / 03",
    eyebrow: 'Interlude · Admiral Yi',
    prompt: 'What are you noticing about how you are <em>behaving</em>?',
    placeholder: 'What you have done — or not done — that you can already see…',
    hint: 'You do not have to know yet. The campaign continues when you do.'
  },
  // 24 · ACT 4 — THE PATTERN (narrative · shadowPattern)
  24: {
    locationLabel: 'ACT FOUR · THE PATTERN',
    eyebrow: 'Act Four · The Pattern',
    body: ['You', 'begin', 'to', 'notice', 'something.'],
    bodyAfter: [
      'Won Gyun chooses aggression over reconnaissance. Speed over consensus. Certainty over doubt.',
      'The pattern is subtle. Once seen, impossible to ignore.'
    ]
  },
  // 25 · Q13 — Think Critically (rating)
  25: {
    locationLabel: 'Q13 · THINK CRITICALLY',
    setup: 'A scout report arrives with a tidy explanation. It is plausible. It is fast. It is exactly what you would prefer to be true.',
    prompt: 'When an explanation feels neat and immediately convincing, I deliberately slow down and look for what it might be hiding.'
  },
  // 26 · PRIVATE MEETING with Won Gyun
  26: {
    locationLabel: "ADMIRAL WON GYUN'S QUARTERS · LATE",
    quote: '"The council is weak. They hesitate. They demand more scouts. We don\'t need more voices. We need a victory."',
    speaker: 'Admiral Won Gyun'
  },
  // 27 · Q14 — Influence Effortlessly (mc)
  27: {
    locationLabel: 'Q14 · INFLUENCE EFFORTLESSLY',
    setup: 'Won Gyun wants you to help him build alignment across the captains. He asks you how.',
    prompt: 'What do you believe is the most effective way to create lasting alignment?',
    options: [
      'Persuasion through logic and evidence.',
      'Authority and clarity — direction beats debate.',
      'Emotional connection — meet people where they live.',
      'Shared ownership — they helped design it, so they help defend it.',
      'A story — one frame that makes everyone\'s contribution visible.',
      'Repetition — the same clear message delivered the same way until it lands.'
    ]
  },
  // 28 · Q15 — Unlock Creativity (ranking)
  28: {
    locationLabel: 'Q15 · UNLOCK CREATIVITY',
    setup: 'You are asked to redesign a failing engagement plan. The old plan is technically sound, but politically brittle. It solves the naval problem and worsens the village one.',
    prompt: 'Rank your approach to redesigning the plan, from first to last.',
    itemLabels: [
      'Generate as many divergent options as possible before narrowing',
      'Seek external perspectives from fishermen, farmers, and old sailors',
      'Build a small experimental engagement and iterate',
      'Refine the existing plan — the bones are sound'
    ]
  },
  // 29 · Q16 — Unlock Creativity (rating)
  29: {
    locationLabel: 'Q16 · UNLOCK CREATIVITY',
    setup: 'You stand in front of an empty sea chart. The brief: a path forward no one has considered.',
    prompt: 'When constraints tighten, my first instinct is to reframe the problem rather than push harder on the old plan.'
  },
  // 30 · ACT 5 — THE QUIET COUNCIL (narrative · alliesWhisper)
  30: {
    locationLabel: 'ACT FIVE · THE QUIET COUNCIL',
    eyebrow: 'Act Five · The Quiet Council',
    body: ['Your', 'fellow', 'officers', 'begin', 'to', 'question', 'Won Gyun.'],
    bodyAfter: [
      'Quietly. Carefully. They do not accuse him. They simply ask whether the campaign\'s direction has changed.',
      'Won Gyun calls it treason.'
    ]
  },
  // 31 · Q17 — Collaborate Inclusively (mc)
  31: {
    locationLabel: 'Q17 · COLLABORATE INCLUSIVELY',
    setup: 'Three of your closest allies pull you aside between watches. They are afraid. They are not wrong. But Won Gyun is watching the war chamber.',
    prompt: 'What do you do?',
    options: [
      'Align them with the Admiral quickly to keep the council intact.',
      'Encourage open debate — the dissent is the data.',
      'Mediate between them — surface the assumptions on each side.',
      'Escalate the concerns formally to the court.',
      'Create a private structure for them to speak safely until I understand the pattern.',
      'Wait — disagreement under pressure rarely produces the truest answer.'
    ]
  },
  // 32 · Q18 — Collaborate Inclusively (rating)
  32: {
    locationLabel: 'Q18 · COLLABORATE INCLUSIVELY',
    setup: 'You sense the captains around you self-editing. Smoothing. Withholding the honest scout report.',
    prompt: 'I actively invite people to disagree with me — and I work to make them safer when they do.'
  },
  // 33 · Q19 — Collaborate Inclusively (mc)
  33: {
    locationLabel: 'Q19 · COLLABORATE INCLUSIVELY',
    setup: 'A delegation of village elders arrives. They will not speak with Won Gyun. They will only speak with you. They are not soldiers.',
    prompt: 'How do you set up the conversation?',
    options: [
      'In the formal war chamber — institutional weight signals respect.',
      'On their terms, in a place they choose, with their own translators.',
      'Privately, just me and their three elders, so trust can build first.',
      'I send a representative first to understand the protocols.',
      'Open the meeting — anyone in their group can speak in any order.',
      'Around food. Real food. We eat before we negotiate.'
    ]
  },
  // 34 · BREAKING POINT — order to blockade fishing villages (narrative-scene)
  34: {
    locationLabel: "ADMIRAL'S DAIS · ORDER DELIVERED",
    quote: '"The southern villages refuse our requisitions. Cut their fishing fleet from the sea. Apply pressure. We sail on schedule."',
    speaker: 'Admiral Won Gyun'
  },
  // 35 · Q20 — Act Decisively (mc)
  35: {
    locationLabel: 'Q20 · ACT DECISIVELY',
    setup: 'The order is given. The room understands the implication — those villages will starve. Every eye finds yours.',
    prompt: 'You believe the order will cause serious harm. What do you do?',
    options: [
      'Follow the order — chain of command exists for a reason.',
      'Challenge it privately, after the room clears.',
      'Refuse openly, in front of everyone.',
      'Propose an alternative that solves the supply problem without the harm — right now, in the room.',
      'Delay — buy time and re-open the question with new evidence.',
      'Step out of the chain entirely and warn the villages directly.'
    ]
  },
  // 36 · Q21 — Act Decisively (rating)
  36: {
    locationLabel: 'Q21 · ACT DECISIVELY',
    setup: 'There is a moment where waiting another hour will cost more than a wrong call.',
    prompt: 'When a clear trade-off is required, I make the call — and I own it, including what it costs.'
  },
  // 37 · Q22 — Future-Focused (rating)
  37: {
    locationLabel: 'Q22 · BE FUTURE-FOCUSED',
    setup: 'A choice will solve today and create something heavier next year.',
    prompt: 'I weigh the long-term consequences of a decision as seriously as the immediate outcome.'
  },
  // 38 · Q23 — Future-Focused (mc)
  38: {
    locationLabel: 'Q23 · BE FUTURE-FOCUSED',
    setup: 'A young officer asks you: "What are we trying to build, ten years from now, that justifies this?"',
    prompt: 'What is your honest answer?',
    options: [
      'I focus on this campaign. Ten years is a story we tell ourselves.',
      'A coast where this engagement never has to be made again.',
      'Order. Discipline. The freedom that comes from things actually working.',
      'People — specifically, more captains like you, ready to make hard calls well.',
      'I don\'t fully know yet. That is part of why I am still here, listening.',
      'A council that can disagree without breaking.'
    ]
  },
  // 39 · Q24 — Embed Practices (mc)
  39: {
    locationLabel: 'Q24 · EMBED PRACTICES',
    setup: 'At the end of the watch, the chamber empties. You have twenty quiet minutes before sleep.',
    prompt: 'What do you most often do with that time?',
    options: [
      'Catch up on dispatches I missed — the day is never finished.',
      'Walk in silence — let the day settle on its own.',
      'Write — what I noticed, what I felt, what I decided badly.',
      'Speak with one person I trust who is not part of this campaign.',
      'Read something with no obvious purpose — poetry, history, anything else.',
      'Sleep — recovery is the practice.'
    ]
  },
  // 40 · ACT 6 — THE MIRROR IN THE CABIN (narrative · reckoningMirror)
  40: {
    locationLabel: 'PRIVATE LOG · LATE',
    eyebrow: 'Act Six · The Mirror in the Cabin',
    body: ['You', 'review', 'the', 'decisions.'],
    bodyAfter: [
      'The saved engagement. The silenced councils. The reframed dissent.',
      'The language of duty becoming the machinery of control. Not duty. Compliance.'
    ]
  },
  // 41 · Q25 — Understand Self (short text)
  41: {
    locationLabel: 'Q25 · UNDERSTAND SELF',
    setup: 'A reflection between scenes. Write what you actually feel — not what would sound impressive.',
    prompt: 'Looking back, when did you first sense something was wrong?',
    placeholder: 'A moment, a sentence, a feeling — write it freely…',
    hint: '1–3 sentences · not scored automatically · used to surface where you notice weak signals'
  },
  // 42 · CONFRONTATION with Won Gyun (narrative-scene)
  42: {
    locationLabel: "CONFRONTATION · WON GYUN'S TENT",
    quote: '"Order requires control, {{firstName}}. Mercy is inefficient. You and I want the same thing."',
    speaker: 'Admiral Won Gyun'
  },
  // 43 · Q26 — Influence Effortlessly (mc)
  43: {
    locationLabel: 'Q26 · INFLUENCE EFFORTLESSLY',
    setup: 'Won Gyun is not angry. He is calm. He believes every word. He wants you to walk out of this tent as his ally.',
    prompt: 'How do you respond to him — not as strategy, but as influence?',
    options: [
      'I dismantle his argument logically, piece by piece.',
      'I find the human inside the position and speak to that.',
      'I tell him what he is becoming, gently and without contempt.',
      'I ask him three questions he can\'t answer without revealing himself.',
      'I refuse the false alliance openly and walk out.',
      'I sit with him in silence until the silence does the work.'
    ]
  },
  // 44 · Q27 — Influence Effortlessly (rating)
  44: {
    locationLabel: 'Q27 · INFLUENCE EFFORTLESSLY',
    setup: 'A test that lives outside this campaign too: how others come to trust your judgement.',
    prompt: 'People I serve with adopt my recommendations because of trust and clarity — not because of position, volume, or pressure.'
  },
  // 45 · Q28 — Master Emotions (rating)
  45: {
    locationLabel: 'Q28 · MASTER EMOTIONS',
    setup: 'A confrontation just ended. Your hands are still steady, but something is moving underneath.',
    prompt: 'In high-stress moments, I can recognise what I am feeling, name it, and stay engaged with the situation.'
  },
  // 46 · Q29 — Understand Self (mc)
  46: {
    locationLabel: 'Q29 · UNDERSTAND SELF',
    setup: 'A trusted captain tells you: "You become more controlling when you are afraid. I don\'t think you see it."',
    prompt: 'What is your honest first reaction?',
    options: [
      'Defensive — I want to explain why he is wrong.',
      'Curious — I want him to tell me the three most recent examples.',
      'Grateful — but unsure whether to believe it yet.',
      'I already knew. I just hadn\'t admitted it.',
      'Quietly hurt — I will sit with it before I respond.',
      'I dismiss it — he doesn\'t see the pressure I am under.'
    ]
  },
  // 47 · Q30 — Listen Deeply (rating)
  47: {
    locationLabel: 'Q30 · LISTEN DEEPLY',
    setup: 'In conversations that matter, you can choose to listen for words — or for everything else.',
    prompt: 'I listen for what is unsaid — tone, silence, what people avoid — as carefully as I listen for what is said.'
  },
  // 48 · ACT 7 — TWELVE SHIPS (narrative · dividedChamber)
  48: {
    locationLabel: 'ACT SEVEN · TWELVE SHIPS',
    eyebrow: 'Act Seven · Twelve Ships',
    body: ['The', 'court', 'is', 'divided.'],
    bodyAfter: [
      'Word has come from Chilcheollyang. The fleet is lost. Twelve ships remain afloat.',
      'A new order arrives from the king — and you must choose your position. The Japanese fleet of three hundred is sailing for Myeongnyang.'
    ]
  },
  // 49 · Q31 — Act Decisively (mc)
  49: {
    locationLabel: 'Q31 · ACT DECISIVELY',
    setup: 'The chamber is full. The order in five minutes. You do not get to abstain.',
    prompt: 'What do you do?',
    options: [
      'Support Won Gyun\'s remaining loyalists — order above all.',
      'Oppose them openly — the fleet must follow Yi.',
      'Seek a compromise between the factions.',
      'Propose a third structure — a new command architecture for the twelve ships.',
      'Step back entirely — let the court resolve it.',
      'Buy time — call for a 24-hour deliberation under the king\'s seal.'
    ]
  },
  // 50 · Q32 — Be Curious (mc)
  50: {
    locationLabel: 'Q32 · BE CURIOUS',
    setup: 'The dust settles. You are offered a role on Admiral Yi\'s restored staff. You will need to keep learning, fast, for the rest of your career.',
    prompt: 'How will you actually do that?',
    options: [
      'I will surround myself with senior captains and listen to their summaries.',
      'I will deliberately spend time with people whose discipline I do not share — fishermen, farmers, foreign scholars.',
      'I will read across fields I have no professional reason to study.',
      'I will travel to provinces I have never visited and listen before I speak.',
      'I will keep a record of what I got wrong, and review it monthly.',
      'I will teach — because teaching exposes what I do not actually understand.'
    ]
  },
  // 51 · Q33 — Manage Uncertainty (mc)
  51: {
    locationLabel: 'Q33 · MANAGE UNCERTAINTY',
    setup: 'A new threat is emerging in a strait you do not know. You have no precedent. You have no chart.',
    prompt: 'What is your first move?',
    options: [
      'Commit to a clear direction — uncertainty is the enemy of momentum.',
      'Wait for clarity — the wrong action is worse than no action.',
      'Run several small scouting missions at once — let reality teach me.',
      'Find a fisherman who has lived the strait and learn before I decide.',
      'Hold the situation lightly — name what I don\'t know, out loud.',
      'Set a deadline by which I must decide, regardless.'
    ]
  },
  // 52 · Q34 — Embed Practices (rating)
  52: {
    locationLabel: 'Q34 · EMBED PRACTICES',
    setup: 'The practices that change you are the ones you do when nobody is watching.',
    prompt: 'I have at least one reflection or learning ritual that I have sustained — even when pressure makes it inconvenient.'
  },
  // 53 · Q35 — Think Critically (mc)
  53: {
    locationLabel: 'Q35 · THINK CRITICALLY',
    setup: 'A clean scout report arrives. Everything fits. The author is competent. The recommendation is exactly what the court wants to hear.',
    prompt: 'What do you do first?',
    options: [
      'Accept the recommendation — the scout is good and the council has more pressing matters.',
      'Ask what evidence would change the conclusion — and whether any of it has been gathered.',
      'Identify the assumption that, if wrong, breaks the whole story.',
      'Bring in one officer who will disagree by reflex — and let them.',
      'Re-frame the question and watch how the recommendation does or does not survive.',
      'Run it past my gut and only intervene if it complains.'
    ]
  },
  // 54 · Q36 — Unlock Creativity (mc)
  54: {
    locationLabel: 'Q36 · UNLOCK CREATIVITY',
    setup: 'A constraint everyone treats as fixed — supplies, time, tradition, royal decree — is the thing keeping you stuck.',
    prompt: 'How do you most often work with constraints like that?',
    options: [
      'I respect them and find efficiency within.',
      'I ignore them and design what is actually needed first, then negotiate.',
      'I treat them as design material and let them shape the solution in surprising ways.',
      'I invite the people enforcing the constraint into the redesign.',
      'I find the original reason the constraint exists — then test whether it still applies.',
      'I look for analogies in completely unrelated domains — agriculture, calligraphy, weather.'
    ]
  },
  // 55 · TWIST — the dispatch
  55: {
    locationLabel: 'DISPATCH · OUTBOUND',
    body: [
      'A messenger arrives from the king.',
      'The court is speaking. Not about Won Gyun. About <em>you</em>.',
      'Your recommendations. Your decisions. Your silence when it mattered.',
      'Won Gyun turns. Smiles.'
    ],
    quote: '"You still think this was my campaign? Every step — you justified it."',
    speaker: 'Admiral Won Gyun'
  },
  // 56-59 END REFLECTIONS
  56: {
    locationLabel: 'CLOSING REFLECTION · 01 / 04',
    eyebrow: 'Closing reflection · Strengths',
    intro: 'Before the result — four quiet questions. Write only what is true.',
    prompt: 'In which moment of this campaign did you feel <em>most like yourself</em>? Where did your real strength show up?',
    placeholder: 'Name the scene, the choice, the feeling…'
  },
  57: {
    locationLabel: 'CLOSING REFLECTION · 02 / 04',
    eyebrow: 'Closing reflection · Beliefs',
    prompt: 'Which <em>belief</em> of yours was tested by this campaign — about people, command, or yourself?',
    placeholder: 'A belief you held coming in, that has shifted or been confirmed…'
  },
  58: {
    locationLabel: 'CLOSING REFLECTION · 03 / 04',
    eyebrow: 'Closing reflection · Mindset',
    prompt: 'What <em>mindset shift</em> — if you made it — would change how you act under pressure?',
    placeholder: 'From X to Y…'
  },
  59: {
    locationLabel: 'CLOSING REFLECTION · 04 / 04',
    eyebrow: 'Closing reflection · Behaviour',
    prompt: 'Which single <em>skill or behaviour</em> — if you built it deliberately over the next ninety days — would change everything?',
    placeholder: 'The one practice you would commit to…'
  },
  // 60 · REFRAME before results
  60: {
    locationLabel: 'REFRAME · BEFORE THE RESULT',
    body: [
      'This campaign was never about whether you were a hero or a villain.',
      'It was about something more useful:',
      'How easily good intentions <em>drift</em> under deadline pressure.',
      'How quickly duty becomes compliance.',
      'How subtly clarity becomes certainty.'
    ],
    quote: 'And how much strategic capability depends on the ability to notice yourself before the pattern becomes the path.',
    speaker: 'Reading your result'
  }
};

function applySceneOverride(orig, ov) {
  if (!ov) return orig;
  const merged = JSON.parse(JSON.stringify(orig));
  Object.entries(ov).forEach(([k, v]) => {
    if (k === 'options' && Array.isArray(orig.options) && Array.isArray(v)) {
      merged.options = orig.options.map((opt, i) => ({ ...opt, copy: v[i] || opt.copy }));
    } else if (k === 'itemLabels' && Array.isArray(orig.items)) {
      merged.items = orig.items.map((it, i) => ({ ...it, label: v[i] || it.label }));
    } else {
      merged[k] = v;
    }
  });
  return merged;
}

const scenes = SCENES.map((s, i) => applySceneOverride(s, SCENE_OVERRIDES[i]));

// ========================================================================
// ARCHETYPES — Yi-themed naval ranks
// ========================================================================
const archetypes = {
  reactive_defender: {
    name: 'The Cadet Under Fire',
    band: 'Strategic Infancy',
    headline: 'You care about defending the coast — but pressure may be driving more of your strategy than you realise.',
    body: 'Your result suggests that when stakes rise, your attention narrows fast. You may move into reaction, urgency, loyalty, or defence before you have understood what is happening. You are committed and action-oriented — but the same energy that makes you formidable in a skirmish can make you blind to the pattern beneath it. You may respond to symptoms rather than causes, miss weak scout signals, or confuse motion with progress.',
    risk: 'Your risk is not lack of effort. It is pressure-led action. You may be protecting the kingdom while reinforcing the very patterns that weaken it.',
    focus: 'Start at Level 1 — <em>Deepen Self-Awareness</em>. Notice your pressure patterns. Name your triggers. Build a pause before reacting. Separate fact from interpretation. Ask, "What am I not seeing yet?"',
    next: 'Your first breakthrough is likely to come from seeing your own operating system more clearly — before you change anything else.'
  },
  tactical_survivor: {
    name: 'The Coastal Captain',
    band: 'Tactical Survivor',
    headline: 'You can handle pressure — but your command may be too anchored in the immediate engagement.',
    body: 'You are capable, practical, and effective in difficult straits. You make decisions, keep momentum, and solve immediate problems. Your result suggests, though, that short-term demands may be crowding out longer-term strategic thinking. You may prioritise control over understanding, optimise for victory rather than direction, and carry too much yourself.',
    risk: 'Your risk is tactical over-functioning. You may become so good at surviving the current engagement that you unintentionally normalise crisis as the operating model.',
    focus: 'Strengthen Level 3 — <em>Develop Strategic Capabilities</em>. Focus on future-orientation, creative options, and acting well in uncertainty. Move from "What needs fixing now?" to "What future are we creating through this decision?"',
    next: 'Your growth edge is widening the time horizon you actually think in — from this watch, to this dynasty.'
  },
  hidden_drifter: {
    name: 'The Compromised Commander',
    band: 'Hidden Drift',
    headline: 'You are more strategic than most — but your blindspots may emerge precisely when you feel most certain.',
    body: 'You are thoughtful, capable, and likely well-intentioned. You can see complexity, make decisions, and influence others. But your result suggests a subtle risk: under pressure, your strengths may distort. Clarity becomes certainty. Decisiveness becomes control. Conviction becomes justification. Calm becomes detachment. This is the most psychologically important result because it mirrors how strategic drift happens in real campaigns — not through incompetence, but through capable officers making apparently reasonable choices under pressure.',
    risk: 'Your risk is <em>justified drift</em>. You may continue making decisions that each seem defensible while the wider pattern moves quietly away from your stated values.',
    focus: 'Work across Levels 1 and 2 together — <em>Deepen Self-Awareness</em> and <em>Cultivate Open-Mindedness</em>. Notice yourself under pressure. Listen most carefully when you disagree. Test the assumptions you would rather keep. Invite challenge. Watch the moment when "necessary" becomes a dangerous word.',
    next: 'Your fastest development will come from learning to notice earlier — before the pattern becomes the path.'
  },
  strategic_operator: {
    name: 'The Squadron Admiral',
    band: 'Strategic Operator',
    headline: 'You show strong strategic capability and a relatively balanced pattern under pressure.',
    body: 'Your result suggests you can remain clear, reflective, and effective in complex situations. You likely balance action with thought, confidence with humility, and direction with collaboration. Composure under fire, thoughtful decisions, openness to council, alignment with crown and crew, and awareness of consequence are all visible in your pattern.',
    risk: 'Your risk is not capability — it is consistency. Under enough pressure, even strong admirals drift into old patterns. The opportunity is to make your strategic capability more reliable, more repeatable, and more visible to others.',
    focus: 'Strengthen Level 4 — <em>Scale Your Impact</em>. Decision quality, council alignment, influence without over-control, collaboration under tension. Turning strategic insight into action that travels.',
    next: 'Your growth edge is becoming more conscious — and more deliberate — about the impact you already have.'
  },
  force_multiplier: {
    name: 'The Architect of the Fleet',
    band: 'Strategic Force Multiplier',
    headline: 'You do not just think strategically. You increase the strategic capacity of the captains and kingdom around you.',
    body: 'Your result suggests a highly integrated strategic profile. You can stay aware of yourself under pressure, regulate emotion without disconnecting from consequence, listen deeply, think critically, generate options in uncertainty, decide with courage and humility, and influence without domination. You hold complexity without collapsing into confusion or control.',
    risk: 'Your risk is <em>over-reliance</em>. Others may look to you for clarity, judgement, and steadiness. Over time, that can quietly create dependency — unless you intentionally build capability in the fleet around you.',
    focus: 'Your next level is multiplication. Develop strategic capability in others. Design decision systems. Build collective intelligence. Create the conditions for others to hold uncertainty without panic.',
    next: 'Your development edge is to become less necessary — by making the fleet more strategically capable.'
  }
};

// ========================================================================
// SECONDARY PATTERNS — Yi-themed
// ========================================================================
const secondaryPatterns = {
  architect_of_order: {
    name: 'The Discipline Hawk',
    headline: 'Drawn to order, command, and decisive action.',
    body: 'You are highly effective in moments of chaos. But unchecked, your strength becomes rigidity. You may begin to mistake disagreement for cowardice, ambiguity for failure, and speed for strategy.'
  },
  the_justifier: {
    name: 'The Excuses of War',
    headline: 'At risk of rationalising questionable orders when the campaign feels important enough.',
    body: 'This does not mean you lack values. It means your values can become vulnerable when victory, loyalty, or royal pressure enters the room.'
  },
  the_calm_blade: {
    name: 'The Iron Hand',
    headline: 'Composed in moments that unsettle others on the deck.',
    body: 'That composure is valuable. But there is a fine line between regulation and emotional distance. Your edge is to remain steady without becoming disconnected from human consequence.'
  },
  the_consensus_seeker: {
    name: 'The Council Builder',
    headline: 'You create inclusion and invite voice — but may delay difficult orders.',
    body: 'Your development edge is to preserve collaboration while becoming more decisive when the moment closes.'
  },
  the_decisive_commander: {
    name: "The Cannon's Voice",
    headline: 'You move quickly and bring momentum — but your speed may narrow the field of scouting.',
    body: 'Your edge is to slow down just enough to hear what the sea is trying to tell you.'
  },
  vision_under_strain: {
    name: 'The Strategist Faltering',
    headline: 'You see beyond the immediate engagement, but pressure may disrupt your steadiness on deck.',
    body: 'Your edge is to build inner stability so your vision survives contact with reality.'
  }
};

// ========================================================================
// RISK COPY — Yi-themed
// ========================================================================
const riskCopy = {
  control_bias: {
    name: 'Command Reflex',
    low:   'You appear able to pursue clarity without defaulting to command.',
    mod:   'You may sometimes overvalue speed, certainty, or rank when pressure rises.',
    high:  'You may be at risk of mistaking <em>command for strategy</em>. This can make you decisive — but it may also reduce listening, creativity, and trust on deck.',
    q:     'Where might you be calling something <em>discipline</em> when it is actually obedience?'
  },
  moral_drift: {
    name: 'Battle Drift',
    low:   'Your responses suggest a relatively strong ability to keep means and ends connected.',
    mod:   'You may occasionally justify difficult orders when the campaign feels important enough.',
    high:  'You may be vulnerable to rationalising harmful choices if they appear necessary for the victory.',
    q:     'At what point does a necessary compromise become a betrayal of the campaign itself?'
  },
  detachment_pressure: {
    name: 'Iron Composure',
    low:   'You appear able to stay connected to human consequence while under pressure.',
    mod:   'Your composure is a strength, but it may sometimes become distance.',
    high:  'You may remain calm in ways others on deck experience as emotionally unavailable, overly rational, or disconnected from impact.',
    q:     'How do you stay steady without becoming unreachable?'
  }
};

// ========================================================================
// NEXT STEPS — Yi-themed practical experiments
// ========================================================================
const nextSteps = {
  reactive_defender: [
    { icon: 'pause',   title: 'The five-breath pause',        body: 'Before responding to a scout report, count five full breaths. Notice what your body wants to do, then choose what to do.', test: 'Try for 7 watches. Track each time you used it.' },
    { icon: 'journal', title: 'A nightly two-line log',        body: 'Each evening write: "Today I noticed…" and "Tomorrow I will…". Build the muscle of self-observation.',                       test: 'Do this for 21 days, then re-read the lot.' },
    { icon: 'mirror',  title: 'Ask one captain',               body: 'Ask one trusted captain: "When pressure rises, what do you see me become on deck?" Listen without defending.',                test: 'One question, one person, this week.' },
    { icon: 'question',title: 'Replace "should" with "if"',    body: 'Notice your "shoulds" — they are usually pressure speaking. Reframe to "if I did this, what would happen?" Re-open the choice.', test: 'Count your "shoulds" for one day. Reframe three.' }
  ],
  tactical_survivor: [
    { icon: 'horizon',  title: 'The ten-year question',           body: 'On any non-trivial decision, ask: "What does this look like a decade from now?" Forces you out of fire-fighting and into direction.', test: 'Apply to your next three meaningful decisions.' },
    { icon: 'experiment', title: 'Run one strategic experiment',  body: 'Pick one current problem. Generate four genuinely different solutions before settling on one. Build option-fluency.',                  test: 'One problem, four options, this week.' },
    { icon: 'doors',    title: 'Future-back planning',           body: 'Describe in detail what good looks like 18 months from now. Then walk backwards: what decision today would matter then?',              test: '90 minutes, a single page, by the new moon.' },
    { icon: 'reframe',  title: 'Trade urgency for importance',   body: 'For one week, mark every order as either urgent OR important. Notice the ratio. Notice what does not survive scrutiny.',                test: 'Audit for 5 days. Drop three urgent-not-important items.' }
  ],
  hidden_drifter: [
    { icon: 'notice',   title: 'The drift word audit',           body: 'Notice when you use words like "necessary", "no choice", "this once". Each is a possible drift signal. Pause, name, examine.',         test: 'Track for two weeks. Bring the list to a mentor.' },
    { icon: 'invite',   title: 'Invite your strongest dissenter', body: 'Identify the captain most likely to disagree with you. Invite them into a real decision. Treat their resistance as data.',           test: 'One conversation, this month. Document what shifted.' },
    { icon: 'mirror',   title: 'The three captains sentence',     body: 'Ask three captains: "What is one thing about my pattern under pressure that I probably do not see?" Listen without explaining.',      test: 'Three people, one question, no defending.' },
    { icon: 'pause',    title: 'Slow down on the certain ones',   body: 'When a call feels obvious, you are most at risk. Apply a 24-hour rule to anything you are certain about.',                             test: 'Use the rule three times this month.' }
  ],
  strategic_operator: [
    { icon: 'multiply', title: 'Develop one other officer',       body: 'Choose one officer in your orbit. Help them build a strategic muscle they currently lack. Multiplication begins with one.',           test: 'Name the person. Name the muscle. Begin.' },
    { icon: 'decide',   title: 'Make decisions more visible',     body: 'When you make a meaningful call, share publicly what you considered and what you weighed. Make the strategy legible.',                 test: 'Try this on three decisions this month.' },
    { icon: 'reframe',  title: 'Sharpen the consequential 20%',   body: 'Identify the 20% of your decisions that drive 80% of outcomes. Concentrate your thinking time there. Delegate or systematise the rest.', test: 'Map your decisions for a week. Re-balance time.' },
    { icon: 'experiment', title: 'Pick one risk to deliberately reduce', body: 'Look at your three risk overlays. Choose the one closest to becoming a real constraint. Design a small practice to soften it.', test: 'One overlay, one practice, 30 days.' }
  ],
  force_multiplier: [
    { icon: 'multiply', title: 'Design a decision system',         body: 'Create a clear template for how strategic decisions get made in your command — owner, evidence, options, trade-offs, review. Replicable, not heroic.', test: 'Build the v1 template. Apply to your next big call.' },
    { icon: 'invite',   title: 'Build the bench',                  body: 'Identify three captains who could become the next layer of strategic capability. Invest in them deliberately, with regular feedback and stretch decisions.', test: 'Three names. One conversation each, this month.' },
    { icon: 'mirror',   title: 'Make yourself less necessary',     body: 'In every council this month, ask: "Could someone else here have led this?" Then arrange for that to be true next time.',                test: 'One month of audit. Hand off two recurring councils.' },
    { icon: 'horizon',  title: 'Author the long memorial',         body: 'Write a short paper on the strategic capability you want your wider command to have in three years. Use it as a north star — share, debate, refine.', test: 'One page. Share with three trusted readers.' }
  ]
};

// ========================================================================
// IMAGE MAP + PROMPTS — Joseon-era naval ink-and-brush concept art
// ========================================================================
const imageMap = {
  archetypeDir: 'images/skin-yi/',
  scene: {
    councilChamber:  'images/skin-yi/scene-war-chamber.png',
    fracturedCity:   'images/skin-yi/scene-burning-coast.png',
    convoyArc:       'images/skin-yi/scene-fleet-under-fire.png',
    privateMeet:     'images/skin-yi/scene-private-meeting.png',
    breakingPoint:   'images/skin-yi/scene-admirals-dais.png',
    confrontation:   'images/skin-yi/scene-confrontation.png',
    twinSuns:        'images/skin-yi/scene-yi-cottage.png',
    summonsHerald:   'images/skin-yi/scene-yeosu-overview.png',
    chaoticCouncil:  'images/skin-yi/scene-council-of-captains.png',
    aftermathMedbay: 'images/skin-yi/scene-courtyard-dawn.png',
    shadowPattern:   'images/skin-yi/scene-shadow-pattern.png',
    alliesWhisper:   'images/skin-yi/scene-allies-whisper.png',
    reckoningMirror: 'images/skin-yi/scene-water-basin.png',
    dividedChamber:  'images/skin-yi/scene-divided-court.png'
  }
};

const imagePrompts = {
  art_direction: 'Ukiyo-e woodblock print style. Flat layered colour fields, strong dark linework outlines around every form, classical East-Asian woodblock composition with foreground / middle / distant planes, decorative cloud bands and wave patterns, hatched shading reserved for shadow only. Joseon-era Korea, late 16th century. Period-correct armor, robes, hanbok, pavilion roofs with upturned eaves, panokseon warships, turtle ships in distant silhouette. Selective vermillion accent against muted earth-tone palette. Strong graphic framing — vertical or square format.',
  palette: 'Deep ink-blue #0a0d18 base · Korean crimson #c41e3a accent · parchment cream #f0e8d0 highlights · soft black #1a1f2e shadow ink',
  archetypes: {
    reactive_defender: {
      filename_template: 'images/skin-yi/archetype-reactive-defender-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. {genderDesc} in 16th-century Joseon naval officer armor, defensive crouch on the deck of a wooden warship at night, shielding the face from a rain of fire arrows. Crimson glow from distant burning coastline. Deep ink-blue sky, mist over the sea, brush-stroke wave texture. 1:1 square aspect ratio, melancholic. Palette deep ink-blue #0a0d18, vermillion #c41e3a, parchment cream #f0e8d0. Ukiyo-e woodblock finish. Strong graphic composition, generous negative space. (Reminder: edge-to-edge, no border, no text.)'
    },
    tactical_survivor: {
      filename_template: 'images/skin-yi/archetype-tactical-survivor-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. {genderDesc}, a weathered Joseon naval captain mid-stride along the deck of a panokseon at dusk, scanning the southern horizon. Bedroll and gear on shoulder, hanbok robe under leather armor, twin moons reflecting on calm water. Long shadow trailing behind. 1:1 square aspect ratio, sense of forward momentum, lonely. Palette deep ink-blue #0a0d18, vermillion #c41e3a, parchment cream #f0e8d0. Ukiyo-e woodblock finish. Strong graphic composition, atmospheric. (Reminder: edge-to-edge, no border, no text.)'
    },
    hidden_drifter: {
      filename_template: 'images/skin-yi/archetype-hidden-drifter-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. {genderDesc}, a solitary Joseon naval officer walking down a long covered pavilion corridor lit by hanging lanterns, polished wooden floor reflecting the figure subtly out of sync — slightly displaced, as if a second self trails them. Crimson light from a distant fire visible through paper screens. 1:1 square aspect ratio, contemplative, slightly unsettling. Palette deep ink-blue #0a0d18, vermillion #c41e3a, parchment cream #f0e8d0. Ukiyo-e woodblock finish. (Reminder: edge-to-edge, no border, no text.)'
    },
    strategic_operator: {
      filename_template: 'images/skin-yi/archetype-strategic-operator-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. {genderDesc}, a centred standing Joseon naval admiral in formal armor on a raised wooden dais, calm posture, hands relaxed, head slightly inclined toward a large sea chart. Other captains visible at lower stations listening, partially in shadow. Hanging crimson silk banners. 1:1 square aspect ratio, sense of grounded authority. Palette deep ink-blue #0a0d18, vermillion #c41e3a, parchment cream #f0e8d0. Ukiyo-e woodblock finish. (Reminder: edge-to-edge, no border, no text.)'
    },
    force_multiplier: {
      filename_template: 'images/skin-yi/archetype-force-multiplier-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. {genderDesc}, a central robed admiral standing on a raised platform bathed in lantern light, surrounded at the same elevation by other officers of equal stature, all illuminated by shared crimson light. Faint brushstroke lines of crimson connecting them. Pavilion architecture suggested behind. 1:1 square aspect ratio, mythic, communal. Palette deep ink-blue #0a0d18, vermillion #c41e3a, parchment cream #f0e8d0. Ukiyo-e woodblock finish. (Reminder: edge-to-edge, no border, no text.)'
    }
  },
  scenes: {
    yeosu_overview:        { filename: 'images/skin-yi/scene-yeosu-overview.png', prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. Wide aerial view of Yeosu naval headquarters at night, pavilion roofs with upturned eaves, panokseon warships anchored in the bay, mist over water, distant watchtower. 1:1, vast scale, melancholic. Palette deep ink-blue, Korean crimson, parchment cream. (Reminder: edge-to-edge, no border, no text.)' },
    war_chamber:           { filename: 'images/skin-yi/scene-war-chamber.png',     prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. Interior of a Joseon war chamber at night, low wooden table covered with sea charts, hanging crimson silk banners, a single figure standing at the table, lantern light overhead, empty seats in shadow surrounding. 1:1, hushed, vast. Palette deep ink-blue, Korean crimson, parchment cream. (Reminder: edge-to-edge, no border, no text.)' },
    burning_coast:         { filename: 'images/skin-yi/scene-burning-coast.png',   prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. View from a ship\'s deck of a burning coastal village at night, pavilion roofs aflame casting crimson glow, distant smoke columns, two cloaked figures at the foreground viewpoint, backs to camera. 1:1, apocalyptic but quiet. Palette deep ink-blue, Korean crimson, parchment cream. (Reminder: edge-to-edge, no border, no text.)' },
    fleet_under_fire:      { filename: 'images/skin-yi/scene-fleet-under-fire.png', prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. A line of panokseon warships under attack at night, single arrows streaking from above as luminous strokes, dragon-prow turtle ship in distant silhouette, mist on water. 1:1, urgency under cold quiet. Palette deep ink-blue, Korean crimson, parchment cream. (Reminder: edge-to-edge, no border, no text.)' },
    private_meeting:       { filename: 'images/skin-yi/scene-private-meeting.png', prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. Two officers seated cross-legged at a low table at night, behind them a paper-screen window showing a distant crimson horizon glow. The right figure leans slightly forward, lit by lantern. 1:1, intimate, quietly tense. Palette deep ink-blue, Korean crimson, parchment cream. (Reminder: edge-to-edge, no border, no text.)' },
    admirals_dais:         { filename: 'images/skin-yi/scene-admirals-dais.png',   prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. A lone figure standing on a raised wooden dais bathed in crimson lantern light, floating semi-transparent dispatch scrolls hovering around them at chest height, vertical hanging banners flanking. 1:1, hushed, weight of decision. Palette deep ink-blue, Korean crimson, parchment cream. (Reminder: edge-to-edge, no border, no text.)' },
    confrontation:         { filename: 'images/skin-yi/scene-confrontation.png',   prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. Two officers in armor facing each other across a darkened pavilion, the negative space between them charged. Both partly silhouetted, one slightly lit from the right with crimson lantern. A thin horizon line bisects the wall behind. 1:1, mirrored stance, psychological standoff. Palette deep ink-blue, Korean crimson, parchment cream. (Reminder: edge-to-edge, no border, no text.)' },
    yi_cottage:            { filename: 'images/skin-yi/scene-yi-cottage.png',      prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. Interior of Admiral Yi Sun-sin\'s modest cottage at dusk. The admiral, depicted respectfully and painterly, an aged Korean naval officer in plain robes (not armor), seated at a low desk with calligraphy brushes, an ink stick, and a half-written scroll. A single candle, a meditation cushion, a paper screen window. 1:1, meditative, dignified. Palette deep ink-blue, Korean crimson, parchment cream. (Reminder: edge-to-edge, no border, no text.)' },
    council_of_captains:   { filename: 'images/skin-yi/scene-council-of-captains.png', prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. A Joseon war chamber. Three captains in officer armor clustered around a low table covered with sea charts, mid-discussion — one with arm raised, one shouting, one with head turned aside silent. Concentric faint ink-ripple arcs from each. Lantern light overhead. 1:1, tension, fragmented voices. Palette deep ink-blue, Korean crimson, parchment cream. (Reminder: edge-to-edge, no border, no text.)' },
    courtyard_dawn:        { filename: 'images/skin-yi/scene-courtyard-dawn.png',  prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. A long pavilion courtyard at dawn after a defeat, rows of wounded sailors on low pallets receding, a single standing figure in the foreground with head bowed, soft crimson light spilling from a brazier, reflective wet stone floor catching the glow. 1:1, hushed, sombre. Palette deep ink-blue, Korean crimson, parchment cream. (Reminder: edge-to-edge, no border, no text.)' },
    shadow_pattern:        { filename: 'images/skin-yi/scene-shadow-pattern.png',  prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. A single Joseon naval officer standing centred, with two contradicting crimson lantern sources from left and right casting two long, diverging shadows toward camera — like a fork in identity. Halo of warm light behind the head. Otherwise pitch dark. 1:1, psychological doubling. Palette deep ink-blue, Korean crimson, parchment cream. (Reminder: edge-to-edge, no border, no text.)' },
    allies_whisper:        { filename: 'images/skin-yi/scene-allies-whisper.png',  prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. Three Joseon officers clustered close together in a screen alcove between two paper-screen panels, heads tilted inward as if speaking quietly. A single warm-orange lantern overhead casting concentrated downlight. Heavy shadow at the edges. 1:1, conspiratorial, intimate. Palette deep ink-blue, Korean crimson, parchment cream. (Reminder: edge-to-edge, no border, no text.)' },
    water_basin:           { filename: 'images/skin-yi/scene-water-basin.png',     prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. An officer in armor crouched at the edge of a still stone water basin in a pavilion courtyard at night, facing their own reflection — the reflection is faintly dimmer, slightly less certain. Lantern reflected as a single point of crimson light on the water. 1:1, recognition of self, reckoning. Palette deep ink-blue, Korean crimson, parchment cream. (Reminder: edge-to-edge, no border, no text.)' },
    divided_court:         { filename: 'images/skin-yi/scene-divided-court.png',   prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Ukiyo-e woodblock-print rendering style — flat layered colours, strong outlines, classical East-Asian composition. Wide interior of the Joseon royal court at night, tiered seating receding, split down the centre by a hard vertical beam of crimson lantern light from above. Two clusters of robed officials occupy each side, mirrored. A single solitary figure stands centred on the seam of light, facing the front. 1:1, decisive moment, schism. Palette deep ink-blue, Korean crimson, parchment cream. (Reminder: edge-to-edge, no border, no text.)' }
  }
};

// ========================================================================
// CHOREO BACKGROUNDS — Korean ink-and-brush evocations
// ========================================================================
const choreoOverrides = {
  // 'converging' → brushstroke wave lines
  converging: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    ${Array.from({length:9}, (_, i) => {
      const y = 140 + i*80;
      return `<path d="M 0 ${y} Q 400 ${y-18} 800 ${y} T 1600 ${y}" fill="none" stroke="rgba(196,30,58,${(0.4 - i*0.025).toFixed(3)})" stroke-width="${(1.1 - i*0.08).toFixed(2)}"/>`;
    }).join('')}
  </svg>`,

  // 'ripple' → ink in water concentric
  ripple: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    ${Array.from({length:9}, (_, i) => `<circle cx="800" cy="450" r="${70 + i*68}" fill="none" stroke="rgba(196,30,58,${(0.5 - i*0.05).toFixed(2)})" stroke-width="0.6"/>`).join('')}
  </svg>`,

  // 'sun-arcs' → rising sun behind Korean five-cloud bands (오색구름)
  'sun-arcs': `<svg class="choreo sun-arcs" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <!-- Three soft horizon arcs -->
    <path d="M -100 700 Q 400 220 800 240 T 1700 700" fill="none" stroke="rgba(181,53,54,0.5)" stroke-width="0.9"/>
    <path d="M -100 760 Q 400 300 800 320 T 1700 760" fill="none" stroke="rgba(181,53,54,0.32)" stroke-width="0.7"/>
    <path d="M -100 820 Q 400 380 800 400 T 1700 820" fill="none" stroke="rgba(181,53,54,0.22)" stroke-width="0.5"/>
    <!-- Vermillion rising sun -->
    <circle cx="800" cy="320" r="60" fill="rgba(181,53,54,0.25)"/>
    <circle cx="800" cy="320" r="34" fill="#b53536"/>
    <!-- Korean five-cloud bands -->
    <g opacity="0.45">
      <path d="M 200 240 Q 280 220 380 240 Q 480 260 580 240 Q 680 220 780 240" fill="none" stroke="#f1e6cb" stroke-width="1.2"/>
      <path d="M 220 256 Q 300 240 400 256 Q 500 270 600 256" fill="none" stroke="#b53536" stroke-width="0.8"/>
      <path d="M 920 200 Q 1000 180 1100 200 Q 1200 220 1300 200" fill="none" stroke="#f1e6cb" stroke-width="1.2"/>
      <path d="M 940 216 Q 1020 200 1120 216 Q 1220 230 1320 216" fill="none" stroke="#b53536" stroke-width="0.8"/>
    </g>
  </svg>`,

  // 'grid' (question background) → ghost frame + small Taegeuk in corner
  grid: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <!-- Small Taegeuk roundel as the only emblem of presence (top right) -->
    <g transform="translate(1510 56) scale(1.0)">
      <circle cx="0" cy="0" r="22" fill="rgba(241,230,203,0.18)" stroke="rgba(181,53,54,0.55)" stroke-width="0.8"/>
      <path d="M 0 -20 A 20 20 0 0 1 0 20 A 10 10 0 0 0 0 0 A 10 10 0 0 1 0 -20 Z" fill="rgba(181,53,54,0.7)"/>
      <circle cx="0" cy="-10" r="3" fill="#1a3e8c" opacity="0.7"/>
      <circle cx="0" cy="10"  r="3" fill="#b53536"/>
    </g>
    <!-- Ghost corner brackets — Joseon framing -->
    <path d="M 40  84  L 40  40  L 84  40"  fill="none" stroke="rgba(181,53,54,0.22)" stroke-width="0.8"/>
    <path d="M 1560 84  L 1560 40  L 1516 40"  fill="none" stroke="rgba(181,53,54,0.22)" stroke-width="0.8"/>
    <path d="M 40  816 L 40  860 L 84  860" fill="none" stroke="rgba(181,53,54,0.22)" stroke-width="0.8"/>
    <path d="M 1560 816 L 1560 860 L 1516 860" fill="none" stroke="rgba(181,53,54,0.22)" stroke-width="0.8"/>
  </svg>`,

  // 'fault' → coastal cartographic stripes
  fault: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <path d="M 0 580 Q 240 540 480 600 Q 720 660 960 580 Q 1200 500 1440 580 L 1600 580" fill="none" stroke="rgba(196,30,58,0.55)" stroke-width="0.9"/>
    <path d="M 0 640 Q 240 600 480 660 Q 720 720 960 640 Q 1200 560 1440 640 L 1600 640" fill="none" stroke="rgba(196,30,58,0.3)" stroke-width="0.6"/>
    ${Array.from({length:6}, (_, i) => `<line x1="${200+i*240}" y1="120" x2="${200+i*240}" y2="780" stroke="rgba(196,30,58,0.15)" stroke-width="0.4" stroke-dasharray="3 6"/>`).join('')}
  </svg>`,

  // 'web' → constellation / star chart radial (for navigation)
  web: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    ${Array.from({length:14}, (_, i) => {
      const a = (i/14)*Math.PI*2;
      return `<line x1="800" y1="450" x2="${800+Math.cos(a)*900}" y2="${450+Math.sin(a)*900}" stroke="rgba(196,30,58,0.22)" stroke-width="0.4"/>`;
    }).join('')}
    ${[200,340,480,620].map((r,i) => `<circle cx="800" cy="450" r="${r}" fill="none" stroke="rgba(196,30,58,${(0.4-i*0.08).toFixed(2)})" stroke-width="0.4"/>`).join('')}
    ${Array.from({length:18}, () => {
      const a = Math.random()*Math.PI*2; const r = 100+Math.random()*500;
      return `<circle cx="${800+Math.cos(a)*r}" cy="${450+Math.sin(a)*r}" r="2" fill="#f0e8d0" opacity="0.7"/>`;
    }).join('')}
  </svg>`
};

// ========================================================================
// DISC ART — Korean naval scenes (14 illustrations)
// ========================================================================
function yiBase(inner) {
  return `<svg class="disc-art" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="yiG" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#11172a"/>
        <stop offset="60%" stop-color="#0a0d18"/>
        <stop offset="100%" stop-color="#04060e"/>
      </radialGradient>
      <radialGradient id="yiRed" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#e63946" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#c41e3a" stop-opacity="0"/>
      </radialGradient>
      <filter id="yiBlur"><feGaussianBlur stdDeviation="4"/></filter>
      <filter id="yiBlurHi"><feGaussianBlur stdDeviation="9"/></filter>
    </defs>
    <rect width="600" height="600" fill="url(#yiG)"/>
    ${inner}
    </svg><div class="disc-veil"></div>`;
}

const discArtOverrides = {
  // summonsHerald → Yeosu HQ overview with giwa-roofed pavilion, distant
  // turtle ship at anchor, five-cloud band, crane in flight, plum blossom drift
  summonsHerald: yiBase(`
    <!-- Sky band + ink wash horizon -->
    <rect x="0" y="380" width="600" height="220" fill="#0a0604"/>
    <line x1="0" y1="380" x2="600" y2="380" stroke="rgba(181,53,54,0.4)" stroke-width="0.6"/>
    <!-- Cliff-edge with Korean pavilion -->
    ${pavilion(300, 260, 200)}
    <!-- Hanging taegeuk banner on long pole beside pavilion -->
    <line x1="420" y1="160" x2="420" y2="320" stroke="#0d0a06" stroke-width="2"/>
    ${taegeuk(420, 200, 14)}
    <!-- Five-cloud band drifting across sky -->
    ${fiveCloud(180, 130, 220)}
    <!-- Crane in flight (auspicious omen) -->
    ${crane(460, 90, 60)}
    <!-- Bamboo grove right edge -->
    ${bamboo(560, 380, 110, 5)}
    <!-- Panokseon warships + turtle ship -->
    ${[140, 240, 340, 440].map((x,i) => `
      <rect x="${x-20}" y="420" width="40" height="16" fill="#0d0a06" stroke="rgba(181,53,54,0.55)" stroke-width="0.5"/>
      <line x1="${x}" y1="420" x2="${x}" y2="${392-i*4}" stroke="rgba(181,53,54,0.55)" stroke-width="0.5"/>
      <rect x="${x-12}" y="${400-i*4}" width="24" height="14" fill="rgba(181,53,54,0.2)" stroke="rgba(181,53,54,0.5)" stroke-width="0.4"/>
    `).join('')}
    ${turtleShip(520, 425, 90)}
    <!-- Plum blossoms drifting in foreground -->
    ${plumBlossom(70, 200, 10, 0.55)}
    ${plumBlossom(540, 260, 8, 0.45)}
    ${plumBlossom(120, 320, 6, 0.65)}
    <!-- Moon halo -->
    <circle cx="120" cy="120" r="42" fill="rgba(241,230,203,0.6)" filter="url(#yiBlur)"/>
    <circle cx="120" cy="120" r="22" fill="#f1e6cb"/>
    <!-- Stars -->
    ${Array.from({length:20}, () => `<circle cx="${Math.random()*600}" cy="${Math.random()*340}" r="${0.4+Math.random()*0.8}" fill="#f1e6cb" opacity="${0.2+Math.random()*0.5}"/>`).join('')}
  `),

  // councilChamber → Joseon war chamber: dancheong-trim eave, Taegeuk banners,
  // sea chart on low table, lone figure on raised platform.
  councilChamber: yiBase(`
    <!-- Upturned-eave Korean pavilion ceiling line -->
    <path d="M 30 90 Q 60 72 90 76 L 510 76 Q 540 72 570 90" fill="none" stroke="rgba(181,53,54,0.55)" stroke-width="0.8"/>
    <path d="M 60 100 L 540 100" stroke="rgba(181,53,54,0.4)" stroke-width="0.5"/>
    <!-- Dancheong patterned beam -->
    ${Array.from({length:14}, (_, i) => `<rect x="${60 + i*36}" y="100" width="32" height="10" fill="${i%3===0 ? '#b53536' : i%3===1 ? '#1a3e8c' : '#c4a56a'}" opacity="0.55"/>`).join('')}
    <!-- Hanging silk banners with Taegeuk -->
    <rect x="120" y="116" width="20" height="200" fill="#b53536" opacity="0.7"/>
    ${taegeuk(130, 152, 9)}
    <rect x="460" y="116" width="20" height="200" fill="#b53536" opacity="0.7"/>
    ${taegeuk(470, 152, 9)}
    <!-- Low chart table -->
    <rect x="170" y="420" width="260" height="44" fill="#1a0e08" stroke="rgba(181,53,54,0.4)" stroke-width="0.5"/>
    <!-- Sea chart on the table -->
    <rect x="186" y="425" width="228" height="32" fill="#f1e6cb" opacity="0.16"/>
    <path d="M 186 442 Q 240 432 290 444 Q 340 456 414 442" fill="none" stroke="rgba(181,53,54,0.45)" stroke-width="0.4"/>
    <!-- Lone figure in officer dress -->
    <ellipse cx="300" cy="510" rx="20" ry="6" fill="#0d0805"/>
    <rect x="288" y="358" width="24" height="100" rx="5" fill="#1a0e08" stroke="rgba(181,53,54,0.5)" stroke-width="0.55"/>
    <!-- Officer helmet silhouette -->
    <path d="M 286 348 Q 286 338 296 338 L 304 338 Q 314 338 314 348 L 314 352 L 286 352 Z" fill="#1a0e08" stroke="rgba(181,53,54,0.5)" stroke-width="0.4"/>
    <circle cx="300" cy="345" r="13" fill="#1a0e08" stroke="rgba(181,53,54,0.55)" stroke-width="0.5"/>
    <!-- Lantern halo above the table -->
    <circle cx="300" cy="220" r="80" fill="url(#yiRed)" filter="url(#yiBlurHi)"/>
    <circle cx="300" cy="220" r="14" fill="#d75557"/>
    <!-- Five-cloud ornament above the eave -->
    ${fiveCloud(300, 56, 240)}
    <!-- Ceiling pinpricks -->
    ${Array.from({length:14}, () => `<circle cx="${Math.random()*600}" cy="${20 + Math.random()*40}" r="${0.5+Math.random()}" fill="#f1e6cb" opacity="${0.3+Math.random()*0.5}"/>`).join('')}
  `),

  // fracturedCity → burning coastal village from the sea. Korean upturned-eave
  // pavilions silhouetted against fire glow. Distant mountain ridge.
  fracturedCity: yiBase(`
    <!-- Distant mountain ridge -->
    <path d="M 0 380 L 80 340 L 160 360 L 240 320 L 320 350 L 400 310 L 480 340 L 560 320 L 600 340 L 600 380 Z" fill="#1a1108" opacity="0.6"/>
    <!-- Coastline silhouette -->
    <path d="M 0 460 L 60 440 L 120 460 L 200 430 L 280 460 L 360 420 L 440 470 L 520 430 L 600 460 L 600 600 L 0 600 Z" fill="#0a0604"/>
    <!-- Three Korean pavilions on shore, eaves upturned -->
    ${[110, 280, 450].map(x => `
      <path d="M ${x-32} 440 Q ${x-36} 432 ${x-28} 430 L ${x-20} 416 L ${x} 408 L ${x+20} 416 L ${x+28} 430 Q ${x+36} 432 ${x+32} 440 Z" fill="#0a0604" stroke="rgba(181,53,54,0.55)" stroke-width="0.5"/>
      <line x1="${x-20}" y1="416" x2="${x+20}" y2="416" stroke="rgba(181,53,54,0.7)" stroke-width="0.6"/>
      <rect x="${x-22}" y="440" width="44" height="32" fill="#0a0604" stroke="rgba(181,53,54,0.3)" stroke-width="0.4"/>
    `).join('')}
    <!-- Fire glows -->
    <ellipse cx="110" cy="430" rx="80" ry="32" fill="url(#yiRed)" filter="url(#yiBlurHi)" opacity="0.85"/>
    <ellipse cx="450" cy="440" rx="100" ry="36" fill="url(#yiRed)" filter="url(#yiBlurHi)" opacity="0.7"/>
    <!-- Ship's prow in foreground (two figures looking at the shore) -->
    <rect x="280" y="500" width="6" height="60" fill="#040201"/>
    <rect x="320" y="500" width="6" height="60" fill="#040201"/>
    <circle cx="283" cy="495" r="5" fill="#040201"/>
    <circle cx="323" cy="495" r="5" fill="#040201"/>
    <line x1="200" y1="540" x2="400" y2="540" stroke="#0a0604" stroke-width="3"/>
    <!-- Smoke columns rising -->
    <ellipse cx="120" cy="220" rx="80" ry="120" fill="rgba(181,53,54,0.07)" filter="url(#yiBlur)"/>
    <ellipse cx="440" cy="200" rx="90" ry="140" fill="rgba(181,53,54,0.07)" filter="url(#yiBlur)"/>
    <!-- Crane fleeing across the sky -->
    ${crane(380, 150, 50)}
    <!-- Stars -->
    ${Array.from({length:18}, () => `<circle cx="${Math.random()*600}" cy="${Math.random()*180}" r="${0.4+Math.random()*0.8}" fill="#f1e6cb" opacity="${0.2+Math.random()*0.5}"/>`).join('')}
  `),

  // convoyArc → fleet under fire (panokseon row)
  convoyArc: yiBase(`
    <!-- Sea band -->
    <rect x="0" y="380" width="600" height="220" fill="#04060e"/>
    <!-- Wave hatching -->
    ${Array.from({length:6}, (_, i) => `<path d="M 0 ${440+i*22} Q 150 ${430+i*22} 300 ${440+i*22} T 600 ${440+i*22}" fill="none" stroke="rgba(196,30,58,0.15)" stroke-width="0.5"/>`).join('')}
    <!-- 4 ships in line -->
    ${[100, 220, 340, 460].map((x,i) => `
      <rect x="${x-30}" y="${390+i*4}" width="60" height="20" fill="#0e1424" stroke="rgba(196,30,58,0.5)" stroke-width="0.5"/>
      <line x1="${x}" y1="${390+i*4}" x2="${x}" y2="${320+i*4}" stroke="rgba(196,30,58,0.5)" stroke-width="0.6"/>
      <rect x="${x-18}" y="${334+i*4}" width="36" height="50" fill="rgba(196,30,58,0.18)" stroke="rgba(196,30,58,0.45)" stroke-width="0.5"/>
    `).join('')}
    <!-- Incoming arrows from above -->
    ${Array.from({length:5}, (_, i) => `<line x1="${100+i*100}" y1="40" x2="${140+i*100}" y2="${300+i*15}" stroke="rgba(196,30,58,0.45)" stroke-width="0.4"/>`).join('')}
    <!-- Flare in sky -->
    <circle cx="200" cy="120" r="6" fill="#e63946"/>
    <circle cx="200" cy="120" r="22" fill="url(#yiRed)" filter="url(#yiBlurHi)"/>
    <!-- Stars -->
    ${Array.from({length:24}, () => `<circle cx="${Math.random()*600}" cy="${Math.random()*340}" r="${0.4+Math.random()*0.8}" fill="#f0e8d0" opacity="${0.2+Math.random()*0.5}"/>`).join('')}
  `),

  // privateMeet → two officers across low table, paper screen window
  privateMeet: yiBase(`
    <!-- Paper screen window with horizon -->
    <rect x="60" y="100" width="480" height="200" fill="#040611" stroke="rgba(196,30,58,0.4)" stroke-width="0.5"/>
    <line x1="60" y1="200" x2="540" y2="200" stroke="rgba(196,30,58,0.4)" stroke-width="0.4"/>
    <line x1="200" y1="100" x2="200" y2="300" stroke="rgba(196,30,58,0.25)" stroke-width="0.3"/>
    <line x1="300" y1="100" x2="300" y2="300" stroke="rgba(196,30,58,0.25)" stroke-width="0.3"/>
    <line x1="400" y1="100" x2="400" y2="300" stroke="rgba(196,30,58,0.25)" stroke-width="0.3"/>
    <ellipse cx="300" cy="200" rx="200" ry="40" fill="url(#yiRed)" filter="url(#yiBlurHi)" opacity="0.55"/>
    <!-- Two seated cross-legged figures -->
    <ellipse cx="180" cy="500" rx="30" ry="14" fill="#0a0d18"/>
    <circle cx="180" cy="430" r="13" fill="#0e1424"/>
    <rect x="158" y="438" width="44" height="60" rx="6" fill="#0e1424" stroke="rgba(196,30,58,0.3)" stroke-width="0.5"/>
    <ellipse cx="420" cy="500" rx="32" ry="15" fill="#0a0d18"/>
    <circle cx="420" cy="425" r="13" fill="#0e1424"/>
    <rect x="396" y="433" width="48" height="65" rx="6" fill="#0e1424" stroke="rgba(196,30,58,0.5)" stroke-width="0.55"/>
    <!-- Low table -->
    <rect x="240" y="480" width="120" height="14" fill="#0e1424" stroke="rgba(196,30,58,0.4)" stroke-width="0.4"/>
    <ellipse cx="420" cy="430" rx="40" ry="50" fill="url(#yiRed)" filter="url(#yiBlurHi)" opacity="0.4"/>
  `),

  // breakingPoint → admiral on dais with floating dispatches
  breakingPoint: yiBase(`
    <rect x="298" y="60" width="4" height="500" fill="url(#yiRed)" filter="url(#yiBlurHi)"/>
    <!-- Banners flanking -->
    <rect x="120" y="60" width="14" height="480" fill="#c41e3a" opacity="0.45"/>
    <rect x="466" y="60" width="14" height="480" fill="#c41e3a" opacity="0.45"/>
    <!-- Floating dispatch scrolls -->
    ${Array.from({length:6}, (_, i) => {
      const x = 80 + (i%3)*170; const y = 200 + Math.floor(i/3)*120;
      return `<rect x="${x}" y="${y}" width="80" height="50" fill="rgba(196,30,58,0.08)" stroke="rgba(196,30,58,0.4)" stroke-width="0.5" rx="2"/>
              <line x1="${x+8}" y1="${y+12}" x2="${x+72}" y2="${y+12}" stroke="rgba(196,30,58,0.5)" stroke-width="0.4"/>
              <line x1="${x+8}" y1="${y+22}" x2="${x+62}" y2="${y+22}" stroke="rgba(196,30,58,0.4)" stroke-width="0.4"/>
              <line x1="${x+8}" y1="${y+32}" x2="${x+72}" y2="${y+32}" stroke="rgba(196,30,58,0.3)" stroke-width="0.4"/>`;
    }).join('')}
    <!-- Lone figure -->
    <rect x="288" y="400" width="24" height="120" rx="5" fill="#0e1424" stroke="rgba(196,30,58,0.55)" stroke-width="0.5"/>
    <circle cx="300" cy="388" r="14" fill="#0e1424" stroke="rgba(196,30,58,0.6)" stroke-width="0.5"/>
    <ellipse cx="300" cy="540" rx="80" ry="12" fill="rgba(196,30,58,0.18)" filter="url(#yiBlur)"/>
  `),

  // confrontation → two officers across darkened pavilion
  confrontation: yiBase(`
    <line x1="60" y1="280" x2="540" y2="280" stroke="rgba(196,30,58,0.45)" stroke-width="0.4"/>
    <ellipse cx="300" cy="280" rx="200" ry="14" fill="rgba(196,30,58,0.15)" filter="url(#yiBlur)"/>
    <line x1="300" y1="60" x2="300" y2="540" stroke="rgba(196,30,58,0.25)" stroke-width="0.4"/>
    <!-- Helmet silhouettes (Joseon officer helmet shape) -->
    <path d="M 180 290 Q 170 310 170 330 L 230 330 Q 230 310 220 290 Q 215 280 200 280 Q 185 280 180 290 Z" fill="#0e1424" stroke="rgba(196,30,58,0.5)" stroke-width="0.5"/>
    <path d="M 380 290 Q 370 310 370 330 L 430 330 Q 430 310 420 290 Q 415 280 400 280 Q 385 280 380 290 Z" fill="#0e1424" stroke="rgba(196,30,58,0.6)" stroke-width="0.55"/>
    <rect x="190" y="330" width="20" height="170" rx="4" fill="#0e1424" stroke="rgba(196,30,58,0.45)" stroke-width="0.5"/>
    <rect x="390" y="330" width="20" height="170" rx="4" fill="#0e1424" stroke="rgba(196,30,58,0.55)" stroke-width="0.5"/>
    <ellipse cx="300" cy="380" rx="90" ry="12" fill="rgba(196,30,58,0.2)" filter="url(#yiBlur)"/>
  `),

  // twinSuns → Admiral Yi's cottage. Paper screens, bamboo, plum, pine,
  // calligraphy desk with an unfurled scroll, vermillion ink stick, oil lamp.
  // A hanging Taegeuk amulet at the screen edge.
  twinSuns: yiBase(`
    <!-- Paper hanji screen wall, four panels -->
    <rect x="60" y="60" width="480" height="280" fill="#1a120c" stroke="rgba(181,53,54,0.35)" stroke-width="0.5"/>
    ${[1,2,3].map(i => `<line x1="${60 + i*120}" y1="60" x2="${60 + i*120}" y2="340" stroke="rgba(181,53,54,0.32)" stroke-width="0.45"/>`).join('')}
    <line x1="60" y1="190" x2="540" y2="190" stroke="rgba(181,53,54,0.28)" stroke-width="0.4"/>
    <!-- Plum branch behind the screens, only silhouette visible -->
    <path d="M 90 340 Q 120 240 200 200 Q 260 180 320 200" fill="none" stroke="rgba(20,8,4,0.55)" stroke-width="2.5"/>
    ${plumBlossom(150, 230, 9, 0.65)}
    ${plumBlossom(195, 205, 7, 0.55)}
    ${plumBlossom(240, 195, 8, 0.6)}
    ${plumBlossom(290, 215, 6, 0.5)}
    <!-- Hanging amulet — small taegeuk on cord by the right screen edge -->
    <line x1="510" y1="80" x2="510" y2="148" stroke="#0d0805" stroke-width="1.4"/>
    ${taegeuk(510, 162, 14)}
    <!-- Low desk -->
    <rect x="80" y="378" width="440" height="44" fill="#0d0805" stroke="rgba(181,53,54,0.45)" stroke-width="0.5"/>
    <line x1="80" y1="378" x2="520" y2="378" stroke="rgba(181,53,54,0.6)" stroke-width="0.6"/>
    <!-- Unfurled scroll with brush calligraphy strokes -->
    <rect x="170" y="368" width="200" height="14" fill="#f1e6cb" opacity="0.85"/>
    <line x1="190" y1="372" x2="200" y2="378" stroke="#1a0e08" stroke-width="2"/>
    <line x1="210" y1="370" x2="218" y2="380" stroke="#1a0e08" stroke-width="2"/>
    <line x1="228" y1="372" x2="236" y2="378" stroke="#1a0e08" stroke-width="2"/>
    <line x1="248" y1="370" x2="252" y2="380" stroke="#1a0e08" stroke-width="2"/>
    <line x1="262" y1="372" x2="272" y2="378" stroke="#1a0e08" stroke-width="2"/>
    <line x1="284" y1="370" x2="296" y2="378" stroke="#1a0e08" stroke-width="2"/>
    <!-- Ink stick + vermillion ink dish -->
    <rect x="386" y="372" width="42" height="8" fill="#1a0e08" stroke="rgba(241,230,203,0.45)" stroke-width="0.3"/>
    <circle cx="450" cy="378" r="7" fill="#b53536" stroke="#7a1818" stroke-width="0.5"/>
    <circle cx="450" cy="378" r="3" fill="#7a1818"/>
    <!-- Brush in a holder -->
    <rect x="475" y="350" width="5" height="32" fill="#1a0e08"/>
    <path d="M 477 350 L 478 342 L 480 350 Z" fill="#1a0e08"/>
    <!-- Oil lamp -->
    <rect x="100" y="350" width="6" height="28" fill="#f1e6cb"/>
    <circle cx="103" cy="346" r="4" fill="#d75557"/>
    <ellipse cx="103" cy="346" rx="50" ry="70" fill="url(#yiRed)" filter="url(#yiBlurHi)" opacity="0.6"/>
    <!-- Yi seated cross-legged in plain robe -->
    <ellipse cx="300" cy="545" rx="52" ry="14" fill="#0d0805"/>
    <rect x="274" y="448" width="52" height="80" rx="8" fill="#1a0e08" stroke="rgba(181,53,54,0.45)" stroke-width="0.5"/>
    <!-- Folded hands -->
    <ellipse cx="300" cy="500" rx="18" ry="8" fill="#1a0e08" stroke="rgba(181,53,54,0.4)" stroke-width="0.3"/>
    <!-- Head + topknot -->
    <circle cx="300" cy="440" r="14" fill="#1a0e08"/>
    <rect x="297" y="420" width="6" height="10" fill="#1a0e08"/>
    <!-- Pine branch in foreground left -->
    ${pine(70, 540, 120)}
    <!-- Bamboo grove silhouette far right -->
    ${bamboo(540, 540, 130, 5)}
    ${bamboo(560, 540, 100, 4)}
  `),

  // chaoticCouncil → captains arguing over sea charts
  chaoticCouncil: yiBase(`
    <!-- Pavilion eave -->
    <path d="M 60 80 L 300 50 L 540 80" fill="none" stroke="rgba(196,30,58,0.45)" stroke-width="0.6"/>
    <!-- Low table -->
    <rect x="100" y="420" width="400" height="34" fill="#0e1424" stroke="rgba(196,30,58,0.35)" stroke-width="0.5"/>
    <!-- Chart on table -->
    <rect x="200" y="425" width="200" height="22" fill="#f0e8d0" opacity="0.12"/>
    <!-- Three captains -->
    ${[[150,'shouting'],[300,'silent'],[450,'arguing']].map(([x,_],i) => `
      <ellipse cx="${x}" cy="540" rx="32" ry="14" fill="#0a0d18"/>
      <rect x="${x-22}" y="358" width="44" height="80" rx="6" fill="#0e1424" stroke="rgba(196,30,58,${i===1?0.3:0.55})" stroke-width="0.5"/>
      <path d="M ${x-22} 350 Q ${x-22} 340 ${x-12} 340 L ${x+12} 340 Q ${x+22} 340 ${x+22} 350 L ${x+22} 360 L ${x-22} 360 Z" fill="#0e1424" stroke="rgba(196,30,58,${i===1?0.3:0.5})" stroke-width="0.5"/>
      <circle cx="${x}" cy="335" r="14" fill="#0e1424"/>
      ${i !== 1 ? `<path d="M ${x-30} 310 Q ${x} 280 ${x+30} 310" fill="none" stroke="rgba(196,30,58,0.4)" stroke-width="0.5"/>
                    <path d="M ${x-44} 296 Q ${x} 260 ${x+44} 296" fill="none" stroke="rgba(196,30,58,0.25)" stroke-width="0.4"/>` : ''}
    `).join('')}
    <!-- Lantern halo -->
    <circle cx="300" cy="160" r="80" fill="url(#yiRed)" filter="url(#yiBlurHi)"/>
  `),

  // aftermathMedbay → courtyard dawn with wounded
  aftermathMedbay: yiBase(`
    <!-- Pavilion ceiling -->
    <rect x="40" y="60" width="520" height="14" fill="#0a0d18"/>
    <line x1="40" y1="60" x2="560" y2="60" stroke="rgba(196,30,58,0.3)" stroke-width="0.4"/>
    <!-- Rows of low pallets -->
    ${[120,170,220,270,320].map(y => `
      <rect x="${100+(y-120)*0.5}" y="${y}" width="${400-(y-120)}" height="10" fill="#0e1424" stroke="rgba(196,30,58,0.25)" stroke-width="0.4"/>
    `).join('')}
    <!-- Foreground standing figure, head bowed -->
    <ellipse cx="300" cy="540" rx="40" ry="12" fill="#0a0d18"/>
    <rect x="288" y="410" width="24" height="120" rx="5" fill="#0e1424" stroke="rgba(196,30,58,0.55)" stroke-width="0.5"/>
    <ellipse cx="300" cy="402" rx="14" ry="16" fill="#0e1424"/>
    <line x1="288" y1="438" x2="280" y2="500" stroke="#0e1424" stroke-width="6" stroke-linecap="round"/>
    <line x1="312" y1="438" x2="320" y2="500" stroke="#0e1424" stroke-width="6" stroke-linecap="round"/>
    <!-- Brazier light from camera-left -->
    <ellipse cx="100" cy="380" rx="100" ry="160" fill="url(#yiRed)" filter="url(#yiBlurHi)" opacity="0.45"/>
    <ellipse cx="300" cy="540" rx="200" ry="14" fill="rgba(196,30,58,0.15)" filter="url(#yiBlur)"/>
  `),

  // shadowPattern → figure with two diverging shadows
  shadowPattern: yiBase(`
    <ellipse cx="300" cy="540" rx="180" ry="26" fill="#04060e" stroke="rgba(196,30,58,0.2)" stroke-width="0.4"/>
    <path d="M 300 540 L 80 460 L 60 540 Z" fill="#020308" opacity="0.85"/>
    <path d="M 300 540 L 520 460 L 540 540 Z" fill="#020308" opacity="0.85"/>
    <rect x="288" y="360" width="24" height="160" rx="5" fill="#0e1424" stroke="rgba(196,30,58,0.55)" stroke-width="0.55"/>
    <path d="M 280 350 Q 280 340 290 340 L 310 340 Q 320 340 320 350 L 320 360 L 280 360 Z" fill="#0e1424" stroke="rgba(196,30,58,0.55)" stroke-width="0.55"/>
    <circle cx="300" cy="345" r="16" fill="#0e1424" stroke="rgba(196,30,58,0.55)" stroke-width="0.55"/>
    <ellipse cx="120" cy="320" rx="80" ry="160" fill="url(#yiRed)" filter="url(#yiBlurHi)" opacity="0.5"/>
    <ellipse cx="480" cy="320" rx="80" ry="160" fill="url(#yiRed)" filter="url(#yiBlurHi)" opacity="0.5"/>
    <circle cx="300" cy="345" r="50" fill="none" stroke="rgba(196,30,58,0.3)" stroke-width="0.4"/>
  `),

  // alliesWhisper → three officers conferring in alcove
  alliesWhisper: yiBase(`
    <!-- Paper screen panels flanking -->
    <rect x="60" y="80" width="140" height="460" fill="#11172a" stroke="rgba(196,30,58,0.2)" stroke-width="0.4"/>
    <rect x="400" y="80" width="140" height="460" fill="#11172a" stroke="rgba(196,30,58,0.2)" stroke-width="0.4"/>
    ${[1,2].map(i => `
      <line x1="${60+i*46}" y1="80" x2="${60+i*46}" y2="540" stroke="rgba(196,30,58,0.15)" stroke-width="0.3"/>
      <line x1="${400+i*46}" y1="80" x2="${400+i*46}" y2="540" stroke="rgba(196,30,58,0.15)" stroke-width="0.3"/>
    `).join('')}
    <ellipse cx="300" cy="540" rx="150" ry="20" fill="#04060e"/>
    <!-- Three figures clustered -->
    ${[256, 300, 344].map((x,i) => `
      <rect x="${x-16}" y="${320+(i===1?-10:0)}" width="32" height="${220+(i===1?10:0)}" rx="6" fill="#0e1424" stroke="rgba(196,30,58,${i===1?0.5:0.32})" stroke-width="0.5"/>
      <circle cx="${x}" cy="${310+(i===1?-10:0)}" r="14" fill="#0e1424"/>
    `).join('')}
    <!-- Single lantern -->
    <circle cx="300" cy="160" r="6" fill="#e63946"/>
    <circle cx="300" cy="160" r="40" fill="url(#yiRed)" filter="url(#yiBlurHi)" opacity="0.8"/>
    <line x1="256" y1="310" x2="300" y2="300" stroke="rgba(196,30,58,0.2)" stroke-width="0.4" stroke-dasharray="2 3"/>
    <line x1="344" y1="310" x2="300" y2="300" stroke="rgba(196,30,58,0.2)" stroke-width="0.4" stroke-dasharray="2 3"/>
  `),

  // reckoningMirror → figure crouched at water basin
  reckoningMirror: yiBase(`
    <ellipse cx="300" cy="540" rx="240" ry="22" fill="#04060e" stroke="rgba(196,30,58,0.2)" stroke-width="0.4"/>
    <!-- Water basin -->
    <ellipse cx="300" cy="430" rx="120" ry="22" fill="#0a0d18" stroke="rgba(196,30,58,0.4)" stroke-width="0.5"/>
    <ellipse cx="300" cy="430" rx="110" ry="16" fill="#040611"/>
    <!-- Reflected lantern as a single crimson point -->
    <circle cx="300" cy="426" r="4" fill="#c41e3a"/>
    <ellipse cx="300" cy="426" rx="30" ry="6" fill="rgba(196,30,58,0.4)" filter="url(#yiBlur)"/>
    <!-- Crouching figure -->
    <ellipse cx="220" cy="510" rx="38" ry="12" fill="#0a0d18"/>
    <rect x="200" y="420" width="40" height="80" rx="5" fill="#0e1424" stroke="rgba(196,30,58,0.5)" stroke-width="0.5"/>
    <circle cx="220" cy="410" r="13" fill="#0e1424" stroke="rgba(196,30,58,0.5)" stroke-width="0.5"/>
    <!-- Look line from figure to reflection -->
    <line x1="230" y1="415" x2="290" y2="428" stroke="rgba(196,30,58,0.25)" stroke-width="0.4" stroke-dasharray="2 4"/>
    <!-- Background lantern -->
    <ellipse cx="450" cy="200" rx="80" ry="100" fill="url(#yiRed)" filter="url(#yiBlurHi)" opacity="0.4"/>
  `),

  // dividedChamber → court split by red beam
  dividedChamber: yiBase(`
    <!-- Pavilion eave -->
    <path d="M 30 70 L 300 40 L 570 70" fill="none" stroke="rgba(196,30,58,0.4)" stroke-width="0.6"/>
    <!-- Tiered seating receding -->
    ${[120,160,200,240,280,320].map(y => `
      <line x1="40" y1="${y}" x2="${290-(y-220)*0.2}" y2="${y}" stroke="rgba(196,30,58,0.1)" stroke-width="0.4"/>
      <line x1="${310+(y-220)*0.2}" y1="${y}" x2="560" y2="${y}" stroke="rgba(196,30,58,0.1)" stroke-width="0.4"/>
    `).join('')}
    <!-- Centre beam -->
    <line x1="300" y1="40" x2="300" y2="560" stroke="rgba(196,30,58,0.45)" stroke-width="0.8"/>
    <ellipse cx="300" cy="300" rx="14" ry="260" fill="url(#yiRed)" filter="url(#yiBlurHi)" opacity="0.6"/>
    <!-- Two clusters of figures, mirrored -->
    ${[150,200,250].map((x,i) => `
      <rect x="${x-4}" y="${380+i*8}" width="8" height="${110+i*4}" rx="2" fill="#04060e"/>
      <circle cx="${x}" cy="${376+i*8}" r="5" fill="#04060e"/>`).join('')}
    ${[350,400,450].map((x,i) => `
      <rect x="${x-4}" y="${380+i*8}" width="8" height="${110+i*4}" rx="2" fill="#04060e"/>
      <circle cx="${x}" cy="${376+i*8}" r="5" fill="#04060e"/>`).join('')}
    <!-- Foreground decision figure on the seam -->
    <rect x="294" y="440" width="12" height="100" rx="3" fill="#0e1424"/>
    <circle cx="300" cy="430" r="8" fill="#0e1424"/>
  `)
};

// ========================================================================
// COMPILE THE SKIN
// ========================================================================
const skin = {
  id: 'yi_sunsin',
  name: 'Twelve Ships · Admiral Yi',
  tagline: '1597 · Joseon · the campaign before Myeongnyang.',
  description: 'Set in the months before the Battle of Myeongnyang — with Admiral Yi Sun-sin as your quiet mentor in disgrace, and Admiral Won Gyun as the pressure system you have to navigate.',
  theme: {
    // Obangsaek-anchored: vermillion (적, jeok) accent, ivory (백, baek) text,
    // deep ink (흑, heuk) ground, with sepia warmth from aged silk.
    '--amber':           '#b53536',
    '--amber-bright':    '#d75557',
    '--amber-deep':      '#7a1818',
    '--amber-glow':      'rgba(181, 53, 54, 0.35)',
    '--brand-orange':    '#b53536',
    '--brand-tangerine': '#d75557',
    '--brand-yellow':    '#c4a56a',
    '--bg':              '#120c08',
    '--bg-deep':         '#0a0604',
    '--panel':           '#1a120c',
    '--ink':             '#f1e6cb',
    '--ink-soft':        '#d8caa8',
    '--ink-mute':        '#a99880',
    '--ink-label':       '#ebe0c4',
    '--ink-dim':         '#5d4f3a',
    '--serif':           "'Gowun Batang', 'Noto Serif KR', 'EB Garamond', Georgia, serif",
    '--sans':            "'Noto Sans KR', 'Inter', sans-serif",
    fontImport:          'https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Noto+Serif+KR:wght@400;500;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap'
  },
  characters: {
    commander: 'Admiral Won Gyun',
    mentor: 'Admiral Yi Sun-sin'
  },
  // Body classes enable cultural overlays (drifting plum blossoms here)
  bodyClasses: ['skin-petals'],
  scenes,
  archetypes,
  secondaryPatterns,
  riskCopy,
  nextSteps,
  imageMap,
  imagePrompts,
  choreoOverrides,
  discArtOverrides
};

fs.writeFileSync(OUT, JSON.stringify(skin, null, 2));
console.log(`✓ wrote ${path.relative(__dirname, OUT)}`);
console.log(`  ${skin.scenes.length} scenes · ${Object.keys(skin.archetypes).length} archetypes · ${Object.keys(skin.secondaryPatterns).length} secondaries · ${Object.values(skin.nextSteps).reduce((a,b)=>a+b.length,0)} next-step actions`);
console.log(`  choreo overrides: ${Object.keys(skin.choreoOverrides).length}  ·  disc-art overrides: ${Object.keys(skin.discArtOverrides).length}`);
