import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { BetPanel, ResultBadge, useProvablyFair } from "@/components/games/shared";
import { useWallet } from "@/components/WalletProvider";
import { diceMultiplier } from "@/lib/gameEngine";
import GameFrame from "@/components/games/GameFrame";

export default function DiceGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [target, setTarget] = useState(50);
  const [direction, setDirection] = useState("over"); // over | under
  const [lastRoll, setLastRoll] = useState(null);
  const [display, setDisplay] = useState(null);
  const [busy, setBusy] = useState(false);
  const timers = useRef([]);

  const winChance = direction === "over" ? 100 - target : target;
  const multiplier = diceMultiplier(winChance).toFixed(4);
  const payout = amount * multiplier;

  const animate = (to, done) => {
    timers.current.forEach(clearTimeout);
    let start=null;
    const duration=560;
    const tick=(now)=>{
      if(!start) start=now;
      const p=Math.min(1,(now-start)/duration);
      const e=1-Math.pow(1-p,3);
      setDisplay(to*e);
      if(p<1) timers.current.push(requestAnimationFrame(tick));
      else { setDisplay(to); done(); }
    };
    timers.current.push(requestAnimationFrame(tick));
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const play = async () => {
    if (busy || !wallet || amount > wallet.balance || amount <= 0) return;
    setBusy(true);
    setDisplay(0);
    const r = await pf.roll();
    const roll = Math.floor(r * 10000) / 100; // 0.00 - 99.99
    const won = direction === "over" ? roll > target : roll < target;
    const mult = won ? +multiplier : 0;
    const net = won ? payout - amount : -amount;
    setLastRoll({ roll, won, multiplier: mult, payout: won ? payout : amount });
    updateBalance(net, amount);
    recordBet({ game_id: "dice", game_name: "Dice", amount, multiplier: mult, payout: won ? payout : 0, result: won ? "win" : "lose", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
    animate(roll, () => setBusy(false));
  };

  const shown = busy && display != null ? display : lastRoll ? lastRoll.roll : null;

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6">
        <GameFrame
          title="Dice"
          stats={[
            { label: "Multiplier", value: `${multiplier}x` },
            { label: "Win chance", value: `${winChance.toFixed(2)}%` },
            { label: "Payout", value: `$${payout.toFixed(2)}` },
          ]}
        >
          <div className="text-xs font-semibold text-white/40 mb-2">LAST RESULT</div>
          <motion.div
            key={shown}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`text-6xl sm:text-7xl font-black tabular-nums ${shown == null ? "text-white/20" : lastRoll && lastRoll.won ? "text-lime" : "text-white"}`}
            style={shown != null && lastRoll && lastRoll.won ? { textShadow: "0 0 24px rgba(204,255,0,0.5)" } : undefined}
          >
            {shown != null ? shown.toFixed(2) : "00.00"}
          </motion.div>
          {/* Shuffle slider — thin track with markers */}
          <div className="w-full max-w-[520px] mt-6">
            <div className="relative h-[6px] rounded-full bg-[#1a1a1a] border border-white/10">
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/60 via-white/5 to-lime/60" />
              </div>
              <input type="range" min="2" max="98" value={target} onChange={(e) => setTarget(+e.target.value)} className="absolute -top-3 left-0 w-full h-8 opacity-0 cursor-pointer" />
              <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-lime shadow-[0_0_10px_rgba(204,255,0,0.5)]" style={{ left: `calc(${target}% - 8px)` }} />
              {lastRoll != null && <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-6 rounded-full" style={{ left: `${Math.max(0, Math.min(100, lastRoll.roll))}%`, background: lastRoll.won ? "#ccff00" : "#ff4f6a" }} />}
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] font-bold text-white/25"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
          </div>
          {/* Shuffle controls: Multiplier / Roll Over / Chance */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-[520px] mt-4">
            <div className="rounded-xl bg-[#121212] border border-white/[0.06] p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1">Multiplier <span className="ml-auto">↗</span></p>
              <p className="text-sm font-black text-white font-mono mt-1">{multiplier}x</p>
            </div>
            <div className="rounded-xl bg-[#121212] border border-white/[0.06] p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1">Roll Over <span className="ml-auto">⇄</span></p>
              <p className="text-sm font-black text-white font-mono mt-1">{target}</p>
            </div>
            <div className="rounded-xl bg-[#121212] border border-white/[0.06] p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Chance</p>
              <p className="text-sm font-black text-white font-mono mt-1">{winChance.toFixed(2)}%</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setDirection("under")} className={`flex-1 h-9 rounded-xl text-xs font-black uppercase ${direction === "under" ? "bg-white text-black" : "bg-white/[0.06] border border-white/10 text-white/60"}`}>Under</button>
            <button onClick={() => setDirection("over")} className={`flex-1 h-9 rounded-xl text-xs font-black uppercase ${direction === "over" ? "bg-white text-black" : "bg-white/[0.06] border border-white/10 text-white/60"}`}>Over</button>
          </div>
        </GameFrame>
        {lastRoll && <ResultBadge result={lastRoll.won ? "win" : "lose"} multiplier={lastRoll.multiplier} payout={lastRoll.won ? lastRoll.payout - amount : -amount} />}
      </div>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} disabled={busy} betLabel={busy ? "..." : "Roll"} profit={amount * multiplier - amount} />
      </div>
    </div>
  );
}