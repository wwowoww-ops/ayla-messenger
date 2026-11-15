// تحميل الأوامر والأحداث مع تحقق من العقد (schema) واكتشاف الأسماء المكررة
const fs = require("fs");
const path = require("path");
const { norm } = require("../lib/util");

const commands = new Map();       // اسم موحّد -> أمر (يشمل البدائل)
const list = [];                  // الأوامر الأصلية
const events = [];                // وحدات الأحداث
const hooks = [];                 // وحدات onMessage (بترتيب order)

function walk(dir) {
    let out = [];
    let ents = [];
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
    ents.sort((a, b) => a.name.localeCompare(b.name));
    for (const e of ents) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) out = out.concat(walk(p));
        else if (e.name.endsWith(".js")) out.push(p);
    }
    return out;
}

function validateCommand(c, file) {
    if (!c || typeof c !== "object") throw new Error("لا يصدّر كائنًا");
    if (!c.name || typeof c.name !== "string") throw new Error("ينقصه name");
    if (typeof c.run !== "function") throw new Error("ينقصه run");
    c.aliases = Array.isArray(c.aliases) ? c.aliases : [];
    c.level = [0, 1, 2].includes(c.level) ? c.level : 0;
    c.cooldown = Number.isFinite(c.cooldown) ? c.cooldown : 2;
    c.category = c.category || path.basename(path.dirname(file));
    c.description = c.description || "";
    c.scope = ["group", "private", "any"].includes(c.scope) ? c.scope : "any";
}

function loadAll(root) {
    let ok = 0, bad = 0;
    for (const file of walk(path.join(root, "commands"))) {
        const rel = path.relative(root, file);
        try {
            const mod = require(file);
            for (const c of (Array.isArray(mod) ? mod : [mod])) {
                validateCommand(c, file);
                for (const n of [c.name, ...c.aliases]) {
                    const k = norm(n);
                    if (commands.has(k)) throw new Error("الاسم «" + n + "» مكرر مع الأمر " + commands.get(k).name);
                    commands.set(k, c);
                }
                list.push(c); ok++;
            }
        } catch (e) { bad++; console.error("[loader] رفض " + rel + ": " + e.message); }
    }
    for (const file of walk(path.join(root, "events"))) {
        const rel = path.relative(root, file);
        try {
            const m = require(file);
            if (!m || !m.name) throw new Error("ينقصه name");
            if (typeof m.onMessage === "function") hooks.push(m);
            if (typeof m.onEvent === "function") {
                if (!Array.isArray(m.types) || !m.types.length) throw new Error("يجب تعريف types");
                events.push(m);
            }
            if (typeof m.onMessage !== "function" && typeof m.onEvent !== "function") throw new Error("ينقصه onMessage أو onEvent");
            ok++;
        } catch (e) { bad++; console.error("[loader] رفض " + rel + ": " + e.message); }
    }
    hooks.sort((a, b) => (a.order || 50) - (b.order || 50));
    console.log("[loader] أوامر: " + list.length + " | أحداث/خطّافات: " + (events.length + hooks.length) + " | مرفوض: " + bad);
    return { ok, bad };
}

module.exports = { loadAll, commands, list, events, hooks };
