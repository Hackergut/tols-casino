import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWallet } from "@/components/WalletProvider";
import { AlertCircle, CheckCircle2, Loader2, Info, RefreshCw, History } from "lucide-react";
import { useIntegrationMode } from "@/hooks/useIntegrationMode";
import CoinSelect from "@/components/wallet/CoinSelect";
import { coinById } from "@/components/wallet/coins";

export default function WithdrawForm({ coin = "solana", setCoin, onClose }) {
  const { wallet, requestWithdrawal } = useWallet();
  const { mode } = useIntegrationMode();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      if (wallet && wallet.id !== "guest") {
        const u = await base44.auth.me();
        setHistory((await base44.entities.Withdrawal.filter({ created_by_id: u.id }, "-created_date", 5)) || []);
      } else setHistory(JSON.parse(localStorage.getItem("tols_withdrawals") || "[]"));
    } catch {
      setHistory(JSON.parse(localStorage.getItem("tols_withdrawals") || "[]"));
    }
  };
  useEffect(() => { loadHistory(); }, [wallet?.id]);

  const chain = coin;
  const active = coinById(coin);
  const balance = wallet ? wallet.balance : 0;
  const amt = parseFloat(amount) || 0;
  const net = Math.max(0, +(amt - active.fee).toFixed(4));

  const submit = async () => {
    setError(""); setSuccess(null); setBusy(true);
    try {
      const r = await requestWithdrawal({ amount: amt, wallet_address: address, chain });
      setSuccess({ amount: r.amount, chain: r.chain });
      setAmount(""); setAddress("");
      await loadHistory();
    } catch (e) {
      setError(e.message || "Withdrawal error");
    } finally {
      setBusy(false);
    }
  };
  const quick = (p) => setAmount((wallet ? (wallet.balance * p / 100) : 0).toFixed(2));
  const paste = async () => {
    try { const t = await navigator.clipboard.readText(); if (t) setAddress(t.trim()); } catch {}
  };

  return (
    <div className="space-y-4">
      {!mode.livePaymentsEnabled && (
        <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4 flex gap-3 text-sm text-blue-100">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-300" />
          <p>
            <b>Sandbox mode:</b> the withdrawal form is integration-ready, but live payouts are disabled.
            Enable live payments only after compliance, custody, fraud, and operations review.
          </p>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-lime/10 border border-lime/30 text-sm text-lime">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p>Withdrawal requested: {success.amount} USDT on {success.chain}.</p>
            <p className="text-white/50 text-xs mt-0.5">Processing, settled on-chain within 24h.</p>
          </div>
        </div>
      )}

      {/* Available balance */}
      <div className="rounded-xl bg-[#1a1a1a] border border-white/10 px-4 py-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-white/45 uppercase tracking-wide">Withdrawable balance</span>
        <span className="text-sm font-bold text-white tabular-nums">{balance.toFixed(2)} USD</span>
      </div>

      {/* Currency */}
      <div>
        <label className="text-[11px] font-semibold text-white/45">Currency</label>
        <div className="mt-1.5"><CoinSelect value={coin} onChange={setCoin} balance={balance} /></div>
      </div>

      {/* Network */}
      <div>
        <label className="text-[11px] font-semibold text-white/45">Network</label>
        <div className="mt-1.5 h-14 flex items-center gap-3 px-3.5 rounded-xl bg-[#1a1a1a] border border-white/10">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-black" style={{ background: active.color }}>{active.symbol}</span>
          <span className="text-sm font-bold text-white">{active.network}</span>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="text-[11px] font-semibold text-white/45">{active.name} ({active.network}) address</label>
        <div className="mt-1.5 flex items-center gap-2 h-14 rounded-xl bg-[#1a1a1a] border border-white/10 px-3.5 focus-within:border-lime/40 transition">
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address"
            className="flex-1 bg-transparent outline-none text-sm font-mono text-white placeholder-white/20" />
          <button onClick={paste} type="button" className="shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-lime hover:border-lime/30 transition">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Amount */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-white/45">Amount</label>
          <span className="text-[11px] text-white/40 tabular-nums">{amt ? (amt).toFixed(8) : "0.00000000"} {active.symbol}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2 h-14 rounded-xl bg-[#1a1a1a] border border-white/10 px-3.5 focus-within:border-lime/40 transition">
          <span className="text-lime font-bold text-base">$</span>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount"
            className="flex-1 bg-transparent outline-none text-base font-bold text-white tabular-nums placeholder-white/20" />
          <span className="text-sm font-bold text-white/40">{wallet?.currency || "USDT"}</span>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {[25, 50, 75, 100].map((p) => (
            <button key={p} onClick={() => quick(p)} className="h-10 rounded-lg bg-transparent border border-white/15 text-xs font-bold text-white/70 hover:border-lime/40 hover:text-lime hover:bg-lime/10 transition">
              {p === 100 ? "MAX" : `${p}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Fee info */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-white/55">
          <Info className="w-3.5 h-3.5 text-white/40 shrink-0" />
          Withdrawal fee: <span className="text-white font-bold ml-auto">{active.fee.toFixed(2)} USD</span>
        </div>
        <div className="flex items-center gap-2 text-white/55">
          <Info className="w-3.5 h-3.5 text-white/40 shrink-0" />
          Your withdrawal will be processed on {active.name} ({active.network}).
        </div>
      </div>

      <button
        onClick={submit} disabled={busy || !amount || !address || !mode.livePaymentsEnabled}
        className="w-full h-14 rounded-xl bg-lime text-black font-black text-lg uppercase tracking-wide hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-lime"
      >
        {busy ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : "Withdraw"}
      </button>

      {history.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-semibold text-white/45 uppercase tracking-wide">Recent withdrawals</h4>
            <Link to="/wallet" onClick={onClose} className="flex items-center gap-1 text-[11px] font-bold text-white/60 hover:text-lime transition">
              <History className="w-3 h-3" /> History
            </Link>
          </div>
          <div className="space-y-2">
            {history.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-lg bg-[#0e0e0e] border border-white/5 px-3 py-2.5">
                <div>
                  <p className="text-sm font-bold text-white">{Number(w.amount).toFixed(2)} {w.currency}</p>
                  <p className="text-xs text-white/40 font-mono truncate max-w-[160px]">{w.wallet_address}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${w.status === "completed" ? "bg-lime/10 text-lime" : w.status === "rejected" ? "bg-red-500/10 text-red-300" : "bg-yellow-500/10 text-yellow-300"}`}>
                    {w.status === "completed" ? "Completed" : w.status === "rejected" ? "Rejected" : "Pending"}
                  </span>
                  <p className="text-xs text-white/30 mt-1">{w.chain}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}