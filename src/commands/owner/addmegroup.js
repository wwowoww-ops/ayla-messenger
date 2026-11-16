// ضيفني: المجموعات التي فيها البوت وأنت لست فيها؛ ردّ برقم لإضافتك
const OL = require("../../lib/ownerlists");
const L = "━━━━━━━━━━━━━━━━━━", MAX = 40;
module.exports = {
    name: "ضيفني", aliases: ["addme"], level: 2, cooldown: 10,
    description: "عرض المجموعات التي لستَ فيها وإضافتك إلى واحدة منها (بالرد برقمها)", usage: "ضيفني",
    async run(ctx) {
        const me = String(ctx.event.senderID);
        let all; try { all = (await OL.getList(ctx.api, ["INBOX"], 100)).filter(t => t && t.isGroup); } catch (e) { return ctx.reply("❌ تعذّر جلب المجموعات الآن\n↳ حاول بعد قليل."); }
        const out = all.filter(t => Array.isArray(t.participantIDs) && !t.participantIDs.map(String).includes(me));
        if (!out.length) return ctx.reply("✅ أنت موجود في جميع مجموعات البوت (" + all.length + ").");
        const items = out.slice(0, MAX).map(t => ({ id: String(t.threadID), name: OL.name(t), members: t.participantIDs.length }));
        const rows = items.map((g, i) => (i + 1) + ". " + g.name + "\n   🆔 " + g.id + "\n   👥 " + g.members + " عضو").join("\n");
        const info = await ctx.reply("📋 مجموعات لستَ فيها (" + items.length + ")\n" + L + "\n" + rows + "\n" + L + "\n💬 ردّ على هذه الرسالة برقم المجموعة لإضافتك إليها.");
        OL.remember(OL.idOf(info), "addme", items, me);
    }
};
