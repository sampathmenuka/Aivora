// Generates flat (solid-colour, no gradients) SVG cover art for the demo products.
// Usage: node scripts/generate-covers.mjs  ->  writes public/covers/<key>.svg
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "covers");
const W = 1200;
const H = 900;

// Deterministic PRNG so covers are stable between runs
function rng(seed) {
  let t = seed;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Big off-canvas shapes plus a sprinkle of dots and plus signs
function backdrop(seed, tone) {
  const rand = rng(seed);
  let out = `<circle cx="${W - 120}" cy="120" r="300" fill="${tone}" opacity="0.10"/>`;
  out += `<circle cx="80" cy="${H - 40}" r="220" fill="${tone}" opacity="0.08"/>`;
  for (let i = 0; i < 26; i++) {
    const x = Math.round(rand() * W);
    const y = Math.round(rand() * H);
    if (Math.hypot(x - W / 2, y - H / 2) < 330) continue; // keep the centre clear
    if (rand() > 0.5) {
      out += `<circle cx="${x}" cy="${y}" r="${4 + Math.round(rand() * 6)}" fill="${tone}" opacity="0.22"/>`;
    } else {
      const s = 9 + Math.round(rand() * 6);
      out += `<path d="M${x - s} ${y}H${x + s}M${x} ${y - s}V${y + s}" stroke="${tone}" stroke-width="5" stroke-linecap="round" opacity="0.22"/>`;
    }
  }
  return out;
}

const svg = (bg, tone, seed, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
  `<rect width="${W}" height="${H}" fill="${bg}"/>${backdrop(seed, tone)}${body}</svg>\n`;

const rect = (x, y, w, h, fill, rx = 0, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const circle = (cx, cy, r, fill, extra = "") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;

const COVERS = {
  // Ebooks
  founder: () =>
    svg("#4f46e5", "#ffffff", 1, `
      <g transform="translate(600 440) rotate(35)">
        <path d="M-44 150 Q0 320 44 150 Z" fill="#f59e0b"/>
        <path d="M-24 150 Q0 250 24 150 Z" fill="#fde68a"/>
        <path d="M-72 40 L-150 170 L-72 150 Z" fill="#f43f5e"/>
        <path d="M72 40 L150 170 L72 150 Z" fill="#f43f5e"/>
        <path d="M-72 150 L-72 -60 Q-72 -210 0 -270 Q72 -210 72 -60 L72 150 Z" fill="#f8fafc"/>
        ${rect(-72, 80, 144, 24, "#f43f5e")}
        ${circle(0, -70, 42, "#1e1b4b")}
        ${circle(0, -70, 27, "#38bdf8")}
      </g>`),

  cleancode: () => {
    const rows = [
      [0, 180, "#a78bfa"], [0, 300, "#22d3ee"], [40, 220, "#f472b6"], [40, 140, "#fbbf24"],
      [80, 260, "#22d3ee"], [40, 120, "#a78bfa"], [0, 90, "#f472b6"], [0, 240, "#34d399"],
    ];
    const lines = rows
      .map(([indent, w, c], i) => rect(330 + indent, 300 + i * 42, w, 18, c, 9))
      .join("");
    return svg("#1e293b", "#94a3b8", 2, `
      ${rect(270, 190, 660, 500, "#0f172a", 30)}
      ${rect(270, 190, 660, 70, "#334155", 30)}
      ${rect(270, 230, 660, 30, "#334155")}
      ${circle(318, 225, 11, "#f87171")}${circle(352, 225, 11, "#fbbf24")}${circle(386, 225, 11, "#34d399")}
      ${lines}
      <path d="M780 560 L730 610 L780 660" stroke="#22d3ee" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M860 560 L910 610 L860 660" stroke="#22d3ee" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  },

  calm: () =>
    svg("#ccfbf1", "#0f766e", 3, `
      ${circle(600, 470, 290, "none", 'stroke="#5eead4" stroke-width="10"')}
      ${circle(600, 470, 230, "none", 'stroke="#99f6e4" stroke-width="10"')}
      ${circle(600, 470, 170, "#f97316")}
      ${rect(290, 470, 620, 330, "#ccfbf1")}
      <path d="M300 520 Q375 480 450 520 T600 520 T750 520 T900 520 V560 H300 Z" fill="#14b8a6"/>
      <path d="M300 580 Q375 540 450 580 T600 580 T750 580 T900 580 V620 H300 Z" fill="#0d9488"/>
      <path d="M300 640 Q375 600 450 640 T600 640 T750 640 T900 640 V700 H300 Z" fill="#0f766e"/>`),

  finance: () => {
    const coin = (cx, cy) =>
      `<ellipse cx="${cx}" cy="${cy + 14}" rx="74" ry="26" fill="#b45309"/>` +
      `<ellipse cx="${cx}" cy="${cy}" rx="74" ry="26" fill="#f59e0b"/>` +
      `<ellipse cx="${cx}" cy="${cy}" rx="48" ry="15" fill="#fbbf24"/>`;
    return svg("#fef3c7", "#b45309", 4, `
      ${rect(330, 470, 90, 200, "#10b981", 14)}
      ${rect(450, 400, 90, 270, "#059669", 14)}
      ${rect(570, 320, 90, 350, "#047857", 14)}
      ${rect(690, 240, 90, 430, "#065f46", 14)}
      <path d="M330 420 L470 330 L590 260 L760 170" stroke="#1f2937" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M700 165 L765 168 L748 230" stroke="#1f2937" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${coin(870, 640)}${coin(870, 600)}${coin(870, 560)}${coin(870, 520)}`);
  },

  remote: () =>
    svg("#e0e7ff", "#4338ca", 5, `
      ${circle(600, 360, 210, "#818cf8")}
      <ellipse cx="600" cy="360" rx="90" ry="210" fill="none" stroke="#4338ca" stroke-width="10"/>
      <path d="M390 360 H810 M420 260 H780 M420 460 H780" stroke="#4338ca" stroke-width="10"/>
      ${circle(600, 360, 210, "none", 'stroke="#4338ca" stroke-width="10"')}
      ${rect(390, 470, 420, 250, "#1e1b4b", 22)}
      ${rect(412, 492, 376, 206, "#f8fafc", 10)}
      ${rect(440, 520, 150, 16, "#818cf8", 8)}${rect(440, 552, 300, 12, "#c7d2fe", 6)}${rect(440, 578, 260, 12, "#c7d2fe", 6)}
      ${circle(720, 640, 28, "#f97316")}
      <path d="M330 720 H870 L830 760 H370 Z" fill="#312e81"/>`),

  // Courses
  photo: () =>
    svg("#f43f5e", "#ffffff", 6, `
      ${rect(330, 290, 540, 360, "#111827", 46)}
      ${rect(440, 240, 170, 80, "#111827", 18)}
      ${rect(720, 330, 90, 44, "#fbbf24", 10)}
      ${circle(600, 470, 150, "#f8fafc")}
      ${circle(600, 470, 118, "#374151")}
      ${circle(600, 470, 80, "#1f2937")}
      ${circle(600, 470, 42, "#38bdf8")}
      ${circle(578, 448, 14, "#f8fafc")}
      ${circle(395, 340, 16, "#f43f5e")}`),

  spring: () => {
    const nodes = [[860, 280], [960, 420], [860, 560], [980, 640]];
    return svg("#dcfce7", "#166534", 7, `
      <path d="M260 700 Q240 330 620 230 Q700 600 260 700 Z" fill="#16a34a"/>
      <path d="M270 690 Q420 520 600 260" stroke="#dcfce7" stroke-width="14" fill="none" stroke-linecap="round"/>
      <path d="M380 560 L470 560 M430 470 L510 480 M480 380 L555 395" stroke="#dcfce7" stroke-width="10" stroke-linecap="round"/>
      <path d="M${nodes.map((n) => n.join(" ")).join(" L")} M860 280 L860 560" stroke="#166534" stroke-width="10" fill="none"/>
      ${nodes.map(([x, y]) => circle(x, y, 34, "#166534") + circle(x, y, 16, "#86efac")).join("")}`);
  },

  nextjs: () =>
    svg("#111827", "#a78bfa", 8, `
      ${rect(250, 180, 700, 530, "#f8fafc", 28)}
      ${rect(250, 180, 700, 64, "#e5e7eb", 28)}
      ${rect(250, 220, 700, 24, "#e5e7eb")}
      ${circle(294, 212, 10, "#f87171")}${circle(326, 212, 10, "#fbbf24")}${circle(358, 212, 10, "#34d399")}
      ${rect(410, 200, 360, 24, "#f8fafc", 12)}
      ${rect(282, 276, 150, 400, "#ede9fe", 16)}
      ${rect(304, 304, 106, 16, "#a78bfa", 8)}${rect(304, 340, 80, 12, "#c4b5fd", 6)}${rect(304, 368, 96, 12, "#c4b5fd", 6)}
      ${rect(456, 276, 462, 150, "#a78bfa", 16)}
      ${rect(456, 450, 220, 226, "#34d399", 16)}
      ${rect(698, 450, 220, 226, "#111827", 16)}
      ${rect(722, 480, 120, 14, "#f8fafc", 7)}${rect(722, 510, 160, 10, "#6b7280", 5)}
      <path d="M840 560 L840 690 L872 660 L896 712 L918 702 L896 650 L940 648 Z" fill="#f8fafc" stroke="#111827" stroke-width="8" stroke-linejoin="round"/>`),

  watercolor: () =>
    svg("#fff7ed", "#fb7185", 9, `
      ${circle(470, 400, 150, "#fb7185", 'opacity="0.85"')}
      ${circle(640, 360, 130, "#60a5fa", 'opacity="0.85"')}
      ${circle(580, 540, 140, "#fbbf24", 'opacity="0.85"')}
      ${circle(420, 590, 90, "#34d399", 'opacity="0.85"')}
      <g transform="translate(800 520) rotate(-40)">
        ${rect(-22, -40, 44, 330, "#1f2937", 22)}
        ${rect(-30, -110, 60, 80, "#9ca3af", 8)}
        <path d="M-30 -110 Q-30 -220 0 -260 Q30 -220 30 -110 Z" fill="#7c2d12"/>
        <path d="M-14 -200 Q0 -240 14 -200 Q0 -230 -14 -200 Z" fill="#fb7185"/>
      </g>`),

  // Digital files
  uikit: () =>
    svg("#059669", "#ffffff", 10, `
      ${rect(260, 190, 330, 230, "#f8fafc", 24)}
      ${circle(320, 250, 30, "#fde047")}${rect(366, 232, 160, 16, "#064e3b", 8)}${rect(366, 260, 110, 12, "#6ee7b7", 6)}
      ${rect(290, 320, 270, 70, "#059669", 18)}${rect(350, 348, 150, 14, "#f8fafc", 7)}
      ${rect(620, 190, 320, 110, "#f8fafc", 24)}
      ${rect(650, 225, 110, 40, "#064e3b", 20)}${circle(740, 245, 16, "#fde047")}
      ${rect(790, 225, 110, 40, "#d1d5db", 20)}${circle(810, 245, 16, "#f8fafc")}
      ${rect(620, 330, 320, 90, "#f8fafc", 24)}
      ${rect(650, 368, 260, 12, "#d1d5db", 6)}${rect(650, 368, 160, 12, "#064e3b", 6)}${circle(810, 374, 20, "#fde047")}
      ${rect(260, 450, 680, 260, "#f8fafc", 24)}
      ${[0, 1, 2].map((i) => rect(290 + i * 212, 480, 190, 140, ["#a7f3d0", "#fde047", "#064e3b"][i], 16)).join("")}
      ${[0, 1, 2].map((i) => rect(290 + i * 212, 640, 120, 14, "#064e3b", 7)).join("")}`),

  notion: () => {
    const row = (y, done, w) =>
      rect(470, y, 38, 38, done ? "#1c1917" : "#f5f5f4", 8, 'stroke="#1c1917" stroke-width="6"') +
      (done ? `<path d="M478 ${y + 19} L486 ${y + 28} L500 ${y + 10}" stroke="#f5f5f4" stroke-width="6" fill="none" stroke-linecap="round"/>` : "") +
      rect(530, y + 12, w, 14, done ? "#a8a29e" : "#1c1917", 7);
    return svg("#e7e5e4", "#1c1917", 11, `
      ${rect(380, 230, 480, 520, "#d6d3d1", 24, 'transform="rotate(-6 620 490)"')}
      ${rect(360, 200, 480, 520, "#fafaf9", 24, 'stroke="#1c1917" stroke-width="8"')}
      ${rect(410, 250, 70, 70, "#ef4444", 14)}
      ${rect(500, 262, 220, 20, "#1c1917", 10)}${rect(500, 296, 140, 12, "#a8a29e", 6)}
      ${row(370, true, 200)}${row(440, true, 160)}${row(510, false, 230)}${row(580, false, 180)}
      ${rect(470, 650, 80, 26, "#3b82f6", 13)}${rect(566, 650, 80, 26, "#22c55e", 13)}`);
  },

  presets: () => {
    const bands = [0, 1, 2, 3]
      .map((i) => rect(380, 392 + i * 36, 440, 10 + i * 4, "#fed7aa"))
      .join("");
    return svg("#fed7aa", "#9a3412", 12, `
      ${circle(600, 430, 210, "#f97316")}
      ${bands}
      <path d="M220 720 L470 430 L620 600 L740 470 L980 720 Z" fill="#9a3412"/>
      <path d="M470 430 L530 500 L500 510 L470 480 L440 520 L410 500 Z" fill="#fde68a"/>
      <path d="M150 720 L360 560 L560 720 Z" fill="#7c2d12"/>
      ${rect(0, 720, W, 180, "#7c2d12")}
      ${rect(260, 760, 280, 14, "#f97316", 7)}${rect(620, 800, 340, 14, "#f97316", 7)}`);
  },

  k8s: () => {
    const spokes = Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
      const x = 600 + Math.cos(a) * 170;
      const y = 450 + Math.sin(a) * 170;
      return `<path d="M600 450 L${x.toFixed(1)} ${y.toFixed(1)}" stroke="#f8fafc" stroke-width="22" stroke-linecap="round"/>` + circle(x.toFixed(1), y.toFixed(1), 24, "#f8fafc");
    }).join("");
    const hex = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      return `${(600 + Math.cos(a) * 300).toFixed(1)},${(450 + Math.sin(a) * 300).toFixed(1)}`;
    }).join(" ");
    return svg("#1d4ed8", "#93c5fd", 13, `
      <polygon points="${hex}" fill="#2563eb" stroke="#93c5fd" stroke-width="12" stroke-linejoin="round"/>
      ${circle(600, 450, 140, "none", 'stroke="#f8fafc" stroke-width="22"')}
      ${spokes}
      ${circle(600, 450, 46, "#f8fafc")}${circle(600, 450, 20, "#1d4ed8")}`);
  },
};

mkdirSync(OUT, { recursive: true });
for (const [key, draw] of Object.entries(COVERS)) {
  writeFileSync(join(OUT, `${key}.svg`), draw());
}
console.log(`Wrote ${Object.keys(COVERS).length} covers to ${OUT}`);
