// POST /api/admin/request-magic-link
// Body: { email: string }
//
// If `email` is in ADMIN_ALLOWLIST, mint a sub='admin' token and email a
// login link to that address. Otherwise return the same generic 200 response
// (without sending) — this prevents the endpoint being used to probe who is
// an admin.
//
// Magic link target:
//   https://<site>/assessment.html?admin=1&token=<jwt>
// The assessment.html bootstrap reads the token, stores it in localStorage
// (mandarin.assessment.cloudToken), and opens the admin panel automatically.

import {
  mintAdminMagicToken,
  isAdminEmail,
  normaliseEmail,
  requireMagicLinkSecret,
  jsonResponse,
  ADMIN_ALLOWLIST
} from "../lib/auth.mjs";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const linkButton = (label, url) =>
  `<a href="${url}" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:14px 28px;font-size:11px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none">${label}</a>`;

function adminLoginEmailHTML(email, magicUrl) {
  const safeUrl = String(magicUrl).replace(/"/g, "&quot;");
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f0e8;font-family:'Inter',-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;color:#0a0a0a;line-height:1.5">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f0e8">
    <tr><td align="center" style="padding:32px 16px 16px">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #d8d2c5">
        <tr><td style="background:#000;padding:18px 28px;color:#fff" align="left">
          <span style="font-weight:500;font-size:18px;color:#fff;vertical-align:middle">mandarin</span>
          <span style="float:right;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#ff481d;line-height:22px;font-weight:600">Admin sign in</span>
        </td></tr>
        <tr><td style="padding:32px 36px 28px">
          <div style="font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#ff481d;margin-bottom:14px">Strategic Capability Assessment</div>
          <h1 style="font-size:26px;font-weight:900;line-height:1.05;letter-spacing:-0.01em;text-transform:uppercase;color:#0a0a0a;margin:0 0 14px">Sign in to the admin area</h1>
          <p style="font-size:15px;line-height:1.6;color:#1c1c1c;margin:0 0 22px">A sign-in link was requested for <strong>${email}</strong>. Click the button below to open the admin area. This link is valid for 30 days and only works for this email address.</p>
          <div style="margin:8px 0 22px">${linkButton("Open admin area", safeUrl)}</div>
          <p style="font-size:12px;line-height:1.5;color:#555048;margin:12px 0 0">If you didn't request this, ignore the email. Whoever asked for the link cannot read it without access to this inbox.</p>
        </td></tr>
        <tr><td style="background:#0a0a0a;padding:20px 28px;color:#d6cdb9;font-size:11px;line-height:1.6">
          An assessment by <a href="https://www.teammandarin.com/" style="color:#d6cdb9;text-decoration:underline">Team Mandarin</a>.<br>
          &copy; Mandarin Business Associates Limited 2026
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendResend(apiKey, payload) {
  try {
    const resp = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { "authorization": "Bearer " + apiKey, "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    return { ok: resp.ok, status: resp.status };
  } catch (e) {
    console.error("Resend send failed:", e);
    return { ok: false, status: 0, error: e.message };
  }
}

export default async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
  const email = normaliseEmail(body && body.email);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: "A valid email is required" }, 400);
  }

  // Generic OK whether or not the email is allowlisted, to prevent probing.
  const genericOk = jsonResponse({ ok: true, message: "If this email is on the admin list, a sign-in link has been sent." }, 200);
  if (!isAdminEmail(email)) {
    console.log(`admin-magic-link: ${email} not in allowlist (size=${ADMIN_ALLOWLIST.length})`);
    return genericOk;
  }

  const secret = requireMagicLinkSecret();
  const token = mintAdminMagicToken(email, secret, 30);
  const siteUrl = (Netlify.env.get("SITE_URL") || "https://strategic-force-assessment.netlify.app").replace(/\/+$/, "");
  const magicUrl = `${siteUrl}/assessment.html?admin=1&token=${encodeURIComponent(token)}`;

  const resendKey = Netlify.env.get("RESEND_API_KEY");
  const from = Netlify.env.get("EMAIL_FROM");
  if (!resendKey || !from) {
    console.error("admin-magic-link: server missing RESEND_API_KEY or EMAIL_FROM");
    return jsonResponse({ error: "Email sending not configured" }, 500);
  }

  const result = await sendResend(resendKey, {
    from,
    to: [email],
    subject: "Admin sign-in link · Mandarin Strategic Capability Assessment",
    html: adminLoginEmailHTML(email, magicUrl),
    text: `Sign in to the Mandarin admin area:\n\n${magicUrl}\n\nValid for 30 days. If you did not request this, ignore the email.`
  });
  if (!result.ok) {
    console.error(`admin-magic-link: Resend returned ${result.status}`);
    return jsonResponse({ error: "Failed to send sign-in email" }, 502);
  }

  return genericOk;
};

export const config = { path: "/api/admin/request-magic-link" };
