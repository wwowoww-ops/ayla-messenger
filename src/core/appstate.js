// يقبل الكوكيز بصيغ متعددة ويحوّلها لصيغة appstate التي تفهمها المكتبة:
//  1) appstate جاهز [{key,value,domain,path,...}]   2) تصدير إضافة Cookie-Editor [{name,value,...}]
//  3) نص Cookie مباشر "c_user=...; xs=...; fr=..."   4) كائن {c_user:"..",xs:".."}
const need = ["c_user", "xs"];
function fromString(s) {
    return String(s).split(/;\s*/).map(p => p.trim()).filter(p => p.includes("=")).map(p => { const i = p.indexOf("="); return { key: p.slice(0, i).trim(), value: p.slice(i + 1).trim() }; });
}
function normalize(input) {
    let arr = null;
    if (typeof input === "string") {
        const t = input.trim();
        if (!t) return null;
        if (t[0] === "[" || t[0] === "{") { try { return normalize(JSON.parse(t)); } catch (e) { return null; } }
        arr = fromString(t);
    } else if (Array.isArray(input)) arr = input;
    else if (input && typeof input === "object") arr = Object.entries(input).map(([key, value]) => ({ key, value }));
    if (!arr) return null;
    const now = new Date().toISOString();
    const out = arr.filter(c => c && (c.key || c.name) && c.value !== undefined && c.value !== null && String(c.value) !== "").map(c => ({
        key: String(c.key || c.name),
        value: String(c.value),
        domain: String(c.domain || ".facebook.com").replace(/^(?!\.)/, ".").replace(/^\.www\./, "."),
        path: c.path || "/",
        hostOnly: !!c.hostOnly,
        creation: c.creation || now,
        lastAccessed: c.lastAccessed || now,
        ...(c.expires ? { expires: c.expires } : {})
    }));
    return out.length ? out : null;
}
const hasSession = arr => Array.isArray(arr) && need.every(k => arr.some(c => c.key === k));
module.exports = { normalize, hasSession };
