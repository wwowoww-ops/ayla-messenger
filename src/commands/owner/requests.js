// طلبات: المجموعات التي أُضيف إليها البوت وهي في صندوق الطلبات؛ ردّ بـ: قبول N / رفض N
const OL = require("../../lib/ownerlists");
const L = "━━━━━━━━━━━━━━━━━━";
module.exports = {
    name: "طلبات", aliases: ["requests"], level: 2, cooldown: 10,
    description: "عرض طلبات المجموعات المعلّقة وقبولها أو رفضها (بالرد على القائمة)", usage: "طلبات",
    async run(ctx) {
        let all = [];
        for (const tag of ["PENDING", "OTHER"]) { try { all = all.concat(await OL.getList(ctx.api, [tag], 50)); } catch (e) { /* التالي */ } }
        const seen = new Set(), items = [];
        for (const t of all) { if (!t || !t.threadID || seen.has(String(t.threadID))) continue; seen.add(String(t.threadID)); items.push({ id: String(t.threadID), name: OL.name(t), group: !!t.isGroup, members: Array.isArray(t.participantIDs) ? t.participantIDs.length : "؟" }); }
        const list = items.slice(0, 30);
        if (!list.length) return ctx.reply("📭 لا توجد طلبات معلّقة الآن.");
        const rows = list.map((g, i) => "【 " + (i + 1) + " 】 " + g.name + "\n🆔 " + g.id + "\n" + (g.group ? "👥 مجموعة · " + g.members + " عضو" : "💬 محادثة خاصة")).join("\n" + L + "\n");
        const info = await ctx.reply("📥 الطلبات المعلّقة (" + list.length + ")\n" + L + "\n" + rows + "\n" + L + "\n💬 ردّ على هذه الرسالة بـ:\n↳ قبول N (أو عدة أرقام: قبول 1 2 3)\n↳ رفض N (يغادر البوت المجموعة)");
        OL.remember(OL.idOf(info), "requests", list, ctx.event.senderID);
    }
};
