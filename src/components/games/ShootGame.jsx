import React, { useMemo, useState } from "react";
import { Crosshair } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, ResultBadge, useProvablyFair } from "@/components/games/shared";
import GameFrame from "@/components/games/GameFrame";
import { randomSeed } from "@/lib/provablyFair";

const MULTIPLIERS = [1, 2, 3, 5, 10];
const COLORS = ["#60a5fa", "#f59e0b", "#f97316", "#ef4444", "#ccff00"];

function mulberry(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function generateTargets(chosen, seed) {
  const rng = mulberry(seed);
  const targets = [];
  for (let i = 0; i < 4; i++) {
    const r = rng();
    if (r < 0.35) targets.push(0);
    else if (r < 0.7) targets.push(1);
    else targets.push(2);
  }
  const guaranteed = Math.max(chosen, Math.min(10, chosen + Math.round(rng() * (10 - chosen))));
  targets.splice(Math.floor(rng() * 5), 0, guaranteed);
  return targets.slice(0, 5);
}

function colorFor(m) {
  if (m >= 5) return "#ccff00";
  if (m >= 2) return "#4ade80";
  if (m >= 1) return "#60a5fa";
  return "#ef4444";
}

export default function ShootGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [targetMul, setTargetMul] = useState(2);
  const [phase, setPhase] = useState("idle"); // idle | shooting | done
  const [seed, setSeed] = useState(randomSeed());
  const [hitIdx, setHitIdx] = useState(null);
  const [revealed, setRevealed] = useState([]);
  const [last, setLast] = useState(null);

  const targets = useMemo(() => generateTargets(targetMul, seed), [seed, targetMul]);

  const shoot = async () => {
    if (phase !== "idle" || !wallet || amount <= 0 || amount > wallet.balance) return;
    setPhase("shooting");
    setHitIdx(null);
    setRevealed([]);
    const r = await pf.roll();
    const pick = Math.floor(r * 5);
    setHitIdx(pick);
    const multiplier = targets[pick];
    const won = multiplier >= targetMul;
    const payout = won ? +(amount * multiplier).toFixed(2) : 0;

    setTimeout(() => {
      setRevealed(targets.map((_, i) => i));
      setPhase("done");
      setLast({ won, multiplier: won ? multiplier : 0, payout: won ? payout - amount : -amount });
      updateBalance(won ? payout - amount : -amount, amount);
      recordBet({
        game_id: "shoot", game_name: "Shoot",
        amount, multiplier: won ? multiplier : 0, payout,
        result: won ? "win" : "lose",
        client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce,
      });
    }, 650);
  };

  const reset = () => {
    setSeed(randomSeed());
    setHitIdx(null);
    setRevealed([]);
    setLast(null);
    setPhase("idle");
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <GameFrame
          title="Shoot"
          stats={[
            { label: "Target", value: `${targetMul}x`, tone: "default" },
            { label: "Result", value: hitIdx !== null ? `${targets[hitIdx]}x` : "—", tone: last?.won ? "default" : "muted" },
            { label: "Payout", value: hitIdx !== null ? `${(amount * targets[hitIdx]).toFixed(2)}` : "—" },
          ]}
        >
          <style>{`
            @keyframes shoot-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
            @keyframes shoot-burst { 0%{transform:scale(1)} 40%{transform:scale(1.15) rotate(8deg)} 100%{transform:scale(.2) rotate(30deg);opacity:0} }
            @keyframes shoot-pop { 0%{transform:scale(.4);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
            @keyframes crosshair-fire { 0%{transform:scale(1)} 50%{transform:scale(1.4)} 100%{transform:scale(0)} }
          `}</style>

          <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-2xl">
            {targets.map((m, i) => {
              const isHit = hitIdx === i;
              const isRevealed = revealed.includes(i);
              const color = colorFor(m);
              const show = phase === "done" || isRevealed;
              return (
                <button
                  key={i}
                  onClick={() => phase === "idle" && shoot()}
                  disabled={phase !== "idle"}
                  className="relative aspect-square rounded-full flex items-center justify-center transition"
                  style={{
                    cursor: phase === "idle" ? "crosshair" : "default",
                    animation: phase === "idle" ? `shoot-bob ${2 + i * 0.18}s ease-in-out infinite` : undefined,
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: `0 0 28px -6px ${color}${show ? "aa" : "33"}` }}
                  />
                  <svg viewBox="0 0 100 100" className="w-full h-full"
                    style={{
                      transform: isHit && phase === "done" ? undefined : undefined,
                      animation: isHit && m >= targetMul ? "shoot-burst .55s ease-out forwards" : show ? "shoot-pop .35s ease-out" : undefined,
                    }}>
                    <circle cx="50" cy="50" r="46" fill="none" stroke={show ? color : "#ffffff22"} strokeWidth="2.5" />
                    <circle cx="50" cy="50" r="34" fill={show ? `${color}1f` : "#ffffff08"} stroke={show ? color : "#ffffff14"} strokeWidth="2" />
                    <circle cx="50" cy="50" r="22" fill="none" stroke={show ? color : "#ffffff0a"} strokeWidth="1.5" />
                    <circle cx="50" cy="50" r="10" fill={show ? color : "#ffffff10"} />
                    {show && (
                      <text x="50" y="56" textAnchor="middle" fontSize="16" fontWeight="900" fill={color}>
                        {m}x
                      </text>
                    )}
                  </svg>
                  {!show && (
                    <Crosshair className="absolute w-6 h-6 text-white/40" />
                  )}
                  {isHit && phase === "shooting" && (
                    <div className="absolute inset-0 rounded-full border-2 border-lime" style={{ animation: "crosshair-fire .5s ease-out forwards" }} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col items-center gap-2">
            {phase === "idle" ? (
              <p className="text-sm text-white/55">Click any target to fire. Hit <span className="text-lime font-bold">{targetMul}x+</span> to win.</p>
            ) : phase === "shooting" ? (
              <p className="text-sm font-bold text-lime">Firing…</p>
            ) : (
              <button onClick={reset} className="px-5 h-10 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:text-lime">
                Shoot again
              </button>
            )}
          </div>
        </GameFrame>
        {last && <ResultBadge result={last.won ? "win" : "lose"} multiplier={last.multiplier} payout={last.payout} />}
      </div>

      <div className="space-y-4">
        <BetPanel
          amount={amount}
          setAmount={setAmount}
          onBet={shoot}
          disabled={phase !== "idle"}
          betLabel={phase === "shooting" ? "…" : phase === "done" ? "Reset" : "Shoot"}
          profit={+(amount * targetMul).toFixed(2)}
          extra={
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Target multiplier</label>
              <div className="grid grid-cols-5 gap-1">
                {MULTIPLIERS.map((m, i) => (
                  <button key={m} onClick={() => setTargetMul(m)} disabled={phase !== "idle"}
                    className="h-10 rounded-lg text-xs font-black transition"
                    style={{
                      background: targetMul === m ? COLORS[i] : "#0e0e0e",
                      color: targetMul === m ? "#000" : "#fff",
                      border: `1px solid ${targetMul === m ? COLORS[i] : "#ffffff15"}`,
                    }}>
                    {m}x
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-white/40 mt-2">Higher target = harder hit but bigger payout.</p>
            </div>
          }
        />
      </div>
    </div>
  );
}
