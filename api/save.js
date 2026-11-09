// Vercel serverless function: admin থেকে GitHub এ content commit করে।
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { password, action, content, files = [] } = req.body || {};
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD)
    { await new Promise(r => setTimeout(r, 1200)); return res.status(401).json({ error: "Password ভুল" }); }
  if (action === "verify") return res.json({ ok: true });

  const repo = process.env.GITHUB_REPO, token = process.env.GITHUB_TOKEN, branch = process.env.GITHUB_BRANCH || "main";
  if (!repo || !token) return res.status(500).json({ error: "GITHUB_REPO বা GITHUB_TOKEN সেট করা নেই" });
  const gh = (p, o = {}) => fetch(`https://api.github.com/repos/${repo}/contents/${p}`, {
    ...o, headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "portfolio-admin", "Content-Type": "application/json" } });
  async function put(path, b64) {
    const g = await gh(`${path}?ref=${branch}`);
    const sha = g.ok ? (await g.json()).sha : undefined;
    const r = await gh(path, { method: "PUT", body: JSON.stringify({ message: `Admin update: ${path}`, content: b64, branch, sha }) });
    if (!r.ok) throw new Error("GitHub: " + (await r.text()).slice(0, 200));
  }
  try {
    for (const f of files) if (/^img\/[\w.-]+\.jpg$/.test(f.path)) await put("public/" + f.path, f.data);
    await put("src/content.json", Buffer.from(JSON.stringify(content, null, 2)).toString("base64"));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
