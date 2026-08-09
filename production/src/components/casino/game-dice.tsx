'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { PostedAmount } from '@/casino/components/casino/PostedAmount';

interface Props {
  onBack: () => void;
  initialBalance: number;
}

const QUICK_BETS = [1, 5, 10, 50, 100];

type Result = null | { won: boolean; roll: number; payout: number; multiplier: number };

export function DiceGame({ onBack, initialBalance }: Props) {
  const [balance, setBalance] = useState(initialBalance);
  const [betAmount, setBetAmount] = useState(5);
  const [target, setTarget] = useState(50);
  const [isOver, setIsOver] = useState(true);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [animatedRoll, setAnimatedRoll] = useState(50);
  const [history, setHistory] = useState<Array<{ roll: number; target: number; isOver: boolean; result: string; payout: number }>>([]);
  const [showPF, setShowPF] = useState(false);
  const [pfData, setPfData] = useState<{ serverSeedHash: string; clientSeed: string; nonce: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const reduced = useReducedMotion();

  const winChance = useMemo(() => isOver ? (100 - target).toFixed(2) : target.toFixed(2), [target, isOver]);
  const potentialMultiplier = useMemo(() => winChance !== '0.00' ? (99 / Number(winChance)).toFixed(4) : '∞', [winChance]);
  const potentialPayout = useMemo(() => (betAmount * Number(potentialMultiplier === '∞' ? 0 : potentialMultiplier)).toFixed(2), [betAmount, potentialMultiplier]);
  const winZoneWidth = useMemo(() => Number(winChance), [winChance]);

  const rollDice = useCallback(async () => {
    if (rolling || betAmount <= 0 || betAmount > balance) return;
    setRolling(true);
    setResult(null);
    setShowResult(false);
    const interval = reduced ? undefined : setInterval(() => {
      setAnimatedRoll(Math.floor(Math.random() * 10000) / 100);
    }, 50);
    if (interval) rollIntervalRef.current = interval;
    try {
      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: 'dice', amount: betAmount, payload: { target, isOver } }),
      });
      const data = await res.json();
      if (interval) clearInterval(interval);
      if (data.success) {
        const payload = data.data.payload as { roll: number; target: number; isOver: boolean };
        const r = { won: data.data.won, roll: payload.roll, payout: data.data.payout, multiplier: data.data.multiplier };
        setResult(r);
        setAnimatedRoll(payload.roll);
        setBalance(data.data.newBalance);
        setPfData({ serverSeedHash: data.data.serverSeedHash, clientSeed: data.data.clientSeed, nonce: data.data.nonce });
        setHistory(prev => [{ roll: payload.roll, target, isOver, result: r.won ? 'win' : 'lose', payout: r.payout }, ...prev].slice(0, 10));
        setTimeout(() => setShowResult(true), 50);
      }
    } catch { if (interval) clearInterval(interval); }
    setTimeout(() => setRolling(false), 400);
  }, [rolling, betAmount, balance, target, isOver, reduced]);

  useEffect(() => {
    return () => { if (rollIntervalRef.current) clearInterval(rollIntervalRef.current); };
  }, []);

  // Target line position (as percentage of bar)
  const targetPct = target;

  return (
    <div className="space-y-4">
      <style>{`
        .dice-3d {
          perspective: 600px;
        }
        .dice-face {
          transform-style: preserve-3d;
          transition: transform 0.1s;
        }
        .dice-rolling .dice-face {
          animation: diceSpin 0.15s linear infinite;
        }
        @keyframes diceSpin {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          25% { transform: rotateX(90deg) rotateY(90deg) rotateZ(45deg); }
          50% { transform: rotateX(180deg) rotateY(180deg) rotateZ(90deg); }
          75% { transform: rotateX(270deg) rotateY(270deg) rotateZ(135deg); }
          100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(180deg); }
        }
        .dice-result-win {
          animation: diceWin 0.5s ease-out;
        }
        @keyframes diceWin {
          0% { transform: scale(1); }
          30% { transform: scale(1.15); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        .dice-result-lose {
          animation: diceLose 0.4s ease-out;
        }
        .dice-slam {
          animation: diceSlam 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes diceSlam {
          0% { transform: scale(1.9); opacity: 0.3; }
          60% { transform: scale(0.94); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes diceLose {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
        }
        .dice-float-win {
          animation: diceFloatWin 1.2s ease-out forwards;
        }
        @keyframes diceFloatWin {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-70px) scale(1.1); }
        }
        .glow-lime { text-shadow: 0 0 20px color-mix(in oklab, var(--color-lime) 60%, transparent), 0 0 40px color-mix(in oklab, var(--color-lime) 30%, transparent), 0 0 80px color-mix(in oklab, var(--color-lime) 10%, transparent); }
        .glow-green { text-shadow: 0 0 20px color-mix(in oklab, var(--color-lime) 70%, transparent), 0 0 50px color-mix(in oklab, var(--color-lime) 30%, transparent); }
        .glow-red { text-shadow: 0 0 20px color-mix(in oklab, var(--color-loss) 70%, transparent), 0 0 50px color-mix(in oklab, var(--color-loss) 30%, transparent); }
        /* Custom range slider */
        .dice-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 200px;
          background: transparent;
          cursor: pointer;
          writing-mode: vertical-lr;
          direction: rtl;
        }
        .dice-slider::-webkit-slider-runnable-track {
          width: 6px;
          height: 100%;
          border-radius: 3px;
          background: linear-gradient(to top, color-mix(in oklab, var(--color-loss) 60%, transparent) 0%, color-mix(in oklab, var(--color-loss) 30%, transparent) ${100 - winZoneWidth}%, color-mix(in oklab, var(--color-lime) 30%, transparent) ${100 - winZoneWidth}%, color-mix(in oklab, var(--color-lime) 60%, transparent) 100%);
        }
        .dice-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 40%, #fff 0%, var(--color-lime) 100%);
          border: 3px solid var(--color-bg);
          box-shadow: 0 0 12px color-mix(in oklab, var(--color-lime) 50%, transparent), 0 2px 8px rgba(0,0,0,0.5);
          margin-left: -9px;
          cursor: grab;
        }
        .dice-slider::-moz-range-track {
          width: 6px;
          border-radius: 3px;
          background: linear-gradient(to top, color-mix(in oklab, var(--color-loss) 60%, transparent) 0%, color-mix(in oklab, var(--color-loss) 30%, transparent) ${100 - winZoneWidth}%, color-mix(in oklab, var(--color-lime) 30%, transparent) ${100 - winZoneWidth}%, color-mix(in oklab, var(--color-lime) 60%, transparent) 100%);
        }
        .dice-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 40%, #fff 0%, var(--color-lime) 100%);
          border: 3px solid var(--color-bg);
          box-shadow: 0 0 12px color-mix(in oklab, var(--color-lime) 50%, transparent), 0 2px 8px rgba(0,0,0,0.5);
          cursor: grab;
        }
        /* Horizontal slider fallback */
        .dice-slider-h {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          background: linear-gradient(to right, color-mix(in oklab, var(--color-lime) 50%, transparent) 0%, color-mix(in oklab, var(--color-lime) 25%, transparent) ${winZoneWidth}%, color-mix(in oklab, var(--color-loss) 25%, transparent) ${winZoneWidth}%, color-mix(in oklab, var(--color-loss) 50%, transparent) 100%);
        }
        .dice-slider-h::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #fff, var(--color-lime));
          border: 3px solid var(--color-bg);
          box-shadow: 0 0 14px color-mix(in oklab, var(--color-lime) 50%, transparent), 0 2px 6px rgba(0,0,0,0.5);
          cursor: grab;
        }
        .dice-slider-h::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #fff, var(--color-lime));
          border: 3px solid var(--color-bg);
          box-shadow: 0 0 14px color-mix(in oklab, var(--color-lime) 50%, transparent), 0 2px 6px rgba(0,0,0,0.5);
          cursor: grab;
        }
        .meter-bar-inner {
          transition: width 0.3s ease, background 0.3s ease;
        }
        .target-line {
          transition: left 0.3s ease;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Dice</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Roll over or under your target number</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Game Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Dice Roll Display */}
          <div className={`rounded-xl p-6 relative overflow-hidden ${rolling ? 'dice-rolling' : ''} ${showResult && result?.won ? 'dice-result-win' : ''} ${showResult && result && !result.won ? 'dice-result-lose' : ''}`} style={{ background: 'linear-gradient(135deg, var(--color-surface) 0%, #1a1d2e 100%)', border: `1px solid ${showResult && result ? (result.won ? 'color-mix(in oklab, var(--color-lime) 30%, transparent)' : 'color-mix(in oklab, var(--color-loss) 30%, transparent)') : 'rgba(255,255,255,0.06)'}` }}>
            <div className="dice-3d flex flex-col items-center justify-center" style={{ minHeight: 140 }}>
              {/* 3D dice cube visual */}
              <div className="dice-face mb-3" style={{ width: 90, height: 90, background: 'linear-gradient(145deg, #2a2d3e, #1a1d2e)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid color-mix(in oklab, var(--color-lime) 15%, transparent)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.4)' }}>
                <span key={showResult && result ? 'settled' : 'live'} className={`font-mono text-4xl font-black tabular-nums ${showResult && result && !reduced ? 'dice-slam' : ''} ${rolling ? '' : showResult && result?.won ? 'glow-lime' : showResult && result && !result.won ? 'glow-red' : 'glow-lime'}`} style={{ color: rolling ? 'var(--color-lime)' : showResult && result ? (result.won ? 'var(--win)' : 'var(--loss)') : 'var(--color-lime)' }}>
                  {animatedRoll.toFixed(2)}
                </span>
              </div>

              {/* Win/lose indicator */}
              {showResult && result && (
                <div className="relative">
                  <p className={`text-sm font-bold tracking-wide ${result.won ? 'text-win' : 'text-loss'}`}>
                    {result.won ? 'WIN!' : 'LOSE'}
                  </p>
                  {result.won && (
                    <span className="dice-float-win absolute -top-4 left-1/2 -translate-x-1/2 text-win text-lg font-black whitespace-nowrap">
                      +${result.payout.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
              {!result && !rolling && (
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Roll to play</p>
              )}
            </div>
          </div>

          {/* Probability Meter */}
          <div className="rounded-xl p-5" style={{ background: 'linear-gradient(135deg, var(--color-surface) 0%, #1a1d2e 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>WIN CHANCE</span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-lime)' }}>{winChance}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>MULTIPLIER</span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-lime)' }}>{potentialMultiplier}×</span>
              </div>
            </div>

            {/* Meter bar (200px height) */}
            <div className="flex gap-6 items-stretch">
              {/* Vertical probability bar */}
              <div className="relative flex-shrink-0" style={{ width: 60, height: 200 }}>
                {/* Lose zone (top) */}
                <div className="absolute inset-0 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-lg" style={{ height: `${winZoneWidth}%`, background: 'linear-gradient(to top, color-mix(in oklab, var(--color-lime) 35%, transparent), color-mix(in oklab, var(--color-lime) 8%, transparent))' }} />
                  <div className="absolute top-0 left-0 right-0 rounded-t-lg" style={{ height: `${100 - winZoneWidth}%`, background: 'linear-gradient(to bottom, color-mix(in oklab, var(--color-loss) 35%, transparent), color-mix(in oklab, var(--color-loss) 8%, transparent))' }} />
                  {/* Gradient transition */}
                  <div className="absolute left-0 right-0" style={{ bottom: `${winZoneWidth - 3}%`, height: '6%', background: `linear-gradient(to bottom, color-mix(in oklab, var(--color-loss) 20%, transparent), color-mix(in oklab, var(--color-lime) 20%, transparent))` }} />
                </div>
                {/* Target line */}
                <div className="target-line absolute left-0 right-0 z-10" style={{ bottom: `${winZoneWidth}%` }}>
                  <div style={{ height: 2, background: 'var(--color-lime)', boxShadow: '0 0 8px color-mix(in oklab, var(--color-lime) 60%, transparent)' }} />
                  <div className="absolute -top-5 -right-1 px-1.5 py-0.5 rounded text-xs font-bold whitespace-nowrap" style={{ background: 'color-mix(in oklab, var(--color-lime) 15%, transparent)', color: 'var(--color-lime)', border: '1px solid color-mix(in oklab, var(--color-lime) 30%, transparent)' }}>
                    {target.toFixed(0)}
                  </div>
                </div>
                {/* Labels */}
                <div className="absolute -left-0.5 top-0 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>100</div>
                <div className="absolute -left-0.5 bottom-0 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>0</div>
              </div>

              {/* Right side: slider + controls */}
              <div className="flex-1 flex flex-col justify-between" style={{ minHeight: 200 }}>
                {/* Slider */}
                <div className="flex-1 flex flex-col justify-center">
                  <input
                    type="range"
                    min={2}
                    max={98}
                    value={target}
                    onChange={e => { setTarget(Number(e.target.value)); setResult(null); setShowResult(false); }}
                    className="dice-slider-h"
                    disabled={rolling}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>0</span>
                    <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>100</span>
                  </div>
                </div>

                {/* Over/Under Toggle */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { setIsOver(true); setResult(null); setShowResult(false); }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
                    style={isOver
                      ? { background: 'linear-gradient(135deg, var(--color-lime), #a8e600)', color: 'var(--color-bg)', boxShadow: '0 0 20px color-mix(in oklab, var(--color-lime) 15%, transparent)' }
                      : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                    disabled={rolling}
                  >
                    Roll Over {target}
                  </button>
                  <button
                    onClick={() => { setIsOver(false); setResult(null); setShowResult(false); }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
                    style={!isOver
                      ? { background: 'linear-gradient(135deg, var(--color-lime), #a8e600)', color: 'var(--color-bg)', boxShadow: '0 0 20px color-mix(in oklab, var(--color-lime) 15%, transparent)' }
                      : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                    disabled={rolling}
                  >
                    Roll Under {target}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-4 text-center" style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Win Chance</p>
              <p className="text-xl font-bold text-white tabular-nums">{winChance}%</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Multiplier</p>
              <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--color-lime)' }}>{potentialMultiplier}×</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Payout on Win</p>
              <p className="text-xl font-bold tabular-nums text-white">${potentialPayout}</p>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Bet History</h3>
                <button onClick={() => setHistory([])} className="text-xs flex items-center gap-1 transition-colors hover:text-white/60" style={{ color: 'rgba(255,255,255,0.3)' }}><RotateCcw className="w-3 h-3" /> Clear</button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg transition-colors" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${h.result === 'win' ? 'text-win' : 'text-loss'}`} style={{ background: h.result === 'win' ? 'color-mix(in oklab, var(--color-lime) 10%, transparent)' : 'color-mix(in oklab, var(--color-loss) 10%, transparent)' }}>{h.result.toUpperCase()}</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{h.isOver ? 'Over' : 'Under'} {h.target} → <span className="font-mono font-semibold text-white">{h.roll.toFixed(2)}</span></span>
                    </div>
                    <span className={`text-xs font-bold tabular-nums ${h.result === 'win' ? 'text-win' : 'text-loss'}`}>{h.result === 'win' ? '+' : '-'}${h.payout.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Provably Fair */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => setShowPF(v => !v)} className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: 'var(--color-lime)' }} />
                <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Provably Fair</span>
              </div>
              {showPF ? <ChevronUp className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />}
            </button>
            {showPF && (
              <div className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Server Seed Hash</span>
                  <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{pfData ? pfData.serverSeedHash.slice(0, 20) + '...' : '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Client Seed</span>
                  <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{pfData ? pfData.clientSeed : '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Nonce</span>
                  <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{pfData ? pfData.nonce : '—'}</span>
                </div>
                <button className="mt-1 w-full py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors" style={{ background: 'color-mix(in oklab, var(--color-lime) 8%, transparent)', color: 'var(--color-lime)', border: '1px solid color-mix(in oklab, var(--color-lime) 15%, transparent)' }}>
                  Verify
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-3">
          {/* Balance */}
          <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, var(--color-surface), #1a1d2e)', border: '1px solid color-mix(in oklab, var(--color-lime) 8%, transparent)' }}>
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Balance</p>
            <PostedAmount value={balance} format={(n) => `$${n.toFixed(2)}`} className="text-2xl font-bold text-lime" />
          </div>

          {/* Bet Amount */}
          <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Bet Amount</p>
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {QUICK_BETS.map(v => (
                <button key={v} onClick={() => setBetAmount(v)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={betAmount === v ? { background: 'color-mix(in oklab, var(--color-lime) 15%, transparent)', color: 'var(--color-lime)', border: '1px solid color-mix(in oklab, var(--color-lime) 30%, transparent)' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid transparent' }}>
                  ${v}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setBetAmount(a => Math.max(1, Math.floor(a / 2)))} className="px-3 py-2 rounded-lg text-xs font-bold transition-colors" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }} disabled={rolling}>½</button>
              <input type="number" value={betAmount} onChange={e => setBetAmount(Math.max(0, Number(e.target.value)))} className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white text-center outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} disabled={rolling} />
              <button onClick={() => setBetAmount(a => Math.min(balance, a * 2))} className="px-3 py-2 rounded-lg text-xs font-bold transition-colors" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }} disabled={rolling}>2×</button>
            </div>
          </div>

          {/* Payout Preview */}
          <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Payout on Win</p>
            <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--color-lime)' }}>${potentialPayout}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Profit: +${(Number(potentialPayout) - betAmount).toFixed(2)}</p>
          </div>

          {/* Action Button */}
          <button onClick={rollDice} disabled={rolling || betAmount <= 0 || betAmount > balance} className="w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(135deg, var(--color-lime), #a8e600)', color: 'var(--color-bg)', boxShadow: !rolling && betAmount > 0 && betAmount <= balance ? '0 0 30px color-mix(in oklab, var(--color-lime) 20%, transparent)' : 'none' }}>
            {rolling ? 'Rolling...' : 'Roll Dice'}
          </button>
        </div>
      </div>
    </div>
  );
}
