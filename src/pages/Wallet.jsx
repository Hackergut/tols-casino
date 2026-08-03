import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "@/components/WalletProvider";
import { ArrowDownToLine, ArrowUpFromLine, Crown, ArrowLeft } from "lucide-react";
import RealDeposit from "@/components/wallet/RealDeposit";
import WithdrawForm from "@/components/wallet/WithdrawForm";

export default function Wallet() {
  const { wallet, vipTier, loading } = useWallet();
  const [tab, setTab] = useState("deposit");

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-lime transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Lobby
        </Link>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#161616] to-[#0d0d0d] p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Available balance</p>
              <p className="text-4xl font-black text-white mt-1 tabular-nums">
                {loading ? "—" : Number(wallet && wallet.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                <span className="text-lg text-lime ml-2">{wallet && wallet.currency || "USDT"}</span>
              </p>
            </div>
            <div className="text-right">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ color: (vipTier && vipTier.color) || "#ccff00", background: `${(vipTier && vipTier.color) || "#ccff00"}1a`, border: `1px solid ${(vipTier && vipTier.color) || "#ccff00"}40` }}
              >
                <Crown className="w-3.5 h-3.5" /> {(vipTier && vipTier.name) || "Bronze"}
              </span>
              <p className="text-xs text-white/30 mt-2">Wagered: {Number(wallet && wallet.total_wagered || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-[#1a1a1a] border border-white/10 w-fit mb-6">
          <button onClick={() => setTab("deposit")} className={`flex items-center gap-2 px-5 h-11 rounded-lg text-sm font-black transition ${tab === "deposit" ? "bg-lime text-black" : "text-white/50 hover:text-white"}`}>
            <ArrowDownToLine className="w-4 h-4" /> Deposit
          </button>
          <button onClick={() => setTab("withdraw")} className={`flex items-center gap-2 px-5 h-11 rounded-lg text-sm font-black transition ${tab === "withdraw" ? "bg-lime text-black" : "text-white/50 hover:text-white"}`}>
            <ArrowUpFromLine className="w-4 h-4" /> Withdraw
          </button>
        </div>

        {tab === "deposit" ? <RealDeposit /> : <WithdrawForm />}
      </div>
    </div>
  );
}