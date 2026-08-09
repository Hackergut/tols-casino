'use client';

import { useState, useCallback, useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { PostedAmount } from '@/casino/components/casino/PostedAmount';

interface Props {
  onBack: () => void;
  initialBalance: number;
}

const QUICK_BETS = [1, 5, 10, 50, 100];

/* ── Multiplier tables matching backend ── */
const MULTIPLIER_TABLES: Record<string, number[]> = {
  "8-low": [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
  "8-medium": [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
  "8-high": [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
  "12-low": [10, 3, 1.3, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.3, 3, 10],
  "12-medium": [58, 15, 7, 3, 1.5, 1, 0.5, 1, 1.5, 3, 7, 15, 58],
  "12-high": [420, 70, 14, 5, 2, 1, 0.2, 1, 2, 5, 14, 70, 420],
  "16-low": [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
  "16-medium": [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
  "16-high": [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
};

function getSlotColor(mult: number): string {
  if (mult >= 10) return 'var(--color-lime)';
  if (mult >= 5) return '#22d3ee';
  if (mult >= 2) return 'var(--color-win)';
  if (mult >= 1) return '#60a5fa';
  if (mult >= 0.5) return 'var(--color-pending)';
  return 'var(--color-loss)';
}

function getSlotBgColor(mult: number): string {
  if (mult >= 10) return 'color-mix(in oklab, var(--color-lime) 15%, transparent)';
  if (mult >= 5) return 'rgba(34,211,238,0.15)';
  if (mult >= 2) return 'color-mix(in oklab, var(--color-win) 15%, transparent)';
  if (mult >= 1) return 'rgba(96,165,250,0.12)';
  if (mult >= 0.5) return 'color-mix(in oklab, var(--color-pending) 12%, transparent)';
  return 'color-mix(in oklab, var(--color-loss) 15%, transparent)';
}

/* ── SVG Plinko Board ── */
function PlinkoBoard({
  rows,
  ballPath,
  dropping,
  resultSlot,
  multipliers,
  animKey
}: {
  rows: 8 | 12 | 16;
  ballPath: number[];
  dropping: boolean;
  resultSlot: number | null;
  multipliers: number[];
  animKey: number;
}) {
  const svgWidth = 500;
  const reduced = useReducedMotion();
  const pegRadius = rows === 16 ? 4 : rows === 12 ? 5 : 6;
  const paddingX = 30;
  const paddingTop = 20;
  const rowSpacing = rows === 16 ? 28 : rows === 12 ? 34 : 40;
  const slotHeight = 36;
  const svgHeight = paddingTop + rows * rowSpacing + slotHeight + 20;
  const slotWidth = (svgWidth - paddingX * 2) / (rows + 1);

  /* ── Ball position calculation ── */
  function getPegX(row: number, col: number): number {
    const numPegs = row + 1;
    const totalWidth = numPegs * slotWidth;
    const startX = (svgWidth - totalWidth) / 2 + slotWidth / 2;
    return startX + col * slotWidth;
  }

  function getPegY(row: number): number {
    return paddingTop + row * rowSpacing;
  }

  function getSlotX(slot: number): number {
    const totalSlots = rows + 1;
    const totalWidth = totalSlots * slotWidth;
    const startX = (svgWidth - totalWidth) / 2;
    return startX + slot * slotWidth + slotWidth / 2;
  }

  /* ── Ball keyframes via SVG path ── */
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const ballPoints: { x: number; y: number; delay: number }[] = useMemo(() => {
    if (ballPath.length < 2) return [];
    const points: { x: number; y: number; delay: number }[] = [];
    // Start point at top center
    points.push({ x: svgWidth / 2, y: 0, delay: 0 });
    const totalSteps = ballPath.length - 1;
    for (let i = 1; i < ballPath.length; i++) {
      const prevPos = ballPath[i - 1];
      const curPos = ballPath[i];
      const midX = (getPegX(i - 1, prevPos) + getPegX(i, curPos)) / 2;
      const midY = (getPegY(i - 1) + getPegY(i)) / 2 + (pegRadius * 0.5);
      points.push({ x: midX, y: midY, delay: i * 0.12 });
    }
    // Final slot position
    const lastPos = ballPath[ballPath.length - 1];
    points.push({
      x: getSlotX(lastPos),
      y: paddingTop + rows * rowSpacing + slotHeight / 2,
      delay: (totalSteps + 1) * 0.12
    });
    return points;
  }, [ballPath, rows, animKey]);

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full h-auto"
      style={{ maxHeight: '480px', filter: 'drop-shadow(0 0 30px color-mix(in oklab, var(--color-lime) 5%, transparent))' }}
    >
      <defs>
        <radialGradient id="pegGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--color-lime)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ballGrad" cx="35%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="var(--color-lime)" />
          <stop offset="100%" stopColor="#88aa00" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="strongGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="slotGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-bg)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--color-surface)" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Board Background */}
      <rect x="0" y="0" width={svgWidth} height={svgHeight} rx="12" fill="url(#bgGrad)" />

      {/* Center funnel guide lines */}
      <line x1={svgWidth / 2} y1={paddingTop - 10} x2={svgWidth / 2} y2={paddingTop + 5}
        stroke="var(--color-lime)" strokeWidth="1" strokeOpacity="0.3" />

      {/* Pegs */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <g key={`row-${rowIdx}`}>
          {Array.from({ length: rowIdx + 1 }).map((_, pegIdx) => {
            const cx = getPegX(rowIdx, pegIdx);
            const cy = getPegY(rowIdx);
            const ballNear = dropping && ballPath[rowIdx] === pegIdx;
            const hitDelay = `${(rowIdx * 0.12).toFixed(2)}s`;
            return (
              <g key={`peg-${rowIdx}-${pegIdx}-${animKey}`}>
                {ballNear && (
                  <circle cx={cx} cy={cy} r={pegRadius * 3} fill="url(#pegGlow)" opacity="0">
                    {!reduced && <animate attributeName="opacity" values="0;1;0" dur="0.35s" begin={hitDelay} fill="freeze" />}
                  </circle>
                )}
                <circle
                  cx={cx} cy={cy} r={pegRadius}
                  fill={ballNear ? 'var(--color-lime)' : 'color-mix(in oklab, var(--color-lime) 35%, transparent)'}
                  style={{
                    filter: ballNear ? 'url(#strongGlow)' : 'url(#glow)',
                    transition: 'fill 0.15s ease'
                  }}
                >
                  {/* peg pulse timed to the ball's arrival at this row */}
                  {ballNear && !reduced && (
                    <animate attributeName="r" values={`${pegRadius};${pegRadius * 1.9};${pegRadius}`} dur="0.28s" begin={hitDelay} fill="freeze" />
                  )}
                </circle>
              </g>
            );
          })}
        </g>
      ))}

      {/* Slot buckets at bottom */}
      {Array.from({ length: rows + 1 }).map((_, i) => {
        const x = getSlotX(i);
        const y = paddingTop + rows * rowSpacing;
        const mult = multipliers[i] ?? 0;
        const color = getSlotColor(mult);
        const bgColor = getSlotBgColor(mult);
        const isResult = resultSlot === i;

        return (
          <g key={`slot-${i}`}>
            {/* Slot background */}
            <rect
              x={x - slotWidth / 2 + 1}
              y={y}
              width={slotWidth - 2}
              height={slotHeight}
              rx="4"
              fill={bgColor}
              stroke={isResult ? color : 'rgba(255,255,255,0.06)'}
              strokeWidth={isResult ? 1.5 : 0.5}
              style={{
                // glow proportional to the multiplier landed
                filter: isResult ? `drop-shadow(0 0 ${Math.min(4 + mult, 26)}px ${color})` : 'none',
                animation: isResult ? 'slotPulse 0.8s ease-in-out infinite' : 'none'
              }}
            />
            {/* Multiplier label */}
            <text
              x={x}
              y={y + slotHeight / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={color}
              fontSize={rows === 16 ? 7 : rows === 12 ? 9 : 10}
              fontWeight="700"
              fontFamily="monospace"
              style={{ filter: isResult ? 'url(#glow)' : 'none' }}
            >
              {mult}x
            </text>
          </g>
        );
      })}

      {/* Animated Ball — squash-and-stretch at each peg cadence + lagging trail */}
      {dropping && !reduced && ballPoints.length > 1 && (
        <g key={`ball-${animKey}`}>
          <circle r="4.5" fill="var(--color-lime)" opacity="0.12">
            <animateMotion dur={`${(ballPath.length) * 0.12}s`} fill="freeze" begin="0.1s">
              <mpath href={`#ballPath-${animKey}`} />
            </animateMotion>
          </circle>
          <circle r="5.2" fill="var(--color-lime)" opacity="0.25">
            <animateMotion dur={`${(ballPath.length) * 0.12}s`} fill="freeze" begin="0.05s">
              <mpath href={`#ballPath-${animKey}`} />
            </animateMotion>
          </circle>
          <circle r="10" fill="url(#pegGlow)" opacity="0.6">
            <animateMotion dur={`${(ballPath.length) * 0.12}s`} fill="freeze">
              <mpath href={`#ballPath-${animKey}`} />
            </animateMotion>
          </circle>
          <ellipse rx="6" ry="6" fill="url(#ballGrad)" filter="url(#strongGlow)">
            <animate attributeName="ry" values="6;4.5;6.8;6" dur="0.12s" repeatCount={rows} />
            <animate attributeName="rx" values="6;7;5.5;6" dur="0.12s" repeatCount={rows} />
            <animateMotion dur={`${(ballPath.length) * 0.12}s`} fill="freeze">
              <mpath href={`#ballPath-${animKey}`} />
            </animateMotion>
          </ellipse>
          <circle r="2.5" fill="white" opacity="0.8">
            <animateMotion dur={`${(ballPath.length) * 0.12}s`} fill="freeze">
              <mpath href={`#ballPath-${animKey}`} />
            </animateMotion>
          </circle>
        </g>
      )}

      {/* Ball motion path (hidden) */}
      {dropping && !reduced && ballPoints.length > 1 && (
        <path
          id={`ballPath-${animKey}`}
          d={ballPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
          fill="none"
          stroke="none"
        />
      )}

      {/* Inline keyframes for slot pulse */}
      <style>{`
        @keyframes slotPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </svg>
  );
}

export function PlinkoGame({ onBack, initialBalance }: Props) {
  const [balance, setBalance] = useState(initialBalance);
  const [betAmount, setBetAmount] = useState(5);
  const [rows, setRows] = useState<8 | 12 | 16>(12);
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [dropping, setDropping] = useState(false);
  const [result, setResult] = useState<null | { won: boolean; slot: number; multiplier: number; payout: number }>(null);
  const [ballPath, setBallPath] = useState<number[]>([]);
  const [history, setHistory] = useState<Array<{ slot: number; multiplier: number; result: string; payout: number }>>([]);
  const [animKey, setAnimKey] = useState(0);

  const multipliers = useMemo(() => {
    const key = `${rows}-${risk}`;
    return MULTIPLIER_TABLES[key] ?? MULTIPLIER_TABLES['12-medium'];
  }, [rows, risk]);

  const dropBall = useCallback(async () => {
    if (dropping || betAmount <= 0 || betAmount > balance) return;
    setDropping(true);
    setResult(null);
    setBallPath([]);
    setAnimKey(k => k + 1);

    try {
      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: 'plinko', amount: betAmount, payload: { rows, risk } }),
      });
      const data = await res.json();
      if (data.success) {
        const payload = data.data.payload as { slot: number };
        const r = { won: data.data.won, slot: payload.slot, multiplier: data.data.multiplier, payout: data.data.payout };
        setResult(r);
        setBalance(data.data.newBalance);
        setHistory(prev => [{ slot: payload.slot, multiplier: r.multiplier, result: r.won ? 'win' : 'lose', payout: r.payout }, ...prev].slice(0, 10));

        // Generate visual path ending at the result slot
        let pos = 0;
        const path = [0];
        for (let i = 0; i < rows; i++) {
          // Bias toward the actual result slot
          const targetSteps = payload.slot;
          const remaining = rows - i;
          const needed = targetSteps - pos;
          if (needed > 0 && Math.random() < needed / remaining) {
            pos++;
          } else if (needed < 0 && Math.random() < -needed / remaining) {
            // don't go back
          } else if (Math.random() > 0.5) {
            pos++;
          }
          pos = Math.max(0, Math.min(i + 1, pos));
          path.push(pos);
        }
        // Force last to match slot
        path[rows] = payload.slot;
        setBallPath(path);
      }
    } catch { /* ignore */ }
    setTimeout(() => setDropping(false), (rows + 2) * 120 + 300);
  }, [dropping, betAmount, balance, rows, risk]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Plinko</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Drop the ball and watch it bounce to a multiplier!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Board */}
        <div className="lg:col-span-3">
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-bg)', border: '1px solid color-mix(in oklab, var(--color-lime) 8%, transparent)' }}>
            <PlinkoBoard
              rows={rows}
              ballPath={ballPath}
              dropping={dropping}
              resultSlot={result?.slot ?? null}
              multipliers={multipliers}
              animKey={animKey}
            />

            {/* Result Banner */}
            {result && (
              <div className="px-4 py-3 text-center" style={{
                background: result.won
                  ? 'linear-gradient(90deg, color-mix(in oklab, var(--color-lime) 8%, transparent), color-mix(in oklab, var(--color-lime) 15%, transparent), color-mix(in oklab, var(--color-lime) 8%, transparent))'
                  : 'linear-gradient(90deg, color-mix(in oklab, var(--color-loss) 8%, transparent), color-mix(in oklab, var(--color-loss) 15%, transparent), color-mix(in oklab, var(--color-loss) 8%, transparent))',
                borderTop: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div className="flex items-center justify-center gap-3">
                  <span className={`text-lg font-bold font-mono tabular-nums ${result.won ? 'text-lime' : 'text-loss'}`}>
                    {result.won ? `+$${result.payout.toFixed(2)}` : `-$${betAmount.toFixed(2)}`}
                  </span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    at {result.multiplier}x
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-3">
          {/* Balance */}
          <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid color-mix(in oklab, var(--color-lime) 8%, transparent)' }}>
            <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Balance</p>
            <PostedAmount value={balance} format={(n) => `$${n.toFixed(2)}`} className="mt-1 text-2xl font-bold text-lime" />
          </div>

          {/* Rows */}
          <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid color-mix(in oklab, var(--color-lime) 8%, transparent)' }}>
            <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Pins</p>
            <div className="grid grid-cols-3 gap-1.5">
              {([8, 12, 16] as const).map(r => (
                <button key={r} onClick={() => setRows(r)}
                  className="py-2 rounded-lg text-xs font-semibold transition-all"
                  style={rows === r
                    ? { background: 'color-mix(in oklab, var(--color-lime) 15%, transparent)', color: 'var(--color-lime)', border: '1px solid color-mix(in oklab, var(--color-lime) 30%, transparent)', boxShadow: '0 0 12px color-mix(in oklab, var(--color-lime) 15%, transparent)' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.06)' }}
                  disabled={dropping}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Risk */}
          <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid color-mix(in oklab, var(--color-lime) 8%, transparent)' }}>
            <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Risk</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(['low', 'medium', 'high'] as const).map(r => (
                <button key={r} onClick={() => setRisk(r)}
                  className="py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all"
                  style={risk === r
                    ? { background: r === 'low' ? 'color-mix(in oklab, var(--color-win) 15%, transparent)' : r === 'high' ? 'color-mix(in oklab, var(--color-loss) 15%, transparent)' : 'color-mix(in oklab, var(--color-lime) 15%, transparent)', color: r === 'low' ? 'var(--color-win)' : r === 'high' ? 'var(--color-loss)' : 'var(--color-lime)', border: `1px solid ${r === 'low' ? 'color-mix(in oklab, var(--color-win) 30%, transparent)' : r === 'high' ? 'color-mix(in oklab, var(--color-loss) 30%, transparent)' : 'color-mix(in oklab, var(--color-lime) 30%, transparent)'}`, boxShadow: `0 0 12px ${r === 'low' ? 'color-mix(in oklab, var(--color-win) 15%, transparent)' : r === 'high' ? 'color-mix(in oklab, var(--color-loss) 15%, transparent)' : 'color-mix(in oklab, var(--color-lime) 15%, transparent)'}` }
                    : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.06)' }}
                  disabled={dropping}
                >
                  {r}
                </button>
              ))}
            </div>
            {/* Mini multiplier distribution */}
            <div className="mt-3 flex flex-wrap gap-1">
              {multipliers.map((m, i) => (
                <span key={i} className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold"
                  style={{
                    background: getSlotBgColor(m),
                    color: getSlotColor(m),
                    border: `1px solid ${getSlotColor(m)}22`
                  }}
                >
                  {m}x
                </span>
              ))}
            </div>
          </div>

          {/* Bet Amount */}
          <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid color-mix(in oklab, var(--color-lime) 8%, transparent)' }}>
            <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Bet Amount</p>
            <div className="flex gap-1.5 mb-2 flex-wrap">
              {QUICK_BETS.map(v => (
                <button key={v} onClick={() => setBetAmount(v)}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                  style={betAmount === v
                    ? { background: 'color-mix(in oklab, var(--color-lime) 15%, transparent)', color: 'var(--color-lime)', border: '1px solid color-mix(in oklab, var(--color-lime) 30%, transparent)' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.06)' }}
                  disabled={dropping}
                >
                  ${v}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setBetAmount(a => Math.max(1, a - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                disabled={dropping}
              >
                <ChevronDown className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
              </button>
              <input type="number" value={betAmount} onChange={e => setBetAmount(Math.max(0, Number(e.target.value)))}
                className="flex-1 h-8 px-3 rounded-lg text-sm font-bold text-white text-center outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                disabled={dropping}
              />
              <button onClick={() => setBetAmount(a => Math.min(balance, a + 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                disabled={dropping}
              >
                <ChevronUp className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
              </button>
            </div>
          </div>

          {/* Bet Button */}
          <button onClick={dropBall}
            disabled={dropping || betAmount <= 0 || betAmount > balance}
            className="w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-30"
            style={{
              background: dropping ? 'color-mix(in oklab, var(--color-lime) 30%, transparent)' : 'var(--color-lime)',
              color: 'var(--color-bg)',
              boxShadow: dropping ? 'none' : '0 0 20px color-mix(in oklab, var(--color-lime) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            {dropping ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(10,12,16,0.3)', borderTopColor: 'var(--color-bg)' }} />
                Dropping...
              </span>
            ) : (
              'Drop Ball'
            )}
          </button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid color-mix(in oklab, var(--color-lime) 8%, transparent)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Bet History</h3>
            <button onClick={() => setHistory([])} className="text-[10px] flex items-center gap-1 transition-colors" style={{ color: 'rgba(255,255,255,0.25)' }}>
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'color-mix(in oklab, var(--color-lime) 20%, transparent) transparent' }}>
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${h.result === 'win' ? 'bg-win/10 text-win' : 'bg-loss/10 text-loss'}`}>
                    {h.result.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Slot {h.slot} → <span style={{ color: getSlotColor(h.multiplier) }}>{h.multiplier}x</span>
                  </span>
                </div>
                <span className={`text-xs font-bold tabular-nums ${h.result === 'win' ? 'text-win' : 'text-loss'}`}>
                  {h.result === 'win' ? '+' : '-'}${h.payout.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
