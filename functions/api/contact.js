// Cloudflare Pages Function — handles the quote form submission.
// Flow: browser -> /api/contact (same origin, no CORS)
//       -> ① forward to Formspree (form-urlencoded, proper format)  -> keeps backend record
//       -> ② send email via Resend (owner notification)              -> instant alert
export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    const fd = await request.formData();
    data = Object.fromEntries(fd.entries());
  } catch (e) {
    return Response.json({ ok: false, error: "bad request" }, { status: 400 });
  }

  // Build email body for owner notification
  const fields = [
    ["name", "Name"],
    ["email", "Email"],
    ["company", "Company"],
    ["quantity", "Quantity"],
    ["size", "Size"],
    ["message", "Message"],
  ];
  const text =
    fields.map(([k, label]) => `${label}: ${data[k] || "-"}`).join("\n") +
    `\n\nReceived from: ${request.headers.get("cf-connecting-ip") || "unknown"}` +
    `\nTime (UTC): ${new Date().toISOString()}`;
  const subject = `New quote request from ${data.name || "website visitor"}`;

  // ── 1) Forward to Formspree using form-urlencoded (their expected format) ──
  // Include honeypot field so Formspree doesn't flag as spam.
  let formspreeOk = false;
  try {
    const body = new URLSearchParams();
    for (const [key, val] of Object.entries(data)) {
      if (val) body.append(key, val);
    }
    body.append("_gotcha", ""); // honeypot: leave empty = real human

    const r = await fetch("https://formspree.io/f/xykrgawj", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    });
    formspreeOk = r.ok;
  } catch (e) {
    formspreeOk = false;
  }

  // ── 2) Email notification via Resend (free tier: 3000 emails/month) ──
  let emailOk = false;
  if (env.RESEND_API_KEY) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "EnamelCraft <onboarding@resend.dev>",
          to: ["ycr13120902436@gmail.com"],
          subject,
          text,
          replyTo: data.email || undefined,
        }),
      });
      emailOk = r.ok;
    } catch (e) {
      emailOk = false;
    }
  }

  // If Formspree succeeded, tell client it's all good.
  if (formspreeOk) {
    return Response.json({ ok: true, emailSent: emailOk });
  }

  // Even if Formspree failed, email might have worked.
  return Response.json(
    { ok: !!emailOk, emailSent: emailOk },
    { status: emailOk ? 200 : 502 },
  );
}
