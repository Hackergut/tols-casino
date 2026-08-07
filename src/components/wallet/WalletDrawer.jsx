import React, { useState } from "react";
import { X } from "lucide-react";
import RealDeposit from "@/components/wallet/RealDeposit";
import WithdrawForm from "@/components/wallet/WithdrawForm";
import { COINS as _COINS } from "@/components/wallet/coins";
// Back-compat re-export (previously defined here)
export const COINS = _COINS;

const TABS = [
  { id: "deposit", label: "Deposit" },
  { id: "withdraw", label: "Withdraw" },
  { id: "buy", label: "Buy Crypto" },
  { id: "tip", label: "Tip" },
];

export default function WalletDrawer({ initialTab = "deposit", initialCoin = "solana", onClose }) {
  const [tab, setTab] = useState(initialTab);
  const [coin, setCoin] = useState(initialCoin);

  return (
    <div className="flex flex-col h-full max-h-[92vh] bg-[#121212]">
      {/* Tabs (underline) + close */}
      <div className="flex items-center gap-1 px-3 border-b border-white/10 shrink-0">
        <div className="flex gap-5 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative h-14 text-sm font-bold whitespace-nowrap transition ${
                tab === t.id ? "text-white" : "text-white/45 hover:text-white/70"
              }`}
            >
              {t.label}
              {tab === t.id && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-lime" />}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="ml-auto shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
        {tab === "deposit" ? (
          <RealDeposit coin={coin} setCoin={setCoin} onClose={onClose} />
        ) : tab === "withdraw" ? (
          <WithdrawForm coin={coin} setCoin={setCoin} onClose={onClose} />
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#1a1a1a] py-16 text-center">
            <p className="text-sm text-white/50">
              {tab === "buy" ? "Buy crypto" : "Tip"} coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}