
"use strict";

const img = require("../../lib/img");
const { compat } = require("../../lib/cards");
const { pick, hash } = require("../../lib/util");

module.exports = {
    name: "توافق",
    aliases: ["ship"],
    level: 0,
    category: "pic",
    scope: "group",
    cooldown: 10,
    description: "يقيس نسبة التوافق بينك وبين شخص عشوائي",
    usage: "توافق",

    async run(ctx) {
        const botId = String(ctx.api.getCurrentUserID());
        const senderId = String(ctx.event.senderID);
        const threadID = String(ctx.event.threadID);

        const info = await ctx.api.getThreadInfo(threadID).catch(() => null);

        const pool = ((info && info.participantIDs) || [])
            .map(String)
            .filter(id => id !== botId && id !== senderId);

        if (!pool.length)
            return ctx.reply("أحتاج شخصاً آخر على الأقل في المجموعة.");

        // الأول صاحب الأمر، والثاني عشوائي
        const a = senderId;
        const b = pick(pool);

        const [na, nb] = await Promise.all([
            ctx.nameOf(a),
            ctx.nameOf(b)
        ]);

        const pct = hash([a, b].sort().join("-")) % 101;

        const [ia, ib] = await Promise.all([
            img.avatar(ctx.api, a, na, 512),
            img.avatar(ctx.api, b, nb, 512)
        ]);

        const h = ctx.hdr(
            ctx.mention([
                "💘 قياس التوافق\n👤 ",
                { id: a, name: na },
                "\n💞 ",
                { id: b, name: nb },
                "\n❤️ نسبة التوافق: ",
                pct + "%",
                "\n✦ آيلا"
            ])
        );

        const result = await compat([ia, ib], pct);

        return img.sendImage(
            ctx.api,
            result,
            h.body,
            threadID,
            ctx.event.messageID,
            h.mentions
        );
    }
};
