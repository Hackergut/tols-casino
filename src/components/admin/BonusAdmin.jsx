import React, { useEffect, useState } from "react";
import { base44 } from "@/api/client";
import { Gift, Save, Trash2, Plus } from "lucide-react";
import { BONUSES } from "@/lib/bonus";

export default function BonusAdmin() {
  const [bonuses, setBonuses] = useState(BONUSES);
  const [claims, setClaims] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const list = await base44.entities.PlatformSetting.filter({ category: "bonus_config" });
      const entry = list.find((s)=> s.key==="bonus_config");
      if (entry?.value) setBonuses(JSON.parse(entry.value));
      const claimList = await base44.entities.PlatformSetting.filter({ category: "bonus_claim" });
      setClaims(claimList || []);
    } catch {}
  };
  useEffect(()=>{ load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const existing = await base44.entities.PlatformSetting.filter({ category: "bonus_config", key: "bonus_config" });
      const payload = JSON.stringify(bonuses);
      if (existing.length) await base44.entities.PlatformSetting.update(existing[0].id, { value: payload });
      else await base44.entities.PlatformSetting.create({ key: "bonus_config", value: payload, category: "bonus_config", description: "Bonus config JSON" });
      setMsg("Saved to PlatformSetting bonus_config");
      setTimeout(()=> setMsg(""), 2000);
    } catch (e) { setMsg("Save failed: "+e.message); }
    finally { setSaving(false); }
  };

  const update = (id, patch) => setBonuses((arr)=> arr.map((b)=> b.id===id? {...b, ...patch}: b));

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center gap-2"><Gift className="w-4 h-4 text-lime" /> Bonus — exact backend logic</h3>
        <button onClick={save} disabled={saving} className="px-4 h-9 rounded-xl bg-lime text-black text-sm font-black flex items-center gap-2"><Save className="w-4 h-4" /> {saving?"Saving...":"Save config"}</button>
      </div>
      {msg && <p className="text-xs text-lime">{msg}</p>}
      <p className="text-xs text-white/40">Stored as PlatformSetting category=bonus_config key=bonus_config value=JSON. Frontend BonusGrid reads this; claim creates PlatformSetting category=bonus_claim key=bonus_claim_userId_bonusId.</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {bonuses.map((b)=> (
          <div key={b.id} className="rounded-xl bg-[#0a0a0a] border border-white/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{b.name}</span>
              <span className="text-xs text-white/40">{b.type}</span>
            </div>
            <input value={b.desc} onChange={(e)=> update(b.id, {desc: e.target.value})} className="w-full h-8 rounded bg-[#1a1a1a] border border-white/10 px-2 text-xs text-white" placeholder="Description" />
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[10px] text-white/40">Reward</label><input type="number" value={b.reward} onChange={(e)=> update(b.id, {reward: Number(e.target.value)})} className="w-full h-8 rounded bg-[#1a1a1a] border border-white/10 px-2 text-sm text-white" /></div>
              <div><label className="text-[10px] text-white/40">Percent</label><input type="number" value={b.percent||0} onChange={(e)=> update(b.id, {percent: Number(e.target.value)})} className="w-full h-8 rounded bg-[#1a1a1a] border border-white/10 px-2 text-sm text-white" /></div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-sm font-bold text-white/70 mb-2">Claims ({claims.length}) — PlatformSetting bonus_claim</h4>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {claims.slice(0,20).map((c)=> (
            <div key={c.id} className="flex items-center justify-between rounded-lg bg-[#0a0a0a] border border-white/5 px-3 py-1.5">
              <span className="text-xs font-mono text-white/60">{c.key}</span>
              <span className="text-xs text-white/30">{new Date(c.created_date).toLocaleString()}</span>
            </div>
          ))}
          {!claims.length && <p className="text-xs text-white/30 text-center py-4">No claims yet</p>}
        </div>
      </div>
    </div>
  );
}
