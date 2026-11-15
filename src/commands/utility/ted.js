// تيد: معلومات المجموعة (الاسم، المعرّف، العدد) مع صورتها إن وُجدت
const fs = require("fs");
const os = require("os");
const path = require("path");
const img = require("../../lib/img");
const { HEADER } = require("../../lib/util");
module.exports = {
    name: "تيد", aliases: ["ted"], level: 0, scope: "group", cooldown: 5,
    description: "عرض معلومات المجموعة", usage: "تيد",
    async run(ctx) {
        const tid = String(ctx.event.threadID);
        let i; try { i = await ctx.api.getThreadInfo(tid); } catch (e) { i = null; }
        if (!i) return ctx.reply(HEADER + "\n\nتعذر الحصول على معلومات المجموعة.");
        const members = Array.isArray(i.participantIDs) ? i.participantIDs.length : (Array.isArray(i.userInfo) ? i.userInfo.length : 0);
        const body = HEADER + "\n\nاسم المجموعة: " + (i.threadName || i.name || "بدون اسم") + "\nآيدي المجموعة: " + tid + "\nعدد الأعضاء: " + members;
        const url = i.imageSrc || i.threadPic || i.image;
        if (!url) return ctx.reply(body);
        try {
            const buf = await img.fetchBuf(url);
            return await img.sendImage(ctx.api, buf, body, tid, ctx.event.messageID);
        } catch (e) { return ctx.reply(body); }
    }
};
