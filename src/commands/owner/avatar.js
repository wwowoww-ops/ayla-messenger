// بروفايلك: ردّ على صورة (أو أرسلها مع الأمر) فيغيّر البوت صورة حسابه إليها. للمطوّر فقط.
const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp");
const img = require("../../lib/img");
const urlOf = a => a && (a.hiresUrl || a.largePreviewUrl || a.url || a.previewUrl || a.thumbnailUrl || a.src);
const isPic = a => a && (/photo|image/i.test(String(a.type || "")) || /\.(jpe?g|png|webp)(\?|$)/i.test(String(urlOf(a) || "")));
module.exports = {
    name: "بروفايلك", aliases: ["صورة_البوت", "setavatar"], level: 2, cooldown: 30,
    description: "تغيير صورة حساب البوت إلى الصورة التي تردّ عليها", usage: "بروفايلك (بالرد على صورة)",
    async run(ctx) {
        const rep = ctx.event.messageReply;
        const atts = [].concat((rep && rep.attachments) || [], ctx.event.attachments || []).filter(isPic);
        if (!atts.length) return ctx.reply("❌ لا توجد صورة\n↳ ردّ على صورة بالأمر " + ctx.prefix + "بروفايلك\n↳ أو أرسل الصورة مع كتابة الأمر في تعليقها.");
        let buf;
        try { buf = await img.fetchBuf(urlOf(atts[0]), 30000); await sharp(buf).metadata(); }
        catch (e) { return ctx.reply("❌ تعذّر تحميل الصورة\n↳ جرّب صورة أخرى أو أعد إرسالها."); }
        const file = path.join(os.tmpdir(), "ayla_avatar_" + Date.now() + ".jpg");
        try {
            // مربّعة وبحجم مناسب للبروفايل
            fs.writeFileSync(file, await sharp(buf).rotate().resize(1080, 1080, { fit: "cover" }).jpeg({ quality: 92 }).toBuffer());
            if (typeof ctx.api.changeAvatar !== "function") return ctx.reply("❌ المكتبة الحالية لا تدعم تغيير الصورة.");
            const stream = fs.createReadStream(file); stream.on("error", () => {});
            await new Promise((res, rej) => ctx.api.changeAvatar(stream, "", null, e => e ? rej(e) : res()));
            return ctx.reply("✅ تم تغيير صورة البوت\n↳ قد تحتاج دقائق حتى تظهر في كل مكان.\n↳ لا تكرر التغيير كثيرًا حتى لا يلفت الحساب انتباه فيسبوك.");
        } catch (e) {
            console.error("[بروفايلك]", e && (e.message || e.error || e));
            return ctx.reply("❌ فشل تغيير الصورة\n↳ ربما رفض فيسبوك العملية من هذا الحساب أو الجلسة. جرّب لاحقًا.");
        } finally { fs.unlink(file, () => {}); }
    }
};
