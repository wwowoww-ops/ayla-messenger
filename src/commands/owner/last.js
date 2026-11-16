// لاست: قائمة المجموعات التي فيها البوت مع الحظر والخروج (ردّ بـ: حظر N / الغاء_حظر N / خروج N)
const OL = require("../../lib/ownerlists");
const L = "━━━━━━━━━━━━━━━━━━", MAX = 40;
module.exports = {
    name: "لاست", aliases: ["last", "المجموعات"], level: 2, cooldown: 8,
    description: "عرض مجموعات البوت وحظرها أو الخروج منها (بالرد على القائمة)", usage: "لاست",
    async run(ctx) {
        let all; try { all = (await OL.getList(ctx.api, ["INBOX"], 100)).filter(t => t && t.isGroup); } catch (e) { return ctx.reply("❌ تعذّر جلب المجموعات الآن\n↳ حاول بعد قليل."); }
        if (!all.length) return ctx.reply("📭 لا توجد مجموعات.");
        const items = all.slice(0, MAX).map(t => ({ id: String(t.threadID), name: OL.name(t), members: Array.isArray(t.participantIDs) ? t.participantIDs.length : "؟" }));
        const rows = items.map((g, i) => "【 " + (i + 1) + " 】 " + g.name + "\n🆔 " + g.id + "\n👥 " + g.members + " عضو" + (ctx.store.get("ban:t:" + g.id) ? "\n🚫 محظورة" : "")).join("\n" + L + "\n");
        const info = await ctx.reply("📋 مجموعات البوت (" + items.length + (all.length > MAX ? " من " + all.length : "") + ")\n" + L + "\n" + rows + "\n" + L + "\n💬 ردّ على هذه الرسالة بـ:\n↳ حظر N\n↳ الغاء_حظر N\n↳ خروج N");
        OL.remember(OL.idOf(info), "last", items, ctx.event.senderID);
    }
};
