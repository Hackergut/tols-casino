import React, { useState, useEffect } from "react";
import { base44 } from "@/api/client";
import { useWallet } from "@/components/WalletProvider";
import { X, ArrowDownToLine, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const CHAINS = [
  { id: "solana", label: "Solana", fee: 0.01, addr: "Example: 7xKp...3fQ" },
  { id: "polygon", label: "Polygon", fee: 0.05, addr: "Example: 0xAb...3F" },
  { id: "ethereum", label: "Ethereum", fee: 0.02, addr: "Example: 0xAb...3F" },
];

export default function WithdrawalPanel({ onClose }) {
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
        const list = await base44.entities.Withdrawal.filter({ created_by_id: (await base44.auth.me()).id }, "-created_date", 5);
        setHistory(list || []);
      } else {
        setHistory(JSON.parse(localStorage.getItem("tols_withdrawals") || "[]"));
      }
    } catch (e) {
      setHistory(JSON.parse(localStorage.getItem("tols_withdrawals") || "[]"));
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const activeChain = CHAINS.find((c) => c.id === chain) || CHAINS[0];
  const amt = parseFloat(amount) || 0;
  const net = Math.max(0, +(amt - activeChain.fee).toFixed(4));

  const submit = async () => {
    setError("");
    setSuccess(null);
    setBusy(true);
    try {
      const record = await requestWithdrawal({ amount: amt, wallet_address: address, chain });
      setSuccess({ amount: record.amount, chain: record.chain, address: record.wallet_address });
      setAmount("");
      setAddress("");
      await loadHistory();
    } catch (e) {
      setError(e.message || "Error during withdrawal request");
    } finally {
      setBusy(false);
    }
  };

  const quickAmount = (pct) => setAmount((wallet ? (wallet.balance * pct / 100) : 0).toFixed(2));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#080808] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime/10 flex items-center justify-center">
              <ArrowDownToLine className="w-5 h-5 text-lime" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg leading-none">Withdraw winnings</h3>
              <p className="text-xs text-white/40 mt-1">Available balance: <span className="text-lime font-bold">{wallet ? Number(wallet.balance).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"} {wallet?.currency}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-lime/10 border border-lime/30 text-sm text-lime">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> 
              <div>
                <p>Withdrawal request registered successfully.</p>
                <p className="text-white/50 text-xs mt-1">{success.amount} {wallet?.currency} on {success.chain} · processing</p>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Withdrawal amount</label>
            <div className="mt-2 relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-12 rounded-xl bg-[#1a1a1a] border border-white/10 px-4 pr-20 text-lg font-bold text-white outline-none focus:border-lime/40 placeholder-white/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/40">{wallet?.currency || "USDT"}</span>
            </div>
            <div className="flex gap-2 mt-2">
              {[25, 50, 100].map((p) => (
                <button key={p} onClick={() => quickAmount(p)} className="flex-1 h-9 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:bg-lime/10 hover:text-lime hover:border-lime/30 transition">
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
                  key={c.id}
                  onClick={() => setChain(c.id)}
                  className={`h-11 rounded-xl border text-sm font-bold transition ${
                    chain === c.id
                      ? "bg-lime/10 border-lime/40 text-lime"
                      : "bg-[#1a1a1a] border-white/10 text-white/60 hover:border-white/20"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Destination wallet address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={activeChain.addr}
              className="w-full h-12 mt-2 rounded-xl bg-[#1a1a1a] border border-white/10 px-4 text-sm font-mono text-white outline-none focus:border-lime/40 placeholder-white/20"
            />
          </div>

          <div className="rounded-xl bg-[#1a1a1a] border border-white/5 p-4 space-y-1.5 text-sm">
            <Row label="Requested amount" value={`${amt.toFixed(2)} ${wallet?.currency || "USDT"}`} />
            <Row label="Network fee" value={`${activeChain.fee} ${wallet?.currency || "USDT"}`} muted />
            <div className="border-t border-white/5 my-1" />
            <Row label="You'll receive (net)" value={`${net} ${wallet?.currency || "USDT"}`} accent />
            <Row label="Balance after withdrawal" value={`${wallet ? Math.max(0, +(wallet.balance - amt)).toFixed(2) : "—"} ${wallet?.currency || "USDT"}`} muted />
          </div>

          <button
            onClick={submit}
            disabled={busy || !amount || !address}
            className="w-full h-12 rounded-xl bg-lime text-black font-black hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {busy ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : "Confirm withdrawal"}
          </button>
          <p className="text-xs text-white/30 text-center">Withdrawals are processed on-chain within 24h · Provably fair and trackable</p>
        </div>

        {history.length > 0 && (
          <div className="border-t border-white/5 p-5">
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-3">Recent withdrawals</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
              {history.map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-lg bg-[#1a1a1a] border border-white/5 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-bold text-white">{Number(w.amount).toFixed(2)} {w.currency}</p>
                    <p className="text-xs text-white/40 font-mono truncate max-w-[180px]">{w.wallet_address}</p>
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
    </div>
  );
}

function Row({ label, value, accent, muted }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50">{label}</span>
      <span className={`font-bold ${accent ? "text-lime" : muted ? "text-white/60" : "text-white"}`}>{value}</span>
    </div>
  );
}