import React, { useCallback, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowDownToLine, ArrowUpFromLine, Dice5, Trophy, RefreshCw, Gift, History } from "lucide-react";

function fmt(n) { return Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }); }

function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return Math.floor(diff) + "s ago";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return new Date(iso).toLocaleDateString();
}

function Row({ icon: Icon, tone, title, sub, amount, currency = "USDT", date }) {
  const color = tone === "in" ? "text-lime" : tone === "out" ? "text-red-300" : tone === "win" ? "text-lime" : "text-white/80";
  const sign = tone === "in" || tone === "win" ? "+" : tone === "out" || tone === "bet" ? "-" : "";
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition">
      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 grid place-items-center shrink-0">
        <Icon className="w-4 h-4 text-white/70" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white truncate">{title}</p>
        <p className="text-[11px] text-white/40 truncate">{sub}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-black tabular-nums ${color}`}>{sign}{fmt(Math.abs(amount))} <span className="text-[10px] text-white/40">{currency}</span></p>
        <p className="text-[10px] text-white/30">{timeAgo(date)}</p>
      </div>
    </div>
  );
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "bets", label: "Game play" },
  { id: "deposits", label: "Deposits" },
  { id: "withdrawals", label: "Withdrawals" },
];

export default function TransactionHistory() {
  const [bets, setBets] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      if (!me) { setLoading(false); return; }
      const [b, d, w] = await Promise.all([
        base44.entities.Bet.filter({ created_by_id: me.id }, "-created_date", 50).catch(() => []),
        base44.entities.Deposit.filter({ created_by_id: me.id }, "-created_date", 30).catch(() => []),
        base44.entities.Withdrawal.filter({ created_by_id: me.id }, "-created_date", 30).catch(() => []),
      ]);
      setBets(b || []); setDeposits(d || []); setWithdrawals(w || []);
    } catch {
      /* guest */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, [load]);

  const rows = useMemo(() => {
    const out = [];
    if (filter === "all" || filter === "bets") {
      bets.forEach((b) => {
        const isWin = b.result === "win";
        out.push({
          key: "bet-" + b.id, date: b.created_date,
          icon: isWin ? Trophy : Dice5,
          tone: isWin ? "win" : "bet",
          title: b.game_name || b.game_id || "Game",
          sub: `${isWin ? "Won" : "Bet"} · ${Number(b.multiplier || 0).toFixed(2)}x`,
          amount: isWin ? Number(b.payout || 0) - Number(b.amount || 0) : Number(b.amount || 0),
          currency: b.currency || "USDT",
        });
      });
    }
    if (filter === "all" || filter === "deposits") {
      deposits.filter((d) => d.status === "confirmed").forEach((d) => {
        out.push({
          key: "dep-" + d.id, date: d.created_date,
          icon: ArrowDownToLine, tone: "in",
          title: "Deposit credited",
          sub: `${d.chain || "crypto"} · ${(d.tx_hash || "").slice(0, 24)}`,
          amount: Number(d.amount || 0), currency: d.currency || "USDT",
        });
      });
    }
    if (filter === "all" || filter === "withdrawals") {
      withdrawals.forEach((w) => {
        out.push({
          key: "wd-" + w.id, date: w.created_date,
          icon: w.status === "completed" ? Gift : ArrowUpFromLine,
          tone: w.status === "rejected" ? "in" : "out",
          title: w.status === "rejected" ? "Withdrawal refunded" : `Withdrawal · ${w.status}`,
          sub: `${w.chain} · ${(w.wallet_address || "").slice(0, 18)}…`,
          amount: Number(w.amount || 0), currency: w.currency || "USDT",
        });
      });
    }
    return out.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [bets, deposits, withdrawals, filter]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-lime" /> Transaction history
        </h3>
        <button onClick={load} className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:text-lime">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-[#0a0a0a] border border-white/10 w-fit overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-3 h-8 rounded-lg text-xs font-bold whitespace-nowrap transition ${filter === f.id ? "bg-lime text-black" : "text-white/50 hover:text-white"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0,1,2].map((i) => <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-white/40">
          No transactions yet. Play a demo game or make a deposit to see activity here.
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-hide pr-1">
          {rows.map((r) => <Row key={r.key} {...r} />)}
        </div>
      )}
    </div>
  );
}
