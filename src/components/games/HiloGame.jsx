import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import GameFrame from "@/components/games/GameFrame";
import { ArrowUp, ArrowDown } from "lucide-react";

const CARDS = [2,3,4,5,6,7,8,9,10,11,12,13,14]; // 11=J,12=Q,13=K,14=A
function cardLabel(v){ if(v===11) return "J"; if(v===12) return "Q"; if(v===13) return "K"; if(v===14) return "A"; return String(v); }

export default function HiloGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [current, setCurrent] = useState(7);
  const [next, setNext] = useState(null);
  const [streak, setStreak] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const play = async (dir) => {
    if (busy || !wallet || amount > wallet.balance) return;
    setBusy(true);
    const r = await pf.roll();
    const idx = Math.floor(r * CARDS.length);
    const nxt = CARDS[idx];
    setNext(nxt);
    const won = dir === "higher" ? nxt > current : nxt < current;
    const isTie = nxt === current;
    const finalWon = isTie ? false : won;
    const mul = finalWon ? 1.9 : 0;
    const payout = finalWon ? amount * mul : 0;
    setResult({ won: finalWon, mul, payout, dir, tie: isTie });
    if (finalWon) {
      setStreak((s)=> s+1);
      setCurrent(nxt);
      updateBalance(payout - amount, amount);
    } else {
      setStreak(0);
      if (!isTie) updateBalance(-amount, amount);
    }
    recordBet({ game_id: "hilo", game_name: "Hilo", amount, multiplier: mul, payout, result: finalWon ? "win" : "lose", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
    setTimeout(()=> setBusy(false), 600);
  };

  const cashout = () => {
    if (streak===0) return;
    const payout = amount * (1 + streak * 0.5);
    updateBalance(payout, amount);
    recordBet({ game_id: "hilo", game_name: "Hilo", amount: 0, multiplier: 1 + streak*0.5, payout, result: "win", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
    setStreak(0);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <GameFrame title="Hilo" stats={[{label:"Current", value: cardLabel(current), tone:"default"}, {label:"Streak", value: `${streak}x`}, {label:"Next", value: next? cardLabel(next): "—"}]}>
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4">
            <motion.div key={current} initial={{ scale: 0.8, y: 10 }} animate={{ scale: 1, y: 0 }} transition={{ type:"spring", stiffness:400, damping:25 }} className="w-28 h-40 rounded-2xl bg-white border-4 border-white/10 flex flex-col items-center justify-center shadow-xl">
              <span className="text-4xl font-black text-black">{cardLabel(current)}</span>
              <span className="text-xs font-bold text-black/40">Current</span>
            </motion.div>
            <AnimatePresence>
              {next && (
                <motion.div key={next+result?.dir} initial={{ x: 40, opacity: 0, rotate: 5 }} animate={{ x: 0, opacity: 1, rotate: 0 }} exit={{ x: -40, opacity: 0 }} transition={{ type:"spring", stiffness:400, damping:25 }} className={`w-28 h-40 rounded-2xl border-4 flex flex-col items-center justify-center shadow-xl ${result?.won ? "bg-lime border-lime" : result?.tie ? "bg-yellow-400 border-yellow-400" : "bg-red-500 border-red-500"}`}>
                  <span className="text-4xl font-black text-black">{cardLabel(next)}</span>
                  <span className="text-xs font-bold text-black/60">{result?.won ? "WIN" : result?.tie ? "TIE" : "LOSE"}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={()=> play("higher")} disabled={busy} className="h-14 px-8 rounded-xl bg-lime text-black font-black flex items-center gap-2 disabled:opacity-40"><ArrowUp className="w-5 h-5" /> Higher</motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={()=> play("lower")} disabled={busy} className="h-14 px-8 rounded-xl bg-white text-black font-black flex items-center gap-2 disabled:opacity-40"><ArrowDown className="w-5 h-5" /> Lower</motion.button>
          </div>
          {streak>0 && <button onClick={cashout} className="text-sm font-bold text-lime underline">Cashout streak x{(1+streak*0.5).toFixed(2)}</button>}
        </div>
      </GameFrame>
      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={()=>{}} disabled={true} betLabel={`Streak ${streak}`} />
        <p className="text-xs text-white/40 text-center">Guess if next card is higher or lower. Tie loses. Build streak to cashout.</p>
      </div>
    </div>
  );
}
