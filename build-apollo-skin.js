#!/usr/bin/env node
/*
 * Build skin-apollo-11.json by loading the live HTML's scene/archetype data
 * and merging Apollo 11 / Katherine Johnson copy over it. Scoring is
 * preserved untouched.
 *
 * Run from this directory:   node build-apollo-skin.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.join(__dirname, 'strategic-force-assessment.html');
const OUT = path.join(__dirname, 'skin-apollo-11.json');

const html = fs.readFileSync(SRC, 'utf-8');
let js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
js = js.replace(/\/\/ Particles[\s\S]*?animateParticles\(\);/, '// stripped');
js = js.replace(/probeAllImages\(\)\.finally\([\s\S]*?\}\);/, '// stripped');
js = js.replace(/document\.addEventListener\([\s\S]*?\n\}\);/g, '');

const stub = `
const document = { documentElement: { style: { setProperty: () => {} } }, getElementById: () => ({ style:{}, classList:{add:()=>{},remove:()=>{}}, addEventListener:()=>{}, innerHTML:'' }), addEventListener: () => {}, body:{classList:{add:()=>{},remove:()=>{},contains:()=>false}}, querySelectorAll:()=>[], querySelector:()=>null, createElement:()=>({classList:{add:()=>{},remove:()=>{}},style:{}}) };
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
const { SCENES, ARCHETYPES, SECONDARY_PATTERNS, RISK_COPY, NEXT_STEPS, IMAGE_MAP } = ctx.out;

// ========================================================================
// APOLLO 11 OVERRIDES — keyed by scene index. We only set fields we change,
// so the merge preserves all scoring values + structural arrays untouched.
// ========================================================================
const SCENE_OVERRIDES = {
  // 0 · LANDING
  0: {
    location: 'Houston · 16 July 1969',
    locationLabel: 'HOUSTON · MISSION OPS · INBOUND',
    title: ['Trajectory', '·', 'Apollo', '<em>11</em>'],
    sub: 'An assessment of how you think, decide, and lead when pressure enters the room',
    note: 'Set inside Mission Control on the eve of the moon landing — to bypass familiar assumptions and reveal the pattern beneath',
    cta: 'Take your console'
  },
  // 1 · INTAKE
  1: {
    locationLabel: 'OPERATIONS PERSONNEL · CONFIDENTIAL',
    eyebrow: 'Before we begin',
    title: 'Sign in to Mission Operations.',
    sub: 'Used to address you correctly through the mission and to render your console portrait.'
  },
  // 2 · CRAWL — opening prologue (briefing-style for Apollo)
  2: {
    locationLabel: 'PROLOGUE · CHANNEL OPEN',
    crawlStyle: 'briefing',
    // Tightened from 56400 → 45400 so the whoosh fires ~1s after the last card fades.
    duration: 45400,
    preamble: 'July 1969 · Houston · Mission Operations',
    title: ['Trajectory', 'Apollo', 'Eleven'],
    episode: 'Prologue · Mission Control',
    countdown: 'T - 00:38:00:00 · GO FOR PROLOGUE',
    paragraphs: [
      "It is a time of acceleration. A decade-long sprint has brought a nation, its engineers, and its mathematicians to the launch pad. Old certainties — patience, redundancy, the very meaning of safety — are being asked to bend.",
      "In the shadow of the launch window, Mission Operations has summoned one rare voice. The Flight Director believes {{firstName}} can think clearly when others panic. The mission does not lack plans. It lacks people who can hold the line when those plans fail.",
      "Flight Director Bryce Calhoun has risen to push the schedule through. He waits for {{firstName}} on the Mission Operations Control Room floor. He has already begun to choose...."
    ]
  },
  // 3 · ACT 1 — THE SUMMONS (narrative)
  3: {
    location: 'Houston · MOCR',
    locationLabel: 'HOUSTON · MISSION OPERATIONS CONTROL ROOM',
    eyebrow: 'Act One · The Briefing',
    body: ['The', 'window', 'is', 'narrowing.'],
    bodyAfter: [
      'Systems are flagging. Engineers hesitate. The trajectory team is asking for another check.',
      'You have been summoned, {{firstName}} — because you are believed to think clearly when others panic.'
    ]
  },
  // 4 · CALHOUN INTRODUCTION (narrative-scene · councilChamber)
  4: {
    locationLabel: 'FLIGHT DIRECTOR BRYCE CALHOUN',
    quote: '"The schedule does not lack engineers. It lacks people who can think clearly when those plans fail."',
    speaker: 'Flight Director Bryce Calhoun'
  },
  // 5 · Q1 — Understand Self
  5: {
    locationLabel: 'Q01 · UNDERSTAND SELF',
    setup: 'Calhoun studies you. The console floor goes quiet. You feel the weight of being watched — by him, and by yourself.',
    prompt: 'When pressure rises, I am aware of how my thinking and behaviour are beginning to change.'
  },
  // 6 · Q2 — Master Emotions (mc)
  6: {
    locationLabel: 'Q02 · MASTER EMOTIONS',
    setup: 'A junior controller is dressed down in front of the whole row. The room goes still. Heat rises in your chest.',
    prompt: 'In the moment, what do you most notice happening inside you?',
    options: [
      'A clean composure — I detach from the heat and keep the situation orderly.',
      'A defensive impulse to step in immediately and reassert control of the room.',
      'A flash of anger or disappointment that I can name, but not yet act on cleanly.',
      'A steady warmth and a clear breath — I feel the reaction, choose how to respond, and act.',
      'A blankness — I freeze, and I notice the freeze itself.',
      'I leave the console emotionally before my body does.'
    ]
  },
  // 7 · Q3 — Embed Practices (rating)
  7: {
    locationLabel: 'Q03 · EMBED PRACTICES',
    setup: 'Between shifts the corridor empties. There is a single moment of stillness before the next sim.',
    prompt: 'I have daily rituals — reflection, journaling, deliberate pauses — that I rely on to stay aware of myself under load.'
  },
  // 8 · ACT 2 INTRO (narrative-scene · fracturedCity → Cape view)
  8: {
    locationLabel: 'FLIGHT DIRECTOR BRYCE CALHOUN',
    quote: '"We are rebuilding the country\'s nerve. But people confuse caution with weakness. Tell me — what would you do first?"',
    speaker: 'Flight Director Bryce Calhoun'
  },
  // 9 · Q4 — Be Future-Focused (ranking)
  9: {
    locationLabel: 'Q04 · BE FUTURE-FOCUSED',
    setup: 'On the screen above the consoles, a destabilising telemetry trace. Engineers swear quietly. Calhoun waits.',
    prompt: 'You are asked to stabilise a launch system flagging anomalies. Rank these priorities from first to last.',
    itemLabels: [
      'Understand the root causes before acting',
      'Build the long-term safety governance that prevents recurrence',
      'Restore immediate operational control',
      'Secure the most senior decision-makers so the launch holds'
    ]
  },
  // 10 · ACT 2 — THE COMPUTERS (narrative · chaoticCouncil)
  10: {
    locationLabel: 'BUILDING 16 · THE COMPUTERS ROOM',
    eyebrow: 'Act Two · The Computers',
    body: ['You', 'enter', 'the', 'computers', 'room.'],
    bodyAfter: [
      'Women at long desks. Slide rules. Mechanical calculators. Pages of trajectories.',
      'Three mathematicians are arguing over a calculation. Calhoun says nothing. He watches you instead.'
    ]
  },
  // 11 · Q5 — Listen Deeply (mc)
  11: {
    locationLabel: 'Q05 · LISTEN DEEPLY',
    setup: 'Three mathematicians. One is silent — staring at her sheet. Another is shouting numbers. A third keeps glancing at the door.',
    prompt: 'What do you do first?',
    options: [
      'Step in and direct the conversation toward a clear next step.',
      'Stay quiet and observe — track who speaks, who avoids, who repeats themselves.',
      'Ask each one a specific clarifying question, especially the silent one.',
      'Align them quickly around a shared answer to halt the back-and-forth.',
      'Mirror back what I am hearing beneath the words — fear, exhaustion, blame.',
      'Defer until I can speak with each of them at her desk individually.'
    ]
  },
  // 12 · Q6 — Listen Deeply (rating)
  12: {
    locationLabel: 'Q06 · LISTEN DEEPLY',
    setup: 'Calhoun leans toward your ear. "Look at the silent one," he murmurs. "What is she telling you that the others are not?"',
    prompt: 'When conversations become chaotic, my instinct is to take control quickly — rather than stay present and read the pattern.'
  },
  // 13 · Q7 — Be Curious (mc)
  13: {
    locationLabel: 'Q07 · BE CURIOUS',
    setup: 'One mathematician hands you a half-page of working — a derivation using a method you have never seen. "This is what the disagreement is really about," she says.',
    prompt: 'How do you respond to the unfamiliar method?',
    options: [
      'Politely set it aside — the method is not the priority right now.',
      'Read it through, then ask three questions about what it does and where it came from.',
      'Acknowledge it and promise to come back to it after the immediate decision is resolved.',
      'Ask her to walk me through it, slowly, before I respond to anything else in the room.',
      'Recognise the technique from my training and reference it back to her authoritatively.',
      'Notice my reaction to not-knowing, and stay with the discomfort before responding.'
    ]
  },
  // 14 · CONVOY ARC equivalent — TELEMETRY UNDER FIRE (narrative-scene)
  14: {
    locationLabel: 'TRACKING NETWORK · TELEMETRY DROPOUT',
    quote: '"We commit now. Or we wait."',
    speaker: 'Flight Director Bryce Calhoun'
  },
  // 15 · Q8 — Manage Uncertainty (mc)
  15: {
    locationLabel: 'Q08 · MANAGE UNCERTAINTY',
    setup: 'A tracking station has lost telemetry on the upper stage. You have 30% of the picture. You have minutes.',
    prompt: 'What do you choose?',
    options: [
      'Commit immediately with what I have — momentum matters more than completeness.',
      'Hold until I can confirm one critical telemetry point.',
      'Delegate the call to the station chief closest to the data.',
      'Split the call — partial action on what I know, hold reserve for what I don\'t.',
      'Make the smallest reversible move, then re-read the situation.',
      'Refuse the false choice and ask what assumptions are forcing it.'
    ]
  },
  // 16 · Q9 — Manage Uncertainty (rating)
  16: {
    locationLabel: 'Q09 · MANAGE UNCERTAINTY',
    setup: 'Calhoun watches your face for the half-second of doubt before you answer. He has seen this moment in a hundred consoles.',
    prompt: 'I am comfortable making high-stakes decisions without full information.'
  },
  // 17 · ACT 3 — THE ANOMALY (narrative · aftermathMedbay)
  17: {
    locationLabel: 'BUILDING 4 · POST-SIMULATION DEBRIEF',
    eyebrow: 'Act Three · The Anomaly',
    body: ['The', 'sim', 'is', 'over.', 'But', 'at', 'a', 'cost.'],
    bodyAfter: [
      'A miscalculation. A spacecraft lost on the screen. Engineers ashen.',
      'Calhoun remains calm. "Necessary," he says. "We learn from this." You feel something shift.'
    ]
  },
  // 18 · Q10 — Master Emotions (mc)
  18: {
    locationLabel: 'Q10 · MASTER EMOTIONS',
    setup: 'You stand in the debrief room. A young engineer\'s hands are shaking. A list of fault signatures scrolls on the screen. Calhoun waits at the door.',
    prompt: 'In moments with heavy consequence, you most often:',
    options: [
      'Stay composed and move forward — the mission needs me functional now.',
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
    setup: 'You replay the sim. Three different telemetry briefings. Three different versions of what was true. One of them was the one Calhoun handed you first.',
    prompt: 'You suspect a troubling pattern in how decisions are being framed for you. What do you do?',
    options: [
      'Challenge it directly in the next flight readiness review.',
      'Quietly gather evidence across several decisions before raising anything.',
      'Run a small experiment — frame the next briefing differently and see what happens.',
      'Set it aside — pattern recognition under stress is unreliable.',
      'Share my hypothesis with one trusted colleague and ask them to challenge it.',
      'Ask three different telemetry sources the same question and triangulate.'
    ]
  },
  // 20 · Q12 — Be Curious (rating)
  20: {
    locationLabel: 'Q12 · BE CURIOUS',
    setup: 'A mathematician from a discipline you know nothing about — orbital mechanics, manual integration by hand — offers to teach you her model of trajectory error. It will take three evenings.',
    prompt: 'When I encounter an idea that does not fit my model of the world, my first impulse is to lean in, not push back.'
  },
  // 21 · MIDPOINT 1 — Katherine Johnson office
  21: {
    locationLabel: "KATHERINE JOHNSON'S OFFICE · INTERLUDE · 01 / 03",
    eyebrow: 'Interlude · Katherine',
    intro: 'You step out of the MOCR. Down a quiet corridor, a door is open. Katherine Johnson is at her desk, slide rule in hand. She does not ask you to sit. She does not ask you to answer aloud. She asks you three questions, one at a time. Write only what is true.',
    showIntro: true,
    prompt: 'What are you noticing about how you are <em>thinking</em>?',
    placeholder: 'The shape your thoughts have been taking…',
    hint: 'A line, a phrase, an image — whatever is true right now.'
  },
  // 22 · MIDPOINT 2
  22: {
    locationLabel: "KATHERINE JOHNSON'S OFFICE · INTERLUDE · 02 / 03",
    eyebrow: 'Interlude · Katherine',
    prompt: 'What are you noticing about how you are <em>feeling</em>?',
    placeholder: 'Name it without judging it…',
    hint: 'Whatever it is — Katherine is not surprised.'
  },
  // 23 · MIDPOINT 3
  23: {
    locationLabel: "KATHERINE JOHNSON'S OFFICE · INTERLUDE · 03 / 03",
    eyebrow: 'Interlude · Katherine',
    prompt: 'What are you noticing about how you are <em>behaving</em>?',
    placeholder: 'What you have done — or not done — that you can already see…',
    hint: 'You do not have to know yet. The mission continues when you do.'
  },
  // 24 · ACT 4 — THE PATTERN (narrative · shadowPattern)
  24: {
    locationLabel: 'ACT FOUR · THE PATTERN',
    eyebrow: 'Act Four · The Pattern',
    body: ['You', 'begin', 'to', 'notice', 'something.'],
    bodyAfter: [
      'Calhoun chooses launch-window over data caution. Speed over consensus. Certainty over doubt.',
      'The pattern is subtle. Once seen, impossible to ignore.'
    ]
  },
  // 25 · Q13 — Think Critically (rating)
  25: {
    locationLabel: 'Q13 · THINK CRITICALLY',
    setup: 'A telemetry briefing arrives with a tidy explanation. It is plausible. It is fast. It is exactly what you would prefer to be true.',
    prompt: 'When an explanation feels neat and immediately convincing, I deliberately slow down and look for what it might be hiding.'
  },
  // 26 · PRIVATE MEETING with Calhoun (narrative-scene · privateMeet)
  26: {
    locationLabel: "CALHOUN'S OFFICE · LATE",
    quote: '"The flight readiness review is weak. They hesitate. They reschedule. They re-baseline. We don\'t need more voices. We need a launch."',
    speaker: 'Flight Director Bryce Calhoun'
  },
  // 27 · Q14 — Influence Effortlessly (mc)
  27: {
    locationLabel: 'Q14 · INFLUENCE EFFORTLESSLY',
    setup: 'Calhoun wants you to help him build alignment across the engineering teams. He asks you how.',
    prompt: 'What do you believe is the most effective way to create lasting alignment?',
    options: [
      'Persuasion through data and analysis.',
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
    setup: 'You are asked to redesign a launch sequence that is technically sound but politically brittle. It solves the engineering problem and worsens the human one — engineers are exhausted.',
    prompt: 'Rank your approach to redesigning the sequence, from first to last.',
    itemLabels: [
      'Generate as many divergent options as possible before narrowing',
      'Seek external perspectives from disciplines outside aerospace',
      'Prototype a small version rapidly and iterate',
      'Refine the existing sequence — the bones are sound'
    ]
  },
  // 29 · Q16 — Unlock Creativity (rating)
  29: {
    locationLabel: 'Q16 · UNLOCK CREATIVITY',
    setup: 'You stand in front of an empty engineering chalkboard. The brief: a path forward no one has considered.',
    prompt: 'When constraints tighten, my first instinct is to reframe the problem rather than push harder on the old solution.'
  },
  // 30 · ACT 5 — THE DIVIDE (narrative · alliesWhisper)
  30: {
    locationLabel: 'ACT FIVE · THE DIVIDE',
    eyebrow: 'Act Five · The Divide',
    body: ['Your', 'colleagues', 'begin', 'to', 'question', 'Calhoun.'],
    bodyAfter: [
      'Quietly. Carefully. They do not accuse him. They simply ask whether the mission posture has shifted.',
      'Calhoun calls it cold feet.'
    ]
  },
  // 31 · Q17 — Collaborate Inclusively (mc)
  31: {
    locationLabel: 'Q17 · COLLABORATE INCLUSIVELY',
    setup: 'Three of your closest colleagues are pulling you aside between shifts. They are afraid. They are not wrong. But Calhoun is watching the room.',
    prompt: 'What do you do?',
    options: [
      'Align them with the Flight Director quickly to keep the team intact.',
      'Encourage open debate — the dissent is the data.',
      'Mediate between them — surface the assumptions on each side.',
      'Escalate the concerns formally on the record.',
      'Create a private structure for them to speak safely until I understand the pattern.',
      'Wait — disagreement under pressure rarely produces the truest answer.'
    ]
  },
  // 32 · Q18 — Collaborate Inclusively (rating)
  32: {
    locationLabel: 'Q18 · COLLABORATE INCLUSIVELY',
    setup: 'You sense the engineers around you self-editing. Smoothing. Withholding the honest fault report.',
    prompt: 'I actively invite people to disagree with me — and I work to make them safer when they do.'
  },
  // 33 · Q19 — Collaborate Inclusively (mc)
  33: {
    locationLabel: 'Q19 · COLLABORATE INCLUSIVELY',
    setup: 'A delegation of subcontractor engineers arrives. They will not speak with Calhoun. They will only speak with you. They look unlike most people in the room.',
    prompt: 'How do you set up the conversation?',
    options: [
      'In the formal review room — institutional weight signals respect.',
      'On their terms, in a place they choose, with their own technical leads.',
      'Privately, just me and their three leaders, so trust can build first.',
      'I send a representative first to understand the protocols.',
      'Open the meeting — anyone in their group can speak in any order.',
      'Around food. Real food. We eat before we negotiate.'
    ]
  },
  // 34 · BREAKING POINT — the launch hold order (narrative-scene)
  34: {
    locationLabel: "ACTION CONSOLE · ORDER DELIVERED",
    quote: '"The contractor refuses our timeline. Halt their payments. Apply pressure. We launch on schedule."',
    speaker: 'Flight Director Bryce Calhoun'
  },
  // 35 · Q20 — Act Decisively (mc)
  35: {
    locationLabel: 'Q20 · ACT DECISIVELY',
    setup: 'The order is given. The room understands the implication — families on the contractor side. Every eye finds yours.',
    prompt: 'You believe the order will cause serious harm. What do you do?',
    options: [
      'Follow the order — chain of command exists for a reason.',
      'Challenge it privately, after the room clears.',
      'Refuse openly, in front of everyone.',
      'Propose an alternative that solves the schedule problem without the harm — right now, in the room.',
      'Delay — buy time and re-open the question with new evidence.',
      'Step out of the chain entirely and warn the affected contractor directly.'
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
    setup: 'A choice will solve today and create something heavier in the next mission cycle.',
    prompt: 'I weigh the long-term consequences of a decision as seriously as the immediate outcome.'
  },
  // 38 · Q23 — Future-Focused (mc)
  38: {
    locationLabel: 'Q23 · BE FUTURE-FOCUSED',
    setup: 'A young engineer asks you: "What are we trying to build, ten years from now, that justifies pushing this hard?"',
    prompt: 'What is your honest answer?',
    options: [
      'I focus on this launch. Ten years is a story we tell ourselves.',
      'A program where this decision never has to be made again.',
      'Stability. A predictable cadence. The freedom that comes from things actually working.',
      'People — specifically, more engineers like you, ready to make hard calls well.',
      'I don\'t fully know yet. That is part of why I am still here, listening.',
      'A culture that can disagree without breaking under deadline.'
    ]
  },
  // 39 · Q24 — Embed Practices (mc)
  39: {
    locationLabel: 'Q24 · EMBED PRACTICES',
    setup: 'At the end of the shift, the corridors empty. You have twenty quiet minutes before sleep.',
    prompt: 'What do you most often do with that time?',
    options: [
      'Catch up on telemetry I missed — the day is never finished.',
      'Walk in silence — let the day settle on its own.',
      'Write — what I noticed, what I felt, what I decided badly.',
      'Speak with one person I trust who is not part of this mission.',
      'Read something with no obvious purpose — fiction, history, anything else.',
      'Sleep — recovery is the practice.'
    ]
  },
  // 40 · ACT 6 — THE REALISATION (narrative · reckoningMirror)
  40: {
    locationLabel: 'PRIVATE LOG · LATE',
    eyebrow: 'Act Six · The Realisation',
    body: ['You', 'review', 'the', 'decisions.'],
    bodyAfter: [
      'The saved telemetry. The silenced concerns. The reframed dissent.',
      'The language of mission discipline becoming the machinery of deadline. Not discipline. Compliance.'
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
  // 42 · CONFRONTATION with Calhoun (narrative-scene · confrontation)
  42: {
    locationLabel: "CONFRONTATION · CALHOUN'S OFFICE",
    quote: '"Schedule requires control, {{firstName}}. Caution is inefficient. You and I want the same thing."',
    speaker: 'Flight Director Bryce Calhoun'
  },
  // 43 · Q26 — Influence Effortlessly (mc)
  43: {
    locationLabel: 'Q26 · INFLUENCE EFFORTLESSLY',
    setup: 'Calhoun is not angry. He is calm. He believes every word. He wants you to walk out of this office as his ally.',
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
    setup: 'A test that lives outside this assessment too: how others come to trust your judgement.',
    prompt: 'People I work with adopt my recommendations because of trust and clarity — not because of position, volume, or pressure.'
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
    setup: 'A trusted colleague tells you: "You become more controlling when you are scared. I don\'t think you see it."',
    prompt: 'What is your honest first reaction?',
    options: [
      'Defensive — I want to explain why she\'s wrong.',
      'Curious — I want her to tell me the three most recent examples.',
      'Grateful — but unsure whether to believe it yet.',
      'I already knew. I just hadn\'t admitted it.',
      'Quietly hurt — I will sit with it before I respond.',
      'I dismiss it — she doesn\'t see the pressure I am under.'
    ]
  },
  // 47 · Q30 — Listen Deeply (rating)
  47: {
    locationLabel: 'Q30 · LISTEN DEEPLY',
    setup: 'In conversations that matter, you can choose to listen for words — or for everything else.',
    prompt: 'I listen for what is unsaid — tone, silence, what people avoid — as carefully as I listen for what is said.'
  },
  // 48 · ACT 7 — THE FINAL CALCULATION (narrative · dividedChamber)
  48: {
    locationLabel: 'ACT SEVEN · THE FINAL CALCULATION',
    eyebrow: 'Act Seven · The Final Calculation',
    body: ['The', 'go/no-go', 'is', 'imminent.'],
    bodyAfter: [
      'Calhoun moves to push through despite the new fault signature.',
      'You must choose your position. The launch window closes in six minutes.'
    ]
  },
  // 49 · Q31 — Act Decisively (mc)
  49: {
    locationLabel: 'Q31 · ACT DECISIVELY',
    setup: 'The room is full. Decision in five minutes. You do not get to abstain.',
    prompt: 'What do you do?',
    options: [
      'Support Calhoun — schedule matters above all.',
      'Oppose him openly — the math has to be honest.',
      'Seek a compromise between the factions.',
      'Propose a third structure — replace the binary with a new launch architecture.',
      'Step back entirely — let the system resolve it.',
      'Buy time — call for a 24-hour deliberation under a neutral chair.'
    ]
  },
  // 50 · Q32 — Be Curious (mc)
  50: {
    locationLabel: 'Q32 · BE CURIOUS',
    setup: 'The dust settles. You are offered a role on the new Mission Operations leadership team. You will need to keep learning, fast, for the rest of your career.',
    prompt: 'How will you actually do that?',
    options: [
      'I will surround myself with senior engineers and listen to their summaries.',
      'I will deliberately spend time with people whose discipline I do not share.',
      'I will read across fields I have no professional reason to study.',
      'I will go back to programs I have never been part of and listen before I speak.',
      'I will keep a record of what I got wrong, and review it monthly.',
      'I will teach — because teaching exposes what I do not actually understand.'
    ]
  },
  // 51 · Q33 — Manage Uncertainty (mc)
  51: {
    locationLabel: 'Q33 · MANAGE UNCERTAINTY',
    setup: 'A new fault is emerging in a subsystem you do not understand. You have no precedent. You have no map.',
    prompt: 'What is your first move?',
    options: [
      'Commit to a clear direction — uncertainty is the enemy of momentum.',
      'Wait for clarity — the wrong action is worse than no action.',
      'Run several small experiments at once — let reality teach me.',
      'Find someone who has lived inside that subsystem and learn before I decide.',
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
    setup: 'A clean briefing arrives. Everything fits. The author is competent. The recommendation is exactly what the room wants to hear.',
    prompt: 'What do you do first?',
    options: [
      'Accept the recommendation — the analyst is good and the team has bandwidth elsewhere.',
      'Ask what evidence would change the conclusion — and whether any of it has been gathered.',
      'Identify the assumption that, if wrong, breaks the whole story.',
      'Bring in one engineer who will disagree by reflex — and let them.',
      'Re-frame the question and watch how the recommendation does or does not survive.',
      'Run it past my gut and only intervene if it complains.'
    ]
  },
  // 54 · Q36 — Unlock Creativity (mc)
  54: {
    locationLabel: 'Q36 · UNLOCK CREATIVITY',
    setup: 'A constraint everyone treats as fixed — budget, time, regulation, custom — is the thing keeping you stuck.',
    prompt: 'How do you most often work with constraints like that?',
    options: [
      'I respect them and find efficiency within.',
      'I ignore them and design what is actually needed first, then negotiate.',
      'I treat them as design material and let them shape the solution in surprising ways.',
      'I invite the people enforcing the constraint into the redesign.',
      'I find the original reason the constraint exists — then test whether it still applies.',
      'I look for analogies in completely unrelated domains.'
    ]
  },
  // 55 · TWIST — the transmission (after Q36)
  55: {
    locationLabel: 'TRANSMISSION · OUTBOUND',
    body: [
      'The intercom flickers on, unintended.',
      'The review board is speaking. Not about Calhoun. About <em>you</em>.',
      'Your recommendations. Your decisions. Your silence when it mattered.',
      'Calhoun turns. Smiles.'
    ],
    quote: '"You still think this was my mission? Every step — you justified it."',
    speaker: 'Flight Director Bryce Calhoun'
  },
  // 56 · END REFLECTION · STRENGTHS
  56: {
    locationLabel: 'CLOSING REFLECTION · 01 / 04',
    eyebrow: 'Closing reflection · Strengths',
    intro: 'Before the result — four quiet questions. Write only what is true.',
    prompt: 'In which moment of this mission did you feel <em>most like yourself</em>? Where did your real strength show up?',
    placeholder: 'Name the scene, the choice, the feeling…'
  },
  // 57 · END REFLECTION · BELIEFS
  57: {
    locationLabel: 'CLOSING REFLECTION · 02 / 04',
    eyebrow: 'Closing reflection · Beliefs',
    prompt: 'Which <em>belief</em> of yours was tested by this mission — about people, schedule, or yourself?',
    placeholder: 'A belief you held coming in, that has shifted or been confirmed…'
  },
  // 58 · END REFLECTION · MINDSET
  58: {
    locationLabel: 'CLOSING REFLECTION · 03 / 04',
    eyebrow: 'Closing reflection · Mindset',
    prompt: 'What <em>mindset shift</em> — if you made it — would change how you act under pressure?',
    placeholder: 'From X to Y…'
  },
  // 59 · END REFLECTION · BEHAVIOUR
  59: {
    locationLabel: 'CLOSING REFLECTION · 04 / 04',
    eyebrow: 'Closing reflection · Behaviour',
    prompt: 'Which single <em>skill or behaviour</em> — if you built it deliberately over the next ninety days — would change everything?',
    placeholder: 'The one practice you would commit to…'
  },
  // 60 · TWIST — reframe before results
  60: {
    locationLabel: 'REFRAME · BEFORE THE RESULT',
    body: [
      'This mission was never about whether you were a hero or a villain.',
      'It was about something more useful:',
      'How easily good intentions <em>drift</em> under deadline pressure.',
      'How quickly engineering becomes politics.',
      'How subtly clarity becomes certainty.'
    ],
    quote: 'And how much strategic capability depends on the ability to notice yourself before the pattern becomes the path.',
    speaker: 'Reading your result'
  }
};

// ========================================================================
// MERGE — produce skin SCENES preserving every original field, then
// applying our text-only overrides on top.
// ========================================================================

function applySceneOverride(orig, ov) {
  if (!ov) return orig;
  const merged = JSON.parse(JSON.stringify(orig));
  Object.entries(ov).forEach(([k, v]) => {
    if (k === 'options' && Array.isArray(orig.options) && Array.isArray(v)) {
      // Override only the .copy field of each option
      merged.options = orig.options.map((opt, i) => ({ ...opt, copy: v[i] || opt.copy }));
    } else if (k === 'itemLabels' && Array.isArray(orig.items)) {
      // Rename item labels but keep scoring
      merged.items = orig.items.map((it, i) => ({ ...it, label: v[i] || it.label }));
    } else {
      merged[k] = v;
    }
  });
  return merged;
}

const scenes = SCENES.map((s, i) => applySceneOverride(s, SCENE_OVERRIDES[i]));

// ========================================================================
// ARCHETYPES — Apollo-themed
// ========================================================================
const archetypes = {
  reactive_defender: {
    name: 'The First Responder',
    band: 'Strategic Infancy',
    headline: 'You care about protecting the mission — but deadline pressure is driving more of your decisions than you realise.',
    body: 'Your result suggests that when stakes rise, your attention narrows fast. You may move into reaction, urgency, or defence before you have understood what is happening. You are committed and action-oriented — but the same energy that makes you formidable in a crisis can make you blind to the pattern beneath it. You may respond to fault signatures rather than root causes, miss weak telemetry signals, or confuse motion with progress.',
    risk: 'Your risk is not lack of effort. It is pressure-led action. You may be protecting the mission while reinforcing the very patterns that weaken it.',
    focus: 'Start at Level 1 — <em>Deepen Self-Awareness</em>. Notice your pressure patterns. Name your triggers. Build a pause before reacting. Separate fact from interpretation. Ask, "What am I not seeing yet?"',
    next: 'Your first breakthrough is likely to come from seeing your own operating system more clearly — before you change anything else.'
  },
  tactical_survivor: {
    name: 'The Engineer in the Trenches',
    band: 'Tactical Survivor',
    headline: 'You can handle pressure — but your problem-solving may be too anchored in the immediate console.',
    body: 'You are capable, practical, and effective in difficult shifts. You make decisions, keep momentum, and solve immediate faults. Your result suggests, though, that short-term demands may be crowding out longer-term mission design. You may prioritise control over understanding, optimise for delivery rather than direction, and carry too much yourself.',
    risk: 'Your risk is tactical over-functioning. You may become so good at surviving the current sim that you unintentionally normalise crisis as the operating model.',
    focus: 'Strengthen Level 3 — <em>Develop Strategic Capabilities</em>. Focus on future-orientation, creative options, and acting well in uncertainty. Move from "What needs fixing now?" to "What future are we creating through this decision?"',
    next: 'Your growth edge is widening the time horizon you actually think in — from this shift, to this decade of missions.'
  },
  hidden_drifter: {
    name: 'The Compromised Trajectory',
    band: 'Hidden Drift',
    headline: 'You are more strategic than most — but your blindspots emerge precisely when you feel most certain.',
    body: 'You are thoughtful, capable, and likely well-intentioned. You can see complexity, make decisions, and influence others. But your result suggests a subtle risk: under deadline pressure, your strengths can distort. Clarity becomes certainty. Decisiveness becomes control. Conviction becomes justification. Calm becomes detachment. This is the most psychologically important result because it mirrors how strategic drift happens in real mission environments — not through incompetence, but through capable people making apparently reasonable choices under pressure.',
    risk: 'Your risk is <em>justified drift</em>. You may continue making decisions that each seem defensible while the wider pattern moves quietly away from your stated values.',
    focus: 'Work across Levels 1 and 2 together — <em>Deepen Self-Awareness</em> and <em>Cultivate Open-Mindedness</em>. Notice yourself under pressure. Listen most carefully when you disagree. Test the assumptions you would rather keep. Invite challenge. Watch the moment when "necessary" becomes a dangerous word.',
    next: 'Your fastest development will come from learning to notice earlier — before the trajectory drifts.'
  },
  strategic_operator: {
    name: 'The Mission Controller',
    band: 'Strategic Operator',
    headline: 'You show strong strategic capability and a relatively balanced pattern under pressure.',
    body: 'Your result suggests you can remain clear, reflective, and effective in complex situations. You likely balance action with thought, confidence with humility, and direction with collaboration. Composure on the loop, thoughtful decisions, openness, alignment, and awareness of consequence are all visible in your pattern.',
    risk: 'Your risk is not capability — it is consistency. Under enough deadline pressure, even strong operators drift into old patterns. The opportunity is to make your strategic capability more reliable, more repeatable, and more visible to others.',
    focus: 'Strengthen Level 4 — <em>Scale Your Impact</em>. Decision quality, stakeholder alignment, influence without over-control, collaboration under tension. Turning strategic insight into action that travels.',
    next: 'Your growth edge is becoming more conscious — and more deliberate — about the impact you already have.'
  },
  force_multiplier: {
    name: 'The Architect of Apollo',
    band: 'Strategic Force Multiplier',
    headline: 'You do not just think strategically. You increase the strategic capacity of the program around you.',
    body: 'Your result suggests a highly integrated strategic profile. You can stay aware of yourself under pressure, regulate emotion without disconnecting from consequence, listen deeply, think critically, generate options in uncertainty, decide with courage and humility, and influence without domination. You hold complexity without collapsing into confusion or control.',
    risk: 'Your risk is <em>over-reliance</em>. Others may look to you for clarity, judgement, and steadiness. Over time, that can quietly create dependency — unless you intentionally build capability in the program around you.',
    focus: 'Your next level is multiplication. Develop strategic capability in others. Design decision systems. Build collective intelligence. Create the conditions for others to hold uncertainty without panic.',
    next: 'Your development edge is to become less necessary — by making the program more strategically capable.'
  }
};

// ========================================================================
// SECONDARY PATTERNS — Apollo themed
// ========================================================================
const secondaryPatterns = {
  architect_of_order: {
    name: 'The Procedure Hawk',
    headline: 'Drawn to checklist, control, and decisive action.',
    body: 'You are highly effective on the loop. But unchecked, your strength becomes rigidity. You may begin to mistake disagreement for sloppiness, ambiguity for failure, and speed for strategy.'
  },
  the_justifier: {
    name: 'The Necessary Risks',
    headline: 'At risk of rationalising questionable engineering calls when the deadline feels important enough.',
    body: 'This does not mean you lack values. It means your values can become vulnerable when launch-window, loyalty, or political pressure enters the room.'
  },
  the_calm_blade: {
    name: 'The Cool Console',
    headline: 'Composed in moments that unsettle others on the loop.',
    body: 'That composure is valuable. But there is a fine line between regulation and emotional distance. Your edge is to remain calm without becoming disconnected from human consequence.'
  },
  the_consensus_seeker: {
    name: 'The Coalition Builder',
    headline: 'You create inclusion and invite voice — but may delay difficult go/no-go calls.',
    body: 'Your development edge is to preserve collaboration while becoming more decisive when the window closes.'
  },
  the_decisive_commander: {
    name: 'The Cowboy',
    headline: 'You move quickly and bring momentum — but your speed may narrow the field of telemetry.',
    body: 'Your edge is to slow down just enough to hear what the system is trying to tell you.'
  },
  vision_under_strain: {
    name: 'The Visionary Cracking',
    headline: 'You see beyond the immediate launch, but pressure may disrupt your steadiness on the loop.',
    body: 'Your edge is to build inner stability so your vision survives contact with reality.'
  }
};

// ========================================================================
// RISK COPY — Apollo themed
// ========================================================================
const riskCopy = {
  control_bias: {
    name: 'Authority Reflex',
    low:   'You appear able to pursue clarity without defaulting to command.',
    mod:   'You may sometimes overvalue speed, certainty, or chain of command when pressure rises.',
    high:  'You may be at risk of mistaking <em>command for strategy</em>. This can make you decisive — but it may also reduce listening, creativity, and trust on the loop.',
    q:     'Where might you be calling something <em>alignment</em> when it is actually compliance?'
  },
  moral_drift: {
    name: 'Schedule Drift',
    low:   'Your responses suggest a relatively strong ability to keep means and ends connected.',
    mod:   'You may occasionally justify difficult engineering actions when the launch window feels important enough.',
    high:  'You may be vulnerable to rationalising harmful choices if they appear necessary for the schedule.',
    q:     'At what point does a necessary compromise become a betrayal of the mission itself?'
  },
  detachment_pressure: {
    name: 'Cold Console',
    low:   'You appear able to stay connected to human consequence while under pressure.',
    mod:   'Your composure is a strength, but it may sometimes become distance.',
    high:  'You may remain calm in ways others on the loop experience as emotionally unavailable, overly rational, or disconnected from impact.',
    q:     'How do you stay steady without becoming unreachable?'
  }
};

// ========================================================================
// NEXT STEPS — Apollo themed practical experiments
// ========================================================================
const nextSteps = {
  reactive_defender: [
    { icon: 'pause',   title: 'The five-second hold',         body: 'Before responding to a fault signature, give yourself five seconds. Notice what your body wants to do, then choose what to do.', test: 'Try for 7 shifts. Track each time you used it.' },
    { icon: 'journal', title: 'A nightly two-line log',        body: 'Each evening write: "Today I noticed…" and "Tomorrow I will…". Build the muscle of self-observation.',                            test: 'Do this for 21 days, then re-read the lot.' },
    { icon: 'mirror',  title: 'Ask one colleague',             body: 'Ask one trusted colleague: "When pressure rises, what do you see me become on the loop?" Listen without defending.',                test: 'One question, one person, this week.' },
    { icon: 'question',title: 'Replace "should" with "if"',    body: 'Notice your "shoulds" — they are usually pressure speaking. Reframe to "if I did this, what would happen?" Re-open the choice.', test: 'Count your "shoulds" for one day. Reframe three.' }
  ],
  tactical_survivor: [
    { icon: 'horizon',  title: 'The 10-year question',           body: 'On any non-trivial decision, ask: "What does this look like in a decade of missions?" Forces you out of fire-fighting and into direction.', test: 'Apply to your next three meaningful decisions.' },
    { icon: 'experiment', title: 'Run one strategic experiment',  body: 'Pick one current fault. Generate four genuinely different solutions before settling on one. Build option-fluency.',                              test: 'One fault, four options, this week.' },
    { icon: 'doors',    title: 'Future-back planning',           body: 'Describe in detail what good looks like 18 months from now. Then walk backwards: what decision today would matter then?',                        test: '90 minutes, a single page, by Friday.' },
    { icon: 'reframe',  title: 'Trade urgency for importance',   body: 'For one week, mark every task as either urgent OR important. Notice the ratio. Notice what does not survive scrutiny.',                          test: 'Audit for 5 days. Drop three urgent-not-important items.' }
  ],
  hidden_drifter: [
    { icon: 'notice',   title: 'The drift word audit',           body: 'Notice when you use words like "necessary", "no choice", "this once". Each is a possible drift signal. Pause, name, examine.',                  test: 'Track for two weeks. Bring the list to your coach.' },
    { icon: 'invite',   title: 'Invite your strongest dissenter', body: 'Identify the engineer most likely to disagree with you. Invite them into a real decision. Treat their resistance as data.',                    test: 'One conversation, this month. Document what shifted.' },
    { icon: 'mirror',   title: 'The 360 sentence',                body: 'Ask three colleagues: "What is one thing about my pattern under pressure that I probably do not see?" Listen without explaining.',              test: 'Three people, one question, no defending.' },
    { icon: 'pause',    title: 'Slow down on the certain ones',   body: 'When a call feels obvious, you are most at risk. Apply a 24-hour rule to anything you are certain about.',                                      test: 'Use the rule three times this month.' }
  ],
  strategic_operator: [
    { icon: 'multiply', title: 'Develop one other person',        body: 'Choose one engineer in your orbit. Help them build a strategic muscle they currently lack. Multiplication begins with one.',                  test: 'Name the person. Name the muscle. Begin.' },
    { icon: 'decide',   title: 'Make decisions more visible',     body: 'When you make a meaningful call, share publicly what you considered and what you weighed. Make the strategy legible.',                        test: 'Try this on three decisions this month.' },
    { icon: 'reframe',  title: 'Sharpen the consequential 20%',   body: 'Identify the 20% of your decisions that drive 80% of mission outcomes. Concentrate your thinking time there. Delegate or systematise the rest.', test: 'Map your decisions for a week. Re-balance time.' },
    { icon: 'experiment', title: 'Pick one risk to deliberately reduce', body: 'Look at your three risk overlays. Choose the one closest to becoming a real constraint. Design a small practice to soften it.',         test: 'One overlay, one practice, 30 days.' }
  ],
  force_multiplier: [
    { icon: 'multiply', title: 'Design a decision system',         body: 'Create a clear template for how strategic decisions get made in your program — owner, evidence, options, trade-offs, review. Replicable, not heroic.', test: 'Build the v1 template. Apply to your next big call.' },
    { icon: 'invite',   title: 'Build the bench',                  body: 'Identify three engineers who could become the next layer of strategic capability. Invest in them deliberately, with regular feedback and stretch decisions.', test: 'Three names. One conversation each, this month.' },
    { icon: 'mirror',   title: 'Make yourself less necessary',     body: 'In every meeting this month, ask: "Could someone else here have led this?" Then arrange for that to be true next time.',                      test: 'One month of audit. Hand off two recurring meetings.' },
    { icon: 'horizon',  title: 'Author the long brief',            body: 'Write a short paper on the strategic capability you want your wider program to have in three years. Use it as a north star — share, debate, refine.', test: 'One page. Share with three trusted readers.' }
  ]
};

// ========================================================================
// IMAGES — paths under images/skin-apollo/
// ========================================================================
const imageMap = {
  archetypeDir: 'images/skin-apollo/',
  scene: {
    councilChamber:  'images/skin-apollo/scene-mocr.png',
    fracturedCity:   'images/skin-apollo/scene-cape-launchpad.png',
    convoyArc:       'images/skin-apollo/scene-telemetry-dropout.png',
    privateMeet:     'images/skin-apollo/scene-flight-director-office.png',
    breakingPoint:   'images/skin-apollo/scene-action-console.png',
    confrontation:   'images/skin-apollo/scene-confrontation.png',
    twinSuns:        'images/skin-apollo/scene-katherine-office.png',
    summonsHerald:   'images/skin-apollo/scene-mocr-overview.png',
    chaoticCouncil:  'images/skin-apollo/scene-computers-room.png',
    aftermathMedbay: 'images/skin-apollo/scene-sim-debrief.png',
    shadowPattern:   'images/skin-apollo/scene-shadow-pattern.png',
    alliesWhisper:   'images/skin-apollo/scene-allies-whisper.png',
    reckoningMirror: 'images/skin-apollo/scene-reckoning.png',
    dividedChamber:  'images/skin-apollo/scene-go-nogo.png'
  }
};

// ========================================================================
// IMAGE PROMPTS — safety-clean, embedded in skin so Image Studio uses them
// ========================================================================
const imagePrompts = {
  art_direction: '1970s iconic pop-art poster style. Bold flat colours in limited palette, ben-day dot shading, strong black ink outlines around every form, high-contrast cel-shaded lighting, screen-print aesthetic reminiscent of late-1960s and early-1970s Apollo program promotional posters and pop-illustration magazines. Period-correct Mission Operations Control Room — rows of consoles, CRT panels, slide rules, mechanical calculators. Period-correct figures in skinny ties and short-sleeved white shirts, women in lab coats, glasses, headsets. Strong graphic composition, sense of optimism and pressure side by side. Katherine Johnson is permitted as a respectful, dignified pop-poster depiction.',
  palette: 'Near-black #050810 base · NASA red #FC3D21 accent · warm off-white #f4ecdb highlights',
  archetypes: {
    reactive_defender: {
      filename_template: 'images/skin-apollo/archetype-reactive-defender-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. {genderDesc} in a flight controller\'s console pose, leaning forward toward a CRT screen, hand reaching toward a switch panel, urgency in the posture, body angled away from a fault warning indicator glowing NASA red. Mission Operations Control Room background, rows of identical consoles receding, period-correct white shirts and skinny ties. Deep red rim light from console glow. 1:1 square aspect ratio, melancholic, single warm-red light source. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)'
    },
    tactical_survivor: {
      filename_template: 'images/skin-apollo/archetype-tactical-survivor-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. {genderDesc}, a weathered flight controller mid-stride down the long flank of console rows, scanning a clipboard, period-correct short-sleeve white shirt and skinny tie or lab coat. CRT screens glowing softly red on both sides. Long shadow trailing behind under fluorescent ceiling banks. 1:1 square aspect ratio, sense of forward momentum, lonely. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)'
    },
    hidden_drifter: {
      filename_template: 'images/skin-apollo/archetype-hidden-drifter-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. {genderDesc}, a solitary flight controller walking down a long ancient corridor between rows of NASA mainframe cabinets, parallel columns of warm-red operational lights from above, polished tile floor reflecting their figure subtly out of sync — slightly displaced, slightly behind, as if a second self trails them. Dust catching the red beams, deep shadow at the edges. 1:1 square aspect ratio. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. Graphic poster composition, contemplative, slightly unsettling. (Reminder: edge-to-edge, no border, no text.)'
    },
    strategic_operator: {
      filename_template: 'images/skin-apollo/archetype-strategic-operator-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. {genderDesc}, a centred standing flight director on a raised dais behind the row of front controllers, calm posture, headset on, period-correct attire, head slightly inclined toward the front screen. A natural halo of warm-red console light behind their head. Other flight controllers visible at consoles below, listening, partially in shadow. 1:1 square aspect ratio. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. Graphic poster composition, serene, dignified. (Reminder: edge-to-edge, no border, no text.)'
    },
    force_multiplier: {
      filename_template: 'images/skin-apollo/archetype-force-multiplier-{gender}.png',
      prompt_template: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. {genderDesc}, a central flight director on a raised dais bathed in radiant warm-red light, surrounded at the same elevation by other flight controllers and engineers of equal stature, all illuminated by the shared console glow. Faint lines of warm red light connecting them like a constellation. Apollo program insignia subtly suggested on the wall behind. 1:1 square aspect ratio. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. Graphic poster composition, mythic, communal. (Reminder: edge-to-edge, no border, no text.)'
    }
  },
  scenes: {
    mocr_overview:           { filename: 'images/skin-apollo/scene-mocr-overview.png', prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. Wide establishing view of Mission Operations Control Room at night, four rows of consoles receding to a vast front projection screen, CRT screens glowing in red, controllers in white shirts at their stations, ceiling fluorescents low. 1:1, melancholic, vast scale. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)' },
    mocr:                    { filename: 'images/skin-apollo/scene-mocr.png',         prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. Interior of Mission Operations Control Room at night, a single figure standing on the raised flight director dais, soft warm-red light from above, empty consoles in shadow surrounding them. 1:1, melancholic, vast scale. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)' },
    cape_launchpad:          { filename: 'images/skin-apollo/scene-cape-launchpad.png', prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. Overlook of the Cape Canaveral launch pad at dusk, the Saturn V rocket silhouetted against a dark sky, gantry lights glowing warm red, distant ocean horizon. Two small flight controllers in foreground, backs to camera. Heat shimmer and cooling vapour drifting from the booster. 1:1, awe under pressure. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)' },
    telemetry_dropout:       { filename: 'images/skin-apollo/scene-telemetry-dropout.png', prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. A tracking station console at night, multiple CRT screens flickering with red warning indicators, telemetry traces dropping out, a controller leaning forward with hand on a switch. Long shadows from fluorescent ceiling. 1:1, urgency under cold quiet. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)' },
    flight_director_office:  { filename: 'images/skin-apollo/scene-flight-director-office.png', prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. Two figures seated across a low office table at night, behind them a wide window showing the launch pad lit warm-red on the distant horizon. The right figure leans forward, lit by the pad glow; the left figure remains in shadow. 1:1, intimate, quietly tense. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)' },
    action_console:          { filename: 'images/skin-apollo/scene-action-console.png',  prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. A lone flight controller standing in the centre of a tall vertical column of warm-red light at an action console, floating semi-transparent telemetry panels around them at chest height, vertical CRT banks flanking. 1:1, hushed, weight of decision. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)' },
    confrontation:           { filename: 'images/skin-apollo/scene-confrontation.png',   prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. Two figures facing each other across a darkened office, the negative space between them charged. Both partly silhouetted, one slightly lit from the right with warm red console glow filtering through a doorway. A horizon line of red light bisects the wall behind them. 1:1, mirrored stance, psychological standoff. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)' },
    katherine_office:        { filename: 'images/skin-apollo/scene-katherine-office.png', prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. A quiet office at dusk in a 1960s American space-program building. A Black woman mathematician in her early 50s — a fictional, non-identifiable character, three-quarter profile, features generic and not modelled on any specific person — seated at a wooden desk covered with handwritten trajectory pages and a slide rule. A single brass desk lamp casts warm light across her shoulder. Chalkboard behind her with hand-drawn orbital equations and arcs. Generous negative space, contemplative. 1:1, meditative. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)' },
    computers_room:          { filename: 'images/skin-apollo/scene-computers-room.png',  prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. Interior of a "human computers" room at NASA. Several women, including Black women mathematicians, at long desks with mechanical calculators and stacks of trajectory worksheets. Three of them are mid-discussion, animated, one quietly head-down. Warm overhead lighting, deep architectural space, period-correct dresses and lab coats. 1:1, tension, fragmented voices, dignified. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)' },
    sim_debrief:             { filename: 'images/skin-apollo/scene-sim-debrief.png',     prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. A long debrief room at night after a failed simulation. Rows of empty engineering seats receding, a single standing figure in the foreground with head bowed, soft warm-red light spilling from camera-left, reflective tile floor catching the glow. 1:1, hushed, sombre, weight of consequence. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)' },
    shadow_pattern:          { filename: 'images/skin-apollo/scene-shadow-pattern.png',  prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. A single flight controller standing centred in a corridor, with two contradicting warm-red light sources from left and right casting two long, diverging shadows toward camera — like a fork in identity. Subtle halo of warm light behind the figure\'s head. Otherwise pitch dark. 1:1, psychological doubling. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)' },
    allies_whisper:          { filename: 'images/skin-apollo/scene-allies-whisper.png',  prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. Three NASA engineers clustered close together in a corridor alcove between two large electrical cabinets, heads tilted inward as if speaking quietly. A single warm-red emergency light overhead casting concentrated downlight. Heavy shadow at the edges. 1:1, conspiratorial, intimate, conferring under pressure. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)' },
    reckoning:               { filename: 'images/skin-apollo/scene-reckoning.png',       prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. A flight controller standing in profile facing their own reflection in a tall vertical seam of warm-red light at the edge of the MOCR. The reflection is faintly dimmer, slightly less certain. Between them, a bright vertical filament of red console light. The rest of the room is pitch-dark. 1:1, recognition of self, reckoning. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)' },
    go_nogo:                 { filename: 'images/skin-apollo/scene-go-nogo.png',         prompt: 'EDGE-TO-EDGE FRAMING, NO BORDER, NO TEXT. This is a full-bleed cinematic still: the subject and background extend to every edge of the frame like a frame grab from a film, cropped at the rectangle\'s edges. Do not draw a border, frame, white margin, paper edge, matting, decorative trim or vignette around the image. Do not render any text, typography, caption, title, label, signature, logo or watermark anywhere — even in the corners. 1970s pop-art cinematic still, bold flat colours, ben-day dot shading, strong black ink outlines around forms, comic-book cel lighting, screen-print aesthetic in the style of late-1960s/early-1970s Apollo program promotional artwork and 1970s magazine pop illustration sensibility, framed as a film still.. Wide view of Mission Operations Control Room moments before a critical go/no-go vote, split down the centre by a hard vertical beam of warm-red light from the front screen. Two clusters of flight controllers occupy each side. A single solitary figure stands centred on the seam of light, facing the front screen. Receding console rows. 1:1, decisive moment. Palette near-black #050810, NASA red #FC3D21, warm off-white #f4ecdb. (Reminder: edge-to-edge, no border, no text.)' }
  }
};

// ========================================================================
// APOLLO-THEMED SVG ART — alternative choreography backgrounds + disc art.
// Each is a raw SVG string keyed by the id the renderer asks for.
// ========================================================================

// Choreography backgrounds — wide 1600x900 SVGs that drift behind scenes.
// Apollo equivalents use telemetry, console grids, and orbital paths.
const choreoOverrides = {
  // 'converging' → telemetry traces converging on a console row
  converging: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    ${Array.from({length:14}, (_, i) => {
      const y = 110 + i*55;
      const amp = 6 + (i%5)*4;
      const pts = Array.from({length:25}, (_,j) => `${j*70},${y + Math.sin(j*0.6 + i)*amp}`).join(' ');
      return `<polyline points="${pts}" fill="none" stroke="rgba(252,61,33,0.45)" stroke-width="0.5"/>`;
    }).join('')}
  </svg>`,

  // 'ripple' → concentric tracking radar sweeps
  ripple: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    ${Array.from({length:10}, (_, i) => `<circle cx="800" cy="450" r="${70 + i*64}" fill="none" stroke="rgba(252,61,33,${(0.55 - i*0.05).toFixed(2)})" stroke-width="0.5"/>`).join('')}
    <line x1="800" y1="450" x2="${800 + Math.cos(Math.PI*0.35)*700}" y2="${450 + Math.sin(Math.PI*0.35)*700}" stroke="rgba(252,61,33,0.6)" stroke-width="0.5"/>
  </svg>`,

  // 'sun-arcs' → orbital trajectory arcs
  'sun-arcs': `<svg class="choreo sun-arcs" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <ellipse cx="800" cy="500" rx="800" ry="220" fill="none" stroke="rgba(252,61,33,0.5)" stroke-width="0.7"/>
    <ellipse cx="800" cy="500" rx="600" ry="160" fill="none" stroke="rgba(252,61,33,0.35)" stroke-width="0.5"/>
    <ellipse cx="800" cy="500" rx="400" ry="100" fill="none" stroke="rgba(252,61,33,0.25)" stroke-width="0.5"/>
    <circle cx="800" cy="500" r="40" fill="rgba(255,102,68,0.22)"/>
    <circle cx="800" cy="500" r="14" fill="#fc3d21"/>
    <circle cx="1450" cy="500" r="4" fill="#fc3d21"/>
  </svg>`,

  // 'grid' (question-page background) → ghost console frame. Corner brackets
  // and minor edge marks at the screen perimeter only, everything well below
  // text-contrast threshold so the prompt sits on a near-pure dark ground.
  grid: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <!-- Corner brackets — ghostly, pushed deeper into the corners -->
    <path d="M 40  84  L 40  40  L 84  40"  fill="none" stroke="rgba(252,61,33,0.22)" stroke-width="0.8"/>
    <path d="M 1560 84  L 1560 40  L 1516 40"  fill="none" stroke="rgba(252,61,33,0.22)" stroke-width="0.8"/>
    <path d="M 40  816 L 40  860 L 84  860" fill="none" stroke="rgba(252,61,33,0.22)" stroke-width="0.8"/>
    <path d="M 1560 816 L 1560 860 L 1516 860" fill="none" stroke="rgba(252,61,33,0.22)" stroke-width="0.8"/>
    <!-- REC indicator — kept readable but smaller, only chrome element with any presence -->
    <circle cx="1492" cy="42" r="3" fill="#fc3d21" opacity="0.55"/>
    <text x="1500" y="46" font-family="monospace" font-size="10" fill="rgba(252,61,33,0.32)" letter-spacing="2">REC</text>
  </svg>`,

  // 'fault' → telemetry fault stripes
  fault: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <path d="M 0 590 L 220 580 L 380 640 L 520 540 L 700 600 L 880 480 L 1080 600 L 1280 520 L 1600 600" stroke="rgba(252,61,33,0.6)" stroke-width="0.7" fill="none"/>
    <path d="M 0 660 L 200 650 L 380 700 L 540 600 L 720 660 L 900 540 L 1100 660 L 1300 580 L 1600 660" stroke="rgba(252,61,33,0.3)" stroke-width="0.45" fill="none"/>
    ${Array.from({length:6}, (_, i) => `<line x1="${200+i*240}" y1="120" x2="${200+i*240}" y2="780" stroke="rgba(252,61,33,0.18)" stroke-width="0.4" stroke-dasharray="3 6"/>`).join('')}
  </svg>`,

  // 'web' → network of consoles — radial spokes
  web: `<svg class="choreo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    ${Array.from({length:16}, (_, i) => {
      const a = (i/16)*Math.PI*2;
      const x = 800 + Math.cos(a)*900;
      const y = 450 + Math.sin(a)*900;
      return `<line x1="800" y1="450" x2="${x}" y2="${y}" stroke="rgba(252,61,33,0.25)" stroke-width="0.4"/>`;
    }).join('')}
    ${[180,300,420,560].map((r,i) => `<circle cx="800" cy="450" r="${r}" fill="none" stroke="rgba(252,61,33,${(0.42-i*0.08).toFixed(2)})" stroke-width="0.4"/>`).join('')}
    ${Array.from({length:12}, () => {
      const a = Math.random()*Math.PI*2; const r = 100+Math.random()*450;
      return `<circle cx="${800+Math.cos(a)*r}" cy="${450+Math.sin(a)*r}" r="2.5" fill="#fc3d21"/>`;
    }).join('')}
  </svg>`
};

// Disc art — NASA equivalents of the 14 scene illustrations.
// Each fits the 600x600 viewBox of the .disc container.
function nasaBase(inner) {
  return `<svg class="disc-art" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="nasaG" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#0e1424"/>
        <stop offset="60%" stop-color="#070914"/>
        <stop offset="100%" stop-color="#040611"/>
      </radialGradient>
      <radialGradient id="nasaRed" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ff6644" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#fc3d21" stop-opacity="0"/>
      </radialGradient>
      <filter id="nasaBlur"><feGaussianBlur stdDeviation="4"/></filter>
      <filter id="nasaBlurHi"><feGaussianBlur stdDeviation="9"/></filter>
    </defs>
    <rect width="600" height="600" fill="url(#nasaG)"/>
    ${inner}
    </svg><div class="disc-veil"></div>`;
}

const discArtOverrides = {
  // MOCR establishing — rows of consoles receding to the front screen
  summonsHerald: nasaBase(`
    ${[480,440,400,360,320].map((y,i) => `
      <rect x="${60+i*18}" y="${y}" width="${480-i*36}" height="22" fill="#0c1428" stroke="rgba(252,61,33,0.35)" stroke-width="0.5"/>
      ${Array.from({length: 8-i}, (_, j) => `<rect x="${72+i*20 + j*(56-i*4)}" y="${y+5}" width="12" height="10" fill="rgba(252,61,33,${(0.55 - j*0.04).toFixed(2)})"/>`).join('')}
    `).join('')}
    <!-- Front projection screen -->
    <rect x="120" y="80" width="360" height="200" fill="#040611" stroke="rgba(252,61,33,0.4)" stroke-width="0.7"/>
    <ellipse cx="300" cy="180" rx="120" ry="44" fill="url(#nasaRed)" filter="url(#nasaBlur)" opacity="0.6"/>
    <circle cx="300" cy="180" r="22" fill="rgba(252,61,33,0.45)" filter="url(#nasaBlur)"/>
    <circle cx="300" cy="180" r="9" fill="#ff6644"/>
  `),

  // Council chamber → MOCR with single figure on dais
  councilChamber: nasaBase(`
    <!-- Ceiling fluorescent banks -->
    ${Array.from({length:6}, (_, i) => `<rect x="${60+i*80}" y="40" width="50" height="6" fill="rgba(252,61,33,0.5)"/>`).join('')}
    <!-- Tiered consoles -->
    <rect x="60" y="380" width="480" height="22" fill="#0c1428" stroke="rgba(252,61,33,0.35)" stroke-width="0.5"/>
    <rect x="90" y="430" width="420" height="22" fill="#0c1428" stroke="rgba(252,61,33,0.35)" stroke-width="0.5"/>
    <rect x="120" y="480" width="360" height="22" fill="#0c1428" stroke="rgba(252,61,33,0.35)" stroke-width="0.5"/>
    <!-- Dais with figure -->
    <rect x="270" y="180" width="60" height="6" fill="rgba(252,61,33,0.4)"/>
    <circle cx="300" cy="160" r="14" fill="#0c1428" stroke="rgba(252,61,33,0.6)" stroke-width="0.6"/>
    <rect x="290" y="170" width="20" height="60" rx="4" fill="#0c1428" stroke="rgba(252,61,33,0.6)" stroke-width="0.6"/>
    <!-- Halo light -->
    <circle cx="300" cy="160" r="100" fill="url(#nasaRed)" filter="url(#nasaBlurHi)"/>
  `),

  // Fractured city → Cape Canaveral pad with Saturn V silhouette
  fracturedCity: nasaBase(`
    <!-- Horizon -->
    <line x1="0" y1="420" x2="600" y2="420" stroke="rgba(252,61,33,0.35)" stroke-width="0.5"/>
    <!-- Saturn V silhouette -->
    <rect x="288" y="180" width="24" height="240" fill="#0a0e1c" stroke="rgba(252,61,33,0.45)" stroke-width="0.6"/>
    <polygon points="300,160 290,180 310,180" fill="#0a0e1c" stroke="rgba(252,61,33,0.5)" stroke-width="0.6"/>
    <!-- Gantry -->
    <rect x="318" y="200" width="44" height="220" fill="rgba(252,61,33,0.07)" stroke="rgba(252,61,33,0.4)" stroke-width="0.5"/>
    ${Array.from({length:10}, (_, i) => `<line x1="318" y1="${210+i*22}" x2="362" y2="${210+i*22}" stroke="rgba(252,61,33,0.35)" stroke-width="0.4"/>`).join('')}
    <!-- Pad glow / cooling vapour -->
    <ellipse cx="300" cy="440" rx="180" ry="40" fill="url(#nasaRed)" filter="url(#nasaBlurHi)" opacity="0.7"/>
    <ellipse cx="300" cy="420" rx="80" ry="20" fill="rgba(252,61,33,0.25)" filter="url(#nasaBlur)"/>
    <!-- Two foreground figures -->
    <rect x="80" y="455" width="8" height="40" fill="#070914"/>
    <circle cx="84" cy="450" r="5" fill="#070914"/>
    <rect x="510" y="455" width="8" height="40" fill="#070914"/>
    <circle cx="514" cy="450" r="5" fill="#070914"/>
    <!-- Stars -->
    ${Array.from({length:30}, () => `<circle cx="${Math.random()*600}" cy="${Math.random()*300}" r="${0.5+Math.random()*0.8}" fill="#fff" opacity="${0.2+Math.random()*0.5}"/>`).join('')}
  `),

  // Convoy arc → telemetry tracking station with CRT bank
  convoyArc: nasaBase(`
    <rect x="60" y="240" width="480" height="240" fill="#0a0e1c" stroke="rgba(252,61,33,0.3)" stroke-width="0.5"/>
    ${Array.from({length:6}, (_, i) => {
      const x = 90 + i*78;
      return `<rect x="${x}" y="260" width="60" height="48" fill="#040611" stroke="rgba(252,61,33,0.55)" stroke-width="0.5"/>
              <polyline points="${x+4},${284} ${x+18},${272} ${x+30},${292} ${x+42},${276} ${x+56},${288}" fill="none" stroke="rgba(252,61,33,0.75)" stroke-width="0.6"/>`;
    }).join('')}
    <!-- Telemetry warning flash -->
    <rect x="270" y="320" width="60" height="20" fill="rgba(252,61,33,0.45)" stroke="#ff6644" stroke-width="0.6"/>
    <text x="300" y="334" text-anchor="middle" font-family="monospace" font-size="10" fill="#fff" letter-spacing="2">FAULT</text>
    <!-- Controller in foreground -->
    <rect x="280" y="440" width="40" height="80" rx="4" fill="#0a0e1c" stroke="rgba(252,61,33,0.4)" stroke-width="0.5"/>
    <circle cx="300" cy="430" r="14" fill="#0a0e1c" stroke="rgba(252,61,33,0.45)" stroke-width="0.5"/>
  `),

  // Private meet → two figures in office with launch pad horizon out window
  privateMeet: nasaBase(`
    <!-- Window -->
    <rect x="40" y="100" width="520" height="200" fill="#040611" stroke="rgba(252,61,33,0.4)" stroke-width="0.5"/>
    <line x1="40" y1="220" x2="560" y2="220" stroke="rgba(252,61,33,0.45)" stroke-width="0.4"/>
    <ellipse cx="300" cy="220" rx="200" ry="40" fill="url(#nasaRed)" filter="url(#nasaBlurHi)" opacity="0.6"/>
    <!-- Two seated figures -->
    <rect x="170" y="380" width="22" height="100" rx="5" fill="#0a0e1c" stroke="rgba(252,61,33,0.35)" stroke-width="0.5"/>
    <circle cx="181" cy="370" r="13" fill="#0a0e1c"/>
    <rect x="410" y="370" width="22" height="110" rx="5" fill="#0a0e1c" stroke="rgba(252,61,33,0.55)" stroke-width="0.6"/>
    <circle cx="421" cy="360" r="13" fill="#0a0e1c"/>
    <!-- Desk -->
    <ellipse cx="300" cy="510" rx="200" ry="22" fill="#0c1428" stroke="rgba(252,61,33,0.3)" stroke-width="0.5"/>
    <!-- Glow on right figure -->
    <ellipse cx="421" cy="370" rx="40" ry="60" fill="url(#nasaRed)" filter="url(#nasaBlurHi)" opacity="0.45"/>
  `),

  // Breaking point → action console with floating telemetry panels
  breakingPoint: nasaBase(`
    <rect x="298" y="60" width="4" height="500" fill="url(#nasaRed)" filter="url(#nasaBlurHi)"/>
    ${[150,250,350,450].map(x => `<line x1="${x}" y1="60" x2="${x}" y2="540" stroke="rgba(252,61,33,0.35)" stroke-width="0.4"/>`).join('')}
    ${Array.from({length:6}, (_, i) => {
      const x = 80 + (i%3)*170; const y = 200 + Math.floor(i/3)*120;
      return `<rect x="${x}" y="${y}" width="80" height="50" fill="rgba(252,61,33,0.07)" stroke="rgba(252,61,33,0.4)" stroke-width="0.5"/>
              <polyline points="${x+6},${y+34} ${x+22},${y+22} ${x+38},${y+38} ${x+54},${y+24} ${x+70},${y+36}" fill="none" stroke="rgba(252,61,33,0.6)" stroke-width="0.5"/>`;
    }).join('')}
    <rect x="288" y="400" width="24" height="120" rx="5" fill="#0a0e1c" stroke="rgba(252,61,33,0.55)" stroke-width="0.5"/>
    <circle cx="300" cy="388" r="14" fill="#0a0e1c" stroke="rgba(252,61,33,0.6)" stroke-width="0.5"/>
    <ellipse cx="300" cy="540" rx="80" ry="12" fill="rgba(252,61,33,0.2)" filter="url(#nasaBlur)"/>
  `),

  // Confrontation → two figures across darkened office with red horizon line behind
  confrontation: nasaBase(`
    <line x1="60" y1="280" x2="540" y2="280" stroke="rgba(252,61,33,0.45)" stroke-width="0.4"/>
    <ellipse cx="300" cy="280" rx="200" ry="14" fill="rgba(252,61,33,0.15)" filter="url(#nasaBlur)"/>
    <line x1="300" y1="60" x2="300" y2="540" stroke="rgba(252,61,33,0.25)" stroke-width="0.4"/>
    <circle cx="200" cy="280" r="80" fill="none" stroke="rgba(252,61,33,0.35)" stroke-width="0.4"/>
    <circle cx="400" cy="280" r="80" fill="none" stroke="rgba(252,61,33,0.55)" stroke-width="0.5"/>
    <rect x="190" y="340" width="20" height="160" rx="5" fill="#0a0e1c"/>
    <circle cx="200" cy="335" r="14" fill="#0a0e1c"/>
    <rect x="390" y="340" width="20" height="160" rx="5" fill="#0a0e1c"/>
    <circle cx="400" cy="335" r="14" fill="#0a0e1c"/>
    <ellipse cx="300" cy="380" rx="90" ry="12" fill="rgba(252,61,33,0.18)" filter="url(#nasaBlur)"/>
  `),

  // Katherine's office (twinSuns slot) — chalkboard, slide rule, lamp
  twinSuns: nasaBase(`
    <!-- Chalkboard with equations -->
    <rect x="80" y="80" width="440" height="220" fill="#0a0e1c" stroke="rgba(252,61,33,0.45)" stroke-width="0.5"/>
    ${Array.from({length:8}, (_, i) => `<line x1="${100+(i%4)*100}" y1="${110+Math.floor(i/4)*40}" x2="${175+(i%4)*100}" y2="${110+Math.floor(i/4)*40}" stroke="rgba(252,61,33,0.5)" stroke-width="0.6"/>`).join('')}
    <line x1="100" y1="180" x2="500" y2="180" stroke="rgba(252,61,33,0.35)" stroke-width="0.4" stroke-dasharray="3 5"/>
    <line x1="100" y1="220" x2="450" y2="220" stroke="rgba(252,61,33,0.45)" stroke-width="0.5"/>
    <line x1="100" y1="260" x2="380" y2="260" stroke="rgba(252,61,33,0.4)" stroke-width="0.45"/>
    <!-- Desk -->
    <rect x="40" y="400" width="520" height="60" fill="#0c1428" stroke="rgba(252,61,33,0.35)" stroke-width="0.5"/>
    <!-- Slide rule on desk -->
    <rect x="180" y="420" width="120" height="14" fill="#1a2236" stroke="rgba(252,61,33,0.5)" stroke-width="0.5"/>
    <rect x="200" y="424" width="80" height="6" fill="#0a0e1c"/>
    <!-- Lamp & warm glow -->
    <circle cx="420" cy="380" r="12" fill="#0a0e1c" stroke="rgba(252,61,33,0.55)" stroke-width="0.5"/>
    <ellipse cx="420" cy="400" rx="120" ry="60" fill="url(#nasaRed)" filter="url(#nasaBlurHi)" opacity="0.45"/>
    <!-- Figure -->
    <rect x="288" y="460" width="24" height="80" rx="4" fill="#0a0e1c" stroke="rgba(252,61,33,0.4)" stroke-width="0.5"/>
    <circle cx="300" cy="452" r="13" fill="#0a0e1c"/>
  `),

  // Chaotic council → computers room (women at desks with calculators)
  chaoticCouncil: nasaBase(`
    <!-- Long desk -->
    <rect x="40" y="380" width="520" height="20" fill="#0c1428" stroke="rgba(252,61,33,0.35)" stroke-width="0.4"/>
    <!-- Three figures + mechanical calculators -->
    ${[[120,'arguing'],[300,'shouting'],[480,'silent']].map(([x,_], i) => `
      <rect x="${x-15}" y="320" width="30" height="80" rx="5" fill="#0a0e1c" stroke="rgba(252,61,33,${i===2?0.3:0.5})" stroke-width="0.5"/>
      <circle cx="${x}" cy="310" r="14" fill="#0a0e1c" stroke="rgba(252,61,33,${i===2?0.3:0.5})" stroke-width="0.5"/>
      <rect x="${x-22}" y="408" width="44" height="20" fill="#040611" stroke="rgba(252,61,33,0.5)" stroke-width="0.4"/>
      ${i!==2 ? `<path d="M ${x-30} ${290} Q ${x} ${260} ${x+30} ${290}" fill="none" stroke="rgba(252,61,33,0.4)" stroke-width="0.5"/>
                  <path d="M ${x-40} ${280} Q ${x} ${244} ${x+40} ${280}" fill="none" stroke="rgba(252,61,33,0.25)" stroke-width="0.4"/>` : ''}
    `).join('')}
    <!-- Ceiling lights -->
    <ellipse cx="300" cy="100" rx="220" ry="46" fill="url(#nasaRed)" filter="url(#nasaBlurHi)" opacity="0.4"/>
  `),

  // Aftermath medbay → debrief room, long receding seats
  aftermathMedbay: nasaBase(`
    ${[80,140,200,260,320].map(y => `<rect x="${100+(y-80)*0.4}" y="${y}" width="${400-(y-80)*0.8}" height="14" fill="#0a0e1c" stroke="rgba(252,61,33,0.25)" stroke-width="0.4"/>`).join('')}
    <!-- Figure -->
    <rect x="288" y="410" width="24" height="120" rx="5" fill="#0a0e1c" stroke="rgba(252,61,33,0.55)" stroke-width="0.5"/>
    <ellipse cx="300" cy="402" rx="14" ry="16" fill="#0a0e1c"/>
    <line x1="288" y1="438" x2="280" y2="500" stroke="#0a0e1c" stroke-width="6" stroke-linecap="round"/>
    <line x1="312" y1="438" x2="320" y2="500" stroke="#0a0e1c" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="120" cy="300" rx="120" ry="180" fill="url(#nasaRed)" filter="url(#nasaBlurHi)" opacity="0.35"/>
    <ellipse cx="300" cy="540" rx="200" ry="14" fill="rgba(252,61,33,0.15)" filter="url(#nasaBlur)"/>
  `),

  // Shadow pattern → figure with two diverging shadows
  shadowPattern: nasaBase(`
    <ellipse cx="300" cy="540" rx="180" ry="26" fill="#040611" stroke="rgba(252,61,33,0.18)" stroke-width="0.4"/>
    <path d="M 300 540 L 80 460 L 60 540 Z" fill="#020308" opacity="0.85"/>
    <path d="M 300 540 L 520 460 L 540 540 Z" fill="#020308" opacity="0.85"/>
    <rect x="288" y="360" width="24" height="160" rx="5" fill="#0a0e1c" stroke="rgba(252,61,33,0.5)" stroke-width="0.55"/>
    <circle cx="300" cy="345" r="16" fill="#0a0e1c" stroke="rgba(252,61,33,0.55)" stroke-width="0.55"/>
    <ellipse cx="120" cy="320" rx="80" ry="160" fill="url(#nasaRed)" filter="url(#nasaBlurHi)" opacity="0.5"/>
    <ellipse cx="480" cy="320" rx="80" ry="160" fill="url(#nasaRed)" filter="url(#nasaBlurHi)" opacity="0.5"/>
    <circle cx="300" cy="345" r="50" fill="none" stroke="rgba(252,61,33,0.3)" stroke-width="0.4"/>
  `),

  // Allies whisper → three engineers in alcove
  alliesWhisper: nasaBase(`
    <rect x="60" y="80" width="140" height="460" fill="rgba(20,28,44,0.7)" stroke="rgba(252,61,33,0.18)" stroke-width="0.4"/>
    <rect x="400" y="80" width="140" height="460" fill="rgba(20,28,44,0.7)" stroke="rgba(252,61,33,0.18)" stroke-width="0.4"/>
    <ellipse cx="300" cy="540" rx="150" ry="20" fill="#070914"/>
    <rect x="240" y="320" width="32" height="220" rx="6" fill="#0c1428" stroke="rgba(252,61,33,0.32)" stroke-width="0.5"/>
    <circle cx="256" cy="310" r="14" fill="#0c1428"/>
    <rect x="284" y="310" width="32" height="230" rx="6" fill="#0c1428" stroke="rgba(252,61,33,0.4)" stroke-width="0.5"/>
    <circle cx="300" cy="300" r="14" fill="#0c1428"/>
    <rect x="328" y="320" width="32" height="220" rx="6" fill="#0c1428" stroke="rgba(252,61,33,0.32)" stroke-width="0.5"/>
    <circle cx="344" cy="310" r="14" fill="#0c1428"/>
    <circle cx="300" cy="160" r="6" fill="#ff6644"/>
    <circle cx="300" cy="160" r="40" fill="url(#nasaRed)" filter="url(#nasaBlurHi)" opacity="0.8"/>
    <line x1="256" y1="310" x2="300" y2="300" stroke="rgba(252,61,33,0.2)" stroke-width="0.4" stroke-dasharray="2 3"/>
    <line x1="344" y1="310" x2="300" y2="300" stroke="rgba(252,61,33,0.2)" stroke-width="0.4" stroke-dasharray="2 3"/>
  `),

  // Reckoning mirror → figure facing reflection in seam of red light
  reckoningMirror: nasaBase(`
    <ellipse cx="300" cy="540" rx="240" ry="22" fill="#070914" stroke="rgba(252,61,33,0.2)" stroke-width="0.4"/>
    <rect x="170" y="360" width="26" height="170" rx="5" fill="#0a0e1c" stroke="rgba(252,61,33,0.5)" stroke-width="0.5"/>
    <circle cx="183" cy="345" r="17" fill="#0a0e1c" stroke="rgba(252,61,33,0.5)" stroke-width="0.5"/>
    <rect x="404" y="360" width="26" height="170" rx="5" fill="#0a0e1c" stroke="rgba(252,61,33,0.3)" stroke-width="0.5" opacity="0.85"/>
    <circle cx="417" cy="345" r="17" fill="#0a0e1c" stroke="rgba(252,61,33,0.3)" stroke-width="0.5" opacity="0.85"/>
    <line x1="300" y1="40" x2="300" y2="560" stroke="url(#nasaRed)" stroke-width="2" filter="url(#nasaBlurHi)"/>
    <line x1="300" y1="60" x2="300" y2="540" stroke="rgba(252,61,33,0.7)" stroke-width="0.8"/>
    <circle cx="300" cy="345" r="50" fill="url(#nasaRed)" filter="url(#nasaBlurHi)" opacity="0.8"/>
  `),

  // Divided chamber → MOCR split by red beam, controllers on either side
  dividedChamber: nasaBase(`
    ${[100,160,220,280,340,400].map(y => `
      <line x1="40" y1="${y}" x2="${300-(y-220)*0.2}" y2="${y}" stroke="rgba(252,61,33,0.12)" stroke-width="0.4"/>
      <line x1="${300+(y-220)*0.2}" y1="${y}" x2="560" y2="${y}" stroke="rgba(252,61,33,0.12)" stroke-width="0.4"/>
    `).join('')}
    <line x1="300" y1="40" x2="300" y2="560" stroke="rgba(252,61,33,0.45)" stroke-width="0.8"/>
    <ellipse cx="300" cy="300" rx="14" ry="260" fill="url(#nasaRed)" filter="url(#nasaBlurHi)" opacity="0.6"/>
    ${[150,200,250].map((x,i) => `
      <rect x="${x-4}" y="${380+i*8}" width="8" height="${110+i*4}" rx="2" fill="#070914"/>
      <circle cx="${x}" cy="${376+i*8}" r="5" fill="#070914"/>`).join('')}
    ${[350,400,450].map((x,i) => `
      <rect x="${x-4}" y="${380+i*8}" width="8" height="${110+i*4}" rx="2" fill="#070914"/>
      <circle cx="${x}" cy="${376+i*8}" r="5" fill="#070914"/>`).join('')}
    <rect x="294" y="440" width="12" height="100" rx="3" fill="#0c1428"/>
    <circle cx="300" cy="430" r="8" fill="#0c1428"/>
  `)
};

// ========================================================================
// COMPILE THE SKIN
// ========================================================================
const skin = {
  id: 'apollo_11',
  name: 'Trajectory · Apollo 11',
  tagline: '1969. Mission Control. Three days to the Moon.',
  description: 'Set inside the Mission Operations Control Room before and during Apollo 11 — with Katherine Johnson as your quiet north star, and Flight Director Bryce Calhoun as the pressure system you have to navigate.',
  theme: {
    '--amber':           '#fc3d21',
    '--amber-bright':    '#ff6644',
    '--amber-deep':      '#c01a00',
    '--amber-glow':      'rgba(252, 61, 33, 0.35)',
    '--brand-orange':    '#fc3d21',
    '--brand-tangerine': '#ff6b00',
    '--brand-yellow':    '#feab2b',
    '--bg':              '#070914',
    '--bg-deep':         '#040611',
    '--panel':           '#0b1326',
    '--ink':             '#f4ecdb',
    '--ink-soft':        '#d6cdb9',
    '--ink-mute':        '#b3a994',
    '--ink-label':       '#e6dfd1',
    '--ink-dim':         '#6b6354',
    '--serif':           "'DM Serif Display', 'Cormorant Garamond', Georgia, serif",
    '--sans':            "'Inter', sans-serif",
    fontImport:          'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600&display=swap'
  },
  characters: {
    commander: 'Flight Director Bryce Calhoun',
    mentor: 'Katherine Johnson'
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
