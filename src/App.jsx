import { useEffect, useRef, useState } from "react";
import D from "./content.json";

const I = {
  ph: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />,
  wa: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.2-1.8-.9-.7.6a3.4 3.4 0 0 1-1.6-1.6l.6-.7-.9-1.8z" /></>,
  ml: <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m22 7-10 6.5L2 7" /></>
};
const src = p => (p ? "/" + p : "");
const avatar = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#1c1440"/><text x="100" y="128" font-size="84" text-anchor="middle" fill="#ffb02e" font-family="sans-serif" font-weight="800">${D.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</text></svg>`);
const phone = D.phone.replace(/\D/g, "");
const wa = "https://wa.me/" + (phone.startsWith("0") ? "88" + phone : phone) + "?text=" + encodeURIComponent("Hello " + D.name);

function Typing({ words }) {
  const [t, setT] = useState("");
  useEffect(() => {
    let r = 0, c = 0, del = false, id;
    const step = () => {
      const w = words[r % words.length] || "";
      c += del ? -1 : 1; setT(w.slice(0, c));
      let d = del ? 35 : 85;
      if (!del && c >= w.length) { del = true; d = 1400; }
      else if (del && c <= 0) { del = false; r++; d = 300; }
      id = setTimeout(step, d);
    };
    step();
    return () => clearTimeout(id);
  }, [words]);
  return <span>{t}</span>;
}

function Num({ n }) {
  const ref = useRef(), [v, setV] = useState(n);
  useEffect(() => {
    const m = /^(\d+)(.*)$/.exec(n);
    if (!m) return;
    setV("0" + m[2]);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const to = +m[1]; let s = null;
      const f = t => { s ??= t; const p = Math.min((t - s) / 1500, 1); setV(Math.round(to * (1 - (1 - p) ** 3)) + m[2]); if (p < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [n]);
  return <span className="num" ref={ref}>{v}</span>;
}

const Card = ({ i, l, v, h, ext }) => (
  <a className="cc rv" href={h} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
    <span className="ic"><svg viewBox="0 0 24 24">{I[i]}</svg></span>
    <span><small>{l}</small><b>{v}</b></span>
  </a>
);
const Row = ({ a, rev }) => {
  const x = [...a, ...a, ...a, ...a];
  return <div className={"mq" + (rev ? " rev" : "")}><div>{x.map((s, i) => <span key={i}>{s}</span>)}</div></div>;
};

export default function App() {
  useEffect(() => {
    document.title = D.name + " – WordPress Developer";
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } }), { threshold: 0.15 });
    document.querySelectorAll(".rv").forEach(e => io.observe(e));
    const links = [...document.querySelectorAll("header nav a")], secs = links.map(a => document.querySelector(a.getAttribute("href")));
    const hd = document.querySelector("header"), pb = document.getElementById("pb");
    const onScroll = () => {
      const h = document.documentElement;
      pb.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100 + "%";
      hd.classList.toggle("sc", scrollY > 40);
      let cur = -1; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.45) cur = i; });
      links.forEach((a, i) => a.classList.toggle("act", i === cur));
    };
    addEventListener("scroll", onScroll, { passive: true });
    const off = [() => removeEventListener("scroll", onScroll), () => io.disconnect()];
    if (matchMedia("(pointer:fine)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
      const cu = document.getElementById("cur"); cu.style.display = "block";
      let x = 0, y = 0, tx = 0, ty = 0, raf;
      const mm = e => { tx = e.clientX; ty = e.clientY; };
      const loop = () => { x += (tx - x) * 0.18; y += (ty - y) * 0.18; cu.style.transform = `translate(${x - 18}px,${y - 18}px)`; raf = requestAnimationFrame(loop); };
      const ov = e => cu.classList.toggle("big", !!e.target.closest("a,button"));
      addEventListener("mousemove", mm); document.addEventListener("mouseover", ov); loop();
      off.push(() => { removeEventListener("mousemove", mm); document.removeEventListener("mouseover", ov); cancelAnimationFrame(raf); });
      document.querySelectorAll(".btn").forEach(b => {
        b.onmousemove = e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`; };
        b.onmouseleave = () => (b.style.transform = "");
      });
      const hr = document.querySelector(".hr"), bl = document.querySelector(".blob");
      hr.onmousemove = e => { const r = hr.getBoundingClientRect(); bl.style.transform = `rotateY(${((e.clientX - r.left) / r.width - 0.5) * 18}deg) rotateX(${-((e.clientY - r.top) / r.height - 0.5) * 18}deg)`; };
      hr.onmouseleave = () => (bl.style.transform = "");
    }
    onScroll();
    return () => off.forEach(f => f());
  }, []);

  return (
    <>
      <div id="pb" /><div id="cur" />
      <header>
        <a className="logo" href="#top">ashaful<b>.dev</b></a>
        <nav><a href="#services">Services</a><a href="#work">Work</a><a href="#skills">Skills</a><a href="#contact">Contact</a></nav>
      </header>
      <main>
        <section id="top" className="hero">
          <div className="hl">
            <p className="hello">হ্যালো, আমি</p>
            <h1 aria-label={D.name}>{[...D.name].map((c, i) => c === " " ? <span key={i} className="sp" /> : <span key={i} className="l" aria-hidden="true" style={{ "--i": i }}>{c}</span>)}</h1>
            <p className="role"><Typing words={D.roles} /></p>
            <p className="bio">{D.bio}</p>
            <div className="cta"><a className="btn" href="#work">আমার কাজ দেখুন</a><a className="btn ghost" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp করুন</a></div>
          </div>
          <div className="hr">
            <div className="blob"><img src={D.photo ? src(D.photo) : avatar} alt={D.name} /></div>
            {D.skills.slice(0, 4).map(s => <span className="chip" key={s}>{s}</span>)}
          </div>
        </section>
        <section className="stats">{D.stats.map((s, i) => <div className="rv" key={i}><Num n={s.n} /><span>{s.t}</span></div>)}</section>
        <section id="services"><h2 className="rv">আমি যা করি</h2>
          {D.services.map((s, i) => <article className="srv rv" key={i}><i /><h3>{s.t}</h3><p>{s.d}</p></article>)}
        </section>
        <section id="work"><h2 className="rv">নির্বাচিত কাজ</h2>
          <div className="pg">{D.projects.map((p, i) => {
            const inner = <>{p.img && <img src={src(p.img)} alt={p.t} loading="lazy" />}{p.l && <span className="go">↗</span>}<div><h3>{p.t}</h3><p>{p.d}</p></div></>;
            return p.l ? <a className="pj rv" key={i} href={p.l} target="_blank" rel="noopener noreferrer">{inner}</a> : <div className="pj rv" key={i}>{inner}</div>;
          })}</div>
        </section>
        <section id="skills" className="sk"><Row a={D.skills} /><Row a={[...D.skills].reverse()} rev /></section>
        <section id="contact"><h2 className="rv">চলুন একসাথে কাজ করি</h2>
          <div className="cg">
            <Card i="ph" l="ফোন করুন" v={D.phone} h={"tel:" + D.phone} />
            <Card i="wa" l="WhatsApp" v={D.phone} h={wa} ext />
            <Card i="ml" l="Email" v={D.email} h={"mailto:" + D.email} />
          </div>
          <p className="soc">{[["facebook", "Facebook"], ["linkedin", "LinkedIn"], ["github", "GitHub"]].filter(([k]) => D[k]).map(([k, l]) => <a key={k} href={D[k]} target="_blank" rel="noopener noreferrer">{l}</a>)}</p>
        </section>
      </main>
      <footer>© {new Date().getFullYear()} {D.name}</footer>
    </>
  );
}
