// تلميح لجنس المستخدم من بيانات فيسبوك إن توفّرت (يُعامَل كتلميح لا كحقيقة)
const cache = new Map();
async function guessGender(api, uid) {
    uid = String(uid);
    if (cache.has(uid)) return cache.get(uid);
    let g = "";
    try {
        const info = await api.getUserInfo(uid);
        const u = info && (info[uid] || info);
        const v = u && (u.gender !== undefined ? u.gender : u.sex);
        if (v === 1 || v === "1" || /female|أنثى|انثى/i.test(String(v))) g = "أنثى";
        else if (v === 2 || v === "2" || /^male$|ذكر/i.test(String(v))) g = "ذكر";
    } catch (e) { /* لا شيء */ }
    cache.set(uid, g); if (cache.size > 3000) cache.delete(cache.keys().next().value);
    return g;
}
module.exports = { guessGender };
