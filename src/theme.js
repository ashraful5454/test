export const T = [
  { n: "Sunset", bg: "#0f0a24", a: "#ff5d73", b: "#ffb02e", c: "#8b5cff" },
  { n: "Ocean", bg: "#04111f", a: "#00d1ff", b: "#2ee6a6", c: "#5b6cff" },
  { n: "Candy", bg: "#1a0b24", a: "#ff4fd8", b: "#ffd23f", c: "#3ad1ff" },
  { n: "Royal", bg: "#0b0d1c", a: "#ffcb47", b: "#ff7a45", c: "#6c7bff" }
];
export function applyTheme(i) {
  const t = T[i] || T[0], r = document.documentElement.style;
  r.setProperty("--bg", t.bg); r.setProperty("--a", t.a); r.setProperty("--b", t.b); r.setProperty("--c", t.c);
}
