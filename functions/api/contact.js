// Cloudflare Pages Function — handles the quote form submission.
// Browser -> /api/contact (same origin, no CORS)
//   -> ① forward to Formspree (best-effort, real IP passed via X-Forwarded-For)
//   -> ② send email via Resend (PRIMARY owner notification)
export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    const fd = await request.formData();
    data = Object.fromEntries(fd.entries());
  } catch (e) {
    return Response.json({ ok: false, error: "bad request" }, { status: 400 });
  }

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
    `\n\nVisitor IP: ${request.headers.get("cf-connecting-ip") || "unknown"}` +
    `\nTime (UTC): ${new Date().toISOString()}`;
  const subject = `New quote request from ${data.name || "website visitor"}`;

  const ip = request.headers.get("cf-connecting-ip") || "";

  // ── 1) Forward to Formspree (form-urlencoded + honeypot + real IP) ──
  let formspreeOk = false;
  try {
    const body = new URLSearchParams();
    for (const [k, v] of Object.entries(data)) if (v) body.append(k, v);
    body.append("_gotcha", "");
    const r = await fetch("https://formspree.io/f/xykrgawj", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "X-Forwarded-For": ip,
      },
      body: body.toString(),
    });
    formspreeOk = r.ok;
  } catch (e) {}

  // ── 2) Email via Resend (the thing you actually need) ──
  let emailOk = false;
  let emailErr = null;
  if (!env.RESEND_API_KEY) {
    emailErr = "RESEND_API_KEY not configured";
  } else {
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
      if (!r.ok) {
        emailErr = await r.text();
        console.error("Resend error:", r.status, emailErr);
      }
    } catch (e) {
      emailErr = e.message;
      console.error("Resend fetch failed:", e.message);
    }
  }

  // Primary success = email delivered. If Resend fails, surface the reason (debug).
  if (emailOk) {
    return Response.json({ ok: true, emailSent: true, formspreeOk });
  }
  return Response.json(
    { ok: false, emailSent: false, formspreeOk, error: emailErr },
    { status: 502 },
  );
}
