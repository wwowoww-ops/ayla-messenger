// توافق: يختار شخصين عشوائيين من المجموعة ويرسم صورة نيونية يتغير لونها مع نسبة الحب
const img = require("../../lib/img");
const { compat } = require("../../lib/cards");
const { pick, hash } = require("../../lib/util");
module.exports = {
    name: "توافق", aliases: ["ship"], level: 0, category: "pic", scope: "group", cooldown: 10,
    description: "يختار شخصين عشوائيين ويعرض نسبة التوافق بينهما بصورة", usage: "توافق",
    async run(ctx) {
        const botId = String(ctx.api.getCurrentUserID());
        const info = await ctx.api.getThreadInfo(String(ctx.event.threadID)).catch(() => null);
        const pool = ((info && info.participantIDs) || []).map(String).filter(id => id !== botId);
        if (pool.length < 2) return ctx.reply("أحتاج شخصين على الأقل في المجموعة.");
        const a = pick(pool), b = pick(pool.filter(x => x !== a));
        const [na, nb] = await Promise.all([ctx.nameOf(a), ctx.nameOf(b)]);
        const pct = hash([a, b].sort().join("-")) % 101;
        const [ia, ib] = await Promise.all([img.avatar(ctx.api, a, na, 400), img.avatar(ctx.api, b, nb, 400)]);
        const verdict = pct >= 90 ? "💖 توأم الروح!" : pct >= 75 ? "❤️ توافق رائع!" : pct >= 50 ? "💕 توافق جيد" : pct >= 25 ? "🙂 مجرد أصدقاء" : "💔 لا أمل يُذكر";
        const h = ctx.hdr(ctx.mention(["💘 قياس التوافق\n👤 ", { id: a, name: na }, "\n💞 ", { id: b, name: nb }, "\n❤️ نسبة التوافق:\n" + pct + "%\n" + verdict + "\n✦ المطور: أبو هريرة"]));
        return img.sendImage(ctx.api, await compat([ia, ib], pct), h.body, ctx.event.threadID, ctx.event.messageID, h.mentions);
    }
};
