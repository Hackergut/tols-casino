import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Clock, TrendingDown, Timer, DollarSign, Check, Ban, Trash2 } from "lucide-react";

const EXCLUDE = [
  { id: "24h", label: "24 hours", ms: 24 * 3600e3 },
  { id: "7d", label: "7 days", ms: 7 * 24 * 3600e3 },
  { id: "30d", label: "30 days", ms: 30 * 24 * 3600e3 },
  { id: "6m", label: "6 months", ms: 182 * 24 * 3600e3 },
  { id: "perm", label: "Permanent", ms: 100 * 365 * 24 * 3600e3 },
];
const PERIODS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

function fmtRemaining(ms) {
  if (ms <= 0) return "expired";
  const d = Math.floor(ms / 86400e3), h = Math.floor((ms % 86400e3) / 3600e3), m = Math.floor((ms % 3600e3) / 60e3);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ResponsibleGaming() {
  const [limits, setLimits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      const list = await base44.entities.ResponsibleLimit.filter({ created_by_id: me.id });
      setLimits(list || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, [load]);

  const exclusion = limits.find((l) => l.type === "self_exclusion" && l.active && l.exclude_until && new Date(l.exclude_until).getTime() > Date.now());
  const remaining = exclusion ? new Date(exclusion.exclude_until).getTime() - Date.now() : 0;
  const getLimit = (type) => limits.find((l) => l.type === type && l.active);

  const saveLimit = async (type, value, period) => {
    setBusy(type);
    try {
      const existing = limits.find((l) => l.type === type);
      const payload = { type, limit_value: Number(value) || 0, period: period || (existing?.period || "daily"), active: true };
      if (existing) await base44.entities.ResponsibleLimit.update(existing.id, payload);
      else await base44.entities.ResponsibleLimit.create(payload);
      await load();
    } finally { setBusy(null); }
  };

  const removeLimit = async (type) => {
    setBusy(type);
    const existing = limits.find((l) => l.type === type);
    if (existing) { await base44.entities.ResponsibleLimit.update(existing.id, { active: false }); await load(); }
    setBusy(null);
  };

  const selfExclude = async (ms) => {
    setBusy("self_exclusion");
    try {
      const existing = limits.find((l) => l.type === "self_exclusion" && l.active);
      const payload = { type: "self_exclusion", active: true, exclude_until: new Date(Date.now() + ms).toISOString(), period: "custom" };
      if (existing) await base44.entities.ResponsibleLimit.update(existing.id, payload);
      else await base44.entities.ResponsibleLimit.create(payload);
      await load();
    } finally { setBusy(null); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-white/10 border-t-lime rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-lime/10 flex items-center justify-center glow-lime"><Shield className="w-6 h-6 text-lime" /></div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Responsible <span className="text-lime">Gaming</span></h1>
            <p className="text-xs text-white/40">Set limits and self-exclusion to stay in control</p>
          </div>
        </div>

        {/* Self-exclusion status */}
        {exclusion ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
            <div className="flex items-center gap-2 text-red-300 font-bold"><Ban className="w-5 h-5" /> Self-exclusion active</div>
            <p className="mt-2 text-sm text-white/80">You are excluded from playing until <span className="font-bold text-white">{new Date(exclusion.exclude_until).toLocaleString()}</span>.</p>
            <p className="mt-1 text-2xl font-black text-red-300 flex items-center gap-2"><Clock className="w-5 h-5" /> {fmtRemaining(remaining)} remaining</p>
            <p className="text-xs text-white/50 mt-2">Self-exclusion cannot be lifted before it expires.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <h3 className="font-bold text-white flex items-center gap-2"><Ban className="w-4 h-4 text-lime" /> Self-exclusion</h3>
            <p className="text-sm text-white/50 mt-1 mb-4">Block yourself from playing for a chosen period. This cannot be reversed early.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {EXCLUDE.map((p) => (
                <button key={p.id} onClick={() => selfExclude(p.ms)} disabled={busy === "self_exclusion"} className="h-12 rounded-xl border border-white/10 bg-[#0d0d0d] text-sm font-bold text-white hover:border-lime/50 hover:text-lime transition disabled:opacity-50">
                  {busy === "self_exclusion" ? "…" : p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Limits */}
        <LimitCard icon={<DollarSign />} title="Deposit limit" desc="Max USDT you can deposit per period." type="deposit" limit={getLimit("deposit")} busy={busy} onSave={saveLimit} onRemove={removeLimit} />
        <LimitCard icon={<TrendingDown />} title="Loss limit" desc="Max USDT you can lose per period." type="loss" limit={getLimit("loss")} busy={busy} onSave={saveLimit} onRemove={removeLimit} />
        <LimitCard icon={<DollarSign />} title="Wager limit" desc="Max USDT you can wager per period." type="wager" limit={getLimit("wager")} busy={busy} onSave={saveLimit} onRemove={removeLimit} />
        <LimitCard icon={<Timer />} title="Session limit" desc="Max session length in minutes." type="session" limit={getLimit("session")} busy={busy} onSave={saveLimit} onRemove={removeLimit} sessionMode />

        <p className="text-xs text-white/40 text-center pt-2">Need help? Contact <span className="text-lime">Base44 support</span>. These tools help you play responsibly but do not guarantee control.</p>
      </main>
    </div>
  );
}

function LimitCard({ icon, title, desc, type, limit, busy, onSave, onRemove, sessionMode }) {
  const [value, setValue] = useState("");
  const [period, setPeriod] = useState(limit?.period || "daily");

  useEffect(() => { if (limit) setValue(String(limit.limit_value || "")); }, [limit?.id, limit?.limit_value]);

  const submit = (e) => { e.preventDefault(); onSave(type, value || 0, period); };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lime">{React.cloneElement(icon, { className: "w-4 h-4" })}</span>
          <h3 className="font-bold text-white">{title}</h3>
        </div>
        {limit && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-lime/10 text-[10px] font-bold text-lime"><Check className="w-3 h-3" /> Active</span>}
      </div>
      <p className="text-sm text-white/50 mt-1 mb-3">{desc}</p>
      {limit && (
        <div className="mb-3 rounded-lg bg-[#0d0d0d] border border-white/5 px-3 py-2 text-sm">
          <span className="text-white/40">Current: </span>
          <span className="font-bold text-lime">{limit.limit_value} {sessionMode ? "min" : "USDT"}</span>
          <span className="text-white/40 capitalize"> · {limit.period}</span>
        </div>
      )}
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <input type="number" min="0" step={sessionMode ? "1" : "0.01"} value={value} onChange={(e) => setValue(e.target.value)} placeholder={sessionMode ? "Minutes" : "Amount USDT"} className="flex-1 h-10 px-3 rounded-lg bg-[#0d0d0d] border border-white/10 text-sm text-white outline-none focus:border-lime/40" />
        {!sessionMode && (
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-10 px-3 rounded-lg bg-[#0d0d0d] border border-white/10 text-sm text-white outline-none focus:border-lime/40">
            {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        )}
        <button type="submit" disabled={busy === type} className="h-10 px-4 rounded-lg bg-lime text-black text-sm font-black hover:opacity-90 transition disabled:opacity-50">{busy === type ? "…" : "Save"}</button>
        {limit && <button type="button" onClick={() => onRemove(type)} className="h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-red-400 transition" aria-label="Remove limit"><Trash2 className="w-4 h-4" /></button>}
      </form>
    </div>
  );
}