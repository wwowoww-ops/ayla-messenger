// صلاحيات مركزية: 2 = مطوّر، 1 = أدمن المجموعة، 0 = الجميع
const cfg = require("./config");

const adminCache = new Map();         // threadID -> { at, ids:Set }
const TTL = 5 * 60 * 1000;

const isOwner = id => cfg.owners.includes(String(id));

async function threadAdmins(api, threadID, force) {
    const c = adminCache.get(threadID);
    if (!force && c && Date.now() - c.at < TTL) return c.ids;
    try {
        const info = await api.getThreadInfo(threadID);
        const ids = new Set((info.adminIDs || []).map(a => String(a.id || a)));
        adminCache.set(threadID, { at: Date.now(), ids, info });
        return ids;
    } catch (e) {
        return c ? c.ids : new Set();
    }
}

async function levelOf(api, event) {
    const id = String(event.senderID);
    if (isOwner(id)) return 2;
    if (!event.isGroup) return 0;
    return (await threadAdmins(api, String(event.threadID))).has(id) ? 1 : 0;
}

async function botIsAdmin(api, threadID) {
    const me = String(api.getCurrentUserID());
    return (await threadAdmins(api, String(threadID))).has(me);
}

const invalidate = threadID => adminCache.delete(String(threadID));

module.exports = { isOwner, levelOf, threadAdmins, botIsAdmin, invalidate };
