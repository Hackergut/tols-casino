import React, { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import GameFrame from "@/components/games/GameFrame";

const LANES = 5;
export default function ChickenGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [pos, setPos] = useState(0);
  const [active, setActive] = useState(false);
  const [busted, setBusted] = useState(false);

  const start = () => { setPos(0); setActive(true); setBusted(false); };
  const step = async () => {
    if (!active) return;
    const r = await pf.roll();
    const isBomb = r < 0.2;
    if (isBomb) {
      setBusted(true); setActive(false);
      updateBalance(-amount, amount);
      recordBet({ game_id: "chicken", game_name: "Chicken", amount, multiplier: 0, payout: 0, result: "lose", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
    } else {
      const np = pos+1;
      setPos(np);
      if (np >= LANES) {
        const mul = 5;
        const payout = amount * mul;
        setActive(false);
        updateBalance(payout - amount, amount);
        recordBet({ game_id: "chicken", game_name: "Chicken", amount, multiplier: mul, payout, result: "win", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
      }
    }
  };
  const cashout = () => {
    if (!active || pos===0) return;
    const mul = 1 + pos * 0.6;
    const payout = amount * mul;
    setActive(false);
    updateBalance(payout - amount, amount);
    recordBet({ game_id: "chicken", game_name: "Chicken", amount, multiplier: mul, payout, result: "win", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <GameFrame title="Chicken" stats={[{label:"Pos", value: `${pos}/${LANES}`}, {label:"Next", value: active? `${(1+pos*0.6).toFixed(2)}x` : "—"}]}>
        <div className="w-full max-w-md">
          <div className="relative h-12 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center px-2">
            <motion.div animate={{ x: `${(pos/LANES)*100}%` }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="absolute left-0 w-8 h-8 rounded-full bg-lime flex items-center justify-center text-sm">🐔</motion.div>
            {Array.from({length: LANES+1}).map((_,i)=> <div key={i} className="flex-1 h-1 bg-white/10 mx-1 rounded" />)}
          </div>
          {busted && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4 text-center py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-black">Busted!</motion.div>}
          <div className="flex gap-2 mt-4 justify-center">
            {!active ? <button onClick={start} className="px-6 h-10 rounded-xl bg-lime text-black font-black">Start</button> : (
              <>
                <button onClick={step} className="px-6 h-10 rounded-xl bg-white text-black font-black">Step</button>
                <button onClick={cashout} className="px-6 h-10 rounded-xl bg-lime text-black font-black">Cashout {(amount*(1+pos*0.6)).toFixed(2)}</button>
              </>
            )}
          </div>
        </div>
      </GameFrame>
      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={start} disabled={active} betLabel={active? "Crossing...":"Bet"} />
      </div>
    </div>
  );
}
