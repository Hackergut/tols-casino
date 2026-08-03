import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import ReferralLink from "@/components/affiliate/ReferralLink";
import AffiliateStats from "@/components/affiliate/AffiliateStats";
import CommissionPlan from "@/components/affiliate/CommissionPlan";
import ReferralTable from "@/components/affiliate/ReferralTable";
import { WalletProvider } from "@/components/WalletProvider";

const SAMPLE_REFERRALS = [
  { player_alias: "Whale_88", status: "deposited", total_wagered: 12450, total_payout: 10800, net_loss: 1650 },
  { player_alias: "CryptoKid", status: "active", total_wagered: 3200, total_payout: 2950, net_loss: 250 },
  { player_alias: "LuckyDuck", status: "deposited", total_wagered: 8900, total_payout: 7200, net_loss: 1700 },
  { player_alias: "MoonBoy", status: "active", total_wagered: 1100, total_payout: 1180, net_loss: -80 },
  { player_alias: "DiceKing", status: "inactive", total_wagered: 540, total_payout: 510, net_loss: 30 },
];

function genCode() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

export default function Affiliate() {
  const [affiliate, setAffiliate] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      const list = await base44.entities.Affiliate.filter({ created_by_id: user.id });
      let aff;
      if (list.length) {
        aff = list[0];
      } else {
        aff = await base44.entities.Affiliate.create({
          referral_code: genCode(),
          commission_plan: "revshare",
          commission_rate: 25,
          cpa_amount: 50,
          total_clicks: 142,
          total_referrals: 5,
          total_wagered: 0,
          total_commission: 0,
          pending_commission: 0,
          paid_commission: 0,
        });
      }

      let refs = await base44.entities.Referral.filter({ created_by_id: user.id });
      if (!refs.length) {
        refs = await base44.entities.Referral.bulkCreate(
          SAMPLE_REFERRALS.map((r) => ({ ...r, signup_date: new Date().toISOString() }))
        );
      }

      // recompute aggregate stats from referrals
      const totalWagered = refs.reduce((s, r) => s + r.total_wagered, 0);
      const netLoss = refs.reduce((s, r) => s + Math.max(0, r.net_loss), 0);
      const totalCommission = netLoss * (aff.commission_rate / 100);
      const pending = Math.max(0, totalCommission - (aff.paid_commission || 0));

      const updated = {
        ...aff,
        total_referrals: refs.length,
        total_wagered: totalWagered,
        total_commission: +totalCommission.toFixed(2),
        pending_commission: +pending.toFixed(2),
      };
      setAffiliate(updated);
      setReferrals(refs);

      // persist recomputed stats
      try {
        await base44.entities.Affiliate.update(aff.id, {
          total_referrals: refs.length,
          total_wagered: +totalWagered.toFixed(2),
          total_commission: +totalCommission.toFixed(2),
          pending_commission: +pending.toFixed(2),
        });
      } catch (e) { /* ignore */ }
    } catch (e) {
      // guest mode
      let local = JSON.parse(localStorage.getItem("tols_affiliate") || "null");
      if (!local) {
        local = {
          id: "guest",
          referral_code: "TOLSDEMO1",
          commission_plan: "revshare",
          commission_rate: 25,
          cpa_amount: 50,
          total_clicks: 142,
          total_referrals: SAMPLE_REFERRALS.length,
          total_wagered: 0,
          total_commission: 0,
          pending_commission: 0,
          paid_commission: 0,
        };
      }
      const totalWagered = SAMPLE_REFERRALS.reduce((s, r) => s + r.total_wagered, 0);
      const netLoss = SAMPLE_REFERRALS.reduce((s, r) => s + Math.max(0, r.net_loss), 0);
      local.total_wagered = totalWagered;
      local.total_commission = +(netLoss * 0.25).toFixed(2);
      local.pending_commission = local.total_commission;
      local.total_referrals = SAMPLE_REFERRALS.length;
      localStorage.setItem("tols_affiliate", JSON.stringify(local));
      setAffiliate(local);
      setReferrals(SAMPLE_REFERRALS.map((r, i) => ({ id: i, ...r })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const changePlan = async (plan) => {
    const next = { ...affiliate, commission_plan: plan };
    setAffiliate(next);
    if (affiliate.id !== "guest") {
      try { await base44.entities.Affiliate.update(affiliate.id, { commission_plan: plan }); } catch (e) {}
    } else {
      localStorage.setItem("tols_affiliate", JSON.stringify(next));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-lime rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            <span className="text-lime">Affiliati</span> TOLS
          </h1>
          <p className="text-sm text-white/40 mt-1">Monitora referral, giocatori e commissioni in tempo reale</p>
        </div>

        <AffiliateStats affiliate={affiliate} referrals={referrals} />

        <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
          <ReferralLink code={affiliate.referral_code} />
          <CommissionPlan affiliate={affiliate} onPlanChange={changePlan} />
        </div>

        <ReferralTable referrals={referrals} plan={affiliate.commission_plan} />

        <PayoutPanel affiliate={affiliate} />
      </main>
    </div>
  );
}

function PayoutPanel({ affiliate }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#161616] to-[#0d0d0d] p-5 sm:p-6">
      <h3 className="font-bold text-white mb-4">Richiesta payout</h3>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-[#0d0d0d] border border-white/10 p-4">
          <p className="text-xs text-white/40">Commissioni totali</p>
          <p className="text-2xl font-black text-white mt-1">${(affiliate.total_commission ?? 0).toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-[#0d0d0d] border border-white/10 p-4">
          <p className="text-xs text-white/40">In attesa</p>
          <p className="text-2xl font-black text-lime mt-1">${(affiliate.pending_commission ?? 0).toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-[#0d0d0d] border border-white/10 p-4">
          <p className="text-xs text-white/40">Già pagato</p>
          <p className="text-2xl font-black text-white/70 mt-1">${(affiliate.paid_commission ?? 0).toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <input
          placeholder="Indirizzo wallet crypto (ETH/SOL/MATIC)"
          className="flex-1 h-12 rounded-xl bg-[#0d0d0d] border border-white/10 px-4 text-sm text-white outline-none focus:border-lime/40 placeholder-white/30"
        />
        <button className="h-12 px-8 rounded-xl bg-lime text-black font-black hover:opacity-90 transition disabled:opacity-40" disabled={(affiliate.pending_commission ?? 0) < 50}>
          Richiedi payout
        </button>
      </div>
      <p className="text-xs text-white/30 mt-3">Soglia minima di payout: $50 · Pagamenti in crypto entro 48h</p>
    </div>
  );
}