// Cloudflare Pages Function — handles the quote form submission.
// Flow: parse form -> forward to Formspree (keeps backend record + future CRM webhook)
//       -> send email notification to owner via Resend (free tier).
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
    `\n\nReceived: ${new Date().toISOString()}`;
  const subject = `New quote request from ${data.name || "website visitor"}`;

  // 1) Forward to Formspree (server side, no CORS issue) — keeps backend + CRM webhook path.
  let formspreeOk = false;
  try {
    const r = await fetch("https://formspree.io/f/xykrgawj", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    formspreeOk = r.ok;
  } catch (e) {
    formspreeOk = false;
  }

  // 2) Email notification via Resend (free plan, 3000/mo). Set RESEND_API_KEY in Pages env.
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
          reply_to: data.email || undefined,
        }),
      });
      emailOk = r.ok;
    } catch (e) {
      emailOk = false;
    }
  }

  // Data captured is the priority. Email is best-effort.
  if (formspreeOk) {
    return Response.json({ ok: true, emailSent: emailOk });
  }
  return Response.json({ ok: false }, { status: 502 });
}
