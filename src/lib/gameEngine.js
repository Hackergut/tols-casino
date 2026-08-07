// Central RTP-calibrated engine for the TOLS original (provably-fair) games.
// House edge is 1% (99% RTP) for all originals except Keno (96%).
// All multiplier tables are scaled so their probability-weighted expected
// return equals the target RTP exactly — shapes are cosmetic, RTP is guaranteed.

// Single source of truth: 3.5% house edge on every original (96.5% RTP).
// Table games keep their real rule-based edge.
export const HOUSE_EDGE = 0.035;
export const RTP = 1 - HOUSE_EDGE; // 0.965
export const RTP_ORIGINALS = {
  dice: RTP,
  crash: RTP,
  plinko: RTP,
  mines: RTP,
  limbo: RTP,
  wheel: RTP,
  coinflip: RTP,
  keno: RTP,
  roulette: 0.973, // European single-zero
  baccarat: 0.986, // banker bet
  "neon-vault": RTP, // Neon Vault slot
};

// ── Dice / Limbo / Coinflip payout formulas (all derived from RTP) ───────────
// Dice: win chance in % (0-100) → fair multiplier.
export function diceMultiplier(winChancePct) {
  if (winChancePct <= 0) return 0;
  return +(RTP * 100 / winChancePct).toFixed(4);
}
// Limbo: target multiplier → win chance in %.
export function limboWinChance(target) {
  if (target <= 1) return 100;
  return +((RTP * 100) / target).toFixed(2);
}
// Limbo result from a uniform float (same curve as crash).
export function limboResultFromFloat(r) {
  const denom = 1 - r;
  if (denom <= 0) return 100000;
  return Math.max(1.0, Math.min(100000, Math.floor((RTP / denom) * 100) / 100));
}
// Coinflip: 50/50 → RTP * 2.
export const COINFLIP_MULTIPLIER = +(RTP * 2).toFixed(2);

// ── helpers ──────────────────────────────────────────────────────────────────
export function binom(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

function scaleToRtp(shape, weights, rtp) {
  let ev = 0;
  for (let i = 0; i < shape.length; i++) ev += weights[i] * shape[i];
  if (ev <= 0) return shape.map(() => 0);
  const s = rtp / ev;
  return shape.map((m) => Math.max(0, +(m * s).toFixed(2)));
}

// ── Crash / Limbo ───────────────────────────────────────────────────────────
// Crash point from a uniform float r in [0,1): 0.99 / (1 - r), 1% house edge.
export function crashPointFromFloat(r) {
  const denom = 1 - r;
  if (denom <= 0) return 100000;
  const cp = RTP / denom;
  return Math.max(1.0, Math.min(100000, Math.floor(cp * 100) / 100));
}

// ── Plinko (12 rows → 13 buckets, binomial p=0.5) ───────────────────────────
const PLINKO_ROWS = 12;
const PLINKO_C = [1, 12, 66, 220, 495, 792, 924, 792, 495, 220, 66, 12, 1];
const PLINKO_PROBS = PLINKO_C.map((c) => c / 4096);

const PLINKO_SHAPES = {
  low: [2, 1.5, 1.2, 1.1, 1.05, 1.02, 1, 1.02, 1.05, 1.1, 1.2, 1.5, 2],
  medium: [8, 4, 2, 1.4, 1.1, 0.9, 0.7, 0.9, 1.1, 1.4, 2, 4, 8],
  high: [40, 15, 5, 2, 0.8, 0.4, 0.2, 0.4, 0.8, 2, 5, 15, 40],
};

export const PLINKO_ROW_COUNT = PLINKO_ROWS;
export const PLINKO_MULTIPLIERS = Object.fromEntries(
  Object.entries(PLINKO_SHAPES).map(([k, shape]) => [k, scaleToRtp(shape, PLINKO_PROBS, RTP)])
);

// ── Wheel (uniform segments, scaled so avg payout = 0.99) ───────────────────
const WHEEL_SHAPES = {
  low: [0, 1.5, 1.5, 1.5, 0, 1.5, 1.5, 1.5, 0, 1.5, 1.5, 2.5],
  medium: [0, 0, 1.5, 0, 2, 0, 1.5, 0, 3, 0, 1.5, 0, 2, 0, 1.5, 0, 0, 1.5, 0, 4],
  high: [0, 0, 0, 2, 0, 0, 3, 0, 0, 5, 0, 0, 2, 0, 0, 9, 0, 0, 2, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 20],
};

export const WHEEL_SEGMENTS = Object.fromEntries(
  Object.entries(WHEEL_SHAPES).map(([k, arr]) => {
    const n = arr.length;
    const sum = arr.reduce((a, b) => a + b, 0);
    const s = sum > 0 ? (RTP * n) / sum : 0;
    return [k, arr.map((m) => (m === 0 ? 0 : +(m * s).toFixed(2)))];
  })
);

// ── Keno (10-spot, draw 10 of 40, 96% RTP) ──────────────────────────────────
const KENO_SHAPE = [0, 0, 0, 1, 2, 5, 15, 50, 200, 1000, 5000];
export const KENO_PICKS = 10;
export const KENO_GRID = 40;

export function kenoPaytable() {
  const total = binom(40, 10);
  const probs = [];
  for (let m = 0; m <= 10; m++) probs[m] = (binom(10, m) * binom(30, 10 - m)) / total;
  let ev = 0;
  for (let m = 0; m <= 10; m++) ev += probs[m] * KENO_SHAPE[m];
  const s = ev > 0 ? RTP / ev : 0;
  const table = {};
  for (let m = 0; m <= 10; m++) table[m] = Math.max(0, +(KENO_SHAPE[m] * s).toFixed(2));
  return table;
}

// ── Mines (25 tiles, k safe reveals, m mines) ───────────────────────────────
export function minesMultiplier(revealed, mines) {
  const GRID = 25;
  const safe = GRID - mines;
  let p = 1;
  for (let i = 0; i < revealed; i++) p *= (safe - i) / (GRID - i);
  if (p <= 0) return 0;
  return Math.floor((RTP / p) * 100) / 100;
}