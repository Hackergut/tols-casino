import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import { KENO_GRID, KENO_PICKS, kenoPaytable, RTP } from "@/lib/gameEngine";
import GameFrame from "@/components/games/GameFrame";

export default function KenoGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [picks, setPicks] = useState([]);
  const [drawn, setDrawn] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [matches, setMatches] = useState(0);

  const paytable = useMemo(() => kenoPaytable(), []);
  const canPlay = picks.length === KENO_PICKS && !playing;

  const togglePick = (n) => {
    if (playing) return;
    setPicks((p) =>
      p.includes(n) ? p.filter((x) => x !== n) : p.length < KENO_PICKS ? [...p, n] : p
    );
  };

  const play = async () => {
    if (!canPlay || !wallet || amount > wallet.balance || amount <= 0) return;
    setPlaying(true);
    setDrawn([]);
    setMatches(0);
    const drawnSet = new Set();
    while (drawnSet.size < 10) {
      const r = await pf.roll();
      drawnSet.add(Math.floor(r * KENO_GRID) + 1);
    }
    const drawnArr = Array.from(drawnSet);
    // sequential reveal animation
    const revealed = [];
    for (const num of drawnArr) {
      await new Promise((res) => setTimeout(res, 190));
      revealed.push(num);
      setDrawn([...revealed]);
      setMatches(revealed.filter((x) => picks.includes(x)).length);
    }
    const m = drawnArr.filter((x) => picks.includes(x)).length;
    const mul = paytable[m] || 0;
    const payout = amount * mul;
    setPlaying(false);
    updateBalance(payout - amount, amount);
    recordBet({
      game_id: "keno", game_name: "Keno", amount,
      multiplier: mul, payout,
      result: mul >= 1 ? "win" : "lose",
      client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce,
    });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <GameFrame
        title="Keno"
        minH=""
        stats={[
          { label: "Picked", value: `${picks.length}/${KENO_PICKS}`, tone: picks.length === KENO_PICKS ? "default" : "muted" },
          { label: "Matches", value: drawn.length ? matches : "—" },
          { label: "Multiplier", value: `${paytable[matches] || 0}x` },
        ]}
      >
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 w-full">
          {Array.from({ length: KENO_GRID }).map((_, i) => {
            const n = i + 1;
            const isPicked = picks.includes(n);
            const isDrawn = drawn.includes(n);
            const isHit = isPicked && isDrawn;
            return (
              <motion.button
                key={n}
                onClick={() => togglePick(n)}
                disabled={playing}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.005 }}
                whileHover={!playing ? { scale: 1.05 } : {}}
                whileTap={!playing ? { scale: 0.95 } : {}}
                className={`aspect-square rounded-lg text-xs font-bold ${
                  isHit
                    ? "bg-lime text-black border-lime"
                    : isPicked
                    ? "bg-lime/20 text-lime border-lime/40"
                    : isDrawn
                    ? "bg-white/10 text-white/60 border-white/20"
                    : "bg-[#1a1a1a] text-white/50 border-white/5 hover:border-lime/30"
                } border`}
              >
                <AnimatePresence>
                  {isDrawn && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
                      {n}
                    </motion.span>
                  )}
                  {!isDrawn && n}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </GameFrame>

      <div className="space-y-4">
        <BetPanel
          amount={amount}
          setAmount={setAmount}
          onBet={play}
          disabled={!canPlay}
          betLabel={playing ? "Drawing..." : picks.length < KENO_PICKS ? `Pick ${KENO_PICKS - picks.length} more` : "Draw"}
        />
        <div className="text-xs text-white/40">
          <p className="font-semibold text-white/60 mb-1">Paytable (10-spot)</p>
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(paytable)
              .filter(([, v]) => v > 0)
              .map(([k, v]) => (
                <span key={k} className="px-2 py-1 rounded bg-[#1a1a1a] text-center">
                  {k}→{v}x
                </span>
              ))}
          </div>
          <p className="mt-2 text-white/30">RTP {(RTP * 100).toFixed(1)}% · Provably fair draw of 10/40</p>
        </div>
      </div>
    </div>
  );
}