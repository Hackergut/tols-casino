import React, { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import RealDeposit from "@/components/wallet/RealDeposit";
import WithdrawForm from "@/components/wallet/WithdrawForm";

export const COINS = [
  { id: "solana", symbol: "SOL", name: "Solana", color: "#9945FF" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", color: "#627EEA" },
  { id: "polygon", symbol: "POL", name: "Polygon", color: "#8247E5" },
];

export default function WalletDrawer({ initialTab = "deposit", initialCoin = "solana" }) {
  const [tab, setTab] = useState(initialTab);
  const [coin, setCoin] = useState(initialCoin);

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d]">
      {/* Tabs */}
      <div className="flex gap-1 p-1 m-3 mb-0 rounded-xl bg-[#1a1a1a] border border-white/10 shrink-0">
        <button
          onClick={() => setTab("deposit")}
          className={`flex-1 h-11 rounded-lg text-sm font-black flex items-center justify-center gap-2 transition ${
            tab === "deposit" ? "bg-lime text-black" : "text-white/50 hover:text-white"
          }`}
        >
          <ArrowDownToLine className="w-4 h-4" /> Deposit
        </button>
        <button
          onClick={() => setTab("withdraw")}
          className={`flex-1 h-11 rounded-lg text-sm font-black flex items-center justify-center gap-2 transition ${
            tab === "withdraw" ? "bg-lime text-black" : "text-white/50 hover:text-white"
          }`}
        >
          <ArrowUpFromLine className="w-4 h-4" /> Withdraw
        </button>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row min-h-0 mt-3">
        {/* Coin list */}
        <div className="sm:w-36 shrink-0 sm:border-r border-b sm:border-b-0 border-white/5 overflow-x-auto sm:overflow-y-auto scrollbar-hide py-2 px-2 flex sm:flex-col gap-1">
          {COINS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCoin(c.id)}
              className={`flex items-center gap-2.5 h-12 px-2.5 rounded-lg transition shrink-0 min-w-[96px] sm:min-w-0 ${
                coin === c.id ? "bg-lime/10 text-lime border border-lime/30" : "text-white/60 hover:bg-white/5 border border-transparent"
              }`}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-black"
                style={{ background: c.color }}
              >
                {c.symbol}
              </span>
              <span className="text-sm font-bold">{c.symbol}</span>
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-3">
          {tab === "deposit" ? <RealDeposit chain={coin} /> : <WithdrawForm chain={coin} />}
        </div>
      </div>
    </div>
  );
}