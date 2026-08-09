import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "@/components/WalletProvider";
import { Crown, ArrowLeft, Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react";
import WalletDrawer from "@/components/wallet/WalletDrawer";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import SandboxNotice from "@/components/SandboxNotice";
import { useIntegrationMode } from "@/hooks/useIntegrationMode";

export default function Wallet() {
  const { wallet, vipTier, loading } = useWallet();
  const { mode } = useIntegrationMode();
  const [tab, setTab] = useState("deposit");

  const quickActions = [
    { id: "deposit", label: "Deposit", icon: ArrowDownToLine },
    { id: "withdraw", label: "Withdraw", icon: ArrowUpFromLine },
    { id: "history", label: "History", icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-lime transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Lobby
        </Link>

        <SandboxNotice />

        {/* Balance hero */}
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1f0a] via-[#121212] to-[#0a0a0a] p-5 sm:p-7 mb-5 overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-[0.08] pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-lime/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                <WalletIcon className="w-3.5 h-3.5" /> Available balance
              </p>
              <p className="text-4xl sm:text-5xl font-black text-white mt-2 tabular-nums">
                {loading ? "—" : Number((wallet && wallet.balance) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                <span className="text-xl text-lime ml-2">{(wallet && wallet.currency) || "USDT"}</span>
              </p>
              <p className="text-xs text-white/30 mt-2">
                Total wagered: {Number((wallet && wallet.total_wagered) || 0).toLocaleString()} · XP: {Number((wallet && wallet.xp) || 0).toLocaleString()}
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
              <p className="text-xs text-white/30 mt-2">{mode.livePaymentsEnabled ? "Live payments enabled" : "Sandbox wallet"}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {quickActions.map((a) => (
            <button key={a.id} onClick={() => setTab(a.id)}
              className={`h-12 rounded-xl border text-sm font-black flex items-center justify-center gap-2 transition ${
                tab === a.id ? "bg-lime text-black border-lime" : "bg-[#111] border-white/10 text-white/70 hover:text-white"
              }`}>
              <a.icon className="w-4 h-4" /> {a.label}
            </button>
          ))}
        </div>

        {tab === "history" ? (
          <TransactionHistory />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden">
            <div className="h-[620px] sm:h-[660px]">
              <WalletDrawer initialTab={tab} initialCoin="solana" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
