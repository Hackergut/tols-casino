import React, { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, ResultBadge, useProvablyFair } from "@/components/games/shared";
import { COINFLIP_MULTIPLIER } from "@/lib/gameEngine";
import GameFrame from "@/components/games/GameFrame";

export default function CoinflipGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [choice, setChoice] = useState("heads"); // heads/tails
  const [streak, setStreak] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [last, setLast] = useState(null);
  const [coinRot, setCoinRot] = useState(0);

  const play = async () => {
    if (flipping || !wallet || amount > wallet.balance || amount <= 0) return;
    setFlipping(true);
    const r = await pf.roll();
    const result = r < 0.5 ? "heads" : "tails";
    const won = result === choice;
    const payout = won ? amount * COINFLIP_MULTIPLIER : 0;

    // 3D flip: 5 full turns, land on the correct face (heads = 0°, tails = 180°)
    const base = Math.floor(coinRot / 360) * 360;
    const target = result === "heads" ? base + 360 * 5 : base + 360 * 5 + 180;
    setCoinRot(target);

    setTimeout(() => {
      setLast({ result, won, multiplier: won ? COINFLIP_MULTIPLIER : 0, payout: won ? payout : amount });
      setFlipping(false);
      setStreak((s) => (won ? s + 1 : 0));
      updateBalance(won ? payout - amount : -amount, amount);
      recordBet({ game_id: "coinflip", game_name: "Coinflip", amount, multiplier: won ? COINFLIP_MULTIPLIER : 0, payout, result: won ? "win" : "lose", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
    }, 1300);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <GameFrame
          title="Coinflip"
          stats={[
            { label: "Your pick", value: choice.toUpperCase(), tone: "muted" },
            { label: "Multiplier", value: `${COINFLIP_MULTIPLIER}x` },
            { label: "Streak", value: streak, tone: streak > 0 ? "default" : "muted" },
          ]}
        >
          <div style={{ perspective: 800 }}>
            <div
              className="relative w-32 h-32 rounded-full"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateX(${coinRot}deg)`,
                transition: "transform 1.25s cubic-bezier(0.2,0.8,0.1,1)",
              }}
            >
              {/* heads face */}
              <div className="absolute inset-0 rounded-full border-4 border-lime bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center" style={{ backfaceVisibility: "hidden" }}>
                <span className="text-5xl font-black italic text-lime">H</span>
              </div>
              {/* tails face */}
              <div className="absolute inset-0 rounded-full border-4 border-white/40 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center" style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)" }}>
                <span className="text-5xl font-black italic text-white">T</span>
              </div>
            </div>
          </div>
          <div className="mt-5 text-sm font-bold text-white/60">
            {last ? (last.won ? `${last.result.toUpperCase()} — WON!` : `${last.result.toUpperCase()} — LOST`) : "Pick and flip"}
          </div>
          {streak > 0 && <div className="mt-1 text-xs text-lime font-semibold">Streak: {streak} 🔥</div>}
        </GameFrame>
        {last && <ResultBadge result={last.won ? "win" : "lose"} multiplier={last.multiplier} payout={last.won ? last.payout - amount : -amount} />}
      </div>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} disabled={flipping} betLabel={flipping ? "..." : "Flip"} />
        <div>
          <label className="text-xs font-semibold text-white/50 mb-1.5 block">Your pick</label>
          <div className="flex gap-2">
            {["heads", "tails"].map((c) => (
              <button
                key={c}
                onClick={() => setChoice(c)}
                disabled={flipping}
                className={`flex-1 h-12 rounded-xl text-sm font-bold capitalize ${choice === c ? "bg-lime text-black" : "bg-[#1a1a1a] text-white/60 border border-white/10"}`}
              >
                {c === "heads" ? "Heads" : "Tails"}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-2">Payout: <span className="text-lime font-bold">{COINFLIP_MULTIPLIER}x</span></p>
        </div>
      </div>
    </div>
  );
}