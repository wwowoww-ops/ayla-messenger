// قوالب نيونية مرسومة بالكود (SVG). نصوص لاتينية فقط داخل الصورة.
// زواج/حضن/صفع: إن وُجد assets/templates/<marry|hug|slap>.png يُستعمل خلفيةً (1000×600) وتوضع الصورتان في مكانيهما الثابتين دون أي رسم فوقها.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { card, esc } = require("./img");
const F = "DejaVu Sans, Arial, sans-serif";
const NEON = { pink: "#ff2ea6", cyan: "#19f2ff", purple: "#a64bff", yellow: "#ffe94a", green: "#39ff88", red: "#ff3b5c", orange: "#ff9a2e" };

const defs = `<defs><filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter><radialGradient id="bgr" cx=".5" cy=".45" r=".8"><stop offset="0" stop-color="#2a0f55"/><stop offset="1" stop-color="#07031a"/></radialGradient></defs>`;
const bg = (w, h) => `${defs}<rect width="${w}" height="${h}" fill="url(#bgr)"/>${grid(w, h)}`;
const grid = (w, h) => { let o = '<g stroke="#a64bff" stroke-opacity=".12" stroke-width="2">'; for (let x = 0; x <= w; x += 50) o += `<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`; for (let y = 0; y <= h; y += 50) o += `<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`; return o + "</g>"; };
const t = (x, y, s, size, c, w) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="${F}" font-size="${size}" font-weight="${w || "bold"}" fill="${c}" filter="url(#glow)">${esc(s)}</text>`;
const frame = (x, y, w, h, c, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r || 18}" fill="none" stroke="${c}" stroke-width="7" filter="url(#glow)"/>`;
const ring = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-width="8" filter="url(#glow)"/>`;
const heart = (x, y, s, c) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${s}" fill="${c}" font-family="${F}" filter="url(#glow)">♥</text>`;
const sparks = (n, w, h, c) => { let o = ""; for (let i = 0; i < n; i++) o += `<circle cx="${(i * 197) % w}" cy="${(i * 113) % h}" r="${2 + i % 4}" fill="${c}" opacity=".7"/>`; return o; };

const single = {
    wanted: a => card(800, 1000, bg(800, 1000) + frame(20, 20, 760, 960, NEON.orange, 26) + sparks(30, 800, 1000, NEON.yellow) + frame(150, 260, 500, 500, NEON.pink, 20),
        [{ buf: a[0], size: 460, x: 400, y: 510 }], t(400, 150, "WANTED", 130, NEON.orange) + t(400, 215, "DEAD OR ALIVE", 38, NEON.yellow) + t(400, 850, "REWARD", 60, NEON.cyan) + t(400, 930, "$ 1,000,000", 70, NEON.pink)),
    grave: a => card(800, 900, bg(800, 900) + `<circle cx="650" cy="140" r="60" fill="${NEON.cyan}" filter="url(#glow)" opacity=".85"/><path d="M180 790 V330 a220 220 0 0 1 440 0 V790" fill="#120a2a" stroke="${NEON.purple}" stroke-width="8" filter="url(#glow)"/>${sparks(24, 800, 900, NEON.green)}`,
        [{ buf: a[0], size: 260, x: 400, y: 470, ring: 8, ringColor: NEON.purple }], t(400, 230, "R.I.P", 90, NEON.cyan) + t(400, 700, "NEVER FORGOTTEN", 26, NEON.purple)),
    jail: a => {
        let bars = ""; for (let x = 60; x < 800; x += 85) bars += `<rect x="${x}" y="0" width="16" height="800" fill="${NEON.cyan}" filter="url(#glow)"/>`;
        return card(800, 800, bg(800, 800), [{ buf: a[0], size: 640, x: 400, y: 400 }], `${defs}<rect width="800" height="800" fill="#07031a" opacity=".3"/>${bars}<rect y="0" width="800" height="16" fill="${NEON.pink}" filter="url(#glow)"/><rect y="784" width="800" height="16" fill="${NEON.pink}" filter="url(#glow)"/>`);
    },
    cert: a => card(1000, 720, bg(1000, 720) + frame(30, 30, 940, 660, NEON.yellow, 24) + frame(52, 52, 896, 616, NEON.pink, 16),
        [{ buf: a[0], size: 230, x: 500, y: 385, ring: 8, ringColor: NEON.yellow }], t(500, 150, "CERTIFICATE", 76, NEON.yellow) + t(500, 205, "OF ACHIEVEMENT", 34, NEON.cyan) + t(500, 560, "Officially a legend", 38, "#fff", "normal") + `<line x1="150" y1="640" x2="400" y2="640" stroke="${NEON.cyan}" stroke-width="3" filter="url(#glow)"/>` + t(275, 668, "SIGNATURE", 18, NEON.cyan, "normal") + ring(810, 610, 46, NEON.pink) + t(810, 626, "★", 48, NEON.pink)),
    id: a => card(900, 560, bg(900, 560) + frame(14, 14, 872, 532, NEON.cyan, 30) + frame(60, 140, 300, 360, NEON.pink, 14),
        [{ buf: a[0], size: 270, x: 210, y: 320 }], t(450, 78, "IDENTITY CARD", 46, NEON.cyan) + [0, 1, 2, 3].map(i => `<rect x="400" y="${170 + i * 60}" width="${[420, 340, 380, 260][i]}" height="24" rx="6" fill="${NEON.purple}" opacity=".8" filter="url(#glow)"/>`).join("") + [...Array(30)].map((_, i) => `<rect x="${405 + i * 14}" y="440" width="${i % 3 + 2}" height="46" fill="${NEON.green}"/>`).join("")),
    king: (a, o) => {
        const q = o && o.queen, c = q ? NEON.pink : NEON.cyan;
        return card(800, 800, bg(800, 800) + `<circle cx="400" cy="470" r="260" fill="${c}" opacity=".25" filter="url(#soft)"/>`, [{ buf: a[0], size: 330, x: 400, y: 470, ring: 10, ringColor: c }],
            `<path d="M230 300 L270 150 L340 240 L400 120 L460 240 L530 150 L570 300 Z" fill="none" stroke="${NEON.yellow}" stroke-width="10" stroke-linejoin="round" filter="url(#glow)"/>` + t(400, 745, q ? "THE QUEEN" : "THE KING", 70, NEON.yellow));
    },
    coin: a => card(800, 800, bg(800, 800) + ring(400, 400, 360, NEON.yellow) + `<circle cx="400" cy="400" r="325" fill="none" stroke="${NEON.orange}" stroke-width="5" stroke-dasharray="4 12"/>`,
        [{ buf: a[0], size: 440, x: 400, y: 400, ring: 10, ringColor: NEON.yellow }], t(400, 128, "ONE LEGEND", 34, NEON.yellow) + t(400, 725, "★ ★ ★", 44, NEON.orange)),
    magazine: a => card(800, 1050, bg(800, 1050) + frame(16, 16, 768, 1018, NEON.purple, 20),
        [{ buf: a[0], size: 600, x: 400, y: 560 }], t(400, 150, "STAR", 150, NEON.pink) + t(400, 205, "THE MAGAZINE · ISSUE #1", 26, NEON.cyan, "normal") + `<rect x="40" y="840" width="460" height="6" fill="${NEON.yellow}" filter="url(#glow)"/>` + t(270, 905, "EXCLUSIVE COVER STORY", 34, NEON.yellow) + t(270, 955, "Everything you wanted to know", 24, "#fff", "normal") + t(270, 995, "and more inside", 24, "#fff", "normal") + ring(680, 900, 66, NEON.pink) + t(680, 893, "SPECIAL", 20, NEON.pink) + t(680, 922, "EDITION", 20, NEON.pink))
};

// أماكن الصورتين (ثابتة، لا تتغير): يسار/يمين
const SLOT = { marry: [[250, 330, 300], [750, 330, 300]], hug: [[300, 330, 320], [700, 330, 320]], slap: [[250, 330, 300], [750, 330, 300]] };
const tpl = k => { const p = path.join(__dirname, "..", "..", "assets", "templates", k + ".png"); return fs.existsSync(p) ? p : null; };
async function slotted(key, a, text, accent, decor) {
    const s = SLOT[key], av = [{ buf: a[0], size: s[0][2], x: s[0][0], y: s[0][1], ring: 8, ringColor: accent }, { buf: a[1], size: s[1][2], x: s[1][0], y: s[1][1], ring: 8, ringColor: accent }];
    const file = tpl(key);
    if (file) { // قالب مرفوع من المستخدم: خلفية فقط، لا نصوص ولا زخارف فوقه
        const base = await sharp(file).resize(1000, 600, { fit: "cover" }).png().toBuffer();
        return card(1000, 600, `<image href="data:image/png;base64,${base.toString("base64")}" width="1000" height="600"/>`, av, "");
    }
    return card(1000, 600, bg(1000, 600) + frame(10, 10, 980, 580, accent, 26) + decor, av, text);
}

const dual = {
    marry: a => slotted("marry", a, t(500, 100, "JUST MARRIED", 70, NEON.pink) + heart(500, 400, 130, NEON.pink) + t(500, 545, "Congratulations!", 42, NEON.cyan, "normal"), NEON.pink, sparks(30, 1000, 600, NEON.pink)),
    hug: a => slotted("hug", a, t(500, 90, "BIG HUG", 64, NEON.orange) + t(500, 560, "Warm & tight", 38, NEON.yellow, "normal"), NEON.orange, sparks(24, 1000, 600, NEON.yellow)),
    slap: a => slotted("slap", a, `<polygon points="440,230 480,300 420,310 470,380 400,370 440,440 560,330 520,320 570,250 510,260 540,190" fill="none" stroke="${NEON.yellow}" stroke-width="8" filter="url(#glow)"/>` + t(500, 110, "SLAP!", 110, NEON.red), NEON.red, sparks(24, 1000, 600, NEON.orange)),
    kiss: a => card(1000, 600, bg(1000, 600) + frame(10, 10, 980, 580, NEON.pink, 26) + sparks(30, 1000, 600, NEON.pink), [{ buf: a[0], size: 280, x: 260, y: 320, ring: 8, ringColor: NEON.pink }, { buf: a[1], size: 280, x: 740, y: 320, ring: 8, ringColor: NEON.pink }], t(500, 100, "SWEET KISS", 64, NEON.pink) + heart(500, 380, 150, NEON.pink)),
    friend: a => card(1000, 600, bg(1000, 600) + frame(10, 10, 980, 580, NEON.cyan, 26), [{ buf: a[0], size: 270, x: 260, y: 320, ring: 8, ringColor: NEON.cyan }, { buf: a[1], size: 270, x: 740, y: 320, ring: 8, ringColor: NEON.cyan }], t(500, 100, "BEST FRIENDS", 64, NEON.cyan) + `<path d="M390 330 Q500 250 610 330" fill="none" stroke="${NEON.green}" stroke-width="12" stroke-linecap="round" filter="url(#glow)"/>` + t(500, 470, "★", 90, NEON.yellow) + t(500, 560, "Forever", 40, NEON.green, "normal")),
    vs: a => card(1000, 600, `${defs}<rect width="500" height="600" fill="#061a3d"/><rect x="500" width="500" height="600" fill="#3d0613"/>${grid(1000, 600)}<line x1="500" y1="0" x2="500" y2="600" stroke="#fff" stroke-width="4" filter="url(#glow)"/>`, [{ buf: a[0], size: 330, x: 250, y: 320, ring: 8, ringColor: NEON.cyan }, { buf: a[1], size: 330, x: 750, y: 320, ring: 8, ringColor: NEON.red }], ring(500, 300, 78, NEON.yellow) + t(500, 330, "VS", 80, NEON.yellow) + t(500, 70, "FIGHT!", 50, "#fff"))
};
module.exports = { single, dual, SLOT };
