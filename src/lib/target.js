// تحديد الشخص المستهدف: منشن، ثم رد على رسالة، ثم معرّف رقمي/رابط، ثم بحث بالاسم داخل المجموعة.
// يحل مشكلة «الأمر لا يقرأ المنشن»: يقبل كل أشكال mentions (Object/Map/Array) ولديه بدائل عند فراغها.
const { norm } = require("./util");

const names = new Map();          // uid -> name (كاش)

function mentionEntries(event) {
    const m = event && event.mentions;
    if (!m) return [];
    let out = [];
    if (m instanceof Map) out = [...m.entries()].map(([id, tag]) => ({ id: String(id), tag: String(tag || "") }));
    else if (Array.isArray(m)) out = m.map(x => ({ id: String(x.id || x.userID || x.i || ""), tag: String(x.tag || x.name || "") }));
    else if (typeof m === "object") out = Object.keys(m).map(id => ({ id: String(id), tag: String(m[id] && m[id].tag ? m[id].tag : m[id] || "") }));
    return out.filter(x => /^\d+$/.test(x.id));
}

async function nameOf(api, id) {
    id = String(id);
    if (names.has(id)) return names.get(id);
    try {
        const info = await api.getUserInfo(id);
        const u = info && (info[id] || info);
        const n = u && (u.name || u.fullName || u.firstName);
        if (n) { names.set(id, n); if (names.size > 3000) names.delete(names.keys().next().value); return n; }
    } catch (e) { /* لا شيء */ }
    return "عضو";
}

const idFromText = t => {
    t = String(t || "");
    const m = /(?:profile\.php\?id=|facebook\.com\/|fb\.com\/|^)(\d{8,})/.exec(t);
    return m ? m[1] : null;
};

// كل الأهداف المذكورة (منشن متعدد)
async function getTargets(api, event, args) {
    const me = String(api.getCurrentUserID());
    let list = mentionEntries(event);
    if (list.length > 1) list = list.filter(x => x.id !== me);      // تجاهل منشن البوت نفسه إن وُجد غيره
    const seen = new Set();
    const out = [];
    for (const x of list) if (!seen.has(x.id)) { seen.add(x.id); out.push({ id: x.id, name: x.tag.replace(/^@/, "").trim() || await nameOf(api, x.id), source: "mention" }); }
    return out;
}

async function getTarget(api, event, args) {
    args = args || [];
    const all = await getTargets(api, event, args);
    if (all.length) return all[0];

    const rep = event.messageReply;
    if (rep && rep.senderID) return { id: String(rep.senderID), name: await nameOf(api, rep.senderID), source: "reply" };

    for (const a of args) {
        const id = idFromText(a);
        if (id) return { id, name: await nameOf(api, id), source: "id" };
    }

    // بديل: ابحث بالاسم داخل المجموعة (مفيد حين يصل المنشن فارغًا)
    if (event.isGroup) {
        const words = args.map(a => norm(a.replace(/^@/, ""))).filter(w => w.length >= 2);
        const tagText = norm((event.body || "").replace(/^[^@]*@/, ""));
        if (words.length || tagText) {
            try {
                const info = await api.getThreadInfo(String(event.threadID));
                const people = (info.userInfo || []).map(u => ({ id: String(u.id), name: u.name || "" }));
                const hit = people.find(p => { const n = norm(p.name); return words.some(w => n.includes(w)) || (tagText && tagText.length >= 3 && n.startsWith(tagText.slice(0, 12))); });
                if (hit && hit.id !== String(api.getCurrentUserID())) { names.set(hit.id, hit.name); return { id: hit.id, name: hit.name, source: "name" }; }
            } catch (e) { /* لا شيء */ }
        }
    }
    return null;
}

// نص الرسالة بعد حذف كلمات المنشن (@الاسم) من args
function textWithoutTags(args, event) {
    const tags = mentionEntries(event).map(x => norm(x.tag.replace(/^@/, ""))).filter(Boolean);
    return (args || []).filter(a => {
        const n = norm(a.replace(/^@/, ""));
        if (a.startsWith("@")) return false;
        if (tags.some(t => t === n || t.split("_").includes(n))) return false;
        return !idFromText(a);
    }).join(" ");
}

module.exports = { getTarget, getTargets, nameOf, textWithoutTags, mentionEntries };
