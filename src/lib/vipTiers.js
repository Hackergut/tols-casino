export const VIP_TIERS = [
  { level: 1, name: "Bronze", min_wagered: 0, cashback: 0.0, level_up_bonus: 0, color: "#cd7f32", multiplier: 1.0 },
  { level: 2, name: "Silver", min_wagered: 1000, cashback: 0.03, level_up_bonus: 25, color: "#c0c0c0", multiplier: 1.05 },
  { level: 3, name: "Gold", min_wagered: 10000, cashback: 0.06, level_up_bonus: 150, color: "#ffd700", multiplier: 1.10 },
  { level: 4, name: "Platinum", min_wagered: 50000, cashback: 0.10, level_up_bonus: 750, color: "#a8e6e1", multiplier: 1.20 },
  { level: 5, name: "Diamond", min_wagered: 250000, cashback: 0.15, level_up_bonus: 5000, color: "#b9f2ff", multiplier: 1.35 },
];

export function tierForWagered(total_wagered) {
  let result = VIP_TIERS[0];
  for (const t of VIP_TIERS) {
    if ((total_wagered || 0) >= t.min_wagered) result = t;
  }
  return result;
}

export function nextTier(total_wagered) {
  for (const t of VIP_TIERS) {
    if ((total_wagered || 0) < t.min_wagered) return t;
  }
  return null;
}