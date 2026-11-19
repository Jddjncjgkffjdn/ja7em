export default async function handler(req, res) {
  // السماح بالطلبات من نفس الموقع
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-owner-token");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ ok: false, message: "Missing target URL" });
    }

    const token = req.headers["x-owner-token"] || "";
    const fetchOptions = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "x-owner-token": token
      }
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      fetchOptions.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const upstream = await fetch(targetUrl, fetchOptions);
    const data = await upstream.json().catch(() => ({ ok: false, message: "Invalid JSON from bot server" }));

    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({
      ok: false,
      message: "فشل اتصال Vercel بسيرفر البوت: " + (err?.message || "Connection refused")
    });
  }
}
