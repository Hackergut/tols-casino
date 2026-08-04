import { base44 } from "@/api/base44Client";

// Global progressive pot: every real wager feeds it, and every wager has a
// small chance to hit it (jackpot.bet-style "play any game to win the pot").
export const JACKPOT_RATE = 0.01;        // 1% of each wager feeds the pot
export const JACKPOT_WIN_CHANCE = 0.00002; // 1 in 50,000 wagers
export const JACKPOT_SEED = 250;

export async function loadJackpot() {
  const list = await base44.entities.GlobalJackpot.list();
  if (list && list.length) return list[0];
  return await base44.entities.GlobalJackpot.create({ amount: JACKPOT_SEED, currency: "USDT" });
}

// Adds the wager contribution and resolves whether this wager hit the pot.
// Returns { pot, won, prize } — never throws (guest / unauthenticated play).
export async function contributeToJackpot(wager, winnerName = "Player") {
  try {
    const pot = await loadJackpot();
    const amount = +(pot.amount + Math.abs(wager) * JACKPOT_RATE).toFixed(2);
    const won = Math.random() < JACKPOT_WIN_CHANCE;
    if (won) {
      await base44.entities.GlobalJackpot.update(pot.id, {
        amount: JACKPOT_SEED,
        contributions_count: 0,
        last_winner: winnerName,
        last_win_amount: amount,
        last_win_date: new Date().toISOString(),
      });
      return { pot: JACKPOT_SEED, won: true, prize: amount };
    }
    await base44.entities.GlobalJackpot.update(pot.id, {
      amount,
      contributions_count: (pot.contributions_count || 0) + 1,
    });
    return { pot: amount, won: false, prize: 0 };
  } catch (e) {
    return { pot: 0, won: false, prize: 0 };
  }
}