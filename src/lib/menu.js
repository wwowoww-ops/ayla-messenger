// قائمة الأوامر التفاعلية (على نسق Hina): رد على القائمة برقم الفئة أو اسمها
const ui = require("./ui");
const { norm } = require("./util");
const CATS = [
    { id: "fun", name: "الـتـرفـيـه", aliases: ["الترفيه", "ترفيه", "تسلية"] },
    { id: "pic", name: "الـصـور", aliases: ["الصور", "صور"] },
    { id: "admin", name: "الإدارة", aliases: ["الادارة", "الإدارة", "ادارة", "إدارة"] },
    { id: "owner", name: "الـمـطـور", aliases: ["المطور", "مطور", "المطوّر", "مطوّر"] },
    { id: "utility", name: "الـخـدمات", aliases: ["الخدمات", "خدمات"] }
];
const DIG = ["❶", "❷", "❸", "❹", "❺", "❻", "❼"];
const digits = t => String(t || "").replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

function mainMenu() {
    return ui.TOP + "\n𝗔𝗬𝗟𝗔          〢       الأوامر\n" + ui.BOTTOM + "\n" +
        CATS.map((c, i) => DIG[i] + " " + c.name).join("\n") + "\n" + ui.TOP + "\nرد برقم الفئة أو اسمها\n" + ui.BOTTOM;
}
function find(input) {
    const v = norm(digits(input));
    const n = parseInt(v, 10);
    if (n >= 1 && n <= CATS.length && String(n) === v) return CATS[n - 1];
    return CATS.find(c => c.aliases.some(a => norm(a) === v) || norm(c.name) === v) || null;
}
function categoryMenu(cat, names) {
    const body = names.map((n, i) => (i === names.length - 1 ? "╘❯ " : "╞❯ ") + n).join("\n");
    return ui.TOP + "\n𝗔𝗬𝗟𝗔          〢       " + cat.name + "\n" + ui.BOTTOM + "\n" + body + "\n" + ui.TOP + "\nعدد الأوامر: " + names.length + "\nرد بـ رجوع للقائمة\n" + ui.BOTTOM;
}
const namesOf = (loader, id) => loader.list.filter(c => c.category === id).map(c => c.name).sort((a, b) => a.localeCompare(b, "ar"));
module.exports = { CATS, mainMenu, categoryMenu, find, namesOf, digits };
