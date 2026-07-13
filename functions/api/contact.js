// Cloudflare Pages Function — handles the quote form submission.
// Browser -> /api/contact (same origin, no CORS)
//   ├─ forward to Formspree (real IP passed via X-Forwarded-For) -> email notification
//   └─ push to SeekTrace CRM (server-side secret in env) -> lead in 线索管理
export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    let data;
    try {
      const fd = await request.formData();
      data = Object.fromEntries(fd.entries());
    } catch (e) {
      return Response.json({ ok: false, error: "bad request" }, { status: 400 });
    }

    const ip = request.headers.get("cf-connecting-ip") || "";
    const referer =
      request.headers.get("referer") || "https://seektrace.ccwu.cc/contact.html";

    // Parse UTM params from the referring page URL for campaign tracking.
    let sourceCampaign = "";
    try {
      const u = new URL(referer);
      sourceCampaign =
        u.searchParams.get("utm_campaign") ||
        u.searchParams.get("utm_source") ||
        "";
    } catch (e) {}

    // ── 1) Forward to Formspree (email notification, kept per CRM doc) ──
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

    // ── 2) Push to SeekTrace CRM (server-side, secret in env) ──
    // CRM fields: company(required), contact, email, phone, wechat, country,
    //   source, sourceType, sourceChannel, sourceUrl, externalId, remark, intent, stage
    let crmOk = false;
    let crmDuplicate = null;
    let crmErr = null;
    if (!env.LEAD_SECRET) {
      crmErr = "LEAD_SECRET not configured";
    } else {
      const company =
        (data.company && data.company.trim()) ||
        (data.name && data.name.trim()) ||
        "未知公司";
      // Stable dedup key: prefer email, else a random UUID (no persistence needed).
      const externalId = (data.email && data.email.trim()) || crypto.randomUUID();

      const remarkParts = [];
      if (data.message) remarkParts.push(data.message);
      if (data.quantity) remarkParts.push("Quantity: " + data.quantity);
      if (data.size) remarkParts.push("Size: " + data.size);

      const payload = {
        company,
        contact: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        whatsapp: data.whatsapp || "",
        country: data.country || "",
        source: "官网表单",
        sourceType: "inbound",
        sourceChannel: "website",
        sourceCampaign,
        sourceUrl: referer,
        externalId,
        intent: "中",
        stage: "新线索",
        remark: remarkParts.join("\n"),
      };

      try {
        const r = await fetch("https://baojia.kuajing.space/api/leads/ingest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "X-Lead-Secret": env.LEAD_SECRET,
          },
          body: JSON.stringify(payload),
        });
        crmOk = r.ok;
        if (r.ok) {
          try {
            const j = await r.json();
            crmDuplicate = !!(j && j.duplicate);
          } catch (e) {}
        } else {
          crmErr = "HTTP " + r.status;
        }
      } catch (e) {
        crmErr = e.message;
      }
    }

    if (formspreeOk) {
      return Response.json({ ok: true, formspreeOk: true, crmOk, crmDuplicate });
    }
    return Response.json(
      { ok: false, formspreeOk: false, crmOk, crmDuplicate, error: "formspree forward failed" },
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
