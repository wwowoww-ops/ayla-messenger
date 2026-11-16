// يجعل fontconfig يرى الخطوط المرفقة في assets/fonts (DejaVu، ترخيص حر) فلا تعتمد الصور على خطوط الخادم.
// يجب استدعاؤه قبل تحميل sharp.
const fs = require("fs");
const os = require("os");
const path = require("path");
(function () {
    try {
        const dir = path.join(__dirname, "..", "..", "assets", "fonts");
        if (!fs.existsSync(dir)) return;
        const cache = path.join(os.tmpdir(), "ayla-fontcache");
        const conf = path.join(os.tmpdir(), "ayla-fonts.conf");
        fs.mkdirSync(cache, { recursive: true });
        fs.writeFileSync(conf, `<?xml version="1.0"?>\n<!DOCTYPE fontconfig SYSTEM "fonts.dtd">\n<fontconfig>\n  <dir>${dir}</dir>\n  <dir>/usr/share/fonts</dir>\n  <cachedir>${cache}</cachedir>\n</fontconfig>\n`);
        process.env.FONTCONFIG_FILE = conf;
    } catch (e) { /* نكمل بخطوط النظام */ }
})();
