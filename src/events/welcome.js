// ترحيب بالأعضاء الجدد وتحية عند إضافة البوت لمجموعة. يُعطَّل بالأمر: ترحيب ايقاف
const { isOn } = require("../lib/toggle");
const L = "━━━━━━━━━━━━━━━━━━";
const NICK = "AYLA | 🌸";
module.exports = {
    name: "welcome", types: ["log:subscribe"],
    async onEvent(ctx, event) {
        const { api, store } = ctx;
        const threadID = String(event.threadID);
        const added = (event.logMessageData && event.logMessageData.addedParticipants) || [];
        if (!added.length) return;
        const me = String(api.getCurrentUserID()), p = ctx.prefix || "";
        if (added.some(x => String(x.userFbId) === me)) { // دخلتُ المجموعة: أغيّر كنيتي (حتى لو الترحيب متوقف)
            await new Promise(r => setTimeout(r, process.env.AYLA_TEST ? 0 : 2500));
            await new Promise(res => { try { api.changeNickname(NICK, threadID, me, () => res()); } catch (e) { res(); } });
        }
        if (!isOn(store, "welcome", threadID, true)) return;
        const info = await api.getThreadInfo(threadID).catch(() => null);
        const gname = (info && (info.threadName || info.name)) || "هذه المجموعة";
        const count = info && Array.isArray(info.participantIDs) ? info.participantIDs.length : 0;
        if (added.some(x => String(x.userFbId) === me)) {
            return ctx.send("🌸 أهلًا بالجميع، أنا آيلا\n" + L + "\n🏡 المجموعة: " + gname + (count ? "\n👥 عدد الأعضاء: " + count : "") +
                "\n" + L + "\n📜 اكتبوا «" + p + "اوامر» لتشوفوا قائمة الأوامر\n💬 ناديوني «آيلا» أو ردّوا على رسالتي وأتكلم معكم\n🛡️ لإدارة أفضل اجعلوني أدمن في المجموعة\n" + L + "\n✨ سعيدة بوجودي معكم!");
        }
        const rules = store.get("rules:" + threadID), rulesText = rules && rules.text ? "\n📜 قوانين المجموعة:\n" + rules.text + "\n" + L : "";
        const names = added.flatMap((x, i) => (i ? ["، "] : []).concat([{ id: String(x.userFbId), name: (x.fullName || "عضو").split(" ")[0] }]));
        return ctx.send(ctx.mention(["🌸 أهلًا وسهلًا ", ...names, "\n" + L + "\n🏡 نورتم مجموعة «" + gname + "»" + (count ? "\n👥 عدد الأعضاء الآن: " + count : "") +
            "\n" + L + "\n📌 تعرّفوا على بعض والتزموا بالاحترام المتبادل\n📜 اكتبوا «" + p + "اوامر» لقائمة الأوامر\n" + L + rulesText + "\n💞 نتمنى لكم وقتًا ممتعًا معنا!"]));
    }
};
