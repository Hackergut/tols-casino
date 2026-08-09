import React, { useEffect, useState } from "react";
import { base44 } from "@/api/client";
import { getMockPlatformSettings, setMockPlatformSetting } from "@/lib/mockAdmin";
import { Settings, Save, Check, Loader2 } from "lucide-react";

const FIELDS = [
  { key: "operator_address_solana", label: "Solana deposit address", placeholder: "7x... (full SOL address)" },
  { key: "operator_address_ethereum", label: "Ethereum deposit address", placeholder: "0x..." },
  { key: "operator_address_polygon", label: "Polygon deposit address", placeholder: "0x..." },
  { key: "rate_solana", label: "SOL → USDT fallback rate", placeholder: "180" },
  { key: "rate_ethereum", label: "ETH → USDT fallback rate", placeholder: "3000" },
  { key: "rate_polygon", label: "POL → USDT fallback rate", placeholder: "0.5" },
];

export default function PaymentSettings() {
  const [map, setMap] = useState({});
  const [ids, setIds] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const list = await base44.entities.PlatformSetting.filter({ category: "payments" });
      const m = {}; const id = {};
      list.forEach((s) => { m[s.key] = s.value; id[s.key] = s.id; });
      // merge mock if empty
      if (!list.length) {
        const mock = getMockPlatformSettings("payments");
        mock.forEach((s)=> { m[s.key]=s.value; id[s.key]=s.id; });
      }
      setMap(m); setIds(id);
      if (Object.keys(m).length && !list.length) setMsg("Demo mode — saved locally");
    } catch (e) { 
      const mock = getMockPlatformSettings("payments");
      const m={}; const id={};
      mock.forEach((s)=> { m[s.key]=s.value; id[s.key]=s.id; });
      setMap(m); setIds(id);
      setMsg("Demo mode — localStorage");
    }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true); setSaved(false); setMsg("");
    try {
      for (const f of FIELDS) {
        const v = (map[f.key] || "").trim();
        // always persist locally
        setMockPlatformSetting(f.key, v, "payments");
        try {
          if (ids[f.key] && !String(ids[f.key]).startsWith("mock_")) {
            if (v) await base44.entities.PlatformSetting.update(ids[f.key], { value: v });
          } else if (v) {
            const r = await base44.entities.PlatformSetting.create({ key: f.key, value: v, category: "payments" });
            setIds((p) => ({ ...p, [f.key]: r.id }));
          }
        } catch {}
      }
      await load();
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { setMsg("Save failed: " + (e.message || "error")); }
    finally { setSaving(false); }
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-5">
      <h3 className="font-bold text-white mb-1 flex items-center gap-2"><Settings className="w-4 h-4 text-lime" /> Payment settings</h3>
      <p className="text-xs text-white/40 mb-4">Real wallet addresses where player deposits are collected, and fallback conversion rates (used only if the live price API is unreachable).</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">{f.label}</label>
            <input value={map[f.key] || ""} onChange={(e) => setMap((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
              className="w-full h-11 mt-1.5 rounded-xl bg-[#1a1a1a] border border-white/10 px-3 text-sm font-mono text-white outline-none focus:border-lime/40 placeholder-white/20" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-lime text-black text-sm font-black hover:opacity-90 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved" : "Save settings"}
        </button>
        {msg && <span className="text-xs text-red-300">{msg}</span>}
      </div>
    </div>
  );
}