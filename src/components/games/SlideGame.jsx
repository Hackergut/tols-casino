import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import GameFrame from "@/components/games/GameFrame";

export default function SlideGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [target, setTarget] = useState(50);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pos, setPos] = useState(50);

  const play = async () => {
    if (busy || !wallet || amount > wallet.balance) return;
    setBusy(true);
    const r = await pf.roll();
    const res = Math.floor(r * 100);
    setPos(res);
    const won = Math.abs(res - target) <= 5;
    const mul = won ? 8 : 0;
    const payout = won ? amount * mul : 0;
    setResult({ res, won, mul, payout });
    updateBalance(won ? payout - amount : -amount, amount);
    recordBet({ game_id: "slide", game_name: "Slide", amount, multiplier: mul, payout, result: won ? "win" : "lose", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
    setTimeout(()=> setBusy(false), 800);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <GameFrame title="Slide" stats={[{label:"Target", value: `${target}`}, {label:"Result", value: result? result.res : "—"}, {label:"Payout", value: result? `${result.mul}x` : "—"}]}>
        <div className="w-full max-w-md">
          <div className="relative h-4 rounded-full bg-[#1a1a1a] border border-white/10 overflow-hidden">
            <div className="absolute inset-y-0 w-2 bg-lime/30" style={{ left: `${target}%` }} />
            {result && <motion.div initial={{ left: "50%" }} animate={{ left: `${result.res}%` }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="absolute top-0 bottom-0 w-3 bg-white rounded-full shadow-lg" />}
            <input type="range" min="0" max="100" value={target} onChange={(e)=> setTarget(Number(e.target.value))} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/30"><span>0</span><span>50</span><span>100</span></div>
          {result && <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`mt-4 text-center py-3 rounded-xl border ${result.won ? "bg-lime/10 border-lime/30 text-lime" : "bg-red-500/10 border-red-500/30 text-red-400"}`}><p className="font-black">{result.won ? `WIN +${(result.payout - amount).toFixed(2)}` : `LOSE -${amount}`}</p></motion.div>}
        </div>
      </GameFrame>
      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} disabled={busy} betLabel={busy ? "..." : "Slide"} />
        <div><label className="text-xs font-bold text-white/40">Target</label><input type="range" min="0" max="100" value={target} onChange={(e)=> setTarget(Number(e.target.value))} className="w-full accent-lime" /></div>
      </div>
    </div>
  );
}
