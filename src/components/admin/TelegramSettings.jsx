import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Save, Check, Loader2, Bell, AlertCircle } from "lucide-react";

const FIELDS = [
  { key: "telegram_bot_token", label: "Bot token", type: "password", placeholder: "123456:ABC-..." },
  { key: "telegram_chat_id", label: "Chat ID", placeholder: "-1001234567890" },
  { key: "telegram_thread_id", label: "Thread ID (optional)", placeholder: "12" },
];

export default function TelegramSettings() {
  const [values, setValues] = useState({});
  const [ids, setIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [test, setTest] = useState(null);
  const [logs, setLogs] = useState([]);

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.PlatformSetting.filter({ category: "ops" });
      const v = {}, idm = {};
      (list || []).forEach((s) => { v[s.key] = s.value || ""; idm[s.key] = s.id; });
      setValues(v); setIds(idm);
      setLogs((await base44.entities.TelegramAlert.list("-created_date", 8).catch(() => [])) || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true); setSaved(false); setTest(null);
    try {
      for (const f of FIELDS) {
        const val = (values[f.key] || "").trim();
        if (ids[f.key]) await base44.entities.PlatformSetting.update(ids[f.key], { value: val });
        else if (val) {
          const r = await base44.entities.PlatformSetting.create({ key: f.key, value: val, category: "ops" });
          setIds((p) => ({ ...p, [f.key]: r.id }));
        }
      }
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { setTest({ ok: false, text: e.message || "Save failed" }); }
    finally { setSaving(false); }
  };

  const sendTest = async () => {
    setTesting(true); setTest(null);
    try {
      const res = await base44.functions.invoke("sendTelegramAlert", {
        event: "system",
        title: "TOLS test alert",
        message: "Telegram monitoring is configured correctly.",
      });
      setTest({ ok: res.data?.ok, text: res.data?.status || "sent" });
      await load();
    } catch (e) {
      setTest({ ok: false, text: e.message || "Test failed" });
    } finally { setTesting(false); }
  };

  const statusStyle = (s) =>
    s === "sent" ? "text-lime border-lime/30 bg-lime/10"
    : s === "failed" ? "text-red-300 border-red-500/30 bg-red-500/10"
    : s === "unconfigured" ? "text-amber-300 border-amber-500/30 bg-amber-500/10"
    : "text-white/60 border-white/10 bg-white/5";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-lime/10 grid place-items-center"><Bell className="w-5 h-5 text-lime" /></div>
        <div>
          <h3 className="font-bold text-white">Telegram monitoring</h3>
          <p className="text-xs text-white/40">Operational alerts for registrations, deposits and withdrawals.</p>
        </div>
      </div>

      {loading ? <div className="h-24 rounded-xl bg-white/5 animate-pulse" /> : (
        <div className="grid sm:grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">{f.label}</label>
              <input
                type={f.type || "text"}
                value={values[f.key] || ""}
                onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full h-11 mt-1.5 rounded-xl bg-[#1a1a1a] border border-white/10 px-3 text-sm font-mono text-white outline-none focus:border-lime/40 placeholder-white/20"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white/80 hover:text-white disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-lime" /> : <Save className="w-4 h-4" />} Save
        </button>
        <button onClick={sendTest} disabled={testing} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-lime text-black text-sm font-black hover:brightness-110 disabled:opacity-50">
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send test alert
        </button>
        {test && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${test.ok ? "text-lime border-lime/30 bg-lime/10" : "text-red-300 border-red-500/30 bg-red-500/10"}`}>{test.text}</span>
        )}
      </div>

      {logs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Recent alerts</p>
          <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-hide">
            {logs.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 rounded-lg bg-[#0a0a0a] border border-white/5 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{l.title}</p>
                  <p className="text-[11px] text-white/40 truncate">{l.message}</p>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${statusStyle(l.status)}`}>{l.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="flex items-start gap-1.5 text-[11px] text-white/30">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        Create a bot with @BotFather, add it to your channel/group, and paste the token + chat id. Every alert is also written to the audit log.
      </p>
    </div>
  );
}
