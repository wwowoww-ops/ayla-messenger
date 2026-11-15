// موزّع واحد لكل الرسائل والأحداث. مراحل بترتيب ثابت (لا ازدواج تنفيذ):
// تجاهل ذاتي ← منع تكرار ← حظر ← وضع المطوّر ← تقييد ← خطّافات الرسائل (كتم/ذكاء) ← بادئة وأمر ← صلاحية ← تبريد ← تنفيذ
const cfg = require("./config");
const store = require("./store");
const perms = require("./perms");
const loader = require("./loader");
const { norm, lev, send, withMentions } = require("../lib/util");
const T = require("../lib/target");
const safety = require("../lib/safety");
const ui = require("../lib/ui");

const seen = new Set();                 // منع معالجة نفس الرسالة مرتين
const cool = new Map();                 // userId:cmd -> وقت
const prefixOf = threadID => store.get("prefix:" + threadID, cfg.prefix);

function dedupe(id) {
    if (!id) return false;
    if (seen.has(id)) return true;
    seen.add(id);
    if (seen.size > 3000) seen.delete(seen.values().next().value);
    return false;
}

// إحصائيات الاستعمال لأمر ابتايم
function track(threadID, sid) {
    const st = store.get("stats", null) || { cmds: 0, threads: {}, users: {} };
    st.cmds++;
    st.threads[threadID] = 1;
    st.users[sid] = 1;
    store.set("stats", st);
}
function makeCtx(api, event, extra) {
    const threadID = String(event.threadID);
    const ctx = Object.assign({
        api, event, cfg, store, perms, loader,
        args: [], rest: "", level: 0,
        send: (m, to) => send(api, m, to || threadID),
        reply: m => send(api, m, threadID, event.messageID),
        react: e => { try { api.setMessageReaction(e, event.messageID, () => {}, true); } catch (x) { /* لا شيء */ } },
        mention: withMentions,
        target: () => T.getTarget(api, event, ctx.args),
        targets: () => T.getTargets(api, event, ctx.args),
        nameOf: id => T.nameOf(api, id),
        text: () => T.textWithoutTags(ctx.args, event),
        prefix: prefixOf(threadID),
        isOwner: perms.isOwner(event.senderID)
    }, extra || {});
    return ctx;
}

async function handleMessage(api, event) {
    const sid = String(event.senderID || "");
    if (!sid || sid === String(api.getCurrentUserID())) return;
    if (dedupe("m:" + event.messageID)) return;
    const body = String(event.body || "");
    if (!body && !(event.attachments && event.attachments.length)) return;
    const threadID = String(event.threadID);
    const owner = perms.isOwner(sid);

    // حظر
    if (!owner && (store.get("ban:u:" + sid) || store.get("ban:t:" + threadID))) return;
    // وضع المطوّر فقط
    if (!owner && store.get("ownerMode")) return;

    const ctx = makeCtx(api, event);
    // تقييد البوت للأدمن
    if (!owner && store.get("restrict:" + threadID)) {
        ctx.level = await perms.levelOf(api, event);
        if (ctx.level < 1) return;
    }

    // أمر ببادئة؟
    const prefix = ctx.prefix;
    const prefixed = prefix && body.startsWith(prefix);
    let cmd = null, name = "";
    if (prefixed) {
        const parts = body.slice(prefix.length).trim().split(/\s+/);
        name = parts.shift() || "";
        ctx.args = parts;
        ctx.rest = parts.join(" ");
        cmd = loader.commands.get(norm(name)) || null;
    }

    // خطّافات "pre" تعمل على كل الرسالة (مثل الكتم) قبل أي أمر؛ وبقية الخطّافات (آيلا...) تعمل فقط حين لا يوجد أمر
    for (const h of loader.hooks) {
        if (!h.pre) continue;
        try { if ((await h.onMessage(ctx, { prefixed, name, cmd })) === true) return; } catch (e) { console.error("[hook " + h.name + "]", e && e.message); }
    }
    if (!cmd) {
        for (const h of loader.hooks) {
            if (h.pre) continue;
            try { if ((await h.onMessage(ctx, { prefixed, name })) === true) return; }
            catch (e) { console.error("[hook " + h.name + "]", e && e.message); }
        }
        if (prefixed && name) {
            const best = [...loader.commands.keys()].map(k => [k, lev(k, norm(name))]).sort((a, b) => a[1] - b[1])[0];
            if (best && best[1] <= Math.max(1, Math.floor(norm(name).length / 3))) ctx.reply(ui.withHeader("❓ أمر غير معروف: «" + name + "»\n↳ هل تقصد: «" + loader.commands.get(best[0]).name + "»؟\n↳ اكتب " + prefix + "اوامر لعرض كل الأوامر.", "default"));
        }
        return;
    }

    // هيدر لكل رد من أي أمر + إحصائيات الاستعمال
    const cat = cmd.category;
    ctx.send = (m, to) => send(api, ui.withHeader(m, cat), to || threadID);
    ctx.reply = m => send(api, ui.withHeader(m, cat), threadID, event.messageID);
    ctx.hdr = m => ui.withHeader(m, cat);

    if (cmd.scope === "group" && !event.isGroup) return ctx.reply("👥 هذا الأمر يعمل داخل المجموعات فقط.");
    if (cmd.scope === "private" && event.isGroup) return ctx.reply("💬 هذا الأمر يعمل في المحادثة الخاصة فقط.");

    ctx.level = ctx.level || (cmd.level > 0 || owner ? await perms.levelOf(api, event) : 0);
    if (cmd.level > ctx.level) return ctx.reply(cmd.level === 2 ? "🔐 هذا الأمر مخصّص للمطوّر فقط." : "🛡️ هذا الأمر مخصّص لأدمن المجموعة فقط.");

    // تبريد
    const key = sid + ":" + cmd.name;
    const now = Date.now();
    if (!owner && !safety.FAST && cmd.cooldown > 0 && now - (cool.get(key) || 0) < cmd.cooldown * 1000) { ctx.react("⏳"); return; }
    cool.set(key, now);
    if (cool.size > 5000) cool.clear();

    try { track(threadID, sid); await cmd.run(ctx); }
    catch (e) {
        console.error("[cmd " + cmd.name + "]", e && (e.stack || e.message));
        ctx.reply("⚠️ حدث خطأ أثناء تنفيذ الأمر «" + cmd.name + "»\n↳ حاول مرة أخرى بعد قليل، وإن تكرر أخبر المطوّر.");
    }
}

async function handleEventType(api, event) {
    const type = event.logMessageType || event.type;
    for (const m of loader.events) {
        if (!m.types.includes(type)) continue;
        try { const c = makeCtx(api, event); c.send = (msg, to) => send(api, ui.withHeader(msg, m.category || "default"), to || String(event.threadID)); await m.onEvent(c, event); }
        catch (e) { console.error("[event " + m.name + "]", e && e.message); }
    }
}

function dispatch(api, event) {
    if (!event) return;
    const t = event.type;
    if (t === "message" || t === "message_reply") return handleMessage(api, event).catch(e => console.error("[dispatch]", e && e.message));
    if (t === "event" || t === "message_unsend") return handleEventType(api, event).catch(e => console.error("[dispatch event]", e && e.message));
}

module.exports = { dispatch, makeCtx, prefixOf };
