import React, { useState } from "react";
import { BetPanel, ResultBadge, useProvablyFair } from "@/components/games/shared";
import { useWallet } from "@/components/WalletProvider";

export default function DiceGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [target, setTarget] = useState(50);
  const [direction, setDirection] = useState("over"); // over | under
  const [lastRoll, setLastRoll] = useState(null);
  const [busy, setBusy] = useState(false);

  const winChance = direction === "over" ? 100 - target : target;
  const multiplier = (99 / winChance).toFixed(4);
  const payout = amount * multiplier;

  const play = async () => {
    if (busy || !wallet || amount > wallet.balance || amount <= 0) return;
    setBusy(true);
    const r = await pf.roll();
    const roll = Math.floor(r * 10000) / 100; // 0.00 - 99.99
    const won = direction === "over" ? roll > target : roll < target;
    const mult = won ? +multiplier : 0;
    const net = won ? payout - amount : -amount;
    setLastRoll({ roll, won, multiplier: mult, payout: won ? payout : amount });
    updateBalance(net, amount);
    recordBet({ game_id: "dice", game_name: "Dice", amount, multiplier: mult, payout: won ? payout : 0, result: won ? "win" : "lose", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
    setBusy(false);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6">
        <div className="relative rounded-2xl border border-white/10 bg-[#111] p-8 min-h-[280px] flex flex-col items-center justify-center">
          <div className="text-xs font-semibold text-white/40 mb-2">LAST RESULT</div>
          {lastRoll ? (
            <div className={`text-6xl font-black tabular-nums ${lastRoll.won ? "text-lime" : "text-white"}`}>
              {lastRoll.roll.toFixed(2)}
            </div>
          ) : (
            <div className="text-6xl font-black text-white/20">00.00</div>
          )}
          {/* slider track */}
          <div className="w-full max-w-md mt-8">
            <div className="relative h-2 rounded-full bg-gradient-to-r from-lime to-[#333]">
              <input
                type="range"
                min="2"
                max="98"
                value={target}
                onChange={(e) => setTarget(+e.target.value)}
                className="absolute -top-2 left-0 w-full h-6 opacity-0 cursor-pointer"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-lime shadow-lg"
                style={{ left: `calc(${target}% - 10px)` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/40 font-semibold">
              <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setDirection("under")}
              className={`px-4 py-2 rounded-full text-sm font-bold ${direction === "under" ? "bg-lime text-black" : "bg-[#1a1a1a] text-white/60"}`}
            >
              Under {target}
            </button>
            <button
              onClick={() => setDirection("over")}
              className={`px-4 py-2 rounded-full text-sm font-bold ${direction === "over" ? "bg-lime text-black" : "bg-[#1a1a1a] text-white/60"}`}
            >
              Over {target}
            </button>
          </div>
        </div>
        {lastRoll && <ResultBadge result={lastRoll.won ? "win" : "lose"} multiplier={lastRoll.multiplier} payout={lastRoll.won ? lastRoll.payout - amount : -amount} />}
      </div>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} disabled={busy} betLabel={busy ? "..." : "Roll"} />
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Multiplier" value={`${multiplier}x`} />
          <Stat label="Win chance" value={`${winChance.toFixed(2)}%`} />
          <Stat label="Payout" value={`$${payout.toFixed(2)}`} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-white/10 p-3">
      <p className="text-[10px] uppercase text-white/40 font-semibold">{label}</p>
      <p className="text-sm font-bold text-lime mt-0.5">{value}</p>
    </div>
  );
}