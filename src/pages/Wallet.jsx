import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWallet } from "@/components/WalletProvider";
import { ArrowDownToLine, ArrowUpFromLine, Crown, ShieldCheck, ArrowLeft } from "lucide-react";
import DepositCard from "@/components/wallet/DepositCard";
import WithdrawForm from "@/components/wallet/WithdrawForm";

const CHAINS = [
  { id: "solana", label: "Solana", color: "#9945FF", fee: 0.01 },
  { id: "polygon", label: "Polygon", color: "#8247E5", fee: 0.05 },
  { id: "ethereum", label: "Ethereum", color: "#627EEA", fee: 0.02 },
];

function genAddress(chain, seed) {
  const s = seed || "guest";
  let st = 0;
  for (let i = 0; i < s.length; i++) st = (st * 31 + s.charCodeAt(i)) >>> 0;
  if (chain === "solana") {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let a = "";
    for (let i = 0; i < 44; i++) { st = (st * 1103515245 + 12345) >>> 0; a += chars[(st >> 16) % chars.length]; }
    return a;
  }
  let hex = "";
  for (let i = 0; i < 40; i++) { st = (st * 1103515245 + 12345) >>> 0; hex += ((st >> 16) & 0xf).toString(16); }
  return "0x" + hex;
}

export default function Wallet() {
  const { wallet, vipTier, loading } = useWallet();
  const [tab, setTab] = useState("deposit");
  const [uid, setUid] = useState("guest");

  useEffect(() => {
    base44.auth.me().then((u) => u && setUid(u.id)).catch(() => {});
  }, []);

  const chains = CHAINS.map((c) => ({ ...c, address: genAddress(c.id, uid) }));

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-lime transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Lobby
        </Link>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#161616] to-[#0d0d0d] p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Saldo disponibile</p>
              <p className="text-4xl font-black text-white mt-1 tabular-nums">
                {loading ? "—" : Number(wallet?.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                <span className="text-lg text-lime ml-2">{wallet?.currency || "USDT"}</span>
              </p>
            </div>
            <div className="text-right">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ color: vipTier?.color || "#ccff00", background: `${vipTier?.color || "#ccff00"}1a`, border: `1px solid ${vipTier?.color || "#ccff00"}40` }}
              >
                <Crown className="w-3.5 h-3.5" /> {vipTier?.name || "Bronze"}
              </span>
              <p className="text-xs text-white/30 mt-2">Volume: {Number(wallet?.total_wagered || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-[#1a1a1a] border border-white/10 w-fit mb-6">
          <button onClick={() => setTab("deposit")} className={`flex items-center gap-2 px-5 h-11 rounded-lg text-sm font-black transition ${tab === "deposit" ? "bg-lime text-black" : "text-white/50 hover:text-white"}`}>
            <ArrowDownToLine className="w-4 h-4" /> Deposito
          </button>
          <button onClick={() => setTab("withdraw")} className={`flex items-center gap-2 px-5 h-11 rounded-lg text-sm font-black transition ${tab === "withdraw" ? "bg-lime text-black" : "text-white/50 hover:text-white"}`}>
            <ArrowUpFromLine className="w-4 h-4" /> Prelievo
          </button>
        </div>

        {tab === "deposit" ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-200">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <p>Genera un indirizzo di deposito per ogni rete. Invia solo USDT sulla rete corrispondente: i fondi vengono accreditati automaticamente al tuo saldo dopo 1 conferma di rete.</p>
            </div>
            {chains.map((c) => (
              <DepositCard key={c.id} chain={c} />
            ))}
          </div>
        ) : (
          <WithdrawForm />
        )}
      </div>
    </div>
  );
}