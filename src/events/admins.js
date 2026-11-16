// عند تغيّر الأدمن في مجموعة نمسح ذاكرة الصلاحيات حتى تُقرأ الحالة الجديدة فورًا
const perms = require("../core/perms");
module.exports = {
    name: "admins", types: ["log:thread-admins"],
    async onEvent(ctx, event) { perms.invalidate(String(event.threadID)); }
};
