import React, { useState, useMemo } from "react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import { KENO_GRID, KENO_PICKS, kenoPaytable } from "@/lib/gameEngine";

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
      <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6">
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
          {Array.from({ length: KENO_GRID }).map((_, i) => {
            const n = i + 1;
            const isPicked = picks.includes(n);
            const isDrawn = drawn.includes(n);
            const isHit = isPicked && isDrawn;
            return (
              <button
                key={n}
                onClick={() => togglePick(n)}
                disabled={playing}
                className={`aspect-square rounded-lg text-xs font-bold transition ${
                  isHit
                    ? "bg-lime text-black border-lime"
                    : isPicked
                    ? "bg-lime/20 text-lime border-lime/40"
                    : isDrawn
                    ? "bg-white/10 text-white/60 border-white/20"
                    : "bg-[#1a1a1a] text-white/50 border-white/5 hover:border-lime/30"
                }`}
                style={isDrawn ? { animation: "kenoPop 0.3s both" } : undefined}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-white/50">
            Picked: <span className="text-lime font-bold">{picks.length}</span>/{KENO_PICKS}
          </span>
          {drawn.length > 0 && (
            <span className="text-white/50">
              Matches: <span className="text-lime font-bold">{matches}</span> · {paytable[matches] || 0}x
            </span>
          )}
        </div>
      </div>

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
          <p className="mt-2 text-white/30">RTP 96% · Provably fair draw of 10/40</p>
        </div>
      </div>
    </div>
  );
}