import React from "react";
import { Link } from "react-router-dom";
import { useWallet } from "@/components/WalletProvider";
import { Crown, ArrowLeft } from "lucide-react";
import WalletDrawer from "@/components/wallet/WalletDrawer";

export default function Wallet() {
  const { wallet, vipTier, loading } = useWallet();

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-lime transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Lobby
        </Link>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#161616] to-[#0d0d0d] p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Available balance</p>
              <p className="text-3xl sm:text-4xl font-black text-white mt-1 tabular-nums">
                {loading ? "—" : Number((wallet && wallet.balance) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                <span className="text-lg text-lime ml-2">{(wallet && wallet.currency) || "USDT"}</span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  color: (vipTier && vipTier.color) || "#ccff00",
                  background: `${(vipTier && vipTier.color) || "#ccff00"}1a`,
                  border: `1px solid ${(vipTier && vipTier.color) || "#ccff00"}40`,
                }}
              >
                <Crown className="w-3.5 h-3.5" /> {(vipTier && vipTier.name) || "Bronze"}
              </span>
              <p className="text-xs text-white/30 mt-2">Wagered: {Number((wallet && wallet.total_wagered) || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#080808] overflow-hidden h-[600px] sm:h-[640px]">
          <WalletDrawer initialTab="deposit" />
        </div>
      </div>
    </div>
  );
}