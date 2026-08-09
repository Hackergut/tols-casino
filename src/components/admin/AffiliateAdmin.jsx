import React, { useEffect, useState } from "react";
import { base44 } from "@/api/client";
import { Users, DollarSign, TrendingUp, Gift, Settings } from "lucide-react";
import { getMockAdminData } from "@/lib/mockAdmin";

export default function AffiliateAdmin() {
  const [affiliates, setAffiliates] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  const load = async () => {
    try {
      const [affList, refList, logList] = await Promise.all([
        base44.entities.Affiliate.list("-created_date", 100),
        base44.entities.Referral.list("-created_date", 100),
        base44.entities.CommissionLog.list("-created_date", 100),
      ]);
      if (!affList.length && !refList.length) throw new Error("empty");
      setAffiliates(affList || []);
      setReferrals(refList || []);
      setLogs(logList || []);
      setIsMock(false);
    } catch {
      const m = getMockAdminData();
      setAffiliates([{ id: "mock_aff1", referral_code: "TOLSDEMO1", commission_plan: "revshare", commission_rate: 25, cpa_amount: 50, total_referrals: 5, total_wagered: 26450, total_commission: 1250, pending_commission: 800 }]);
      setReferrals([
        { id: "r1", player_alias: "Whale_88", status: "deposited", total_wagered: 12450, total_payout: 10800, net_loss: 1650, signup_date: new Date().toISOString() },
        { id: "r2", player_alias: "CryptoKid", status: "active", total_wagered: 3200, total_payout: 2950, net_loss: 250, signup_date: new Date().toISOString() },
      ]);
      setLogs([]);
      setIsMock(true);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const updatePlan = async (aff, plan) => {
    try { await base44.entities.Affiliate.update(aff.id, { commission_plan: plan }); load(); } catch {}
  };

  if (loading) return <div className="h-32 grid place-items-center"><div className="w-6 h-6 border-2 border-white/10 border-t-lime rounded-full animate-spin" /></div>;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center gap-2"><Users className="w-4 h-4 text-lime" /> Affiliate — exact backend logic {isMock && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">MOCK</span>}</h3>
        <span className="text-xs text-white/40">{affiliates.length} affiliates · {referrals.length} referrals · {logs.length} logs</span>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#0a0a0a] border border-white/10 p-3"><p className="text-xs text-white/40">Affiliates</p><p className="text-xl font-black text-white">{affiliates.length}</p></div>
        <div className="rounded-xl bg-[#0a0a0a] border border-white/10 p-3"><p className="text-xs text-white/40">Total wagered</p><p className="text-xl font-black text-lime">{affiliates.reduce((s,a)=> s+(a.total_wagered||0),0).toLocaleString()}</p></div>
        <div className="rounded-xl bg-[#0a0a0a] border border-white/10 p-3"><p className="text-xs text-white/40">Pending commission</p><p className="text-xl font-black text-yellow-300">{affiliates.reduce((s,a)=> s+(a.pending_commission||0),0).toFixed(2)}</p></div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-white/40 uppercase border-b border-white/5"><th className="py-2 text-left px-2">Code</th><th className="py-2 px-2">Plan</th><th className="py-2 text-right px-2">Rate</th><th className="py-2 text-right px-2">Referrals</th><th className="py-2 text-right px-2">Commission</th><th className="py-2 px-2">Action</th></tr></thead>
          <tbody>
            {affiliates.map((a)=> (
              <tr key={a.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-2 px-2 font-mono text-lime font-bold">{a.referral_code}</td>
                <td className="py-2 px-2 text-white/70">{a.commission_plan}</td>
                <td className="py-2 px-2 text-right text-white">{a.commission_rate}% / ${a.cpa_amount}</td>
                <td className="py-2 px-2 text-right text-white">{a.total_referrals}</td>
                <td className="py-2 px-2 text-right font-bold text-lime">{(a.total_commission||0).toFixed(2)}</td>
                <td className="py-2 px-2"><select value={a.commission_plan} onChange={(e)=> updatePlan(a, e.target.value)} className="bg-[#1a1a1a] border border-white/10 rounded px-2 py-1 text-xs text-white"><option value="revshare">Revshare</option><option value="cpa">CPA</option><option value="hybrid">Hybrid</option></select></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h4 className="text-sm font-bold text-white/70 mb-2">Referrals (exact: Referral entity)</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {referrals.map((r)=> (
            <div key={r.id} className="flex items-center justify-between rounded-lg bg-[#0a0a0a] border border-white/5 px-3 py-2">
              <span className="text-sm font-bold text-white">{r.player_alias} <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${r.status==="deposited"?"bg-lime/20 text-lime":"bg-white/10 text-white/40"}`}>{r.status}</span></span>
              <span className="text-xs text-white/50 tabular-nums">{(r.total_wagered||0).toLocaleString()} wagered · {(r.net_loss||0).toLocaleString()} net</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-white/30">Logic: Affiliate.commission = sum(computeCommission(referral, affiliate)) · Referral.net_loss = wagered - payout · Pending = total - paid · Stored via Affiliate/Referral/CommissionLog entities, synced every 10s.</p>
    </div>
  );
}
