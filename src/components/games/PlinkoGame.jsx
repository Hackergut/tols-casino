import React, { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import { PLINKO_ROW_COUNT, PLINKO_MULTIPLIERS } from "@/lib/gameEngine";

export default function PlinkoGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [risk, setRisk] = useState("medium");
  const [balls, setBalls] = useState([]);
  const [lastBucket, setLastBucket] = useState(null);

  const muls = PLINKO_MULTIPLIERS[risk];
  const buckets = muls.length;

  const play = async () => {
    if (!wallet || amount > wallet.balance || amount <= 0) return;
    let pos = PLINKO_ROW_COUNT / 2;
    for (let i = 0; i < PLINKO_ROW_COUNT; i++) {
      const r = await pf.roll();
      pos += r < 0.5 ? -0.5 : 0.5;
    }
    const bucket = Math.max(0, Math.min(buckets - 1, Math.round(pos)));
    const mul = muls[bucket];
    setLastBucket(bucket);
    setBalls((b) => [{ id: Date.now(), bucket }].concat(b).slice(0, 20));
    const payout = amount * mul;
    updateBalance(payout - amount, amount);
    recordBet({
      game_id: "plinko", game_name: "Plinko", amount,
      multiplier: mul, payout,
      result: mul >= 1 ? "win" : "lose",
      client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce,
    });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6 flex flex-col items-center">
        <div className="relative" style={{ width: 280, maxWidth: "100%" }}>
          {Array.from({ length: PLINKO_ROW_COUNT + 1 }).map((_, row) => (
            <div key={row} className="flex justify-center gap-3" style={{ marginTop: 18 }}>
              {Array.from({ length: row + 1 }).map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/15" />
              ))}
            </div>
          ))}
        </div>
        <div
          className="grid gap-1 mt-3 w-full"
          style={{ gridTemplateColumns: `repeat(${buckets}, 1fr)` }}
        >
          {muls.map((m, i) => (
            <div
              key={i}
              className={`h-12 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                lastBucket === i
                  ? "bg-lime text-black border-lime"
                  : m >= 1
                  ? "bg-lime/15 text-lime border-lime/20"
                  : "bg-[#1a1a1a] text-white/40 border-white/5"
              }`}
            >
              {m.toFixed(2)}x
            </div>
          ))}
        </div>
        {lastBucket !== null && (
          <p className="mt-4 text-sm font-bold text-white/60">
            Result: <span className="text-lime">{muls[lastBucket].toFixed(2)}x</span>
          </p>
        )}
      </div>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} betLabel="Drop ball" />
        <div>
          <label className="text-xs font-semibold text-white/50 mb-1.5 block">Risk</label>
          <div className="flex gap-2">
            {["low", "medium", "high"].map((r) => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                className={`flex-1 h-11 rounded-xl text-sm font-bold capitalize ${
                  risk === r ? "bg-lime text-black" : "bg-[#1a1a1a] text-white/60 border border-white/10"
                }`}
              >
                {r === "low" ? "Low" : r === "medium" ? "Medium" : "High"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}