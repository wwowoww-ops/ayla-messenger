// معالجة ردود المطوّر على قوائم لاست / ضيفني / طلبات
const OL = require("../lib/ownerlists");
const ui = require("../lib/ui");
const { send, sleep } = require("../lib/util");
const rm = (api, uid, tid) => new Promise((res, rej) => api.removeUserFromGroup(String(uid), String(tid), e => e ? rej(e) : res()));
const add = (api, uid, tid) => new Promise((res, rej) => api.addUserToGroup(String(uid), String(tid), e => e ? rej(e) : res()));
module.exports = {
    name: "owner-lists", order: 6,
    async onMessage(ctx) {
        const e = ctx.event, rep = e.messageReply;
        if (!rep || !rep.messageID) return false;
        const m = OL.get(rep.messageID);
        if (!m) return false;
        if (String(e.senderID) !== m.author || !ctx.perms.isOwner(e.senderID)) return false;
        const body = String(e.body || "").replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).trim();
        if (!body) return false;
        const say = t => send(ctx.api, ui.withHeader(t, "owner"), e.threadID, e.messageID);
        const parts = body.split(/\s+/), word = parts[0].replace(/_/g, ""), nums = (m.kind === "addme" ? parts : parts.slice(1)).map(Number).filter(n => Number.isInteger(n) && n > 0);
        const items = nums.map(n => m.items[n - 1]);
        const bad = () => say("⚠️ رد غير صحيح\n↳ " + ({ last: "حظر N | الغاء_حظر N | خروج N", addme: "اكتب رقم المجموعة فقط", requests: "قبول N | رفض N" })[m.kind]);
        if (!nums.length || items.some(x => !x)) { await bad(); return true; }
        const lines = [];
        if (m.kind === "last") {
            const g = items[0], n = nums[0];
            if (/^(حظر)$/.test(word)) { ctx.store.set("ban:t:" + g.id, true); lines.push("🚫 تم حظر المجموعة: " + g.name); }
            else if (/^(الغاءحظر|فكحظر)$/.test(word)) { ctx.store.del("ban:t:" + g.id); lines.push("✅ تم إلغاء حظر: " + g.name); }
            else if (/^(خروج|غادر)$/.test(word)) { try { await rm(ctx.api, ctx.api.getCurrentUserID(), g.id); lines.push("👋 غادرتُ المجموعة: " + g.name); } catch (er) { lines.push("❌ فشل الخروج من " + g.name + "\n↳ " + ((er && er.message) || "خطأ غير معروف")); } }
            else { await bad(); return true; }
        } else if (m.kind === "addme") {
            const g = items[0];
            try { await add(ctx.api, e.senderID, g.id); lines.push("✅ تمت إضافتك إلى: " + g.name + "\n🆔 " + g.id); } catch (er) { lines.push("❌ فشلت الإضافة إلى " + g.name + "\n↳ " + ((er && er.message) || "خطأ غير معروف")); }
        } else { // requests
            const ok = /^(قبول|اوافق|موافق)$/.test(word), no = /^(رفض|ارفض)$/.test(word);
            if (!ok && !no) { await bad(); return true; }
            let acc = 0, rej = 0, fail = 0;
            for (const g of items.slice(0, 10)) {
                try {
                    if (ok) { await send(ctx.api, "🌸 تم قبول المجموعة، أهلًا بكم!\n↳ اكتبوا «" + (ctx.prefix || "") + "اوامر» لقائمة الأوامر.", g.id); acc++; lines.push("✅ قُبلت: " + g.name); }
                    else { await send(ctx.api, "❌ تم رفض طلب المجموعة، سأغادر الآن.", g.id); await rm(ctx.api, ctx.api.getCurrentUserID(), g.id); rej++; lines.push("🚪 رُفضت: " + g.name); }
                } catch (er) { fail++; lines.push("⚠️ فشلت المعالجة: " + g.name); }
                await sleep(process.env.AYLA_TEST ? 0 : 2500);
            }
            lines.push("━━━━━━━━━━━━━━━━━━\n📊 مقبول: " + acc + " · مرفوض: " + rej + " · فشل: " + fail);
        }
        await say(lines.join("\n"));
        return true;
    }
};
