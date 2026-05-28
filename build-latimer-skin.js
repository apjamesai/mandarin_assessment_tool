#!/usr/bin/env node
/*
 * Build skin-latimer.json — Lewis Latimer / 1881 NYC skin.
 * Setting: late 1881, U.S. Electric Lighting Company drafting rooms. Lewis
 * Latimer is the quiet master draftsman developing improved carbon filament.
 * A composite Gilded-Age industrialist, "Director Edmund Crale", pressures
 * for shortcuts. You are a junior draftsman caught between them.
 *
 * Run from this directory:  node build-latimer-skin.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.join(__dirname, 'strategic-force-assessment.html');
const OUT = path.join(__dirname, 'skin-latimer.json');

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

// Brass mission emblem — Victorian filigree square with a stylised filament
const latimerSeal = `<svg viewBox="0 0 200 200" aria-hidden="true">
  <!-- Outer brass plate with chamfered corners -->
  <path d="M 36 20 L 164 20 L 180 36 L 180 164 L 164 180 L 36 180 L 20 164 L 20 36 Z" fill="#b88940" stroke="#6e4f1c" stroke-width="2.5"/>
  <path d="M 40 24 L 160 24 L 176 40 L 176 160 L 160 176 L 40 176 L 24 160 L 24 40 Z" fill="none" stroke="#6e4f1c" stroke-width="0.6"/>
  <!-- Filigree corner flourishes -->
  <path d="M 40 56 Q 56 40 80 44" fill="none" stroke="#6e4f1c" stroke-width="1"/>
  <path d="M 160 56 Q 144 40 120 44" fill="none" stroke="#6e4f1c" stroke-width="1"/>
  <path d="M 40 144 Q 56 160 80 156" fill="none" stroke="#6e4f1c" stroke-width="1"/>
  <path d="M 160 144 Q 144 160 120 156" fill="none" stroke="#6e4f1c" stroke-width="1"/>
  <!-- Central carbon-filament bulb -->
  <ellipse cx="100" cy="98" rx="34" ry="44" fill="none" stroke="#3a2210" stroke-width="2"/>
  <rect x="92" y="138" width="16" height="14" fill="#6e4f1c" stroke="#3a2210" stroke-width="0.8"/>
  <rect x="88" y="152" width="24" height="6" fill="#6e4f1c" stroke="#3a2210" stroke-width="0.8"/>
  <!-- Glowing horseshoe filament -->
  <path d="M 84 110 Q 100 80 116 110 Q 110 130 100 124 Q 90 130 84 110 Z" fill="none" stroke="#d4982e" stroke-width="2.2"/>
  <path d="M 84 110 Q 100 84 116 110" fill="none" stroke="#fbe09a" stroke-width="0.8"/>
  <!-- Year inscription -->
  <text x="100" y="170" text-anchor="middle" font-family="serif" font-size="12" fill="#3a2210" letter-spacing="2" font-weight="700">A.D. 1881</text>
</svg>`;

// ─── Cultural sprite helpers (Victorian / industrial era) ───
const gasLamp = (x, y, h = 70) => `
  <g transform="translate(${x} ${y})">
    <rect x="-1.2" y="-${h}" width="2.4" height="${h-12}" fill="#3a2210"/>
    <ellipse cx="0" cy="-${h+8}" rx="10" ry="14" fill="none" stroke="#6e4f1c" stroke-width="1"/>
    <ellipse cx="0" cy="-${h+8}" rx="6" ry="9" fill="#fbe09a" opacity="0.85"/>
    <circle cx="0" cy="-${h+8}" r="3" fill="#ffe9b0"/>
    <ellipse cx="0" cy="-${h+8}" rx="40" ry="34" fill="rgba(212,152,46,0.18)" filter="url(#latBlurHi)"/>
  </g>`;

const carbonBulb = (x, y, w = 28) => `
  <g transform="translate(${x} ${y})">
    <ellipse cx="0" cy="0" rx="${w*0.5}" ry="${w*0.66}" fill="none" stroke="#3a2210" stroke-width="1"/>
    <rect x="-${w*0.18}" y="${w*0.55}" width="${w*0.36}" height="${w*0.22}" fill="#6e4f1c" stroke="#3a2210" stroke-width="0.5"/>
    <rect x="-${w*0.24}" y="${w*0.77}" width="${w*0.48}" height="${w*0.10}" fill="#6e4f1c" stroke="#3a2210" stroke-width="0.5"/>
    <path d="M -${w*0.22} ${w*0.12} Q 0 -${w*0.4} ${w*0.22} ${w*0.12} Q ${w*0.12} ${w*0.36} 0 ${w*0.28} Q -${w*0.12} ${w*0.36} -${w*0.22} ${w*0.12} Z" fill="none" stroke="#d4982e" stroke-width="1.2"/>
    <circle cx="0" cy="0" r="${w*0.4}" fill="rgba(212,152,46,0.25)" filter="url(#latBlurHi)"/>
  </g>`;

const draftingCompass = (x, y, w = 30) => `
  <g transform="translate(${x} ${y})">
    <circle cx="0" cy="0" r="2" fill="#6e4f1c"/>
    <line x1="0" y1="0" x2="-${w*0.4}" y2="${w}" stroke="#6e4f1c" stroke-width="1.2"/>
    <line x1="0" y1="0" x2="${w*0.4}" y2="${w}" stroke="#6e4f1c" stroke-width="1.2"/>
    <circle cx="-${w*0.4}" cy="${w}" r="1.5" fill="#3a2210"/>
    <circle cx="${w*0.4}" cy="${w}" r="1.5" fill="#3a2210"/>
  </g>`;

const tSquare = (x, y, w = 60) => `
  <g transform="translate(${x} ${y})">
    <rect x="-${w*0.5}" y="-1" width="${w}" height="2.2" fill="#6e4f1c"/>
    <rect x="-1" y="0" width="2.2" height="${w*0.7}" fill="#6e4f1c"/>
  </g>`;

const inkwell = (x, y) => `
  <g transform="translate(${x} ${y})">
    <ellipse cx="0" cy="0" rx="8" ry="2" fill="#1a0a04"/>
    <path d="M -8 0 L -6 -10 L 6 -10 L 8 0 Z" fill="#3a2210" stroke="#6e4f1c" stroke-width="0.4"/>
    <ellipse cx="0" cy="-10" rx="6" ry="1.5" fill="#1a0a04"/>
  </g>`;

const pocketWatch = (x, y, w = 16) => `
  <g transform="translate(${x} ${y})">
    <circle cx="0" cy="0" r="${w*0.5}" fill="#b88940" stroke="#3a2210" stroke-width="0.8"/>
    <circle cx="0" cy="0" r="${w*0.42}" fill="#f0e3c8"/>
    <line x1="0" y1="0" x2="0" y2="-${w*0.3}" stroke="#3a2210" stroke-width="0.7"/>
    <line x1="0" y1="0" x2="${w*0.22}" y2="0" stroke="#3a2210" stroke-width="0.7"/>
    <circle cx="0" cy="0" r="${w*0.04}" fill="#3a2210"/>
    <rect x="-1" y="-${w*0.55}" width="2" height="${w*0.1}" fill="#3a2210"/>
  </g>`;

const gearCog = (cx, cy, r) => `
  <g transform="translate(${cx} ${cy})">
    ${Array.from({length:12}, (_, i) => {
      const a = (i/12)*Math.PI*2;
      return `<rect x="-${r*0.12}" y="-${r}" width="${r*0.24}" height="${r*0.22}" fill="#6e4f1c" transform="rotate(${i*30})"/>`;
    }).join('')}
    <circle cx="0" cy="0" r="${r*0.85}" fill="#3a2210" stroke="#6e4f1c" stroke-width="0.6"/>
    <circle cx="0" cy="0" r="${r*0.3}" fill="#1a0a04"/>
  </g>`;

// ========================================================================
// SCENE OVERRIDES
// ========================================================================
const SCENE_OVERRIDES = {
  0: {
    location: 'New York · Autumn 1881',
    locationLabel: 'NEW YORK · AUTUMN 1881',
    title: ['Filament', '·', '<em>The Latimer</em>', 'Notebook'],
    sub: 'An assessment of how you think, decide, and lead when pressure enters the room',
    note: 'Set in the drafting rooms of the U.S. Electric Lighting Company — to bypass familiar assumptions and reveal the pattern beneath',
    cta: 'Enter the drafting room'
  },
  1: {
    locationLabel: 'COMPANY REGISTER · CONFIDENTIAL',
    eyebrow: 'Before we begin',
    title: 'Present yourself to the Director.',
    sub: 'Used to address you correctly through the campaign and to render your portrait.'
  },
  2: {
    locationLabel: 'PROLOGUE · COMPANY MEMORANDUM',
    crawlStyle: 'broadsheet',
    // Tightened from 56400 → 38400 so the whoosh fires ~1s after the stamp fades.
    duration: 38400,
    markSvg: latimerSeal,
    preamble: 'New York · the Year of Our Lord 1881',
    title: ['Filament'],
    episode: 'Prologue · The Notebook',
    countdown: 'AUTUMN 1881 · THE CARBON FILAMENT PATENT',
    paragraphs: [
      "It is a time of light. A continent is being wired, and the man who can make the carbon filament burn longest will hold a fortune in his hand. Old certainties — patience, attribution, the very meaning of authorship — are being asked to bend.",
      "In the shadow of the patent race, the company has summoned one rare voice. The Director believes {{firstName}} can think clearly when others panic. The trade does not lack draftsmen. It lacks people who can hold the line when those plans fail.",
      "Director Edmund Crale has risen to push the filament patent through. He waits for {{firstName}} on the drafting-room floor. He has already begun to choose...."
    ]
  },
  3: {
    location: 'New York · U.S. Electric Lighting Company',
    locationLabel: 'COMPANY HEADQUARTERS · BROADWAY',
    eyebrow: 'Act One · The Drafting Room',
    body: ['The', 'patent', 'race', 'is', 'narrowing.'],
    bodyAfter: [
      'Filaments fail nightly. Investors demand answers. Senior draftsmen are asking for another committee.',
      'You have been summoned, {{firstName}} — because you are believed to think clearly when others panic.'
    ]
  },
  4: {
    locationLabel: 'DIRECTOR EDMUND CRALE',
    quote: '"The trade does not lack draftsmen. It lacks people who can think clearly when those plans fail."',
    speaker: 'Director Edmund Crale'
  },
  5: {
    locationLabel: 'Q01 · UNDERSTAND SELF',
    setup: 'Crale studies you across the heavy mahogany desk. The drafting room falls silent. You feel the weight of being watched — by him, and by yourself.',
    prompt: 'When pressure rises, I am aware of how my thinking and behaviour are beginning to change.'
  },
  6: {
    locationLabel: 'Q02 · MASTER EMOTIONS',
    setup: 'A junior draftsman is dressed down in front of the whole room. The shop floor goes still. Heat rises in your chest.',
    prompt: 'In the moment, what do you most notice happening inside you?',
    options: [
      'A clean composure — I detach from the heat and keep the room orderly.',
      'A defensive impulse to step in immediately and reassert the company\'s discipline.',
      'A flash of anger or shame that I can name, but not yet act on cleanly.',
      'A steady warmth and a clear breath — I feel the reaction, choose how to respond, and act.',
      'A blankness — I freeze, and I notice the freeze itself.',
      'I leave the room emotionally before my body does.'
    ]
  },
  7: {
    locationLabel: 'Q03 · EMBED PRACTICES',
    setup: 'Between shifts the corridor of the company offices empties. A single gaslit moment of stillness before the next conference.',
    prompt: 'I have daily rituals — reflection, journaling, deliberate pauses — that I rely on to stay aware of myself under load.'
  },
  8: {
    locationLabel: 'DIRECTOR EDMUND CRALE',
    quote: '"We are rebuilding the trade\'s nerve. But people confuse caution with weakness. Tell me — what would you do first?"',
    speaker: 'Director Edmund Crale'
  },
  9: {
    locationLabel: 'Q04 · BE FUTURE-FOCUSED',
    setup: 'Below the windows, the gaslit avenue smokes with carriages. A telegram in your hand: a competing patent has been filed in Newark. Crale waits.',
    prompt: 'You are asked to stabilise a faltering product line. Rank these priorities from first to last.',
    itemLabels: [
      'Understand the root causes before acting',
      'Build the long-term standards that prevent recurrence',
      'Restore immediate manufacturing control',
      'Secure the most senior patent holders so the chain holds'
    ]
  },
  10: {
    locationLabel: 'COMMITTEE ROOM · ENGINEERS GATHERED',
    eyebrow: 'Act Two · The Patent Hearing',
    body: ['You', 'meet', 'the', 'engineers.'],
    bodyAfter: [
      'They speak over each other. Fear. Anger. Blame. Diagrams spread across a long oak table.',
      'Crale says nothing. He watches you instead.'
    ]
  },
  11: {
    locationLabel: 'Q05 · LISTEN DEEPLY',
    setup: 'Three engineers. One is silent — staring at the diagram. Another is shouting. A third keeps glancing at the door.',
    prompt: 'What do you do first?',
    options: [
      'Step in and direct the committee toward a clear next step.',
      'Stay quiet and observe — track who speaks, who avoids, who repeats themselves.',
      'Ask each engineer one specific clarifying question, especially the silent one.',
      'Align them quickly around a shared answer to halt the chaos.',
      'Mirror back what I am hearing beneath the words — fear, exhaustion, blame.',
      'Defer the meeting until I can speak with each engineer at his bench individually.'
    ]
  },
  12: {
    locationLabel: 'Q06 · LISTEN DEEPLY',
    setup: 'Crale leans toward your ear. "Look at the silent one," he murmurs. "What is he telling you that the others are not?"',
    prompt: 'When conversations become chaotic, my instinct is to take control quickly — rather than stay present and read the pattern.'
  },
  13: {
    locationLabel: 'Q07 · BE CURIOUS',
    setup: 'One engineer hands you a folded sheet — a process you have never seen, with notations in a machinist\'s hand. "This is what the disagreement is really about," he says.',
    prompt: 'How do you respond to the unfamiliar process?',
    options: [
      'Politely set it aside — the process is not the priority right now.',
      'Examine it, then ask three questions about what it does and where it came from.',
      'Acknowledge it and promise to come back to it after the immediate situation is resolved.',
      'Ask him to walk me through it, slowly, before I respond to anything else in the room.',
      'Recognise the technique from my training and reference it back to him authoritatively.',
      'Notice my reaction to not-knowing, and stay with the discomfort before responding.'
    ]
  },
  14: {
    locationLabel: 'NIGHT SHIFT · THE FACTORY FLOOR',
    quote: '"We file now. Or we wait."',
    speaker: 'Director Edmund Crale'
  },
  15: {
    locationLabel: 'Q08 · MANAGE UNCERTAINTY',
    setup: 'A foreman has sent a fragmentary telegram. You have a third of the picture. You have minutes.',
    prompt: 'What do you choose?',
    options: [
      'File the patent immediately with what I have — momentum matters more than completeness.',
      'Hold until I can confirm one critical drawing.',
      'Delegate the decision to the foreman closest to the line.',
      'Split the filing — partial action on what I know, hold reserve for what I don\'t.',
      'Make the smallest reversible change, then re-read the situation.',
      'Refuse the false choice and ask what assumptions are forcing it.'
    ]
  },
  16: {
    locationLabel: 'Q09 · MANAGE UNCERTAINTY',
    setup: 'Crale watches your face for the half-second of doubt before you answer. He has seen this moment in a hundred others.',
    prompt: 'I am comfortable making high-stakes decisions without full information.'
  },
  17: {
    locationLabel: 'AFTERMATH · COMPANY INFIRMARY',
    eyebrow: 'Act Three · The Burned Hand',
    body: ['The', 'shift', 'is', 'over.', 'But', 'at', 'a', 'cost.'],
    bodyAfter: [
      'A glassblower\'s hand. A jar shattered. Two men hospitalised.',
      'Crale remains calm. "Necessary," he says. You feel something shift.'
    ]
  },
  18: {
    locationLabel: 'Q10 · MASTER EMOTIONS',
    setup: 'You stand in the company infirmary. A nurse\'s hands are shaking. A list of injuries is read aloud. Crale waits at the door.',
    prompt: 'In moments with heavy moral consequence, you most often:',
    options: [
      'Stay composed and move forward — the company needs me functional now.',
      'Pause, reflect deeply, name what I feel, and only act once I have processed it.',
      'Question the decision afterwards — was it really the right call?',
      'Create deliberate distance from the emotion to think clearly.',
      'Sit with the people most affected before I sit with anything else.',
      'Channel the weight into a clearer commitment about what I will not do again.'
    ]
  },
  19: {
    locationLabel: 'Q11 · THINK CRITICALLY',
    setup: 'You replay the night. Three different shop reports before the order was given. Three different versions of what was true. One was the one Crale handed you first.',
    prompt: 'You suspect a troubling pattern in how decisions are being framed for you. What do you do?',
    options: [
      'Challenge it directly in the next committee.',
      'Quietly gather evidence across several decisions before raising anything.',
      'Run a small experiment — frame the next memorandum differently and see what happens.',
      'Set it aside — pattern recognition under stress is unreliable.',
      'Share my hypothesis with one trusted draftsman and ask them to challenge it.',
      'Send three queries to different shop foremen and triangulate the answers.'
    ]
  },
  20: {
    locationLabel: 'Q12 · BE CURIOUS',
    setup: 'A retired draftsman from Brooklyn offers to teach you his manual method for tracing — slower, more accurate, almost forgotten. It will take three evenings.',
    prompt: 'When I encounter an idea that does not fit my model of the world, my first impulse is to lean in, not push back.'
  },
  21: {
    locationLabel: "LATIMER'S STUDY · INTERLUDE · 01 / 03",
    eyebrow: 'Interlude · Mr. Latimer',
    intro: 'After the night-shift, you take the trolley to Flushing. A small house, a single light in the upper window. Lewis Latimer is at his draftsman\'s table, a carbon-filament bulb burning steadily in a brass lamp at his elbow. He does not ask you to sit. He does not ask you to answer aloud. He asks you three questions, one at a time. Write only what is true.',
    showIntro: true,
    prompt: 'What are you noticing about how you are <em>thinking</em>?',
    placeholder: 'The shape your thoughts have been taking…',
    hint: 'A line, a phrase, an image — whatever is true right now.'
  },
  22: {
    locationLabel: "LATIMER'S STUDY · INTERLUDE · 02 / 03",
    eyebrow: 'Interlude · Mr. Latimer',
    prompt: 'What are you noticing about how you are <em>feeling</em>?',
    placeholder: 'Name it without judging it…',
    hint: 'Whatever it is — Mr. Latimer is not surprised.'
  },
  23: {
    locationLabel: "LATIMER'S STUDY · INTERLUDE · 03 / 03",
    eyebrow: 'Interlude · Mr. Latimer',
    prompt: 'What are you noticing about how you are <em>behaving</em>?',
    placeholder: 'What you have done — or not done — that you can already see…',
    hint: 'You do not have to know yet. The work continues when you do.'
  },
  24: {
    locationLabel: 'ACT FOUR · THE PATTERN',
    eyebrow: 'Act Four · The Pattern',
    body: ['You', 'begin', 'to', 'notice', 'something.'],
    bodyAfter: [
      'Crale chooses speed over verification. Speed over consensus. Certainty over doubt.',
      'The pattern is subtle. Once seen, impossible to ignore.'
    ]
  },
  25: {
    locationLabel: 'Q13 · THINK CRITICALLY',
    setup: 'A shop report arrives with a tidy explanation. It is plausible. It is fast. It is exactly what you would prefer to be true.',
    prompt: 'When an explanation feels neat and immediately convincing, I deliberately slow down and look for what it might be hiding.'
  },
  26: {
    locationLabel: "CRALE'S PRIVATE OFFICE · LATE",
    quote: '"The committee is weak. They debate. They re-baseline. We don\'t need more voices. We need a filed patent."',
    speaker: 'Director Edmund Crale'
  },
  27: {
    locationLabel: 'Q14 · INFLUENCE EFFORTLESSLY',
    setup: 'Crale wants you to help him build alignment across the engineering teams. He asks you how.',
    prompt: 'What do you believe is the most effective way to create lasting alignment?',
    options: [
      'Persuasion through evidence and demonstration.',
      'Authority and clarity — direction beats debate.',
      'Emotional connection — meet people where they live.',
      'Shared ownership — they helped design it, so they help defend it.',
      'A story — one frame that makes everyone\'s contribution visible.',
      'Repetition — the same clear message delivered the same way until it lands.'
    ]
  },
  28: {
    locationLabel: 'Q15 · UNLOCK CREATIVITY',
    setup: 'You are asked to redesign a failing filament process. The old design is technically sound, but politically brittle — it solves the engineering problem and worsens the labour one.',
    prompt: 'Rank your approach to redesigning the process, from first to last.',
    itemLabels: [
      'Generate as many divergent options as possible before narrowing',
      'Seek external perspectives from machinists, glassblowers, and chemists',
      'Build a small experimental run rapidly and iterate',
      'Refine the existing design — the bones are sound'
    ]
  },
  29: {
    locationLabel: 'Q16 · UNLOCK CREATIVITY',
    setup: 'You stand in front of an empty drafting sheet. The brief: a path forward no one has considered.',
    prompt: 'When constraints tighten, my first instinct is to reframe the problem rather than push harder on the old design.'
  },
  30: {
    locationLabel: 'ACT FIVE · THE STAIRWELL',
    eyebrow: 'Act Five · The Stairwell',
    body: ['Your', 'colleagues', 'begin', 'to', 'question', 'Crale.'],
    bodyAfter: [
      'Quietly. Carefully. They do not accuse him. They simply ask whether the company\'s direction has changed.',
      'Crale calls it disloyalty.'
    ]
  },
  31: {
    locationLabel: 'Q17 · COLLABORATE INCLUSIVELY',
    setup: 'Three of your closest allies pull you aside in the stairwell between floors. They are afraid. They are not wrong. But Crale is watching the building.',
    prompt: 'What do you do?',
    options: [
      'Align them with the Director quickly to keep the team intact.',
      'Encourage open debate — the dissent is the data.',
      'Mediate between them — surface the assumptions on each side.',
      'Escalate the concerns formally to the board.',
      'Create a private structure for them to speak safely until I understand the pattern.',
      'Wait — disagreement under pressure rarely produces the truest answer.'
    ]
  },
  32: {
    locationLabel: 'Q18 · COLLABORATE INCLUSIVELY',
    setup: 'You sense the engineers around you self-editing. Smoothing. Withholding the honest shop report.',
    prompt: 'I actively invite people to disagree with me — and I work to make them safer when they do.'
  },
  33: {
    locationLabel: 'Q19 · COLLABORATE INCLUSIVELY',
    setup: 'A delegation of immigrant glassblowers arrives. They will not speak with Crale. They will only speak with you. Many of them are women.',
    prompt: 'How do you set up the conversation?',
    options: [
      'In the formal boardroom — institutional weight signals respect.',
      'On their terms, in a place they choose, with their own foreman translating.',
      'Privately, just me and their three leaders, so trust can build first.',
      'I send a clerk first to understand the protocols.',
      'Open the meeting — anyone in their group can speak in any order.',
      'Around food. Real food. We eat before we negotiate.'
    ]
  },
  34: {
    locationLabel: 'BOARD ROOM · ORDER DELIVERED',
    quote: '"The Brooklyn shop refuses our timeline. Cut their contracts. Apply pressure. We file on schedule."',
    speaker: 'Director Edmund Crale'
  },
  35: {
    locationLabel: 'Q20 · ACT DECISIVELY',
    setup: 'The order is given. The room understands the implication — those families will be on the breadline before winter. Every eye finds yours.',
    prompt: 'You believe the order will cause serious harm. What do you do?',
    options: [
      'Follow the order — the company hierarchy exists for a reason.',
      'Challenge it privately, after the room clears.',
      'Refuse openly, in front of everyone.',
      'Propose an alternative that solves the supply problem without the harm — right now, in the room.',
      'Delay — buy time and re-open the question with new evidence.',
      'Step out of the chain entirely and warn the Brooklyn shop directly.'
    ]
  },
  36: {
    locationLabel: 'Q21 · ACT DECISIVELY',
    setup: 'There is a moment where waiting another hour will cost more than a wrong call.',
    prompt: 'When a clear trade-off is required, I make the call — and I own it, including what it costs.'
  },
  37: {
    locationLabel: 'Q22 · BE FUTURE-FOCUSED',
    setup: 'A choice will solve today and create something heavier next decade.',
    prompt: 'I weigh the long-term consequences of a decision as seriously as the immediate outcome.'
  },
  38: {
    locationLabel: 'Q23 · BE FUTURE-FOCUSED',
    setup: 'A young clerk asks you: "What are we trying to build, ten years from now, that justifies this?"',
    prompt: 'What is your honest answer?',
    options: [
      'I focus on this filing. Ten years is a story we tell ourselves.',
      'A trade where this kind of decision never has to be made again.',
      'Order. Predictability. The freedom that comes from things actually working.',
      'People — specifically, more draftsmen like you, ready to make hard calls well.',
      'I don\'t fully know yet. That is part of why I am still here, listening.',
      'A company that can disagree without breaking.'
    ]
  },
  39: {
    locationLabel: 'Q24 · EMBED PRACTICES',
    setup: 'At the end of the shift, the corridors empty. You have twenty quiet minutes before sleep.',
    prompt: 'What do you most often do with that time?',
    options: [
      'Catch up on correspondence I missed — the day is never finished.',
      'Walk in silence — let the day settle on its own.',
      'Write — what I noticed, what I felt, what I decided badly.',
      'Speak with one person I trust who is not part of this campaign.',
      'Read something with no obvious purpose — poetry, history, anything else.',
      'Sleep — recovery is the practice.'
    ]
  },
  40: {
    locationLabel: 'PRIVATE LOG · LATE',
    eyebrow: 'Act Six · The Lampblack',
    body: ['You', 'review', 'the', 'decisions.'],
    bodyAfter: [
      'The filed patent. The silenced committee. The reframed dissent.',
      'The language of progress becoming the machinery of control. Not progress. Compliance.'
    ]
  },
  41: {
    locationLabel: 'Q25 · UNDERSTAND SELF',
    setup: 'A reflection between scenes. Write what you actually feel — not what would sound impressive.',
    prompt: 'Looking back, when did you first sense something was wrong?',
    placeholder: 'A moment, a sentence, a feeling — write it freely…',
    hint: '1–3 sentences · not scored automatically · used to surface where you notice weak signals'
  },
  42: {
    locationLabel: "CONFRONTATION · CRALE'S OFFICE",
    quote: '"Progress requires control, {{firstName}}. Mercy is inefficient. You and I want the same thing."',
    speaker: 'Director Edmund Crale'
  },
  43: {
    locationLabel: 'Q26 · INFLUENCE EFFORTLESSLY',
    setup: 'Crale is not angry. He is calm. He believes every word. He wants you to walk out of this office as his ally.',
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
  44: {
    locationLabel: 'Q27 · INFLUENCE EFFORTLESSLY',
    setup: 'A test that lives outside this campaign too: how others come to trust your judgement.',
    prompt: 'People I work with adopt my recommendations because of trust and clarity — not because of position, volume, or pressure.'
  },
  45: {
    locationLabel: 'Q28 · MASTER EMOTIONS',
    setup: 'A confrontation just ended. Your hands are still steady, but something is moving underneath.',
    prompt: 'In high-stress moments, I can recognise what I am feeling, name it, and stay engaged with the situation.'
  },
  46: {
    locationLabel: 'Q29 · UNDERSTAND SELF',
    setup: 'A trusted colleague tells you: "You become more controlling when you are afraid. I don\'t think you see it."',
    prompt: 'What is your honest first reaction?',
    options: [
      'Defensive — I want to explain why she is wrong.',
      'Curious — I want her to tell me the three most recent examples.',
      'Grateful — but unsure whether to believe it yet.',
      'I already knew. I just hadn\'t admitted it.',
      'Quietly hurt — I will sit with it before I respond.',
      'I dismiss it — she doesn\'t see the pressure I am under.'
    ]
  },
  47: {
    locationLabel: 'Q30 · LISTEN DEEPLY',
    setup: 'In conversations that matter, you can choose to listen for words — or for everything else.',
    prompt: 'I listen for what is unsaid — tone, silence, what people avoid — as carefully as I listen for what is said.'
  },
  48: {
    locationLabel: 'ACT SEVEN · THE FILAMENT',
    eyebrow: 'Act Seven · The Filament',
    body: ['The', 'patent', 'must', 'be', 'filed.'],
    bodyAfter: [
      'Crale moves to file under the company\'s sole name. Mr. Latimer is not credited.',
      'You must choose your position. The clerk leaves for Washington at dawn.'
    ]
  },
  49: {
    locationLabel: 'Q31 · ACT DECISIVELY',
    setup: 'The board room is full. Decision in five minutes. You do not get to abstain.',
    prompt: 'What do you do?',
    options: [
      'Support Crale — the company\'s interest above all.',
      'Oppose him openly — Latimer\'s name must be on the patent.',
      'Seek a compromise between the factions.',
      'Propose a third structure — a new joint-credit framework for the patent.',
      'Step back entirely — let the lawyers resolve it.',
      'Buy time — call for a 24-hour delay under a neutral counsel.'
    ]
  },
  50: {
    locationLabel: 'Q32 · BE CURIOUS',
    setup: 'The dust settles. You are offered a position on Mr. Latimer\'s drafting team. You will need to keep learning, fast, for the rest of your career.',
    prompt: 'How will you actually do that?',
    options: [
      'I will surround myself with senior engineers and listen to their summaries.',
      'I will deliberately spend time with people whose trade I do not share — machinists, glassblowers, immigrant women.',
      'I will read across fields I have no professional reason to study.',
      'I will travel to industries I have never been in and listen before I speak.',
      'I will keep a record of what I got wrong, and review it monthly.',
      'I will teach — because teaching exposes what I do not actually understand.'
    ]
  },
  51: {
    locationLabel: 'Q33 · MANAGE UNCERTAINTY',
    setup: 'A new threat is emerging in a trade you do not know. You have no precedent. You have no manual.',
    prompt: 'What is your first move?',
    options: [
      'Commit to a clear direction — uncertainty is the enemy of momentum.',
      'Wait for clarity — the wrong action is worse than no action.',
      'Run several small experiments at once — let reality teach me.',
      'Find a foreman who has lived inside that trade and learn before I decide.',
      'Hold the situation lightly — name what I don\'t know, out loud.',
      'Set a deadline by which I must decide, regardless.'
    ]
  },
  52: {
    locationLabel: 'Q34 · EMBED PRACTICES',
    setup: 'The practices that change you are the ones you do when nobody is watching.',
    prompt: 'I have at least one reflection or learning ritual that I have sustained — even when pressure makes it inconvenient.'
  },
  53: {
    locationLabel: 'Q35 · THINK CRITICALLY',
    setup: 'A clean memorandum arrives. Everything fits. The author is competent. The recommendation is exactly what the board wants to hear.',
    prompt: 'What do you do first?',
    options: [
      'Accept the recommendation — the author is good and the committee has bandwidth elsewhere.',
      'Ask what evidence would change the conclusion — and whether any of it has been gathered.',
      'Identify the assumption that, if wrong, breaks the whole story.',
      'Bring in one engineer who will disagree by reflex — and let them.',
      'Re-frame the question and watch how the recommendation does or does not survive.',
      'Run it past my gut and only intervene if it complains.'
    ]
  },
  54: {
    locationLabel: 'Q36 · UNLOCK CREATIVITY',
    setup: 'A constraint everyone treats as fixed — budget, time, regulation, tradition — is the thing keeping you stuck.',
    prompt: 'How do you most often work with constraints like that?',
    options: [
      'I respect them and find efficiency within.',
      'I ignore them and design what is actually needed first, then negotiate.',
      'I treat them as design material and let them shape the solution in surprising ways.',
      'I invite the people enforcing the constraint into the redesign.',
      'I find the original reason the constraint exists — then test whether it still applies.',
      'I look for analogies in completely unrelated trades.'
    ]
  },
  55: {
    locationLabel: 'TELEGRAM · OUTBOUND',
    body: [
      'A telegram arrives from Washington.',
      'The board is speaking. Not about Crale. About <em>you</em>.',
      'Your recommendations. Your decisions. Your silence when it mattered.',
      'Crale turns. Smiles.'
    ],
    quote: '"You still think this was my filing? Every step — you justified it."',
    speaker: 'Director Edmund Crale'
  },
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
    prompt: 'Which <em>belief</em> of yours was tested by this campaign — about people, attribution, or yourself?',
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
  60: {
    locationLabel: 'REFRAME · BEFORE THE RESULT',
    body: [
      'This campaign was never about whether you were a hero or a villain.',
      'It was about something more useful:',
      'How easily good intentions <em>drift</em> under commercial pressure.',
      'How quickly invention becomes proprietary.',
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
// ARCHETYPES — Latimer-themed Victorian trade
// ========================================================================
const archetypes = {
  reactive_defender: {
    name: 'The Apprentice Under Pressure',
    band: 'Strategic Infancy',
    headline: 'You care about defending the trade — but pressure may be driving more of your strategy than you realise.',
    body: 'Your result suggests that when stakes rise, your attention narrows fast. You may move into reaction, urgency, loyalty, or defence before you have understood what is happening. You are committed and action-oriented — but the same energy that makes you formidable in a crisis can make you blind to the pattern beneath it.',
    risk: 'Your risk is not lack of effort. It is pressure-led action. You may be protecting the company while reinforcing the very patterns that weaken it.',
    focus: 'Start at Level 1 — <em>Deepen Self-Awareness</em>. Notice your pressure patterns. Name your triggers. Build a pause before reacting. Separate fact from interpretation. Ask, "What am I not seeing yet?"',
    next: 'Your first breakthrough is likely to come from seeing your own operating system more clearly — before you change anything else.'
  },
  tactical_survivor: {
    name: 'The Shop-Floor Engineer',
    band: 'Tactical Survivor',
    headline: 'You can handle pressure — but your work may be too anchored in the immediate filing.',
    body: 'You are capable, practical, and effective in difficult shifts. You make decisions, keep momentum, and solve immediate problems. Your result suggests, though, that short-term demands may be crowding out longer-term thinking.',
    risk: 'Your risk is tactical over-functioning. You may become so good at surviving the current shift that you unintentionally normalise crisis as the operating model.',
    focus: 'Strengthen Level 3 — <em>Develop Strategic Capabilities</em>. Focus on future-orientation, creative options, and acting well in uncertainty.',
    next: 'Your growth edge is widening the time horizon you actually think in — from this filing, to this decade of invention.'
  },
  hidden_drifter: {
    name: 'The Compromised Draftsman',
    band: 'Hidden Drift',
    headline: 'You are more strategic than most — but your blindspots may emerge precisely when you feel most certain.',
    body: 'You are thoughtful, capable, and likely well-intentioned. You can see complexity, make decisions, and influence others. But your result suggests a subtle risk: under pressure, your strengths may distort. Clarity becomes certainty. Decisiveness becomes control. Conviction becomes justification. Calm becomes detachment.',
    risk: 'Your risk is <em>justified drift</em>. You may continue making decisions that each seem defensible while the wider pattern moves quietly away from your stated values.',
    focus: 'Work across Levels 1 and 2 together — <em>Deepen Self-Awareness</em> and <em>Cultivate Open-Mindedness</em>. Notice yourself under pressure. Listen most carefully when you disagree. Watch the moment when "necessary" becomes a dangerous word.',
    next: 'Your fastest development will come from learning to notice earlier — before the pattern becomes the path.'
  },
  strategic_operator: {
    name: 'The Master Draftsman',
    band: 'Strategic Operator',
    headline: 'You show strong strategic capability and a relatively balanced pattern under pressure.',
    body: 'Your result suggests you can remain clear, reflective, and effective in complex situations. You likely balance action with thought, confidence with humility, and direction with collaboration.',
    risk: 'Your risk is not capability — it is consistency. Under enough pressure, even strong operators drift into old patterns.',
    focus: 'Strengthen Level 4 — <em>Scale Your Impact</em>. Decision quality, board alignment, influence without over-control.',
    next: 'Your growth edge is becoming more conscious — and more deliberate — about the impact you already have.'
  },
  force_multiplier: {
    name: 'The Architect of the Trade',
    band: 'Strategic Force Multiplier',
    headline: 'You do not just think strategically. You increase the strategic capacity of the trade around you.',
    body: 'Your result suggests a highly integrated strategic profile. You can stay aware of yourself under pressure, regulate emotion without disconnecting from consequence, listen deeply, think critically, generate options in uncertainty, decide with courage and humility, and influence without domination.',
    risk: 'Your risk is <em>over-reliance</em>. Others may look to you for clarity, judgement, and steadiness. Over time, that can quietly create dependency — unless you intentionally build capability in the trade around you.',
    focus: 'Your next level is multiplication. Develop strategic capability in others. Design decision systems. Build collective intelligence.',
    next: 'Your development edge is to become less necessary — by making the trade more strategically capable.'
  }
};

const secondaryPatterns = {
  architect_of_order: {
    name: 'The Ledger Hawk',
    headline: 'Drawn to discipline, control, and decisive action.',
    body: 'You are highly effective in moments of chaos. But unchecked, your strength becomes rigidity. You may begin to mistake disagreement for sloppiness, ambiguity for failure, and speed for strategy.'
  },
  the_justifier: {
    name: 'The Necessary Cost',
    headline: 'At risk of rationalising questionable orders when the filing feels important enough.',
    body: 'This does not mean you lack values. It means your values can become vulnerable when patent, loyalty, or industrial pressure enters the room.'
  },
  the_calm_blade: {
    name: 'The Cold Quill',
    headline: 'Composed in moments that unsettle others at the drafting table.',
    body: 'That composure is valuable. But there is a fine line between regulation and emotional distance. Your edge is to remain steady without becoming disconnected from human consequence.'
  },
  the_consensus_seeker: {
    name: 'The Committee Builder',
    headline: 'You create inclusion and invite voice — but may delay difficult filings.',
    body: 'Your development edge is to preserve collaboration while becoming more decisive when the dispatch leaves.'
  },
  the_decisive_commander: {
    name: 'The Bell Voice',
    headline: 'You move quickly and bring momentum — but your speed may narrow the field of evidence.',
    body: 'Your edge is to slow down just enough to hear what the shop is trying to tell you.'
  },
  vision_under_strain: {
    name: 'The Vision Strained',
    headline: 'You see beyond the immediate filing, but pressure may disrupt your steadiness in the drafting room.',
    body: 'Your edge is to build inner stability so your vision survives contact with reality.'
  }
};

const riskCopy = {
  control_bias: {
    name: 'Directorial Reflex',
    low:   'You appear able to pursue clarity without defaulting to authority.',
    mod:   'You may sometimes overvalue speed, certainty, or rank when pressure rises.',
    high:  'You may be at risk of mistaking <em>directorship for strategy</em>. This can make you decisive — but it may also reduce listening, creativity, and trust in the trade.',
    q:     'Where might you be calling something <em>discipline</em> when it is actually obedience?'
  },
  moral_drift: {
    name: 'Patent Drift',
    low:   'Your responses suggest a relatively strong ability to keep means and ends connected.',
    mod:   'You may occasionally justify difficult industrial actions when the filing feels important enough.',
    high:  'You may be vulnerable to rationalising harmful choices if they appear necessary for the patent.',
    q:     'At what point does a necessary compromise become a betrayal of the invention itself?'
  },
  detachment_pressure: {
    name: 'The Cold Pen',
    low:   'You appear able to stay connected to human consequence while under pressure.',
    mod:   'Your composure is a strength, but it may sometimes become distance.',
    high:  'You may remain calm in ways others on the floor experience as emotionally unavailable, overly rational, or disconnected from impact.',
    q:     'How do you stay steady without becoming unreachable?'
  }
};

const nextSteps = {
  reactive_defender: [
    { icon: 'pause',   title: 'The five-second pause',        body: 'Before responding to a memorandum, give yourself five full seconds. Notice what your body wants to do, then choose what to do.', test: 'Try for 7 days. Track each time you used it.' },
    { icon: 'journal', title: 'A nightly two-line ledger',     body: 'Each evening write: "Today I noticed…" and "Tomorrow I will…". Build the muscle of self-observation.',                              test: 'Do this for 21 days, then re-read the lot.' },
    { icon: 'mirror',  title: 'Ask one colleague',             body: 'Ask one trusted colleague: "When pressure rises, what do you see me become at the bench?" Listen without defending.',                test: 'One question, one person, this week.' },
    { icon: 'question',title: 'Replace "should" with "if"',    body: 'Notice your "shoulds" — they are usually pressure speaking. Reframe to "if I did this, what would happen?" Re-open the choice.', test: 'Count your "shoulds" for one day. Reframe three.' }
  ],
  tactical_survivor: [
    { icon: 'horizon',  title: 'The 10-year question',           body: 'On any non-trivial decision, ask: "What does this look like in a decade of practice?" Forces you out of fire-fighting and into direction.', test: 'Apply to your next three meaningful decisions.' },
    { icon: 'experiment', title: 'Run one strategic experiment', body: 'Pick one current problem. Generate four genuinely different solutions before settling on one.',                                              test: 'One problem, four options, this week.' },
    { icon: 'doors',    title: 'Future-back planning',           body: 'Describe in detail what good looks like 18 months from now. Then walk backwards: what decision today would matter then?',                  test: '90 minutes, a single page, by Friday.' },
    { icon: 'reframe',  title: 'Trade urgency for importance',   body: 'For one week, mark every task as either urgent OR important. Notice the ratio. Notice what does not survive scrutiny.',                    test: 'Audit for 5 days. Drop three urgent-not-important items.' }
  ],
  hidden_drifter: [
    { icon: 'notice',   title: 'The drift-word audit',           body: 'Notice when you use words like "necessary", "no choice", "this once". Each is a possible drift signal. Pause, name, examine.',             test: 'Track for two weeks. Bring the list to a mentor.' },
    { icon: 'invite',   title: 'Invite your strongest dissenter', body: 'Identify the colleague most likely to disagree with you. Invite them into a real decision. Treat their resistance as data.',             test: 'One conversation, this month. Document what shifted.' },
    { icon: 'mirror',   title: 'The three-colleague sentence',    body: 'Ask three colleagues: "What is one thing about my pattern under pressure that I probably do not see?" Listen without explaining.',       test: 'Three people, one question, no defending.' },
    { icon: 'pause',    title: 'Slow down on the certain ones',   body: 'When a call feels obvious, you are most at risk. Apply a 24-hour rule to anything you are certain about.',                                test: 'Use the rule three times this month.' }
  ],
  strategic_operator: [
    { icon: 'multiply', title: 'Develop one other person',        body: 'Choose one draftsman in your orbit. Help them build a strategic muscle they currently lack. Multiplication begins with one.',           test: 'Name the person. Name the muscle. Begin.' },
    { icon: 'decide',   title: 'Make decisions more visible',     body: 'When you make a meaningful call, share publicly what you considered and what you weighed. Make the strategy legible.',                  test: 'Try this on three decisions this month.' },
    { icon: 'reframe',  title: 'Sharpen the consequential 20%',   body: 'Identify the 20% of your decisions that drive 80% of outcomes. Concentrate your thinking time there. Delegate or systematise the rest.',  test: 'Map your decisions for a week. Re-balance time.' },
    { icon: 'experiment', title: 'Pick one risk to reduce',       body: 'Look at your three risk overlays. Choose the one closest to becoming a real constraint. Design a small practice to soften it.',         test: 'One overlay, one practice, 30 days.' }
  ],
  force_multiplier: [
    { icon: 'multiply', title: 'Design a decision system',         body: 'Create a clear template for how strategic decisions get made in your shop — owner, evidence, options, trade-offs, review.',           test: 'Build the v1 template. Apply to your next big call.' },
    { icon: 'invite',   title: 'Build the bench',                  body: 'Identify three engineers who could become the next layer of strategic capability. Invest in them deliberately.',                       test: 'Three names. One conversation each, this month.' },
    { icon: 'mirror',   title: 'Make yourself less necessary',     body: 'In every meeting this month, ask: "Could someone else here have led this?" Then arrange for that to be true next time.',               test: 'One month of audit. Hand off two recurring meetings.' },
    { icon: 'horizon',  title: 'Author the long memorandum',       body: 'Write a short paper on the strategic capability you want your trade to have in three years. Use it as a north star.',                test: 'One page. Share with three trusted readers.' }
  ]
};

const imageMap = {
  archetypeDir: 'images/skin-latimer/',
  scene: {
    councilChamber:  'images/skin-latimer/scene-drafting-room.png',
    fracturedCity:   'images/skin-latimer/scene-burning-factory.png',
    convoyArc:       'images/skin-latimer/scene-night-shift.png',
    privateMeet:     'images/skin-latimer/scene-crale-office.png',
    breakingPoint:   'images/skin-latimer/scene-board-room.png',
    confrontation:   'images/skin-latimer/scene-confrontation.png',
    twinSuns:        'images/skin-latimer/scene-latimer-study.png',
    summonsHerald:   'images/skin-latimer/scene-company-broadway.png',
    chaoticCouncil:  'images/skin-latimer/scene-patent-hearing.png',
    aftermathMedbay: 'images/skin-latimer/scene-infirmary.png',
    shadowPattern:   'images/skin-latimer/scene-shadow-pattern.png',
    alliesWhisper:   'images/skin-latimer/scene-stairwell.png',
    reckoningMirror: 'images/skin-latimer/scene-home-mirror.png',
    dividedChamber:  'images/skin-latimer/scene-board-divided.png'
  }
};

const imagePrompts = {
  art_direction: 'Late Victorian oil painting, Romantic-realist academic tradition. Detailed brushwork, classical chiaroscuro lighting, period-correct 1880s American industrial setting. Warm gaslight palette dominant — burnished brass, mahogany, oxblood velvet, gaslamp amber, dark walnut, ivory parchment, sepia ink. Period-correct attire: frock coats, waistcoats, high collars, watch chains, leather aprons, glassblower goggles, draftsman spectacles. Industrial interiors: drafting tables, brass gas lamps, mahogany desks, blackboards with chalk diagrams, telegraph keys, mechanical lathes, glass-blowing furnaces in distant rooms. Generous negative space, atmospheric haze of lamp-smoke and dust motes, melancholic composition. Lewis Latimer is permitted as a respectful, painterly depiction — a dignified Black draftsman in his 30s, sober suit, spectacles.',
  palette: 'Warm dark mahogany #1a0f08 base · gaslamp amber #d4982e accent · oxblood burgundy #6a1818 secondary · parchment ivory #f0e3c8 highlights',
  archetypes: {
    reactive_defender: {
      filename_template: 'images/skin-latimer/archetype-reactive-defender-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. {genderDesc} as a young draftsman in 1880s industrial New York, hunched over a drafting table at night, shielding the page from a sudden gust through an open window, urgency in the posture, body angled away from a flickering brass gas lamp. Drafting room background — long benches, T-squares, blueprints, ink stains. Deep amber rim light from gaslamp glow. 1:1 square aspect ratio, melancholic. Palette warm dark mahogany #1a0f08, gaslamp amber #d4982e, oxblood burgundy #6a1818, parchment ivory #f0e3c8. Classical chiaroscuro, painterly. (Reminder: edge-to-edge, no border, no text.)'
    },
    tactical_survivor: {
      filename_template: 'images/skin-latimer/archetype-tactical-survivor-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. {genderDesc}, a weathered shop engineer in 1880s industrial New York mid-stride across a factory floor at dusk, scanning a rolled blueprint, frock coat over leather waistcoat, watch chain visible. Brass gas lamps glowing softly amber on both sides. Long shadow trailing behind, dust motes in air. 1:1 square aspect ratio, sense of forward momentum, lonely. Palette warm dark mahogany #1a0f08, gaslamp amber #d4982e, parchment ivory #f0e3c8. Painterly, atmospheric. (Reminder: edge-to-edge, no border, no text.)'
    },
    hidden_drifter: {
      filename_template: 'images/skin-latimer/archetype-hidden-drifter-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. {genderDesc}, a solitary draftsman walking down a long gaslit corridor lined with brass-fitted office doors, parallel columns of warm amber light from above, polished mahogany floor reflecting their figure subtly out of sync — slightly displaced, slightly behind, as if a second self trails them. Dust catching the gaslamp beams, deep shadow at the edges. 1:1 square aspect ratio. Palette warm dark mahogany #1a0f08, gaslamp amber #d4982e, parchment ivory #f0e3c8. Painterly, contemplative, slightly unsettling. (Reminder: edge-to-edge, no border, no text.)'
    },
    strategic_operator: {
      filename_template: 'images/skin-latimer/archetype-strategic-operator-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. {genderDesc}, a centred standing draftsman on a raised platform in a board room behind front engineers, calm posture, hand resting on a draftsman\'s compass, frock coat, head slightly inclined toward a large patent diagram on the wall. A natural halo of warm gaslamp light behind their head. Other engineers visible at lower stations listening, partially in shadow. 1:1 square aspect ratio. Palette warm dark mahogany #1a0f08, gaslamp amber #d4982e, parchment ivory #f0e3c8. Painterly, serene, dignified. (Reminder: edge-to-edge, no border, no text.)'
    },
    force_multiplier: {
      filename_template: 'images/skin-latimer/archetype-force-multiplier-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. {genderDesc}, a central robed-coat figure standing on a raised drafting platform bathed in radiant warm gaslamp light, surrounded at the same elevation by other engineers and draftsmen of equal stature, all illuminated by the same shared glow. Faint lines of warm gaslamp light connecting them like a constellation. Industrial architecture suggested behind — brass fittings, glass cabinets, blackboards. 1:1 square aspect ratio. Palette warm dark mahogany #1a0f08, gaslamp amber #d4982e, parchment ivory #f0e3c8. Painterly, mythic, communal. (Reminder: edge-to-edge, no border, no text.)'
    }
  },
  scenes: {
    company_broadway:  { filename: 'images/skin-latimer/scene-company-broadway.png', prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. Wide aerial view of a 1880s industrial New York street at dusk, four-storey brownstone offices of an electric lighting company, gaslit windows glowing amber, horse-drawn carriages on cobblestones, telegraph wires overhead. 1:1, melancholic, vast scale. Palette warm dark mahogany, gaslamp amber, oxblood burgundy, parchment ivory. (Reminder: edge-to-edge, no border, no text.)' },
    drafting_room:     { filename: 'images/skin-latimer/scene-drafting-room.png',    prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. Interior of a company drafting room at night, long benches with brass gas lamps in a row, blueprints pinned to walls, T-squares and compasses on the tables, a single figure standing at the head bench studying a diagram, soft amber light overhead, empty drafting stools in shadow. 1:1, hushed, vast. Palette warm dark mahogany, gaslamp amber, parchment ivory. (Reminder: edge-to-edge, no border, no text.)' },
    burning_factory:   { filename: 'images/skin-latimer/scene-burning-factory.png',  prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. View from a tenement window of a distant factory fire at night, brick smokestack silhouetted, amber glow rising, telegraph wires across the foreground, two cloaked figures at the window, backs to camera. 1:1, apocalyptic but quiet. Palette warm dark mahogany, gaslamp amber, oxblood burgundy, parchment ivory. (Reminder: edge-to-edge, no border, no text.)' },
    night_shift:       { filename: 'images/skin-latimer/scene-night-shift.png',      prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. A factory floor at night, rows of glass-blowing stations glowing amber, glassblowers at work with iron pipes, a foreman in foreground reading a telegram by gaslamp. Long shadows, mechanical lathes, telegraph key on a desk. 1:1, urgency under cold quiet. Palette warm dark mahogany, gaslamp amber, parchment ivory. (Reminder: edge-to-edge, no border, no text.)' },
    crale_office:      { filename: 'images/skin-latimer/scene-crale-office.png',     prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. Two figures seated across a heavy mahogany desk at night, behind them a wide window showing the gaslit avenue below. The right figure leans slightly forward, lit by an oxblood-shaded brass desk lamp. The left figure remains in shadow. Crystal decanter on the desk, ledgers stacked. 1:1, intimate, quietly tense. Palette warm dark mahogany, gaslamp amber, oxblood burgundy, parchment ivory. (Reminder: edge-to-edge, no border, no text.)' },
    board_room:        { filename: 'images/skin-latimer/scene-board-room.png',       prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. A lone figure standing at the head of a long board-room table in a tall vertical column of warm gaslamp light, floating semi-transparent patent diagrams hovering around them at chest height, brass chandelier flanking. 1:1, hushed, weight of decision. Palette warm dark mahogany, gaslamp amber, parchment ivory. (Reminder: edge-to-edge, no border, no text.)' },
    confrontation:     { filename: 'images/skin-latimer/scene-confrontation.png',    prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. Two figures in frock coats facing each other across a darkened office, the negative space between them charged. Both partly silhouetted, one slightly lit from the right with warm gaslamp glow. A thin horizon line of amber light bisects the wall behind them — the avenue through the window. 1:1, mirrored stance, psychological standoff. Palette warm dark mahogany, gaslamp amber, parchment ivory. (Reminder: edge-to-edge, no border, no text.)' },
    latimer_study:     { filename: 'images/skin-latimer/scene-latimer-study.png',    prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. The home study of Lewis Latimer, a dignified Black inventor and draftsman in his 30s, depicted respectfully and painterly, in a sober suit and spectacles, seated at a draftsman\'s table with a leather-bound notebook, ink pots, and an early carbon-filament bulb burning steadily in a brass lamp at his elbow. Bookshelves behind him, framed patent drawings on the wall, a single window showing twilight. Generous negative space, contemplative. 1:1, meditative, dignified. Palette warm dark mahogany, gaslamp amber, parchment ivory. (Reminder: edge-to-edge, no border, no text.)' },
    patent_hearing:    { filename: 'images/skin-latimer/scene-patent-hearing.png',   prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. Interior of a company committee room. Three engineers in waistcoats and frock coats clustered around a long oak table covered with patent diagrams, mid-argument — one with arm raised, one shouting, one with head turned aside. Brass chandelier overhead. Period-correct attire. 1:1, tension, fragmented voices. Palette warm dark mahogany, gaslamp amber, parchment ivory. (Reminder: edge-to-edge, no border, no text.)' },
    infirmary:         { filename: 'images/skin-latimer/scene-infirmary.png',        prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. A long company infirmary at dawn after a factory accident. Rows of low cots receding, a single standing figure in the foreground with head bowed, soft amber light spilling from a brass gaslamp on the wall, polished tile floor catching the glow. A nurse in white at a distant bedside. 1:1, hushed, sombre, weight of consequence. Palette warm dark mahogany, gaslamp amber, parchment ivory. (Reminder: edge-to-edge, no border, no text.)' },
    shadow_pattern:    { filename: 'images/skin-latimer/scene-shadow-pattern.png',   prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. A single figure in a frock coat standing centred in a corridor, with two contradicting brass-lamp light sources from left and right casting two long, diverging shadows toward camera — like a fork in identity. Subtle halo of warm light behind the figure\'s head. Otherwise pitch dark. 1:1, psychological doubling. Palette warm dark mahogany, gaslamp amber, parchment ivory. (Reminder: edge-to-edge, no border, no text.)' },
    stairwell:         { filename: 'images/skin-latimer/scene-stairwell.png',        prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. Three colleagues in frock coats clustered close together on a tenement stairwell landing between floors, heads tilted inward as if speaking quietly. A single brass gas wall-sconce overhead casting concentrated amber downlight. Heavy shadow at the edges, wrought-iron banister. 1:1, conspiratorial, intimate. Palette warm dark mahogany, gaslamp amber, parchment ivory. (Reminder: edge-to-edge, no border, no text.)' },
    home_mirror:       { filename: 'images/skin-latimer/scene-home-mirror.png',      prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. A figure in shirt-sleeves and a draftsman\'s waistcoat standing in profile in a modest home study at night, facing their own reflection in a tall framed mirror. The reflection is faintly dimmer, slightly less certain. Between them, a brass oil lamp burning on a side table casts a single point of amber light. The rest of the room is pitch-dark. 1:1, recognition of self, reckoning. Palette warm dark mahogany, gaslamp amber, parchment ivory. (Reminder: edge-to-edge, no border, no text.)' },
    board_divided:     { filename: 'images/skin-latimer/scene-board-divided.png',    prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. Late Victorian oil painting, Romantic-realist academic tradition. Wide interior of a company board room at night, tiered seating receding, split down the centre by a hard vertical beam of warm amber light from a tall window. Two clusters of frock-coated directors occupy each side, mirrored. A single solitary figure stands centred on the seam of light, facing the head of the table. Brass chandeliers. 1:1, decisive moment, schism. Palette warm dark mahogany, gaslamp amber, parchment ivory. (Reminder: edge-to-edge, no border, no text.)' }
  }
};

// ========================================================================
// CHOREO BACKGROUNDS — Victorian industrial motifs
// ========================================================================
const choreoOverrides = {
  // 'converging' → blueprint lines converging on a drafting compass
  converging: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    ${Array.from({length:14}, (_, i) => `<line x1="${i*120}" y1="0" x2="${800}" y2="${450}" stroke="rgba(212,152,46,${(0.18 - i*0.008).toFixed(3)})" stroke-width="0.5"/>`).join('')}
    ${Array.from({length:14}, (_, i) => `<line x1="${1600 - i*120}" y1="900" x2="${800}" y2="${450}" stroke="rgba(212,152,46,${(0.18 - i*0.008).toFixed(3)})" stroke-width="0.5"/>`).join('')}
    <circle cx="800" cy="450" r="24" fill="none" stroke="rgba(212,152,46,0.45)" stroke-width="0.8"/>
    <circle cx="800" cy="450" r="4" fill="#d4982e"/>
  </svg>`,
  // 'ripple' → gaslight halo rings
  ripple: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    ${Array.from({length:9}, (_, i) => `<circle cx="800" cy="450" r="${70 + i*68}" fill="none" stroke="rgba(212,152,46,${(0.45 - i*0.04).toFixed(2)})" stroke-width="0.6"/>`).join('')}
  </svg>`,
  // 'sun-arcs' → industrial cityscape silhouette + smokestack glow
  'sun-arcs': `<svg class="choreo sun-arcs" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <path d="M -100 700 Q 400 220 800 240 T 1700 700" fill="none" stroke="rgba(212,152,46,0.5)" stroke-width="0.9"/>
    <path d="M -100 760 Q 400 300 800 320 T 1700 760" fill="none" stroke="rgba(212,152,46,0.3)" stroke-width="0.6"/>
    <!-- Smokestack column with rising smoke -->
    <rect x="380" y="180" width="14" height="280" fill="rgba(106,24,24,0.4)"/>
    <ellipse cx="387" cy="120" rx="80" ry="40" fill="rgba(212,152,46,0.18)"/>
    <!-- Distant gaslamp halo -->
    <circle cx="900" cy="320" r="50" fill="rgba(212,152,46,0.25)"/>
    <circle cx="900" cy="320" r="20" fill="#d4982e"/>
  </svg>`,
  // 'grid' (question background) → ghost frame with compass+T-square corner mark
  grid: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <!-- Small drafting compass emblem top-right -->
    <g transform="translate(1510 56)">
      <line x1="-14" y1="20" x2="0" y2="-12" stroke="rgba(212,152,46,0.55)" stroke-width="1.2"/>
      <line x1="14"  y1="20" x2="0" y2="-12" stroke="rgba(212,152,46,0.55)" stroke-width="1.2"/>
      <circle cx="0" cy="-12" r="2" fill="#d4982e"/>
      <line x1="-14" y1="20" x2="14" y2="20" stroke="rgba(212,152,46,0.4)" stroke-width="0.8"/>
    </g>
    <!-- Ghost corner brackets -->
    <path d="M 40 84 L 40 40 L 84 40"   fill="none" stroke="rgba(212,152,46,0.22)" stroke-width="0.8"/>
    <path d="M 1560 84 L 1560 40 L 1516 40"  fill="none" stroke="rgba(212,152,46,0.22)" stroke-width="0.8"/>
    <path d="M 40 816 L 40 860 L 84 860" fill="none" stroke="rgba(212,152,46,0.22)" stroke-width="0.8"/>
    <path d="M 1560 816 L 1560 860 L 1516 860" fill="none" stroke="rgba(212,152,46,0.22)" stroke-width="0.8"/>
  </svg>`,
  // 'fault' → industrial schematic stripes
  fault: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <path d="M 0 580 L 240 540 L 480 600 L 720 540 L 960 600 L 1200 540 L 1440 600 L 1600 580" fill="none" stroke="rgba(212,152,46,0.5)" stroke-width="0.9"/>
    <path d="M 0 640 L 240 600 L 480 660 L 720 600 L 960 660 L 1200 600 L 1440 660 L 1600 640" fill="none" stroke="rgba(212,152,46,0.28)" stroke-width="0.6"/>
    ${Array.from({length:6}, (_, i) => `<line x1="${200+i*240}" y1="120" x2="${200+i*240}" y2="780" stroke="rgba(212,152,46,0.15)" stroke-width="0.4" stroke-dasharray="3 6"/>`).join('')}
  </svg>`,
  // 'web' → electrical filament network
  web: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    ${Array.from({length:14}, (_, i) => {
      const a = (i/14)*Math.PI*2;
      return `<line x1="800" y1="450" x2="${800+Math.cos(a)*900}" y2="${450+Math.sin(a)*900}" stroke="rgba(212,152,46,0.22)" stroke-width="0.4"/>`;
    }).join('')}
    ${[200,340,480,620].map((r,i) => `<circle cx="800" cy="450" r="${r}" fill="none" stroke="rgba(212,152,46,${(0.4-i*0.08).toFixed(2)})" stroke-width="0.4"/>`).join('')}
    ${Array.from({length:14}, () => {
      const a = Math.random()*Math.PI*2; const r = 100+Math.random()*500;
      return `<circle cx="${800+Math.cos(a)*r}" cy="${450+Math.sin(a)*r}" r="3" fill="#d4982e" opacity="0.7"/>`;
    }).join('')}
  </svg>`
};

// ========================================================================
// DISC ART — Victorian industrial scenes
// ========================================================================
function latBase(inner) {
  return `<svg class="disc-art" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="latG" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#241608"/>
        <stop offset="60%" stop-color="#1a0f08"/>
        <stop offset="100%" stop-color="#0e0804"/>
      </radialGradient>
      <radialGradient id="latAmber" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fbe09a" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#d4982e" stop-opacity="0"/>
      </radialGradient>
      <filter id="latBlur"><feGaussianBlur stdDeviation="4"/></filter>
      <filter id="latBlurHi"><feGaussianBlur stdDeviation="9"/></filter>
    </defs>
    <rect width="600" height="600" fill="url(#latG)"/>
    ${inner}
    </svg><div class="disc-veil"></div>`;
}

const discArtOverrides = {
  summonsHerald: latBase(`
    <!-- Avenue silhouette -->
    <rect x="0" y="380" width="600" height="220" fill="#0e0804"/>
    <line x1="0" y1="380" x2="600" y2="380" stroke="rgba(212,152,46,0.35)" stroke-width="0.5"/>
    <!-- Brownstone building -->
    <rect x="160" y="120" width="280" height="280" fill="#1a0f08" stroke="rgba(212,152,46,0.45)" stroke-width="0.6"/>
    ${Array.from({length:4}, (_, row) => Array.from({length:4}, (_, col) => `
      <rect x="${180 + col*60}" y="${140 + row*60}" width="44" height="40" fill="#3a2210"/>
      <rect x="${180 + col*60}" y="${140 + row*60}" width="44" height="40" fill="${row > 0 && col % 2 === 0 ? 'rgba(212,152,46,0.55)' : 'none'}"/>
    `).join('')).join('')}
    <!-- Telegraph wires -->
    <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(212,152,46,0.3)" stroke-width="0.5"/>
    <line x1="0" y1="105" x2="600" y2="105" stroke="rgba(212,152,46,0.3)" stroke-width="0.5"/>
    <!-- Gaslamps -->
    ${gasLamp(80, 420, 60)}
    ${gasLamp(520, 420, 60)}
    <!-- Carriage silhouette -->
    <ellipse cx="300" cy="460" rx="50" ry="6" fill="#1a0f08"/>
    <rect x="270" y="430" width="60" height="22" fill="#1a0f08" stroke="rgba(212,152,46,0.4)" stroke-width="0.4"/>
    <circle cx="280" cy="458" r="8" fill="#1a0f08" stroke="rgba(212,152,46,0.5)" stroke-width="0.4"/>
    <circle cx="320" cy="458" r="8" fill="#1a0f08" stroke="rgba(212,152,46,0.5)" stroke-width="0.4"/>
    <!-- Stars in fog -->
    ${Array.from({length:14}, () => `<circle cx="${Math.random()*600}" cy="${Math.random()*100}" r="${0.4+Math.random()*0.6}" fill="#f0e3c8" opacity="${0.2+Math.random()*0.4}"/>`).join('')}
  `),
  councilChamber: latBase(`
    <!-- Mahogany panel walls -->
    <rect x="40" y="60" width="520" height="40" fill="#2a1810"/>
    <rect x="40" y="500" width="520" height="40" fill="#2a1810"/>
    <!-- Long drafting bench with multiple stations -->
    <rect x="80" y="380" width="440" height="20" fill="#2a1810" stroke="rgba(212,152,46,0.4)" stroke-width="0.4"/>
    <!-- Blueprints on bench -->
    <rect x="200" y="386" width="80" height="10" fill="#f0e3c8" opacity="0.5"/>
    <rect x="320" y="386" width="80" height="10" fill="#f0e3c8" opacity="0.5"/>
    <!-- Three brass gas lamps on the bench -->
    ${gasLamp(180, 380, 90)}
    ${gasLamp(300, 380, 90)}
    ${gasLamp(420, 380, 90)}
    <!-- T-squares and compass -->
    ${tSquare(230, 380, 50)}
    ${draftingCompass(360, 380, 28)}
    <!-- Lone figure at head bench -->
    <rect x="288" y="410" width="24" height="90" rx="3" fill="#1a0f08" stroke="rgba(212,152,46,0.5)" stroke-width="0.5"/>
    <circle cx="300" cy="402" r="13" fill="#1a0f08" stroke="rgba(212,152,46,0.55)" stroke-width="0.5"/>
    <!-- Hanging brass chandelier suggestion -->
    <line x1="300" y1="60" x2="300" y2="150" stroke="#3a2210" stroke-width="2"/>
    <circle cx="300" cy="160" r="28" fill="none" stroke="rgba(212,152,46,0.45)" stroke-width="0.6"/>
    ${[0, 120, 240].map(a => `<circle cx="${300 + Math.cos(a*Math.PI/180)*22}" cy="${160 + Math.sin(a*Math.PI/180)*22}" r="4" fill="#d4982e"/>`).join('')}
    <ellipse cx="300" cy="160" rx="120" ry="80" fill="url(#latAmber)" filter="url(#latBlurHi)"/>
  `),
  fracturedCity: latBase(`
    <!-- Distant industrial skyline -->
    <path d="M 0 480 L 60 440 L 90 460 L 130 420 L 170 470 L 220 410 L 280 470 L 330 420 L 380 480 L 440 430 L 500 470 L 540 440 L 600 480 L 600 600 L 0 600 Z" fill="#0e0804"/>
    <!-- Two tall smokestacks with fire glow -->
    <rect x="180" y="320" width="14" height="160" fill="#2a1810" stroke="rgba(212,152,46,0.4)" stroke-width="0.4"/>
    <rect x="400" y="300" width="14" height="180" fill="#2a1810" stroke="rgba(212,152,46,0.4)" stroke-width="0.4"/>
    <ellipse cx="187" cy="320" rx="60" ry="40" fill="url(#latAmber)" filter="url(#latBlurHi)" opacity="0.8"/>
    <ellipse cx="407" cy="300" rx="80" ry="50" fill="url(#latAmber)" filter="url(#latBlurHi)" opacity="0.85"/>
    <!-- Tenement window foreground frame -->
    <rect x="40" y="40" width="520" height="520" fill="none" stroke="#3a2210" stroke-width="3"/>
    <line x1="300" y1="40" x2="300" y2="560" stroke="#3a2210" stroke-width="2"/>
    <line x1="40" y1="300" x2="560" y2="300" stroke="#3a2210" stroke-width="2"/>
    <!-- Telegraph wires -->
    <line x1="0" y1="220" x2="600" y2="220" stroke="rgba(212,152,46,0.25)" stroke-width="0.5"/>
    <line x1="0" y1="226" x2="600" y2="226" stroke="rgba(212,152,46,0.25)" stroke-width="0.5"/>
    <!-- Two foreground figures looking out -->
    <rect x="220" y="450" width="6" height="80" fill="#0e0804"/>
    <rect x="350" y="450" width="6" height="80" fill="#0e0804"/>
    <circle cx="223" cy="445" r="6" fill="#0e0804"/>
    <circle cx="353" cy="445" r="6" fill="#0e0804"/>
  `),
  convoyArc: latBase(`
    <!-- Factory floor -->
    <rect x="0" y="380" width="600" height="220" fill="#0e0804"/>
    <!-- Row of glass-blowing stations with amber glow -->
    ${[120, 240, 360, 480].map((x,i) => `
      <rect x="${x-30}" y="${390+i*4}" width="60" height="60" fill="#1a0f08" stroke="rgba(212,152,46,0.4)" stroke-width="0.4"/>
      <ellipse cx="${x}" cy="${410+i*4}" rx="22" ry="14" fill="url(#latAmber)" filter="url(#latBlurHi)" opacity="0.85"/>
      <circle cx="${x}" cy="${410+i*4}" r="8" fill="#fbe09a"/>
    `).join('')}
    <!-- Long worker silhouettes -->
    ${[120, 240, 360, 480].map(x => `
      <rect x="${x-3}" y="370" width="6" height="40" fill="#0e0804"/>
      <circle cx="${x}" cy="364" r="5" fill="#0e0804"/>
    `).join('')}
    <!-- Foreman in foreground reading telegram -->
    <ellipse cx="300" cy="540" rx="34" ry="10" fill="#0e0804"/>
    <rect x="284" y="460" width="32" height="80" rx="4" fill="#1a0f08" stroke="rgba(212,152,46,0.5)" stroke-width="0.5"/>
    <circle cx="300" cy="452" r="14" fill="#1a0f08"/>
    <rect x="288" y="490" width="24" height="10" fill="#f0e3c8" opacity="0.7"/>
    <!-- Lathes/gears at top -->
    ${gearCog(80, 80, 40)}
    ${gearCog(520, 80, 40)}
    <line x1="120" y1="80" x2="480" y2="80" stroke="#3a2210" stroke-width="2"/>
  `),
  privateMeet: latBase(`
    <!-- Window with gaslit avenue -->
    <rect x="40" y="80" width="520" height="200" fill="#0e0804" stroke="rgba(212,152,46,0.4)" stroke-width="0.6"/>
    <line x1="40" y1="200" x2="560" y2="200" stroke="rgba(212,152,46,0.4)" stroke-width="0.4"/>
    <line x1="300" y1="80" x2="300" y2="280" stroke="rgba(212,152,46,0.3)" stroke-width="0.4"/>
    <!-- Gaslit avenue dots -->
    ${[100, 220, 340, 460].map(x => `
      <circle cx="${x}" cy="240" r="4" fill="#d4982e" opacity="0.85"/>
      <circle cx="${x}" cy="240" r="14" fill="rgba(212,152,46,0.4)" filter="url(#latBlur)"/>
    `).join('')}
    <!-- Two seated figures -->
    <ellipse cx="180" cy="510" rx="36" ry="14" fill="#0e0804"/>
    <rect x="158" y="400" width="44" height="100" rx="4" fill="#1a0f08" stroke="rgba(212,152,46,0.35)" stroke-width="0.4"/>
    <circle cx="181" cy="392" r="13" fill="#1a0f08"/>
    <ellipse cx="420" cy="500" rx="38" ry="15" fill="#0e0804"/>
    <rect x="396" y="390" width="48" height="110" rx="4" fill="#1a0f08" stroke="rgba(212,152,46,0.55)" stroke-width="0.55"/>
    <circle cx="420" cy="380" r="14" fill="#1a0f08"/>
    <!-- Heavy mahogany desk -->
    <rect x="220" y="460" width="160" height="50" fill="#2a1810" stroke="rgba(212,152,46,0.35)" stroke-width="0.4"/>
    <!-- Brass desk lamp on the desk -->
    ${gasLamp(420, 460, 50)}
    <!-- Crystal decanter -->
    <rect x="240" y="446" width="14" height="20" fill="#1a0f08" stroke="rgba(212,152,46,0.5)" stroke-width="0.4"/>
    <rect x="244" y="440" width="6" height="8" fill="#3a2210"/>
    ${inkwell(280, 466)}
    <!-- Ledgers stacked -->
    <rect x="312" y="450" width="50" height="6" fill="#6a1818"/>
    <rect x="312" y="456" width="50" height="6" fill="#3a2210"/>
  `),
  breakingPoint: latBase(`
    <rect x="298" y="60" width="4" height="500" fill="url(#latAmber)" filter="url(#latBlurHi)"/>
    <!-- Board-room chandelier -->
    <circle cx="300" cy="80" r="34" fill="none" stroke="rgba(212,152,46,0.5)" stroke-width="0.7"/>
    ${[0, 60, 120, 180, 240, 300].map(a => `<circle cx="${300 + Math.cos(a*Math.PI/180)*28}" cy="${80 + Math.sin(a*Math.PI/180)*28}" r="5" fill="#d4982e"/>`).join('')}
    <ellipse cx="300" cy="100" rx="140" ry="100" fill="url(#latAmber)" filter="url(#latBlurHi)" opacity="0.6"/>
    <!-- Floating patent diagrams -->
    ${Array.from({length:6}, (_, i) => {
      const x = 80 + (i%3)*170; const y = 220 + Math.floor(i/3)*120;
      return `<rect x="${x}" y="${y}" width="80" height="60" fill="#1a0f08" stroke="rgba(212,152,46,0.5)" stroke-width="0.5"/>
              <line x1="${x+6}" y1="${y+14}" x2="${x+74}" y2="${y+14}" stroke="rgba(212,152,46,0.45)" stroke-width="0.3"/>
              <line x1="${x+6}" y1="${y+24}" x2="${x+60}" y2="${y+24}" stroke="rgba(212,152,46,0.45)" stroke-width="0.3"/>
              <circle cx="${x+40}" cy="${y+42}" r="10" fill="none" stroke="rgba(212,152,46,0.5)" stroke-width="0.4"/>
              <line x1="${x+40}" y1="${y+32}" x2="${x+40}" y2="${y+52}" stroke="rgba(212,152,46,0.4)" stroke-width="0.3"/>`;
    }).join('')}
    <!-- Lone figure -->
    <rect x="288" y="420" width="24" height="120" rx="4" fill="#1a0f08" stroke="rgba(212,152,46,0.55)" stroke-width="0.5"/>
    <circle cx="300" cy="408" r="14" fill="#1a0f08" stroke="rgba(212,152,46,0.6)" stroke-width="0.5"/>
  `),
  confrontation: latBase(`
    <line x1="60" y1="280" x2="540" y2="280" stroke="rgba(212,152,46,0.45)" stroke-width="0.4"/>
    <ellipse cx="300" cy="280" rx="200" ry="14" fill="rgba(212,152,46,0.15)" filter="url(#latBlur)"/>
    <line x1="300" y1="60" x2="300" y2="540" stroke="rgba(212,152,46,0.25)" stroke-width="0.4"/>
    <!-- Top hat silhouettes -->
    <path d="M 180 270 L 180 240 L 220 240 L 220 270 L 224 270 L 224 274 L 176 274 L 176 270 Z" fill="#0e0804" stroke="rgba(212,152,46,0.5)" stroke-width="0.4"/>
    <path d="M 380 270 L 380 238 L 420 238 L 420 270 L 424 270 L 424 274 L 376 274 L 376 270 Z" fill="#0e0804" stroke="rgba(212,152,46,0.6)" stroke-width="0.5"/>
    <!-- Heads -->
    <circle cx="200" cy="290" r="14" fill="#1a0f08"/>
    <circle cx="400" cy="290" r="14" fill="#1a0f08"/>
    <!-- Frock-coat bodies -->
    <rect x="186" y="304" width="28" height="200" rx="4" fill="#1a0f08" stroke="rgba(212,152,46,0.5)" stroke-width="0.5"/>
    <rect x="386" y="304" width="28" height="200" rx="4" fill="#1a0f08" stroke="rgba(212,152,46,0.55)" stroke-width="0.5"/>
    <!-- Watch chain -->
    <path d="M 388 360 Q 400 364 412 360" fill="none" stroke="#d4982e" stroke-width="0.6"/>
    ${pocketWatch(405, 372, 12)}
  `),
  twinSuns: latBase(`
    <!-- Bookshelves on wall -->
    <rect x="40" y="60" width="200" height="280" fill="#2a1810"/>
    ${Array.from({length:5}, (_, i) => `<line x1="40" y1="${100+i*48}" x2="240" y2="${100+i*48}" stroke="rgba(212,152,46,0.45)" stroke-width="0.4"/>`).join('')}
    ${Array.from({length:5}, (_, row) => Array.from({length:7}, (_, col) => `<rect x="${50+col*26}" y="${68 + row*48}" width="22" height="28" fill="${col%3 === 0 ? '#6a1818' : col%3 === 1 ? '#3a2210' : '#6e4f1c'}"/>`).join('')).join('')}
    <!-- Framed patent drawings on wall -->
    <rect x="280" y="80" width="120" height="100" fill="#1a0f08" stroke="#6e4f1c" stroke-width="2"/>
    <rect x="290" y="90" width="100" height="80" fill="#f0e3c8" opacity="0.6"/>
    ${carbonBulb(340, 130, 30)}
    <rect x="420" y="80" width="120" height="100" fill="#1a0f08" stroke="#6e4f1c" stroke-width="2"/>
    <rect x="430" y="90" width="100" height="80" fill="#f0e3c8" opacity="0.6"/>
    <circle cx="480" cy="130" r="20" fill="none" stroke="#3a2210" stroke-width="1.5"/>
    <line x1="468" y1="130" x2="492" y2="130" stroke="#3a2210" stroke-width="1"/>
    <line x1="480" y1="118" x2="480" y2="142" stroke="#3a2210" stroke-width="1"/>
    <!-- Drafting table -->
    <rect x="60" y="380" width="480" height="60" fill="#2a1810" stroke="rgba(212,152,46,0.45)" stroke-width="0.5"/>
    <!-- Leather-bound notebook on the table -->
    <rect x="120" y="385" width="100" height="14" fill="#6a1818" stroke="#3a2210" stroke-width="0.5"/>
    <line x1="170" y1="385" x2="170" y2="399" stroke="#3a2210" stroke-width="0.4"/>
    <!-- Brass lamp + carbon bulb on table (Latimer's invention) -->
    ${gasLamp(440, 380, 50)}
    ${carbonBulb(440, 360, 26)}
    <!-- Ink pots and quill -->
    ${inkwell(280, 390)}
    ${inkwell(310, 390)}
    <rect x="340" y="382" width="2" height="20" fill="#3a2210" transform="rotate(-15 341 392)"/>
    <!-- Latimer seated, dignified, in sober suit and spectacles -->
    <ellipse cx="300" cy="540" rx="44" ry="12" fill="#0e0804"/>
    <rect x="276" y="450" width="48" height="80" rx="4" fill="#1a0f08" stroke="rgba(212,152,46,0.4)" stroke-width="0.5"/>
    <!-- Lapel + waistcoat lines -->
    <line x1="295" y1="450" x2="295" y2="510" stroke="rgba(212,152,46,0.3)" stroke-width="0.3"/>
    <line x1="305" y1="450" x2="305" y2="510" stroke="rgba(212,152,46,0.3)" stroke-width="0.3"/>
    <!-- Head + small spectacles -->
    <circle cx="300" cy="442" r="14" fill="#1a0f08"/>
    <line x1="294" y1="442" x2="306" y2="442" stroke="#d4982e" stroke-width="0.4"/>
    <circle cx="294" cy="442" r="2.5" fill="none" stroke="#d4982e" stroke-width="0.4"/>
    <circle cx="306" cy="442" r="2.5" fill="none" stroke="#d4982e" stroke-width="0.4"/>
    <!-- Window with twilight (small upper right) -->
    <rect x="500" y="200" width="60" height="80" fill="#0e0804" stroke="#3a2210" stroke-width="1"/>
    <line x1="500" y1="240" x2="560" y2="240" stroke="#3a2210" stroke-width="0.6"/>
    <line x1="530" y1="200" x2="530" y2="280" stroke="#3a2210" stroke-width="0.6"/>
  `),
  chaoticCouncil: latBase(`
    <!-- Long oak committee table -->
    <rect x="80" y="380" width="440" height="44" fill="#2a1810" stroke="rgba(212,152,46,0.4)" stroke-width="0.5"/>
    <!-- Patent diagrams scattered -->
    <rect x="120" y="385" width="60" height="14" fill="#f0e3c8" opacity="0.5"/>
    <rect x="220" y="386" width="80" height="14" fill="#f0e3c8" opacity="0.5"/>
    <rect x="340" y="385" width="60" height="14" fill="#f0e3c8" opacity="0.5"/>
    <rect x="440" y="386" width="60" height="14" fill="#f0e3c8" opacity="0.5"/>
    <!-- Three engineers -->
    ${[[150,'shouting'],[300,'silent'],[450,'arguing']].map(([x,_],i) => `
      <ellipse cx="${x}" cy="540" rx="34" ry="12" fill="#0e0804"/>
      <rect x="${x-20}" y="356" width="40" height="80" rx="4" fill="#1a0f08" stroke="rgba(212,152,46,${i===1?0.3:0.55})" stroke-width="0.5"/>
      <!-- Frock coat lapels -->
      <line x1="${x-6}" y1="356" x2="${x-6}" y2="406" stroke="rgba(212,152,46,${i===1?0.25:0.45})" stroke-width="0.3"/>
      <line x1="${x+6}" y1="356" x2="${x+6}" y2="406" stroke="rgba(212,152,46,${i===1?0.25:0.45})" stroke-width="0.3"/>
      <circle cx="${x}" cy="346" r="13" fill="#1a0f08"/>
      ${i !== 1 ? `<path d="M ${x-26} 320 Q ${x} 296 ${x+26} 320" fill="none" stroke="rgba(212,152,46,0.4)" stroke-width="0.5"/>
                    <path d="M ${x-40} 308 Q ${x} 276 ${x+40} 308" fill="none" stroke="rgba(212,152,46,0.25)" stroke-width="0.4"/>` : ''}
    `).join('')}
    <!-- Brass chandelier overhead -->
    <line x1="300" y1="60" x2="300" y2="140" stroke="#3a2210" stroke-width="2"/>
    <circle cx="300" cy="150" r="34" fill="none" stroke="rgba(212,152,46,0.45)" stroke-width="0.7"/>
    ${[0, 90, 180, 270].map(a => `<circle cx="${300 + Math.cos(a*Math.PI/180)*30}" cy="${150 + Math.sin(a*Math.PI/180)*30}" r="5" fill="#d4982e"/>`).join('')}
    <ellipse cx="300" cy="170" rx="180" ry="80" fill="url(#latAmber)" filter="url(#latBlurHi)" opacity="0.5"/>
  `),
  aftermathMedbay: latBase(`
    <!-- Tile floor -->
    <rect x="0" y="450" width="600" height="150" fill="#0e0804"/>
    ${Array.from({length:6}, (_, i) => `<line x1="${100 + i*70}" y1="450" x2="${300 + (i-3)*200}" y2="540" stroke="rgba(212,152,46,0.12)" stroke-width="0.4"/>`).join('')}
    <!-- Rows of cots receding -->
    ${[150,200,250,300,350,400].map((y, i) => `<rect x="${100 + (y-100)*0.3}" y="${y}" width="${400 - (y-100)*0.6}" height="14" fill="#2a1810" stroke="rgba(212,152,46,0.3)" stroke-width="0.4"/>`).join('')}
    <!-- Brass wall sconce -->
    ${gasLamp(100, 200, 80)}
    <!-- Foreground figure with head bowed -->
    <ellipse cx="300" cy="540" rx="36" ry="10" fill="#0e0804"/>
    <rect x="284" y="430" width="32" height="100" rx="4" fill="#1a0f08" stroke="rgba(212,152,46,0.55)" stroke-width="0.5"/>
    <circle cx="300" cy="422" r="14" fill="#1a0f08"/>
    <line x1="284" y1="450" x2="276" y2="510" stroke="#1a0f08" stroke-width="6" stroke-linecap="round"/>
    <line x1="316" y1="450" x2="324" y2="510" stroke="#1a0f08" stroke-width="6" stroke-linecap="round"/>
    <!-- Nurse silhouette at distant bedside -->
    <rect x="448" y="280" width="14" height="40" fill="#f0e3c8" opacity="0.6"/>
    <circle cx="455" cy="276" r="6" fill="#f0e3c8" opacity="0.7"/>
  `),
  shadowPattern: latBase(`
    <ellipse cx="300" cy="540" rx="180" ry="26" fill="#0e0804" stroke="rgba(212,152,46,0.2)" stroke-width="0.4"/>
    <path d="M 300 540 L 80 460 L 60 540 Z" fill="#040201" opacity="0.85"/>
    <path d="M 300 540 L 520 460 L 540 540 Z" fill="#040201" opacity="0.85"/>
    <rect x="288" y="360" width="24" height="160" rx="4" fill="#1a0f08" stroke="rgba(212,152,46,0.55)" stroke-width="0.55"/>
    <!-- Top-hat silhouette -->
    <path d="M 282 350 L 282 326 L 318 326 L 318 350 L 322 350 L 322 354 L 278 354 L 278 350 Z" fill="#1a0f08" stroke="rgba(212,152,46,0.5)" stroke-width="0.4"/>
    <circle cx="300" cy="350" r="14" fill="#1a0f08" stroke="rgba(212,152,46,0.55)" stroke-width="0.5"/>
    ${gasLamp(120, 240, 100)}
    ${gasLamp(480, 240, 100)}
    <circle cx="300" cy="345" r="50" fill="none" stroke="rgba(212,152,46,0.3)" stroke-width="0.4"/>
  `),
  alliesWhisper: latBase(`
    <!-- Tenement stairwell — vertical structural lines -->
    <rect x="80" y="0" width="20" height="600" fill="#2a1810"/>
    <rect x="500" y="0" width="20" height="600" fill="#2a1810"/>
    <!-- Wrought iron banister -->
    ${Array.from({length:9}, (_, i) => `<line x1="${102}" y1="${60 + i*60}" x2="${102}" y2="${110 + i*60}" stroke="#6e4f1c" stroke-width="0.6"/>`).join('')}
    <line x1="102" y1="60" x2="500" y2="60" stroke="#3a2210" stroke-width="2"/>
    <!-- Three figures conferring -->
    <ellipse cx="300" cy="540" rx="140" ry="18" fill="#0e0804"/>
    ${[260, 300, 340].map((x,i) => `
      <rect x="${x-14}" y="${340 + (i===1 ? -10 : 0)}" width="28" height="${200 + (i===1 ? 10 : 0)}" rx="4" fill="#1a0f08" stroke="rgba(212,152,46,${i===1 ? 0.55 : 0.35})" stroke-width="0.5"/>
      <circle cx="${x}" cy="${330 + (i===1 ? -10 : 0)}" r="13" fill="#1a0f08"/>
    `).join('')}
    <!-- Single brass wall sconce overhead -->
    ${gasLamp(300, 180, 80)}
    <line x1="260" y1="330" x2="300" y2="320" stroke="rgba(212,152,46,0.2)" stroke-width="0.4" stroke-dasharray="2 3"/>
    <line x1="340" y1="330" x2="300" y2="320" stroke="rgba(212,152,46,0.2)" stroke-width="0.4" stroke-dasharray="2 3"/>
  `),
  reckoningMirror: latBase(`
    <ellipse cx="300" cy="540" rx="240" ry="22" fill="#0e0804" stroke="rgba(212,152,46,0.2)" stroke-width="0.4"/>
    <!-- Tall framed mirror -->
    <rect x="380" y="120" width="120" height="280" fill="#1a0f08" stroke="#6e4f1c" stroke-width="4"/>
    <path d="M 380 120 L 376 116 L 504 116 L 500 120 Z" fill="#6e4f1c"/>
    <path d="M 380 400 L 376 404 L 504 404 L 500 400 Z" fill="#6e4f1c"/>
    <rect x="386" y="126" width="108" height="268" fill="#3a2210"/>
    <!-- Reflection figure (faded) -->
    <rect x="424" y="280" width="28" height="100" rx="4" fill="#1a0f08" stroke="rgba(212,152,46,0.3)" stroke-width="0.4" opacity="0.7"/>
    <circle cx="438" cy="272" r="13" fill="#1a0f08" opacity="0.7"/>
    <!-- Main figure in shirt-sleeves, in profile facing mirror -->
    <ellipse cx="220" cy="540" rx="38" ry="12" fill="#0e0804"/>
    <rect x="200" y="300" width="40" height="220" rx="4" fill="#1a0f08" stroke="rgba(212,152,46,0.55)" stroke-width="0.5"/>
    <!-- Waistcoat lines -->
    <line x1="210" y1="300" x2="210" y2="420" stroke="rgba(212,152,46,0.35)" stroke-width="0.3"/>
    <line x1="230" y1="300" x2="230" y2="420" stroke="rgba(212,152,46,0.35)" stroke-width="0.3"/>
    <circle cx="220" cy="292" r="14" fill="#1a0f08" stroke="rgba(212,152,46,0.55)" stroke-width="0.5"/>
    <!-- Brass oil lamp on a side table between them -->
    <rect x="300" y="380" width="40" height="40" fill="#2a1810" stroke="rgba(212,152,46,0.35)" stroke-width="0.4"/>
    ${gasLamp(320, 380, 80)}
    <ellipse cx="320" cy="320" rx="120" ry="80" fill="url(#latAmber)" filter="url(#latBlurHi)" opacity="0.55"/>
  `),
  dividedChamber: latBase(`
    <!-- Mahogany ceiling beam -->
    <rect x="0" y="50" width="600" height="14" fill="#2a1810"/>
    <!-- Tiered seating receding -->
    ${[120,160,200,240,280,320,360].map(y => `
      <line x1="40" y1="${y}" x2="${290-(y-220)*0.2}" y2="${y}" stroke="rgba(212,152,46,0.1)" stroke-width="0.4"/>
      <line x1="${310+(y-220)*0.2}" y1="${y}" x2="560" y2="${y}" stroke="rgba(212,152,46,0.1)" stroke-width="0.4"/>
    `).join('')}
    <line x1="300" y1="40" x2="300" y2="560" stroke="rgba(212,152,46,0.45)" stroke-width="0.8"/>
    <ellipse cx="300" cy="300" rx="14" ry="260" fill="url(#latAmber)" filter="url(#latBlurHi)" opacity="0.6"/>
    <!-- Two clusters of frock-coated directors -->
    ${[140,190,240].map((x,i) => `
      <rect x="${x-5}" y="${360+i*8}" width="10" height="${110+i*4}" rx="2" fill="#0e0804"/>
      <path d="M ${x-5} ${354+i*8} L ${x-5} ${344+i*8} L ${x+5} ${344+i*8} L ${x+5} ${354+i*8}" fill="#0e0804"/>
      <circle cx="${x}" cy="${354+i*8}" r="5" fill="#0e0804"/>`).join('')}
    ${[360,410,460].map((x,i) => `
      <rect x="${x-5}" y="${360+i*8}" width="10" height="${110+i*4}" rx="2" fill="#0e0804"/>
      <path d="M ${x-5} ${354+i*8} L ${x-5} ${344+i*8} L ${x+5} ${344+i*8} L ${x+5} ${354+i*8}" fill="#0e0804"/>
      <circle cx="${x}" cy="${354+i*8}" r="5" fill="#0e0804"/>`).join('')}
    <!-- Foreground decision figure on the seam -->
    <rect x="294" y="440" width="12" height="100" rx="3" fill="#1a0f08"/>
    <circle cx="300" cy="430" r="8" fill="#1a0f08"/>
    <!-- Brass chandeliers -->
    <line x1="160" y1="64" x2="160" y2="140" stroke="#3a2210" stroke-width="1.4"/>
    <circle cx="160" cy="150" r="20" fill="none" stroke="rgba(212,152,46,0.5)" stroke-width="0.6"/>
    <line x1="440" y1="64" x2="440" y2="140" stroke="#3a2210" stroke-width="1.4"/>
    <circle cx="440" cy="150" r="20" fill="none" stroke="rgba(212,152,46,0.5)" stroke-width="0.6"/>
  `)
};

// ========================================================================
// COMPILE THE SKIN
// ========================================================================
const skin = {
  id: 'latimer',
  name: 'Filament · The Latimer Notebook',
  tagline: '1881 · New York · the carbon-filament patent race.',
  description: 'Set in the drafting rooms of the U.S. Electric Lighting Company in 1881 — with Lewis Latimer as your quiet mentor and Director Edmund Crale (a fictional industrialist) as the pressure system you have to navigate.',
  theme: {
    '--amber':           '#d4982e',
    '--amber-bright':    '#fbe09a',
    '--amber-deep':      '#8a5b14',
    '--amber-glow':      'rgba(212, 152, 46, 0.35)',
    '--brand-orange':    '#d4982e',
    '--brand-tangerine': '#fbe09a',
    '--brand-yellow':    '#fbe09a',
    '--bg':              '#1a0f08',
    '--bg-deep':         '#0e0804',
    '--panel':           '#2a1810',
    '--ink':             '#f0e3c8',
    '--ink-soft':        '#d8c8a8',
    '--ink-mute':        '#a99780',
    '--ink-label':       '#ecdcbc',
    '--ink-dim':         '#5d4d3a',
    '--serif':           "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
    '--sans':            "'Crimson Text', 'Inter', serif",
    fontImport:          'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap'
  },
  characters: {
    commander: 'Director Edmund Crale',
    mentor: 'Lewis Latimer'
  },
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
