// قوائم المطوّر التفاعلية (لاست / ضيفني / طلبات): نتذكر القائمة لكل رسالة ثم نعالج ردّ المطوّر عليها
const lists = new Map(); // messageID -> {kind, items, author, at}
const remember = (id, kind, items, author) => { if (!id) return; lists.set(String(id), { kind, items, author: String(author), at: Date.now() }); if (lists.size > 50) lists.delete(lists.keys().next().value); };
const get = id => { const m = lists.get(String(id)); return m && Date.now() - m.at < 60 * 60 * 1000 ? m : null; };
const getList = (api, tags, limit) => new Promise((res, rej) => api.getThreadList(limit || 100, null, tags, (e, l) => e ? rej(e) : res(l || [])));
const name = t => String(t.name || t.threadName || "").trim() || "بدون اسم";
const idOf = r => r && (r.messageID || r.messageId);
module.exports = { remember, get, getList, name, idOf };
