// Commission calculation for the affiliate program.
// Commissions are earned based on the game volume (total_wagered) of referred players.
export function computeCommission(r, { plan = "revshare", commission_rate = 25, cpa_amount = 50 } = {}) {
  const volume = Number(r.total_wagered || 0);
  if (plan === "cpa") return r.status === "deposited" ? Number(cpa_amount) : 0;
  if (plan === "hybrid") {
    return (r.status === "deposited" ? Number(cpa_amount) : 0) + volume * (Number(commission_rate) / 100);
  }
  // revshare: a share of the referred player's wagering volume
  return volume * (Number(commission_rate) / 100);
}