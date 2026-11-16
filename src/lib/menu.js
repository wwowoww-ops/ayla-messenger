// قائمة الأوامر التفاعلية (على نسق Hina): رد على القائمة برقم الفئة أو اسمها
const ui = require("./ui");
const { norm } = require("./util");
const CATS = [
    { id: "fun", name: "الترفيه", aliases: ["الترفيه", "ترفيه", "تسلية"] },
    { id: "pic", name: "الصور", aliases: ["الصور", "صور"] },
    { id: "admin", name: "الإدارة", aliases: ["الادارة", "الإدارة", "ادارة", "إدارة"] },
    { id: "owner", name: "المطوّر", aliases: ["المطور", "مطور", "المطوّر", "مطوّر"] },
    { id: "utility", name: "الخدمات", aliases: ["الخدمات", "خدمات"] }
];
const DIG = ["❶", "❷", "❸", "❹", "❺", "❻", "❼"];
const digits = t => String(t || "").replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
const LINE = "✦━━━━━━━━━━━━━━━━━━✦";
const title = t => "✦━━━━ ◈ آيلا ◈ ━━━━✦\n      ⟡ " + t + " ⟡\n" + LINE;

function mainMenu() {
    return title("قائمة الأوامر") + "\n" + CATS.map((c, i) => DIG[i] + "  ✧ " + c.name).join("\n") + "\n" + LINE + "\n💬 رُدّ على هذه الرسالة برقم الفئة أو اسمها";
}
function find(input) {
    const v = norm(digits(input));
    const n = parseInt(v, 10);
    if (n >= 1 && n <= CATS.length && String(n) === v) return CATS[n - 1];
    return CATS.find(c => c.aliases.some(a => norm(a) === v) || norm(c.name) === v) || null;
}
function categoryMenu(cat, names) {
    const body = names.map((n, i) => (i === names.length - 1 ? "┗ ✦ " : "┃ ✦ ") + n).join("\n");
    return title(cat.name) + "\n" + body + "\n" + LINE + "\n📊 عدد الأوامر: " + names.length + "\n↩️ رُدّ بكلمة «رجوع» للعودة للقائمة";
}
const namesOf = (loader, id) => loader.list.filter(c => c.category === id).map(c => c.name).sort((a, b) => a.localeCompare(b, "ar"));
module.exports = { CATS, mainMenu, categoryMenu, find, namesOf, digits };
