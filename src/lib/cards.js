// قوالب الصور مرسومة بالكود (SVG) — نصوص لاتينية فقط داخل الصورة كي لا تعتمد على خطوط عربية
const { card, esc } = require("./img");
const F = "DejaVu Sans, Arial, sans-serif", S = "DejaVu Serif, Georgia, serif";
const t = (x, y, s, size, fill, extra) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="${extra && extra.serif ? S : F}" font-size="${size}" font-weight="${(extra && extra.w) || "bold"}" fill="${fill}" ${(extra && extra.attr) || ""}>${esc(s)}</text>`;
const grad = (id, a, b, v) => `<linearGradient id="${id}" x1="0" y1="0" x2="${v ? 0 : 1}" y2="${v ? 1 : 1}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const hearts = (n, w, h, color) => { let o = ""; for (let i = 0; i < n; i++) { const x = (i * 137) % w, y = (i * 89) % h, s = 14 + (i * 7) % 22; o += `<text x="${x}" y="${y}" font-size="${s}" fill="${color}" opacity=".35" font-family="${F}">♥</text>`; } return o; };

// ---------- فردية (800×800) ----------
const single = {
    wanted: async a => card(800, 1000,
        `<rect width="800" height="1000" fill="#c9a66b"/><rect x="20" y="20" width="760" height="960" fill="none" stroke="#5a3a1a" stroke-width="10"/>${t(400, 150, "WANTED", 130, "#3b2410", { serif: 1 })}${t(400, 215, "DEAD OR ALIVE", 40, "#3b2410", { serif: 1 })}<rect x="150" y="260" width="500" height="500" fill="#3b2410"/>${t(400, 850, "REWARD", 60, "#3b2410", { serif: 1 })}${t(400, 930, "$ 1,000,000", 70, "#7a1f10", { serif: 1 })}`,
        [{ buf: a[0], size: 480, x: 400, y: 510, ring: 0 }],
        `<rect x="160" y="270" width="480" height="480" fill="none"/>`).then(b => b),
    grave: async a => card(800, 900,
        `<defs>${grad("sky", "#1b1f3a", "#4b3f6b", 1)}</defs><rect width="800" height="900" fill="url(#sky)"/><circle cx="650" cy="140" r="60" fill="#f3efd0" opacity=".9"/><rect y="720" width="800" height="180" fill="#1d2a1d"/><path d="M180 760 V330 a220 220 0 0 1 440 0 V760 Z" fill="#8d9096" stroke="#555" stroke-width="8"/>${t(400, 230, "R.I.P", 90, "#2c2e33", { serif: 1 })}${t(400, 700, "NEVER FORGOTTEN", 24, "#2c2e33", { serif: 1 })}`,
        [{ buf: a[0], size: 260, x: 400, y: 470, ring: 8, ringColor: "#2c2e33" }]),
    jail: async a => {
        let bars = ""; for (let x = 60; x < 800; x += 85) bars += `<rect x="${x}" y="0" width="22" height="800" fill="#2a2a2a"/><rect x="${x + 4}" y="0" width="6" height="800" fill="#6a6a6a"/>`;
        return card(800, 800, `<rect width="800" height="800" fill="#7d8186"/>`, [{ buf: a[0], size: 640, x: 400, y: 400, ring: 0 }],
            `<rect width="800" height="800" fill="#000" opacity=".25"/>${bars}<rect y="0" width="800" height="18" fill="#222"/><rect y="782" width="800" height="18" fill="#222"/>`);
    },
    cert: async a => card(1000, 720,
        `<rect width="1000" height="720" fill="#f7f0dc"/><rect x="25" y="25" width="950" height="670" fill="none" stroke="#b8922f" stroke-width="12"/><rect x="48" y="48" width="904" height="624" fill="none" stroke="#b8922f" stroke-width="3"/>${t(500, 150, "CERTIFICATE", 76, "#7a5a12", { serif: 1 })}${t(500, 205, "OF ACHIEVEMENT", 34, "#7a5a12", { serif: 1 })}${t(500, 560, "Officially a legend", 38, "#444", { serif: 1, w: "normal", attr: 'font-style="italic"' })}<line x1="150" y1="640" x2="400" y2="640" stroke="#555" stroke-width="2"/>${t(275, 665, "SIGNATURE", 18, "#555", { w: "normal" })}<circle cx="810" cy="610" r="48" fill="#b8302a"/>${t(810, 622, "★", 50, "#fff")}`,
        [{ buf: a[0], size: 230, x: 500, y: 385, ring: 8, ringColor: "#b8922f" }]),
    id: async a => card(900, 560,
        `<defs>${grad("g", "#1e4d8c", "#2f7fc7")}</defs><rect width="900" height="560" rx="30" fill="url(#g)"/><rect y="0" width="900" height="95" rx="30" fill="#14345f"/><rect y="60" width="900" height="35" fill="#14345f"/>${t(450, 65, "IDENTITY CARD", 44, "#fff")}<rect x="60" y="140" width="300" height="360" rx="14" fill="#fff" opacity=".18"/><rect x="400" y="170" width="420" height="26" rx="6" fill="#fff" opacity=".6"/><rect x="400" y="230" width="340" height="26" rx="6" fill="#fff" opacity=".4"/><rect x="400" y="290" width="380" height="26" rx="6" fill="#fff" opacity=".4"/><rect x="400" y="350" width="260" height="26" rx="6" fill="#fff" opacity=".4"/><rect x="400" y="440" width="420" height="40" fill="#fff" opacity=".85"/>${[...Array(30)].map((_, i) => `<rect x="${405 + i * 14}" y="445" width="${i % 3 + 2}" height="30" fill="#14345f"/>`).join("")}`,
        [{ buf: a[0], size: 280, x: 210, y: 320, ring: 0 }]),
    king: async (a, o) => {
        const q = o && o.queen;
        return card(800, 800, `<defs>${grad("b", q ? "#6b1f6e" : "#7a1020", q ? "#c04ba8" : "#d6402e", 1)}</defs><rect width="800" height="800" fill="url(#b)"/><circle cx="400" cy="470" r="250" fill="#f3c93b" opacity=".35"/>`,
            [{ buf: a[0], size: 330, x: 400, y: 470, ring: 10, ringColor: "#f3c93b" }],
            `<path d="M230 300 L270 150 L340 240 L400 120 L460 240 L530 150 L570 300 Z" fill="#f3c93b" stroke="#a37d0b" stroke-width="8"/><circle cx="270" cy="150" r="14" fill="#e03a3a"/><circle cx="400" cy="120" r="16" fill="#3a7be0"/><circle cx="530" cy="150" r="14" fill="#e03a3a"/>${t(400, 745, q ? "THE QUEEN" : "THE KING", 70, "#f3c93b", { serif: 1 })}`);
    },
    coin: async a => card(800, 800,
        `<rect width="800" height="800" fill="#16181d"/><defs><radialGradient id="c"><stop offset="0" stop-color="#ffe78a"/><stop offset="1" stop-color="#b8861a"/></radialGradient></defs><circle cx="400" cy="400" r="370" fill="url(#c)" stroke="#8a6410" stroke-width="12"/><circle cx="400" cy="400" r="335" fill="none" stroke="#8a6410" stroke-width="6" stroke-dasharray="4 10"/>`,
        [{ buf: a[0], size: 440, x: 400, y: 400, ring: 10, ringColor: "#8a6410" }],
        `${t(400, 128, "ONE LEGEND", 34, "#6b4a08", { serif: 1 })}${t(400, 725, "★ ★ ★", 44, "#6b4a08")}`),
    magazine: async a => card(800, 1050,
        `<defs>${grad("m", "#1b2845", "#6a3d7c", 1)}</defs><rect width="800" height="1050" fill="url(#m)"/>`,
        [{ buf: a[0], size: 600, x: 400, y: 560, ring: 0 }],
        `${t(400, 150, "STAR", 150, "#ff3b6b", { serif: 1 })}${t(400, 205, "THE MAGAZINE · ISSUE #1", 26, "#fff", { w: "normal" })}<rect x="40" y="840" width="460" height="6" fill="#ffd23b"/>${t(270, 905, "EXCLUSIVE COVER STORY", 36, "#ffd23b")}${t(270, 955, "Everything you wanted to know", 24, "#fff", { w: "normal" })}${t(270, 995, "and more inside", 24, "#fff", { w: "normal" })}<circle cx="680" cy="900" r="70" fill="#ff3b6b"/>${t(680, 893, "SPECIAL", 22, "#fff")}${t(680, 925, "EDITION", 22, "#fff")}`)
};

// ---------- ثنائية (1000×600) ----------
const dual = {
    marry: async a => card(1000, 600, `<defs>${grad("w", "#ffd6e8", "#fff3f8")}</defs><rect width="1000" height="600" fill="url(#w)"/>${hearts(26, 1000, 600, "#e8478b")}`,
        [{ buf: a[0], size: 270, x: 250, y: 310, ring: 10, ringColor: "#fff" }, { buf: a[1], size: 270, x: 750, y: 310, ring: 10, ringColor: "#fff" }],
        `${t(500, 110, "JUST MARRIED", 70, "#c2185b", { serif: 1 })}<text x="500" y="350" text-anchor="middle" font-size="130" fill="#e8478b" font-family="${F}">♥</text>${t(500, 520, "Congratulations!", 44, "#c2185b", { serif: 1, w: "normal", attr: 'font-style="italic"' })}`),
    hug: async a => card(1000, 600, `<defs>${grad("h", "#ffe3b3", "#ffb88a")}</defs><rect width="1000" height="600" fill="url(#h)"/>${hearts(14, 1000, 600, "#fff")}`,
        [{ buf: a[0], size: 300, x: 380, y: 320, ring: 9, ringColor: "#fff" }, { buf: a[1], size: 300, x: 620, y: 320, ring: 9, ringColor: "#fff" }],
        `${t(500, 90, "BIG HUG", 64, "#a4451b", { serif: 1 })}${t(500, 555, "Warm & tight 🤗".replace(" 🤗", ""), 40, "#a4451b", { serif: 1, w: "normal" })}`),
    kiss: async a => card(1000, 600, `<defs>${grad("k", "#ff9ec3", "#c94b8a")}</defs><rect width="1000" height="600" fill="url(#k)"/>${hearts(30, 1000, 600, "#fff")}`,
        [{ buf: a[0], size: 280, x: 260, y: 320, ring: 9, ringColor: "#fff" }, { buf: a[1], size: 280, x: 740, y: 320, ring: 9, ringColor: "#fff" }],
        `${t(500, 100, "SWEET KISS", 64, "#fff", { serif: 1 })}<text x="500" y="370" text-anchor="middle" font-size="150" fill="#fff" font-family="${F}">♥</text>`),
    friend: async a => card(1000, 600, `<defs>${grad("f", "#a7e0ff", "#d3f5c9")}</defs><rect width="1000" height="600" fill="url(#f)"/>`,
        [{ buf: a[0], size: 270, x: 260, y: 320, ring: 9, ringColor: "#fff" }, { buf: a[1], size: 270, x: 740, y: 320, ring: 9, ringColor: "#fff" }],
        `${t(500, 100, "BEST FRIENDS", 64, "#1d5a80", { serif: 1 })}<path d="M390 330 Q500 250 610 330" fill="none" stroke="#1d5a80" stroke-width="14" stroke-linecap="round"/><text x="500" y="470" text-anchor="middle" font-size="90" fill="#e8478b" font-family="${F}">★</text>${t(500, 560, "Forever", 40, "#1d5a80", { serif: 1, w: "normal", attr: 'font-style="italic"' })}`),
    vs: async a => card(1000, 600, `<rect width="500" height="600" fill="#1f5fbf"/><rect x="500" width="500" height="600" fill="#c0282d"/>`,
        [{ buf: a[0], size: 330, x: 250, y: 320, ring: 10, ringColor: "#fff" }, { buf: a[1], size: 330, x: 750, y: 320, ring: 10, ringColor: "#fff" }],
        `<polygon points="470,0 530,0 500,600 440,600" fill="#111" opacity=".0"/><circle cx="500" cy="300" r="82" fill="#111" stroke="#ffd23b" stroke-width="8"/>${t(500, 330, "VS", 84, "#ffd23b")}${t(500, 70, "FIGHT!", 50, "#fff")}`),
    slap: async a => card(1000, 600, `<defs>${grad("s", "#fff3b0", "#ff9a3c")}</defs><rect width="1000" height="600" fill="url(#s)"/><g stroke="#ff6a00" stroke-width="10" opacity=".5">${[...Array(16)].map((_, i) => { const an = i * Math.PI / 8; return `<line x1="500" y1="300" x2="${500 + Math.cos(an) * 700}" y2="${300 + Math.sin(an) * 700}"/>`; }).join("")}</g>`,
        [{ buf: a[0], size: 250, x: 230, y: 330, ring: 9, ringColor: "#fff" }, { buf: a[1], size: 290, x: 770, y: 320, ring: 9, ringColor: "#fff" }],
        `<polygon points="440,230 480,300 420,310 470,380 400,370 440,440 560,330 520,320 570,250 510,260 540,190" fill="#ffe14a" stroke="#c20000" stroke-width="7"/>${t(500, 110, "SLAP!", 110, "#c20000", { serif: 1 })}`)
};
module.exports = { single, dual };
