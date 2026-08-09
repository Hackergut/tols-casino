import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import GameFrame from "@/components/games/GameFrame";

const LEVELS = 8;
export default function TowerGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [level, setLevel] = useState(0);
  const [active, setActive] = useState(false);
  const [bombs, setBombs] = useState([]);
  const [revealed, setRevealed] = useState([]);

  const start = async () => {
    if (!wallet || amount > wallet.balance) return;
    const b = [];
    for(let i=0;i<LEVELS;i++){ const r=await pf.roll(); b.push(r < 0.3 ? Math.floor(r*3) : -1); }
    setBombs(b); setLevel(0); setRevealed([]); setActive(true);
  };
  const pick = (col) => {
    if (!active) return;
    const bomb = bombs[level];
    if (bomb===col) {
      setActive(false);
      updateBalance(-amount, amount);
      recordBet({ game_id: "tower", game_name: "Tower", amount, multiplier: 0, payout: 0, result: "lose", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
    } else {
      const nl = level+1;
      setRevealed([...revealed, level]);
      if (nl >= LEVELS) {
        const mul = 8;
        const payout = amount * mul;
        setActive(false);
        updateBalance(payout - amount, amount);
        recordBet({ game_id: "tower", game_name: "Tower", amount, multiplier: mul, payout, result: "win", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
      } else setLevel(nl);
    }
  };
  const cashout = () => {
    if (!active || level===0) return;
    const mul = 1 + level * 0.8;
    const payout = amount * mul;
    setActive(false);
    updateBalance(payout - amount, amount);
    recordBet({ game_id: "tower", game_name: "Tower", amount, multiplier: mul, payout, result: "win", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <GameFrame title="Tower" stats={[{label:"Level", value: `${level}/${LEVELS}`}, {label:"Next", value: active? `${(1+level*0.8).toFixed(2)}x` : "—"}]}>
        <div className="w-full max-w-xs space-y-1">
          {Array.from({length: LEVELS}).map((_, i)=> {
            const idx = LEVELS-1-i;
            const isActive = idx===level && active;
            const isRevealed = revealed.includes(idx);
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.03 }} className={`grid grid-cols-3 gap-1 p-1 rounded-lg ${isActive ? "bg-lime/10 border border-lime/30" : isRevealed ? "bg-lime/20" : "bg-[#1a1a1a] border border-white/5"}`}>
                {[0,1,2].map(col=> (
                  <button key={col} onClick={()=> isActive && pick(col)} disabled={!isActive} className={`h-8 rounded-md font-bold text-xs ${isRevealed && bombs[idx]===col ? "bg-red-500 text-white" : isRevealed ? "bg-lime text-black" : "bg-white/5 hover:bg-white/10 text-white/60"}`}>
                    {isRevealed ? (bombs[idx]===col ? "💣" : "✓") : "?"}
                  </button>
                ))}
              </motion.div>
            );
          })}
        </div>
        {active && level>0 && <button onClick={cashout} className="mt-4 px-6 py-2 rounded-full bg-lime text-black font-black">Cashout {(amount*(1+level*0.8)).toFixed(2)}</button>}
      </GameFrame>
      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={start} disabled={active} betLabel={active? "Climbing...":"Start Tower"} />
      </div>
    </div>
  );
}
