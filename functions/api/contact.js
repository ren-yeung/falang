// Cloudflare Pages Function — handles the quote form submission.
// Browser -> /api/contact (same origin, no CORS)
//   -> forward to Formspree (real IP passed via X-Forwarded-For)
// Formspree then stores the submission AND sends the email notification,
// so the site owner gets exactly ONE email per submission.
export async function onRequestPost(context) {
  try {
    const { request } = context;

    let data;
    try {
      const fd = await request.formData();
      data = Object.fromEntries(fd.entries());
    } catch (e) {
      return Response.json({ ok: false, error: "bad request" }, { status: 400 });
    }

    const ip = request.headers.get("cf-connecting-ip") || "";

    // Forward to Formspree (form-urlencoded + honeypot + real visitor IP).
    // Formspree is responsible for the email notification (no Resend duplicate).
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
    } catch (e) {
      console.error("Formspree forward failed:", e.message);
    }

    if (formspreeOk) {
      return Response.json({ ok: true, formspreeOk: true });
    }
    return Response.json(
      { ok: false, formspreeOk: false, error: "formspree forward failed" },
      { status: 502 },
    );
  } catch (err) {
    // Surface any unexpected crash instead of Cloudflare's generic 502 page.
    return new Response(
      JSON.stringify({ ok: false, fatal: String(err), stack: err && err.stack }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
