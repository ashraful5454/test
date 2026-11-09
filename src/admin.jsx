import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import base from "./content.json";
import { T, applyTheme } from "./theme.js";
import "./admin.css";

const lines = v => v.split("\n").map(s => s.trim()).filter(Boolean);
const csv = v => v.split(",").map(s => s.trim()).filter(Boolean);
const blank = { stats: { n: "", t: "" }, services: { t: "", d: "" }, projects: { t: "", d: "", l: "", img: "" } };

async function api(password, body) {
  let r, j = {};
  try {
    r = await fetch("/api/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, ...body }) });
    j = await r.json();
  } catch { throw new Error("API পাওয়া যায়নি। Vercel এ deploy করা site থেকে খুলুন।"); }
  if (!r.ok) throw new Error(j.error || "Error");
  return j;
}

function Drop({ src, onFile }) {
  const [over, setOver] = useState(false), r = useRef();
  return (
    <div className={"drop" + (over ? " over" : "")} onClick={() => r.current.click()}
      onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files[0]); }}>
      {src && <img src={src} alt="" />}
      <span>ছবি drag and drop করুন, অথবা click করে বাছুন</span>
      <input ref={r} type="file" accept="image/*" hidden onChange={e => onFile(e.target.files[0])} />
    </div>
  );
}

function Admin() {
  const [D, setD] = useState(null), [pw, setPw] = useState(""), [err, setErr] = useState(""), [msg, setMsg] = useState(""), [bad, setBad] = useState(false);
  const [prev, setPrev] = useState({}), files = useRef({});
  const set = (k, v) => setD(d => ({ ...d, [k]: v }));
  const setItem = (k, i, f, v) => setD(d => ({ ...d, [k]: d[k].map((o, j) => (j === i ? { ...o, [f]: v } : o)) }));
  const say = (t, b) => { setMsg(t); setBad(!!b); };

  const login = async () => {
    setErr("");
    try { await api(pw, { action: "verify" }); setD({ ...base, rolesTxt: base.roles.join("\n"), skillsTxt: base.skills.join(", ") }); }
    catch (e) { setErr(e.message); }
  };

  const pick = f => new Promise(res => {
    const r = new FileReader();
    r.onload = () => { const i = new Image(); i.onload = () => {
      const s = Math.min(1, 900 / Math.max(i.width, i.height)), c = document.createElement("canvas");
      c.width = i.width * s; c.height = i.height * s; c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
      const u = c.toDataURL("image/jpeg", 0.82), p = "img/" + Date.now() + Math.random().toString(36).slice(2, 6) + ".jpg";
      files.current[p] = u.split(",")[1]; setPrev(x => ({ ...x, [p]: u })); res(p);
    }; i.src = r.result; };
    r.readAsDataURL(f);
  });
  const onImg = async (f, apply) => { if (!f || !/^image/.test(f.type)) return; apply(await pick(f)); say("ছবি প্রস্তুত, Save করুন"); };
  const show = p => (p ? prev[p] || "/" + p : "");

  const save = async () => {
    const c = { ...D, roles: lines(D.rolesTxt), skills: csv(D.skillsTxt) };
    delete c.rolesTxt; delete c.skillsTxt;
    const s = JSON.stringify(c), fs = Object.entries(files.current).filter(([p]) => s.includes(p)).map(([path, data]) => ({ path, data }));
    say("Save হচ্ছে...");
    try { await api(pw, { content: c, files: fs }); files.current = {}; say("Save হয়েছে। ১–২ মিনিটের মধ্যে site এ live হবে।"); }
    catch (e) { say(e.message, true); }
  };

  if (!D) return (
    <div id="login"><div className="box">
      <h1>Admin Login</h1><p>Content বদলাতে password দিন।</p>
      <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} autoComplete="current-password" />
      <button className="pri" onClick={login}>Login</button>
      <p className="err">{err}</p>
    </div></div>
  );

  const In = ({ l, k, rows }) => (
    <label>{l}{rows ? <textarea rows={rows} value={D[k]} onChange={e => set(k, e.target.value)} /> : <input value={D[k]} onChange={e => set(k, e.target.value)} />}</label>
  );
  const List = ({ k, fs, img }) => (
    <div className="list">
      {D[k].map((o, i) => (
        <div className="item" key={i}>
          {fs.map(([f, l, ta]) => <label key={f}>{l}{ta ? <textarea rows={2} value={o[f]} onChange={e => setItem(k, i, f, e.target.value)} /> : <input value={o[f]} onChange={e => setItem(k, i, f, e.target.value)} />}</label>)}
          {img && <Drop src={show(o.img)} onFile={f => onImg(f, p => setItem(k, i, "img", p))} />}
          <button className="x" onClick={() => set(k, D[k].filter((_, j) => j !== i))}>মুছে ফেলুন</button>
        </div>
      ))}
      <button className="add" onClick={() => set(k, [...D[k], { ...blank[k] }])}>+ নতুন যোগ করুন</button>
    </div>
  );

  return (
    <>
      <div className="bar"><b>Content Editor</b><a href="/" target="_blank">Site দেখুন</a><span style={{ color: bad ? "#ff5d73" : "#ffb02e" }}>{msg}</span><button className="pri" onClick={save}>Save করুন</button></div>
      <div id="body">
        <section><h2>Color theme</h2><div className="sws">{T.map((t, i) => <button key={i} className={"sw" + (D.theme === i ? " on" : "")} title={t.n} style={{ background: `linear-gradient(110deg,${t.a},${t.b},${t.c})` }} onClick={() => { set("theme", i); applyTheme(i); }} />)}</div></section>
        <section><h2>Hero photo</h2><Drop src={show(D.photo)} onFile={f => onImg(f, p => set("photo", p))} /></section>
        <section><h2>মূল তথ্য</h2>
          <In l="নাম" k="name" /><In l="Typing animation এর লাইন (প্রতি লাইনে একটা)" k="rolesTxt" rows={4} /><In l="Bio" k="bio" rows={4} />
          <In l="Phone / WhatsApp" k="phone" /><In l="Email" k="email" /><In l="Facebook link" k="facebook" /><In l="LinkedIn link" k="linkedin" /><In l="GitHub link" k="github" />
        </section>
        <section><h2>Stats</h2><List k="stats" fs={[["n", "সংখ্যা (যেমন 3+)"], ["t", "লেখা"]]} /></section>
        <section><h2>Services</h2><List k="services" fs={[["t", "Title"], ["d", "বিবরণ", 1]]} /></section>
        <section><h2>Projects</h2><List k="projects" img fs={[["t", "Title"], ["d", "বিবরণ", 1], ["l", "Link (ফাঁকা রাখলে link হবে না)"]]} /></section>
        <section><h2>Skills</h2><In l="Comma দিয়ে লিখুন" k="skillsTxt" rows={3} /></section>
      </div>
    </>
  );
}
createRoot(document.getElementById("root")).render(<Admin />);
