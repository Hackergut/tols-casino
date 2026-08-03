import React, { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, ResultBadge, useProvablyFair } from "@/components/games/shared";

export default function CoinflipGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [choice, setChoice] = useState("heads"); // heads/tails
  const [streak, setStreak] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [last, setLast] = useState(null);

  const play = async () => {
    if (flipping || !wallet || amount > wallet.balance || amount <= 0) return;
    setFlipping(true);
    const r = await pf.roll();
    const result = r < 0.5 ? "heads" : "tails";
    const won = result === choice;
    const payout = won ? amount * 1.98 : 0;
    setLast({ result, won, multiplier: won ? 1.98 : 0, payout: won ? payout : amount });
    setFlipping(false);
    setStreak((s) => (won ? s + 1 : 0));
    updateBalance(won ? payout - amount : -amount, amount);
    recordBet({ game_id: "coinflip", game_name: "Coinflip", amount, multiplier: won ? 1.98 : 0, payout, result: won ? "win" : "lose", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#111] p-8 min-h-[300px] flex flex-col items-center justify-center">
          <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition ${last?.won ? "border-lime bg-lime/10" : "border-white/10 bg-[#1a1a1a]"} ${flipping ? "animate-spin" : ""}`}>
            <span className="text-3xl font-black italic" style={{ color: "#ccff00" }}>TOLS</span>
          </div>
          <div className="mt-4 text-sm font-bold text-white/60">
            {last ? (last.won ? `${last.result.toUpperCase()} — VINTA!` : `${last.result.toUpperCase()} — PERSA`) : "Scegli e lancia"}
          </div>
          {streak > 0 && <div className="mt-1 text-xs text-lime font-semibold">Streak: {streak} 🔥</div>}
        </div>
        {last && <ResultBadge result={last.won ? "win" : "lose"} multiplier={last.multiplier} payout={last.won ? last.payout - amount : -amount} />}
      </div>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} disabled={flipping} betLabel={flipping ? "..." : "Lancia"} />
        <div>
          <label className="text-xs font-semibold text-white/50 mb-1.5 block">La tua scelta</label>
          <div className="flex gap-2">
            {["heads", "tails"].map((c) => (
              <button
                key={c}
                onClick={() => setChoice(c)}
                className={`flex-1 h-12 rounded-xl text-sm font-bold capitalize ${choice === c ? "bg-lime text-black" : "bg-[#1a1a1a] text-white/60 border border-white/10"}`}
              >
                {c === "heads" ? "Testa" : "Croce"}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-2">Payout: <span className="text-lime font-bold">1.98x</span></p>
        </div>
      </div>
    </div>
  );
}