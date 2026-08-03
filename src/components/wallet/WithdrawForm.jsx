import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useWallet } from "@/components/WalletProvider";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const CHAINS = [
  { id: "solana", label: "Solana", fee: 0.01, placeholder: "7xKp...3fQ" },
  { id: "polygon", label: "Polygon", fee: 0.05, placeholder: "0xAb...3F" },
  { id: "ethereum", label: "Ethereum", fee: 0.02, placeholder: "0xAb...3F" },
];

export default function WithdrawForm() {
  const { wallet, requestWithdrawal } = useWallet();
  const [amount, setAmount] = useState("");
  const [chain, setChain] = useState("solana");
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

  const active = CHAINS.find((c) => c.id === chain) || CHAINS[0];
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

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-[#111] p-5 space-y-4">
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

        <div>
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Withdrawal amount</label>
          <div className="mt-2 relative">
            <input
              type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
              className="w-full h-12 rounded-xl bg-[#1a1a1a] border border-white/10 px-4 pr-20 text-lg font-bold text-white outline-none focus:border-lime/40 placeholder-white/20"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/40">{wallet?.currency || "USDT"}</span>
          </div>
          <div className="flex gap-2 mt-2">
            {[25, 50, 100].map((p) => (
              <button key={p} onClick={() => quick(p)} className="flex-1 h-9 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:bg-lime/10 hover:text-lime hover:border-lime/30 transition">
                {p === 100 ? "MAX" : `${p}%`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Blockchain network</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {CHAINS.map((c) => (
              <button
                key={c.id} onClick={() => setChain(c.id)}
                className={`h-11 rounded-xl border text-sm font-bold transition ${chain === c.id ? "bg-lime/10 border-lime/40 text-lime" : "bg-[#1a1a1a] border-white/10 text-white/60 hover:border-white/20"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Destination wallet address</label>
          <input
            value={address} onChange={(e) => setAddress(e.target.value)} placeholder={active.placeholder}
            className="w-full h-12 mt-2 rounded-xl bg-[#1a1a1a] border border-white/10 px-4 text-sm font-mono text-white outline-none focus:border-lime/40 placeholder-white/20"
          />
        </div>

        <div className="rounded-xl bg-[#1a1a1a] border border-white/5 p-4 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-white/50">Requested amount</span><span className="font-bold text-white">{amt.toFixed(2)} USDT</span></div>
          <div className="flex justify-between"><span className="text-white/50">Network fee</span><span className="text-white/60">{active.fee} USDT</span></div>
          <div className="border-t border-white/5 my-1" />
          <div className="flex justify-between"><span className="text-white/50">You'll receive (net)</span><span className="font-bold text-lime">{net} USDT</span></div>
          <div className="flex justify-between"><span className="text-white/50">Balance after withdrawal</span><span className="text-white/60">{wallet ? Math.max(0, +(wallet.balance - amt)).toFixed(2) : "—"} USDT</span></div>
        </div>

        <button
          onClick={submit} disabled={busy || !amount || !address}
          className="w-full h-12 rounded-xl bg-lime text-black font-black hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {busy ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : "Confirm withdrawal"}
        </button>
      </div>

      {history.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-3">Recent withdrawals</h4>
          <div className="space-y-2">
            {history.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-lg bg-[#1a1a1a] border border-white/5 px-3 py-2.5">
                <div>
                  <p className="text-sm font-bold text-white">{Number(w.amount).toFixed(2)} {w.currency}</p>
                  <p className="text-xs text-white/40 font-mono truncate max-w-[200px]">{w.wallet_address}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${w.status === "completed" ? "bg-lime/10 text-lime" : w.status === "rejected" ? "bg-red-500/10 text-red-300" : "bg-yellow-500/10 text-yellow-300"}`}>
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