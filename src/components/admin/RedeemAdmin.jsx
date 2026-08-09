import React, { useEffect, useState } from "react";
import { base44 } from "@/api/client";
import { Ticket, Plus, Trash2, Save } from "lucide-react";

export default function RedeemAdmin() {
  const [codes, setCodes] = useState([]);
  const [claims, setClaims] = useState([]);
  const [form, setForm] = useState({ code: "", reward: 50, currency: "USDT", desc: "" });
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const list = await base44.entities.PlatformSetting.filter({ category: "redeem_code" });
      setCodes(list || []);
      const claimList = await base44.entities.PlatformSetting.filter({ category: "redeem_claim" });
      setClaims(claimList || []);
    } catch {}
  };
  useEffect(()=>{ load(); }, []);

  const create = async () => {
    if (!form.code.trim()) return;
    const upper = form.code.trim().toUpperCase();
    try {
      await base44.entities.PlatformSetting.create({ key: upper, value: JSON.stringify({ reward: Number(form.reward), currency: form.currency, desc: form.desc }), category: "redeem_code", description: form.desc });
      setForm({ code: "", reward: 50, currency: "USDT", desc: "" });
      setMsg("Created "+upper);
      load();
    } catch (e) { setMsg("Create failed: "+e.message); }
  };

  const del = async (id) => {
    try { await base44.entities.PlatformSetting.delete(id); load(); } catch {}
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-5 space-y-4">
      <h3 className="font-bold text-white flex items-center gap-2"><Ticket className="w-4 h-4 text-lime" /> Redeem Codes — exact backend logic</h3>
      <p className="text-xs text-white/40">Stored as PlatformSetting category=redeem_code key=CODE value=JSON. Claim creates PlatformSetting category=redeem_claim key=redeem_claim_userId_CODE. Frontend validates via fetchRedeemCodesFromBackend() + redeemCodeBackend().</p>

      <div className="grid sm:grid-cols-4 gap-2">
        <input value={form.code} onChange={(e)=> setForm({...form, code: e.target.value})} placeholder="CODE e.g. WELCOME100" className="h-10 rounded-xl bg-[#1a1a1a] border border-white/10 px-3 text-sm font-mono uppercase text-white placeholder-white/30" />
        <input type="number" value={form.reward} onChange={(e)=> setForm({...form, reward: e.target.value})} className="h-10 rounded-xl bg-[#1a1a1a] border border-white/10 px-3 text-sm text-white" />
        <input value={form.currency} onChange={(e)=> setForm({...form, currency: e.target.value})} className="h-10 rounded-xl bg-[#1a1a1a] border border-white/10 px-3 text-sm text-white" />
        <input value={form.desc} onChange={(e)=> setForm({...form, desc: e.target.value})} placeholder="Description" className="h-10 rounded-xl bg-[#1a1a1a] border border-white/10 px-3 text-sm text-white" />
      </div>
      <button onClick={create} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-lime text-black text-sm font-black"><Plus className="w-4 h-4" /> Create code</button>
      {msg && <p className="text-xs text-lime">{msg}</p>}

      <div>
        <h4 className="text-sm font-bold text-white/70 mb-2">Codes ({codes.length})</h4>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {codes.map((c)=> (
            <div key={c.id} className="flex items-center justify-between rounded-lg bg-[#0a0a0a] border border-white/5 px-3 py-2">
              <div><span className="font-mono font-bold text-lime">{c.key}</span><span className="ml-2 text-xs text-white/50">{c.value}</span></div>
              <button onClick={()=> del(c.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {!codes.length && <p className="text-xs text-white/30 text-center py-4">No codes — defaults WELCOME100, TOLS2024 etc are hardcoded fallback when DB empty</p>}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-white/70 mb-2">Claims ({claims.length})</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
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
