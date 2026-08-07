// Neon Vault — 5×3 provably-fair video slot (TOLS original).
// Outcome is decided by a single provably-fair float mapped to a weighted
// tier distribution, then the reels are dressed to *visualise* that tier.
// The payout is therefore mathematically guaranteed; the board is cosmetic.
// RTP is calibrated to the platform's 96.5% via the same scaleToRtp approach
// used by Plinko / Wheel.

import { RTP } from "@/lib/gameEngine"; // 0.965

export const SLOT_SYMBOLS = [
  { id: 0, key: "cherry",  label: "Cherry",  emoji: "🍒", color: "#ff4f6a" },
  { id: 1, key: "lemon",   label: "Lemon",   emoji: "🍋", color: "#ffe14f" },
  { id: 2, key: "bell",    label: "Bell",    emoji: "🔔", color: "#ffb14f" },
  { id: 3, key: "star",    label: "Star",    emoji: "⭐", color: "#4fc3ff" },
  { id: 4, key: "diamond", label: "Diamond", emoji: "💎", color: "#4fffe1" },
  { id: 5, key: "seven",   label: "Seven",   emoji: "7️⃣", color: "#ccff00" },
  { id: 6, key: "wild",    label: "Wild",    emoji: "🃏", color: "#b04fff" },
  { id: 7, key: "bonus",   label: "Bonus",   emoji: "💰", color: "#ffd24f" },
];

// Raw payout shape + probability per tier. probs sum to 1.
const TIERS_RAW = [
  { mult: 0,   prob: 0.55,  count: 0, sym: 0 }, // no win
  { mult: 0.5, prob: 0.20,  count: 3, sym: 0 }, // 3 cherries
  { mult: 1,   prob: 0.12,  count: 3, sym: 1 }, // 3 lemons
  { mult: 2,   prob: 0.07,  count: 4, sym: 1 }, // 4 lemons
  { mult: 3,   prob: 0.035, count: 3, sym: 2 }, // 3 bells
  { mult: 5,   prob: 0.015, count: 3, sym: 3 }, // 3 stars
  { mult: 10,  prob: 0.007, count: 4, sym: 3 }, // 4 stars
  { mult: 25,  prob: 0.002, count: 3, sym: 4 }, // 3 diamonds
  { mult: 100, prob: 0.001, count: 5, sym: 5 }, // 5 sevens (top)
];

const RAW_EV = TIERS_RAW.reduce((s, t) => s + t.prob * t.mult, 0); // 0.76
const SCALE = RTP / RAW_EV; // ~1.2697 — scales the shape so EV == RTP exactly

// Final tiers with RTP-calibrated payouts.
export const SLOT_TIERS = TIERS_RAW.map((t) => ({
  ...t,
  payout: t.mult === 0 ? 0 : +(t.mult * SCALE).toFixed(2),
}));

// Cumulative distribution for tier selection from a uniform float in [0,1).
export const SLOT_CDF = (() => {
  const cdf = [];
  let acc = 0;
  for (const t of TIERS_RAW) {
    acc += t.prob;
    cdf.push(acc);
  }
  return cdf;
})();

export function slotTierFromFloat(r) {
  for (let i = 0; i < SLOT_CDF.length; i++) {
    if (r < SLOT_CDF[i]) return i;
  }
  return SLOT_CDF.length - 1;
}

const randSym = () => Math.floor(Math.random() * SLOT_SYMBOLS.length);

// Build a 5×3 board (board[reel][row]) that visualises the given tier.
// Winning line is the centre row (row 1); `count` matching symbols are placed
// left-to-right and the line is broken at the next reel.
export function boardForTier(tierIdx) {
  const tier = SLOT_TIERS[tierIdx];
  const board = Array.from({ length: 5 }, () => [randSym(), randSym(), randSym()]);

  if (tier.count > 0) {
    for (let r = 0; r < tier.count; r++) board[r][1] = tier.sym;
    if (tier.count < 5) {
      let b = randSym();
      if (b === tier.sym) b = (b + 1) % SLOT_SYMBOLS.length;
      board[tier.count][1] = b;
    }
  } else {
    // avoid a misleading accidental 3-left match on the centre row
    if (board[0][1] === board[1][1]) {
      while (board[2][1] === board[0][1]) board[2][1] = randSym();
    }
  }
  return board;
}