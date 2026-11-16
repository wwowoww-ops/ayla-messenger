// بانر قائمة الأوامر: يُرسم محليًا (هوية آيلا) بدل أي صورة خارجية
const sharp = require("sharp");
let cache = null;
module.exports = async function banner() {
    if (cache) return cache;
    const F = "DejaVu Sans, sans-serif";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="420">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b1d6e"/><stop offset=".55" stop-color="#7b3fb8"/><stop offset="1" stop-color="#d36ac2"/></linearGradient>
<radialGradient id="r" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<rect width="900" height="420" fill="url(#g)"/>
<circle cx="140" cy="90" r="170" fill="url(#r)"/><circle cx="780" cy="340" r="200" fill="url(#r)"/>
${[...Array(28)].map((_, i) => `<circle cx="${(i * 131) % 900}" cy="${(i * 79) % 420}" r="${1.5 + i % 3}" fill="#fff" opacity="${0.25 + (i % 4) * 0.15}"/>`).join("")}
<rect x="30" y="30" width="840" height="360" rx="28" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>
<text x="450" y="210" text-anchor="middle" font-family="${F}" font-size="150" font-weight="bold" fill="#fff">آيلا</text>
<text x="450" y="290" text-anchor="middle" font-family="${F}" font-size="44" fill="#fff" fill-opacity=".92">قائمة الأوامر</text>
<text x="450" y="350" text-anchor="middle" font-family="${F}" font-size="26" fill="#fff" fill-opacity=".75">✦  AYLA  ✦</text></svg>`;
    cache = await sharp(Buffer.from(svg)).png().toBuffer();
    return cache;
};
