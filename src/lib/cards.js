// قوالب الصور مرسومة بالكود (SVG) — النصوص عربية (خط DejaVu Sans يدعم العربية)
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { card, esc, fetchBuf } = require("./img");
const neon = require("./neon");
const F = "DejaVu Sans, Arial, sans-serif", S = "DejaVu Sans, Arial, sans-serif";
const t = (x, y, s, size, fill, extra) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="${extra && extra.serif ? S : F}" font-size="${size}" font-weight="${(extra && extra.w) || "bold"}" fill="${fill}" ${(extra && extra.attr) || ""}>${esc(s)}</text>`;
const grad = (id, a, b, v) => `<linearGradient id="${id}" x1="0" y1="0" x2="${v ? 0 : 1}" y2="${v ? 1 : 1}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const hearts = (n, w, h, color) => { let o = ""; for (let i = 0; i < n; i++) { const x = (i * 137) % w, y = (i * 89) % h, s = 14 + (i * 7) % 22; o += `<text x="${x}" y="${y}" font-size="${s}" fill="${color}" opacity=".35" font-family="${F}">♥</text>`; } return o; };

// ---------- فردية (800×800) ----------
const single = {
    wanted: async a => card(800, 1000,
        `<rect width="800" height="1000" fill="#c9a66b"/><rect x="20" y="20" width="760" height="960" fill="none" stroke="#5a3a1a" stroke-width="10"/>${t(400, 150, "مطلوب", 130, "#3b2410", { serif: 1 })}${t(400, 215, "حيًّا أو ميتًا", 40, "#3b2410", { serif: 1 })}<rect x="150" y="260" width="500" height="500" fill="#3b2410"/>${t(400, 850, "المكافأة", 60, "#3b2410", { serif: 1 })}${t(400, 930, "1,000,000 $", 70, "#7a1f10", { serif: 1 })}`,
        [{ buf: a[0], size: 480, x: 400, y: 510, ring: 0 }],
        `<rect x="160" y="270" width="480" height="480" fill="none"/>`).then(b => b),
    grave: async a => card(800, 900,
        `<defs>${grad("sky", "#1b1f3a", "#4b3f6b", 1)}</defs><rect width="800" height="900" fill="url(#sky)"/><circle cx="650" cy="140" r="60" fill="#f3efd0" opacity=".9"/><rect y="720" width="800" height="180" fill="#1d2a1d"/><path d="M180 760 V330 a220 220 0 0 1 440 0 V760 Z" fill="#8d9096" stroke="#555" stroke-width="8"/>${t(400, 230, "رحمه الله", 58, "#2c2e33", { serif: 1 })}${t(400, 700, "لن ننساك أبدًا", 24, "#2c2e33", { serif: 1 })}`,
        [{ buf: a[0], size: 260, x: 400, y: 470, ring: 8, ringColor: "#2c2e33" }]),
    jail: async a => {
        let bars = ""; for (let x = 60; x < 800; x += 85) bars += `<rect x="${x}" y="0" width="22" height="800" fill="#2a2a2a"/><rect x="${x + 4}" y="0" width="6" height="800" fill="#6a6a6a"/>`;
        return card(800, 800, `<rect width="800" height="800" fill="#7d8186"/>`, [{ buf: a[0], size: 640, x: 400, y: 400, ring: 0 }],
            `<rect width="800" height="800" fill="#000" opacity=".25"/>${bars}<rect y="0" width="800" height="18" fill="#222"/><rect y="782" width="800" height="18" fill="#222"/>`);
    },
    cert: async a => card(1000, 720,
        `<rect width="1000" height="720" fill="#f7f0dc"/><rect x="25" y="25" width="950" height="670" fill="none" stroke="#b8922f" stroke-width="12"/><rect x="48" y="48" width="904" height="624" fill="none" stroke="#b8922f" stroke-width="3"/>${t(500, 150, "شهادة", 76, "#7a5a12", { serif: 1 })}${t(500, 205, "تقدير وإنجاز", 34, "#7a5a12", { serif: 1 })}${t(500, 560, "أسطورة معتمدة رسميًا", 38, "#444", { serif: 1, w: "normal", attr: 'font-style="italic"' })}<line x1="150" y1="640" x2="400" y2="640" stroke="#555" stroke-width="2"/>${t(275, 665, "التوقيع", 18, "#555", { w: "normal" })}<circle cx="810" cy="610" r="48" fill="#b8302a"/>${t(810, 622, "★", 50, "#fff")}`,
        [{ buf: a[0], size: 230, x: 500, y: 385, ring: 8, ringColor: "#b8922f" }]),
    id: async a => card(900, 560,
        `<defs>${grad("g", "#1e4d8c", "#2f7fc7")}</defs><rect width="900" height="560" rx="30" fill="url(#g)"/><rect y="0" width="900" height="95" rx="30" fill="#14345f"/><rect y="60" width="900" height="35" fill="#14345f"/>${t(450, 65, "بطاقة هوية", 44, "#fff")}<rect x="60" y="140" width="300" height="360" rx="14" fill="#fff" opacity=".18"/><rect x="400" y="170" width="420" height="26" rx="6" fill="#fff" opacity=".6"/><rect x="400" y="230" width="340" height="26" rx="6" fill="#fff" opacity=".4"/><rect x="400" y="290" width="380" height="26" rx="6" fill="#fff" opacity=".4"/><rect x="400" y="350" width="260" height="26" rx="6" fill="#fff" opacity=".4"/><rect x="400" y="440" width="420" height="40" fill="#fff" opacity=".85"/>${[...Array(30)].map((_, i) => `<rect x="${405 + i * 14}" y="445" width="${i % 3 + 2}" height="30" fill="#14345f"/>`).join("")}`,
        [{ buf: a[0], size: 280, x: 210, y: 320, ring: 0 }]),
    king: async (a, o) => {
        const q = o && o.queen;
        return card(800, 800, `<defs>${grad("b", q ? "#6b1f6e" : "#7a1020", q ? "#c04ba8" : "#d6402e", 1)}</defs><rect width="800" height="800" fill="url(#b)"/><circle cx="400" cy="470" r="250" fill="#f3c93b" opacity=".35"/>`,
            [{ buf: a[0], size: 330, x: 400, y: 470, ring: 10, ringColor: "#f3c93b" }],
            `<path d="M230 300 L270 150 L340 240 L400 120 L460 240 L530 150 L570 300 Z" fill="#f3c93b" stroke="#a37d0b" stroke-width="8"/><circle cx="270" cy="150" r="14" fill="#e03a3a"/><circle cx="400" cy="120" r="16" fill="#3a7be0"/><circle cx="530" cy="150" r="14" fill="#e03a3a"/>${t(400, 745, q ? "الملكة" : "الملك", 70, "#f3c93b", { serif: 1 })}`);
    },
    coin: async a => card(800, 800,
        `<rect width="800" height="800" fill="#16181d"/><defs><radialGradient id="c"><stop offset="0" stop-color="#ffe78a"/><stop offset="1" stop-color="#b8861a"/></radialGradient></defs><circle cx="400" cy="400" r="370" fill="url(#c)" stroke="#8a6410" stroke-width="12"/><circle cx="400" cy="400" r="335" fill="none" stroke="#8a6410" stroke-width="6" stroke-dasharray="4 10"/>`,
        [{ buf: a[0], size: 440, x: 400, y: 400, ring: 10, ringColor: "#8a6410" }],
        `${t(400, 128, "عملة تذكارية", 34, "#6b4a08", { serif: 1 })}${t(400, 725, "★ ★ ★", 44, "#6b4a08")}`),
    magazine: async a => card(800, 1050,
        `<defs>${grad("m", "#1b2845", "#6a3d7c", 1)}</defs><rect width="800" height="1050" fill="url(#m)"/>`,
        [{ buf: a[0], size: 600, x: 400, y: 560, ring: 0 }],
        `${t(400, 150, "نجم", 150, "#ff3b6b", { serif: 1 })}${t(400, 205, "مجلة آيلا · العدد الأول", 26, "#fff", { w: "normal" })}<rect x="40" y="840" width="460" height="6" fill="#ffd23b"/>${t(270, 905, "غلاف حصري", 36, "#ffd23b")}${t(270, 955, "كل ما أردت معرفته", 24, "#fff", { w: "normal" })}${t(270, 995, "وأكثر في الداخل", 24, "#fff", { w: "normal" })}<circle cx="680" cy="900" r="70" fill="#ff3b6b"/>${t(680, 893, "عدد", 22, "#fff")}${t(680, 925, "خاص", 22, "#fff")}`)
};

// ---------- ثنائية (1000×600) ----------
const dual = {
    marry: async a => card(1000, 600, `<defs>${grad("w", "#ffd6e8", "#fff3f8")}</defs><rect width="1000" height="600" fill="url(#w)"/>${hearts(26, 1000, 600, "#e8478b")}`,
        [{ buf: a[0], size: 270, x: 250, y: 310, ring: 10, ringColor: "#fff" }, { buf: a[1], size: 270, x: 750, y: 310, ring: 10, ringColor: "#fff" }],
        `${t(500, 110, "تم الزواج", 70, "#c2185b", { serif: 1 })}<text x="500" y="350" text-anchor="middle" font-size="130" fill="#e8478b" font-family="${F}">♥</text>${t(500, 520, "ألف مبروك!", 44, "#c2185b", { serif: 1, w: "normal", attr: 'font-style="italic"' })}`),
    hug: async a => card(1000, 600, `<defs>${grad("h", "#ffe3b3", "#ffb88a")}</defs><rect width="1000" height="600" fill="url(#h)"/>${hearts(14, 1000, 600, "#fff")}`,
        [{ buf: a[0], size: 300, x: 380, y: 320, ring: 9, ringColor: "#fff" }, { buf: a[1], size: 300, x: 620, y: 320, ring: 9, ringColor: "#fff" }],
        `${t(500, 90, "حضن كبير", 64, "#a4451b", { serif: 1 })}${t(500, 555, "دافئ وقوي", 40, "#a4451b", { serif: 1, w: "normal" })}`),
    kiss: async a => card(1000, 600, `<defs>${grad("k", "#ff9ec3", "#c94b8a")}</defs><rect width="1000" height="600" fill="url(#k)"/>${hearts(30, 1000, 600, "#fff")}`,
        [{ buf: a[0], size: 280, x: 260, y: 320, ring: 9, ringColor: "#fff" }, { buf: a[1], size: 280, x: 740, y: 320, ring: 9, ringColor: "#fff" }],
        `${t(500, 100, "بوسة حلوة", 64, "#fff", { serif: 1 })}<text x="500" y="370" text-anchor="middle" font-size="150" fill="#fff" font-family="${F}">♥</text>`),
    friend: async a => card(1000, 600, `<defs>${grad("f", "#a7e0ff", "#d3f5c9")}</defs><rect width="1000" height="600" fill="url(#f)"/>`,
        [{ buf: a[0], size: 270, x: 260, y: 320, ring: 9, ringColor: "#fff" }, { buf: a[1], size: 270, x: 740, y: 320, ring: 9, ringColor: "#fff" }],
        `${t(500, 100, "أفضل الأصدقاء", 64, "#1d5a80", { serif: 1 })}<path d="M390 330 Q500 250 610 330" fill="none" stroke="#1d5a80" stroke-width="14" stroke-linecap="round"/><text x="500" y="470" text-anchor="middle" font-size="90" fill="#e8478b" font-family="${F}">★</text>${t(500, 560, "للأبد", 40, "#1d5a80", { serif: 1, w: "normal", attr: 'font-style="italic"' })}`),
    vs: async a => card(1000, 600, `<rect width="500" height="600" fill="#1f5fbf"/><rect x="500" width="500" height="600" fill="#c0282d"/>`,
        [{ buf: a[0], size: 330, x: 250, y: 320, ring: 10, ringColor: "#fff" }, { buf: a[1], size: 330, x: 750, y: 320, ring: 10, ringColor: "#fff" }],
        `<polygon points="470,0 530,0 500,600 440,600" fill="#111" opacity=".0"/><circle cx="500" cy="300" r="82" fill="#111" stroke="#ffd23b" stroke-width="8"/>${t(500, 330, "VS", 84, "#ffd23b")}${t(500, 70, "مواجهة!", 50, "#fff")}`),
    slap: async a => card(1000, 600, `<defs>${grad("s", "#fff3b0", "#ff9a3c")}</defs><rect width="1000" height="600" fill="url(#s)"/><g stroke="#ff6a00" stroke-width="10" opacity=".5">${[...Array(16)].map((_, i) => { const an = i * Math.PI / 8; return `<line x1="500" y1="300" x2="${500 + Math.cos(an) * 700}" y2="${300 + Math.sin(an) * 700}"/>`; }).join("")}</g>`,
        [{ buf: a[0], size: 250, x: 230, y: 330, ring: 9, ringColor: "#fff" }, { buf: a[1], size: 290, x: 770, y: 320, ring: 9, ringColor: "#fff" }],
        `<polygon points="440,230 480,300 420,310 470,380 400,370 440,440 560,330 520,320 570,250 510,260 540,190" fill="#ffe14a" stroke="#c20000" stroke-width="7"/>${t(500, 110, "صفعة!", 110, "#c20000", { serif: 1 })}`)
};
const classic = { single, dual };


// ================= قوالب Hina الأصلية (روابط خارجية: تُحمَّل مرة وتُخزَّن؛ وعند الفشل نرجع للتصميم الاحتياطي) =================
const CACHE = path.join(__dirname, "..", "..", "data", "tpl");
const U = {
    hug: "https://i.ibb.co/3YN3T1r/q1y28eqblsr21.jpg",
    marry: "https://i.ibb.co/9ZZCSzR/ba6abadae46b5bdaa29cf6a64d762874.jpg",
    zawjini: "https://files.catbox.moe/8zlvjg.jpg",
    kiss: "https://files.catbox.moe/cbb7zy.jpg",
    grave: "https://i.imgur.com/A4quyh3.jpg",
    jail: "https://files.catbox.moe/rysh6o.jpg"
};
// الإحداثيات منقولة من أوامر Hina (x,y = الزاوية العلوية اليسرى، s = القطر، canvas = تحجيم الخلفية قبل اللصق)
const SLOTS = {
    hug: { slots: [{ x: 320, y: 100, s: 150 }, { x: 280, y: 280, s: 130 }] },
    marry: { slots: [{ x: 200, y: 70, s: 130 }, { x: 350, y: 150, s: 130 }] },
    zawjini: { slots: [{ x: 69, y: 163, s: 153 }, { x: 619, y: 163, s: 153 }] },
    kiss: { canvas: [473, 500], slots: [{ x: 89, y: 22, s: 132 }, { x: 258, y: 22, s: 132 }] }
};
async function template(key) {
    const f = path.join(CACHE, key + ".img");
    try { if (fs.existsSync(f)) return fs.readFileSync(f); } catch (e) { /* نحمّل */ }
    try {
        const b = await fetchBuf(U[key], 20000);
        await sharp(b).metadata();
        try { fs.mkdirSync(CACHE, { recursive: true }); fs.writeFileSync(f, b); } catch (e) { /* التخزين اختياري */ }
        return b;
    } catch (e) { console.error("[قالب] تعذّر تحميل قالب «" + key + "» (" + U[key] + "): " + e.message + " — سأستعمل التصميم الاحتياطي"); return null; }
}
const upload = k => { const p = path.join(__dirname, "..", "..", "assets", "templates", k + ".png"); return fs.existsSync(p) ? fs.readFileSync(p) : null; };

async function onTemplate(key, a, over) { // خلفية + دوائر في أماكنها
    const spec = SLOTS[key]; if (!spec) return null;
    let base = upload(key) || await template(key); if (!base) return null;
    let png = sharp(base);
    if (spec.canvas) png = png.resize(spec.canvas[0], spec.canvas[1], { fit: "fill" });
    const buf = await png.png().toBuffer(), m = await sharp(buf).metadata();
    return card(m.width, m.height, `<image href="data:image/png;base64,${buf.toString("base64")}" width="${m.width}" height="${m.height}"/>`,
        spec.slots.map((sl, i) => ({ buf: a[i], size: sl.s, x: sl.x + sl.s / 2, y: sl.y + sl.s / 2 })), over || "");
}
async function grave(a) { // قبر Hina: خلفية 500×670 والصورة 160 عند (160,70) مع كتابة RIP
    const base = upload("grave") || await template("grave"); if (!base) return null;
    const buf = await sharp(base).resize(500, 670, { fit: "fill" }).png().toBuffer();
    return card(500, 670, `<image href="data:image/png;base64,${buf.toString("base64")}" width="500" height="670"/>`,
        [{ buf: a[0], size: 160, x: 240, y: 150 }], t(240, 260, "رحمه الله", 30, "#fff", { attr: 'stroke="#000" stroke-width="1"' }));
}
async function jail(a) { // سجن Hina: الصورة تغطي القالب كاملًا والقالب (بعد إزالة الأبيض) فوقها
    const base = upload("jail") || await template("jail"); if (!base) return null;
    const m = await sharp(base).metadata();
    const { data, info } = await sharp(base).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) if (data[i] >= 225 && data[i + 1] >= 225 && data[i + 2] >= 225) data[i + 3] = 0;
    const bars = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
    const prof = await sharp(a[0]).resize(m.width, m.height, { fit: "cover" }).png().toBuffer();
    return sharp(prof).composite([{ input: bars, left: 0, top: 0 }]).png().toBuffer();
}
async function wanted(a, o) { // مطلوب Hina: واجهة popcat الخارجية تصنع الصورة من رابط الصورة الشخصية
    if (!o || !o.uid) return null;
    try {
        const cfg = require("../core/config");
        const av = "https://graph.facebook.com/" + o.uid + "/picture?width=512&height=512" + (cfg.avatarToken ? "&access_token=" + encodeURIComponent(cfg.avatarToken) : "");
        const b = await fetchBuf("https://api.popcat.xyz/wanted?image=" + encodeURIComponent(av), 20000);
        await sharp(b).metadata();
        return b;
    } catch (e) { return null; }
}

const tryFirst = (first, fallback) => async (a, o) => { let r = null; try { r = await first(a, o); } catch (e) { r = null; } return r || fallback(a, o); };
const single2 = Object.assign({}, classic.single, {
    grave: tryFirst(grave, classic.single.grave),
    jail: tryFirst(jail, classic.single.jail),
    wanted: tryFirst(wanted, classic.single.wanted)
});
const dual2 = Object.assign({}, classic.dual, {
    marry: tryFirst(a => onTemplate("marry", a), a => neon.marry(a)),
    hug: tryFirst(a => onTemplate("hug", a), classic.dual.hug),
    kiss: tryFirst(a => onTemplate("kiss", a), classic.dual.kiss),
    slap: tryFirst(async a => { const b = upload("slap"); return b ? card(1000, 600, `<image href="data:image/png;base64,${(await sharp(b).resize(1000, 600, { fit: "cover" }).png().toBuffer()).toString("base64")}" width="1000" height="600"/>`, [{ buf: a[0], size: 300, x: 250, y: 330 }, { buf: a[1], size: 300, x: 750, y: 330 }], "") : null; }, classic.dual.slap)
});
// زوجيني: النسبة تُطبع في منتصف القلب (425,239) مثل Hina
async function zawjiniCard(a, pct) {
    const txt = `<text x="425" y="250" text-anchor="middle" font-family="${F}" font-size="38" font-weight="bold" fill="#fff" stroke="#000" stroke-width="1.2" stroke-opacity=".5">${pct}%</text>`;
    let r = null;
    try { r = await onTemplate("zawjini", a, txt); } catch (e) { r = null; }
    return r || neon.marry(a, pct);
}
module.exports = { single: single2, dual: dual2, zawjiniCard, compat: neon.compat };
