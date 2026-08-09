import React, { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import GameFrame from "@/components/games/GameFrame";
import { Zap } from "lucide-react";

export default function BlitzGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const play = async () => {
    if (busy || !wallet || amount > wallet.balance) return;
    setBusy(true);
    const r = await pf.roll();
    const mul = r < 0.05 ? 50 : r < 0.15 ? 10 : r < 0.4 ? 2 : 0;
    const won = mul > 0;
    const payout = won ? amount * mul : 0;
    setResult({ mul, won, payout });
    updateBalance(won ? payout - amount : -amount, amount);
    recordBet({ game_id: "blitz", game_name: "Blitz", amount, multiplier: mul, payout, result: won ? "win" : "lose", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
    setTimeout(()=> setBusy(false), 600);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <GameFrame title="Blitz" stats={[{label:"Speed", value: `${speed}x`}, {label:"Last", value: result? `${result.mul}x` : "—"}, {label:"Result", value: result? (result.won?"WIN":"LOSE") : "—"}]}>
        <motion.div animate={{ rotate: busy ? 360 : 0 }} transition={{ duration: 0.5, repeat: busy? Infinity: 0, ease: "linear" }} className="w-32 h-32 rounded-full border-4 border-lime flex items-center justify-center bg-[#121212]">
          <Zap className="w-12 h-12 text-lime" />
        </motion.div>
        {result && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`mt-4 px-6 py-3 rounded-xl font-black text-xl ${result.won ? "bg-lime text-black" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>{result.won ? `+${result.mul}x` : `0x`}</motion.div>}
      </GameFrame>
      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} disabled={busy} betLabel={busy ? "Blitz..." : "Blitz!"} />
        <div className="flex gap-2">{[1,2,3].map(s=> <button key={s} onClick={()=> setSpeed(s)} className={`flex-1 h-10 rounded-xl font-bold ${speed===s?"bg-lime text-black":"bg-[#1a1a1a] border border-white/10 text-white/60"}`}>{s}x</button>)}</div>
      </div>
    </div>
  );
}
