// تخزين بسيط: ذاكرة + حفظ مؤجَّل. Postgres إن وُجد DATABASE_URL، وإلا data/store.json
const fs = require("fs");
const path = require("path");
const cfg = require("./config");

const FILE = path.join(__dirname, "..", "..", "data", "store.json");
const mem = new Map();
const dirty = new Set();
let pool = null;
let timer = null;

async function init() {
    if (cfg.databaseUrl) {
        try {
            const { Pool } = require("pg");
            pool = new Pool({ connectionString: cfg.databaseUrl, ssl: { rejectUnauthorized: false }, max: 3 });
            pool.on("error", e => console.error("[store] pg:", e.message));
            await pool.query("CREATE TABLE IF NOT EXISTS ayla_fb_kv (k TEXT PRIMARY KEY, v JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW())");
            const r = await pool.query("SELECT k, v FROM ayla_fb_kv");
            r.rows.forEach(x => mem.set(x.k, x.v));
            console.log("[store] Postgres: " + r.rows.length + " مفتاح");
            return;
        } catch (e) { console.error("[store] تعذّر Postgres، سأستعمل الملف:", e.message); pool = null; }
    }
    try {
        const o = JSON.parse(fs.readFileSync(FILE, "utf8"));
        Object.keys(o).forEach(k => mem.set(k, o[k]));
    } catch (e) { /* ملف غير موجود */ }
}

const get = (k, def) => (mem.has(k) ? mem.get(k) : def);
function set(k, v) { mem.set(k, v); dirty.add(k); schedule(); return v; }
function del(k) { mem.delete(k); dirty.add(k); schedule(); }
function schedule() { if (!timer) timer = setTimeout(flush, 2000); }

async function flush() {
    timer = null;
    if (!dirty.size) return;
    const keys = [...dirty]; dirty.clear();
    try {
        if (pool) {
            for (const k of keys) {
                if (mem.has(k)) await pool.query("INSERT INTO ayla_fb_kv (k,v,updated_at) VALUES ($1,$2::jsonb,NOW()) ON CONFLICT (k) DO UPDATE SET v=EXCLUDED.v, updated_at=NOW()", [k, JSON.stringify(mem.get(k))]);
                else await pool.query("DELETE FROM ayla_fb_kv WHERE k=$1", [k]);
            }
        } else {
            fs.mkdirSync(path.dirname(FILE), { recursive: true });
            const tmp = FILE + ".tmp";
            fs.writeFileSync(tmp, JSON.stringify(Object.fromEntries(mem)));
            fs.renameSync(tmp, FILE);
        }
    } catch (e) { keys.forEach(k => dirty.add(k)); console.error("[store] flush:", e.message); schedule(); }
}
process.on("beforeExit", () => { flush(); });

module.exports = { init, get, set, del, flush };
