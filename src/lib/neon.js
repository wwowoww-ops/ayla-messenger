// تصميم نيوني: احتياطي لأمر زواج + قالب أمر توافق (يتغير لونه مع النسبة). النصوص عربية.
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


function marry(a) {
    const accent = NEON.pink;
    return card(1000, 600, bg(1000, 600) + frame(10, 10, 980, 580, accent, 26) + sparks(30, 1000, 600, NEON.pink),
        [{ buf: a[0], size: 300, x: 250, y: 330, ring: 8, ringColor: accent }, { buf: a[1], size: 300, x: 750, y: 330, ring: 8, ringColor: accent }],
        t(500, 100, "تم الزواج", 70, NEON.pink) + heart(500, 400, 130, NEON.pink) + t(500, 545, "ألف مبروك!", 42, NEON.cyan, "normal"));
}

// لون القالب يتدرّج مع النسبة: 0% أزرق بارد ← بنفسجي ← أصفر/برتقالي ← 100% أحمر/وردي حار
const hue = pct => Math.round(220 - Math.max(0, Math.min(100, pct)) * 2.2);
const hsl = (h, l) => `hsl(${(h + 360) % 360},100%,${l || 60}%)`;
function compat(a, pct) {
    const h = hue(pct), c = hsl(h), c2 = hsl(h + 40, 65), dark = `hsl(${h},70%,7%)`, mid = `hsl(${h},60%,18%)`;
    const bgx = `${defs}<defs><radialGradient id="cg" cx=".5" cy=".45" r=".8"><stop offset="0" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></radialGradient></defs><rect width="1000" height="600" fill="url(#cg)"/><g stroke="${c}" stroke-opacity=".14" stroke-width="2">${[...Array(21)].map((_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="600"/>`).join("")}${[...Array(13)].map((_, i) => `<line x1="0" y1="${i * 50}" x2="1000" y2="${i * 50}"/>`).join("")}</g>`;
    // قوس تقدّم حول الرقم
    const R = 95, C = 2 * Math.PI * R, dash = C * Math.max(0, Math.min(100, pct)) / 100;
    const arc = `<circle cx="500" cy="330" r="${R}" fill="none" stroke="${c}" stroke-opacity=".2" stroke-width="14"/><circle cx="500" cy="330" r="${R}" fill="none" stroke="${c}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${dash} ${C}" transform="rotate(-90 500 330)" filter="url(#glow)"/>`;
    const over = frame(10, 10, 980, 580, c, 26) + sparks(26, 1000, 600, c2) + arc +
        t(500, 90, "مقياس الحب", 60, c) + t(500, 350, pct + "%", 56, "#fff") +
        t(500, 555, pct >= 80 ? "توأم الروح!" : pct >= 60 ? "توافق رائع" : pct >= 40 ? "ربما..." : pct >= 20 ? "مجرد أصدقاء" : "لا أمل", 40, c2, "normal");
    return card(1000, 600, bgx, [{ buf: a[0], size: 270, x: 200, y: 330, ring: 8, ringColor: c }, { buf: a[1], size: 270, x: 800, y: 330, ring: 8, ringColor: c }], over);
}
module.exports = { marry, compat, hue };
