// HTML email templates for user + admin notifications. Inline-styled so
// they render the same across Gmail, Outlook, Apple Mail. Keeps the
// Mandarin brand palette: black header, cream body, orange CTA.

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[c]));
}

const BRAND_MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 235 230" width="22" height="22" style="vertical-align:middle"><polygon fill="#ff481d" points="139.43 0 92.31 35.2 85.37 100.69 67.33 84.92 34.93 109.09 27.89 154.91 27.88 154.9 16.66 141.62 0 154.03 19.87 210 61.46 193.17 67.63 155.12 96.45 202.36 131.35 188.28 133.23 119.37 170.1 195.5 232.37 170.25 139.43 0"/></svg>`;

function shellHTML(innerHTML) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f0e8;font-family:'Inter',-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;color:#0a0a0a;line-height:1.5">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f0e8">
    <tr><td align="center" style="padding:32px 16px 16px">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #d8d2c5">
        <tr><td style="background:#000;padding:18px 28px;color:#fff" align="left">
          ${BRAND_MARK} <span style="font-weight:500;font-size:18px;color:#fff;margin-left:8px;vertical-align:middle">mandarin</span>
          <span style="float:right;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#ff481d;line-height:22px;font-weight:600">Strategic Capability Assessment</span>
        </td></tr>
        <tr><td style="padding:32px 36px 28px">${innerHTML}</td></tr>
        <tr><td style="background:#0a0a0a;padding:20px 28px;color:#d6cdb9;font-size:11px;line-height:1.6">
          An assessment by <a href="https://www.teammandarin.com/" style="color:#d6cdb9;text-decoration:underline">Team Mandarin</a>.<br>
          Built on the <a href="https://www.teammandarin.com/be-more-strategic-book" style="color:#d6cdb9;text-decoration:underline">Be More Strategic</a> framework by Charlie Curson.<br>
          &copy; Mandarin Business Associates Limited 2026
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function summaryBlock(session) {
  const overall = session.overall != null ? session.overall : 0;
  const arch = session.archetype_name || session.archetype || "";
  const secondary = session.secondary_name || "";
  return `
    <div style="background:#0a0a0a;color:#f4f0e8;padding:22px 26px;margin:18px 0 22px">
      <div style="font-size:10px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#ff8a4a;margin-bottom:6px">Your archetype</div>
      <div style="font-size:24px;font-weight:800;text-transform:uppercase;letter-spacing:-0.01em">${esc(arch)}</div>
      ${secondary ? `<div style="font-size:13px;font-weight:500;color:#ff8a4a;margin-top:4px">+ ${esc(secondary)}</div>` : ""}
      <div style="font-size:10px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#ff8a4a;margin:18px 0 4px">Overall capability</div>
      <div style="font-size:40px;font-weight:900;line-height:1">${overall}<span style="font-size:18px;color:#ff8a4a">%</span></div>
    </div>`;
}

function levelGrid(session) {
  const levels = session.levels || {};
  const labels = { L1: "Self-Awareness", L2: "Open-Mindedness", L3: "Strategic Capabilities", L4: "Impact" };
  const cells = ["L1", "L2", "L3", "L4"].map(L => {
    const v = levels[L] != null ? levels[L] : 0;
    return `<td style="padding:10px 14px;border:1px solid #d8d2c5;background:#fff;width:25%">
      <div style="font-size:9px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;color:#ff481d;margin-bottom:6px">${L}</div>
      <div style="font-size:11px;font-weight:500;color:#1c1c1c;margin-bottom:6px">${esc(labels[L])}</div>
      <div style="font-size:22px;font-weight:800;color:#0a0a0a">${v}<span style="font-size:11px;color:#807868">%</span></div>
    </td>`;
  }).join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 22px;border-collapse:separate;border-spacing:0"><tr>${cells}</tr></table>`;
}

function ctaButton(label, url) {
  return `<a href="${esc(url)}" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:14px 28px;font-size:11px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none">${esc(label)}</a>`;
}

export function buildUserEmailHTML(session, magicLinkUrl) {
  const firstName = session.firstName || "there";
  return shellHTML(`
    <div style="font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#ff481d;margin-bottom:14px">Your result is ready</div>
    <h1 style="font-size:32px;font-weight:900;line-height:1.05;letter-spacing:-0.015em;text-transform:uppercase;color:#0a0a0a;margin:0 0 14px">Thank you, ${esc(firstName)}.</h1>
    <p style="font-size:15px;line-height:1.6;color:#1c1c1c;margin:0 0 4px">Below is a quick snapshot of your Strategic Capability Assessment. The full report, with every practice score and a breakdown of risks under pressure, is attached to this email as a PDF and is also available at the link below.</p>
    ${summaryBlock(session)}
    ${levelGrid(session)}
    <div style="margin:18px 0 8px">${ctaButton("View my full results", magicLinkUrl)}</div>
    <p style="font-size:12px;line-height:1.5;color:#555048;margin:16px 0 0">
      This link is unique to you and valid for 30 days. You can come back at any time to revisit your result, see your history if you take the assessment again, or download a fresh PDF.
    </p>
  `);
}

function breakdownBlock(session) {
  const items = Array.isArray(session.answer_breakdown) ? session.answer_breakdown : [];
  if (!items.length) return "";
  const rows = items.map((rec) => {
    let answerHTML = "";
    if (rec.kind === "ranking" && Array.isArray(rec.selected_ranking_text) && rec.selected_ranking_text.length) {
      answerHTML = `<ol style="margin:0;padding-left:18px;color:#0a0a0a">${rec.selected_ranking_text.map(t => `<li style="font-size:13px;line-height:1.45;margin:2px 0">${esc(t)}</li>`).join("")}</ol>`;
    } else if (rec.selected_text) {
      answerHTML = `<div style="font-size:13px;line-height:1.5;color:#0a0a0a">${esc(rec.selected_text)}</div>`;
    } else {
      answerHTML = `<div style="font-size:12px;color:#807868;font-style:italic">(no answer recorded)</div>`;
    }
    return `<tr>
      <td style="padding:14px 16px;border-bottom:1px solid #ece5d7;background:#ffffff;vertical-align:top;width:100%">
        <div style="font-size:9px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;color:#ff481d;margin-bottom:4px">${esc(rec.location || "")}${rec.practice ? ` &middot; ${esc(rec.practice)}` : ""}</div>
        <div style="font-size:13px;font-weight:600;color:#0a0a0a;margin-bottom:6px">${esc(rec.prompt || "")}</div>
        <div style="font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#807868;margin-bottom:4px">Answer</div>
        ${answerHTML}
      </td>
    </tr>`;
  }).join("");
  return `
    <div style="margin:24px 0 8px">
      <div style="font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#ff481d;margin-bottom:10px">Question by question</div>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #d8d2c5;border-collapse:separate">
        ${rows}
      </table>
    </div>`;
}

function reflectionsBlock(session) {
  const refs = session.reflections || {};
  const entries = Object.entries(refs).filter(([k, v]) => typeof v === "string" && v.trim());
  if (!entries.length) return "";
  const items = entries.map(([key, val]) => `
    <div style="padding:14px 16px;border-bottom:1px solid #ece5d7;background:#ffffff">
      <div style="font-size:9px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;color:#ff481d;margin-bottom:6px">${esc(key)}</div>
      <div style="font-size:13px;line-height:1.5;color:#0a0a0a;white-space:pre-wrap">${esc(val)}</div>
    </div>
  `).join("");
  return `
    <div style="margin:18px 0 8px">
      <div style="font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#ff481d;margin-bottom:10px">Free-text reflections</div>
      <div style="border:1px solid #d8d2c5">${items}</div>
    </div>`;
}

export function buildAdminEmailHTML(session, magicLinkUrl) {
  const fullName = [session.firstName || "", session.lastName || ""].filter(Boolean).join(" ");
  const submittedAt = new Date(session.completed_at || Date.now()).toLocaleString("en-GB");
  return shellHTML(`
    <div style="font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#ff481d;margin-bottom:14px">New assessment completed</div>
    <h1 style="font-size:26px;font-weight:900;line-height:1.05;letter-spacing:-0.01em;text-transform:uppercase;color:#0a0a0a;margin:0 0 14px">${esc(fullName)}</h1>
    <p style="font-size:14px;color:#555048;margin:0 0 16px">
      ${esc(session.email || "")}${session.skin_name ? ` &middot; ${esc(session.skin_name)}` : ""} &middot; ${esc(submittedAt)}
    </p>
    ${summaryBlock(session)}
    ${levelGrid(session)}
    <p style="font-size:12px;color:#555048;margin:12px 0">PDF report attached. Full record available in the admin Results tab.</p>
    <div style="margin:12px 0 8px">${ctaButton("Open user view", magicLinkUrl)}</div>
    ${breakdownBlock(session)}
    ${reflectionsBlock(session)}
  `);
}

export function buildInviteEmailHTML(email, inviteUrl, inviteCode) {
  const codeBlock = inviteCode ? `
    <div style="background:#0a0a0a;color:#f4f0e8;padding:18px 20px;margin:22px 0 6px;text-align:center">
      <div style="font-size:10px;font-weight:600;letter-spacing:0.32em;text-transform:uppercase;color:#ff8a4a;margin-bottom:8px">Or use this code</div>
      <div style="font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:26px;font-weight:800;letter-spacing:0.18em;color:#ffffff">${esc(inviteCode)}</div>
      <div style="font-size:11px;color:#d6cdb9;margin-top:8px;line-height:1.5">If the button or the link above don't work, enter this 12-character code on <a href="https://assessment.teammandarin.com/invite-required.html" style="color:#ff8a4a;text-decoration:underline">assessment.teammandarin.com</a>.</div>
    </div>` : "";
  return shellHTML(`
    <div style="font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#ff481d;margin-bottom:14px">You're invited</div>
    <h1 style="font-size:30px;font-weight:900;line-height:1.05;letter-spacing:-0.015em;text-transform:uppercase;color:#0a0a0a;margin:0 0 14px">Take the Strategic Capability Assessment</h1>
    <p style="font-size:15px;line-height:1.6;color:#1c1c1c;margin:0 0 14px">You've been invited to take Mandarin's Strategic Capability Assessment, a short, story-driven diagnostic that surfaces how you think, decide, and lead under pressure.</p>
    <p style="font-size:15px;line-height:1.6;color:#1c1c1c;margin:0 0 22px">It takes around 30 minutes. Your result includes your strategic archetype, your scores across the 12 essential practices, and the patterns most likely to drift under pressure.</p>
    <div style="margin:8px 0 22px">${ctaButton("Begin the assessment", inviteUrl)}</div>
    <p style="font-size:12px;line-height:1.5;color:#555048;margin:12px 0 0">If the button doesn't work, paste this link into your browser:<br><span style="font-family:monospace;font-size:11px;color:#1c1c1c;word-break:break-all">${esc(inviteUrl)}</span></p>
    ${codeBlock}
    <p style="font-size:12px;line-height:1.5;color:#807868;margin:16px 0 0">This invitation is for <strong style="color:#1c1c1c">${esc(email)}</strong> and is valid for 90 days. If you didn't expect this, you can ignore it.</p>
  `);
}

export function buildResumeEmailHTML(firstName, resumeUrl) {
  return shellHTML(`
    <div style="font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#ff481d;margin-bottom:14px">Pick up where you left off</div>
    <h1 style="font-size:28px;font-weight:900;line-height:1.05;letter-spacing:-0.015em;text-transform:uppercase;color:#0a0a0a;margin:0 0 14px">Welcome back, ${esc(firstName)}.</h1>
    <p style="font-size:15px;line-height:1.6;color:#1c1c1c;margin:0 0 22px">You paused your Strategic Capability Assessment partway through. When you're ready, click below to resume from exactly the question you left on.</p>
    <div style="margin:8px 0 22px">${ctaButton("Continue the assessment", resumeUrl)}</div>
    <p style="font-size:12px;line-height:1.5;color:#807868;margin:14px 0 0">This resume link is valid for 30 days. Your saved progress is private to this email address and isn't visible to anyone else.</p>
  `);
}

export function buildEmailTextSummary(session) {
  // Plaintext fallback for clients that block HTML.
  const overall = session.overall != null ? session.overall : 0;
  const arch = session.archetype_name || session.archetype || "";
  return [
    "Your Strategic Capability Assessment result",
    "",
    "Archetype: " + arch,
    "Overall capability: " + overall + "%",
    "",
    "Full PDF report attached.",
    "",
    "Open your results: (see link in the HTML version of this email)",
    "",
    "An assessment by Team Mandarin. teammandarin.com"
  ].join("\n");
}
