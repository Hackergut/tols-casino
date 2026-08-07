// Demo (fun-money) play limits. Demo money is NOT unlimited: each player gets a
// starting balance, a capped number of daily top-ups and a hard daily wager
// ceiling, so demo traffic stays bounded and measurable.

export const DEMO_START = 5000;
export const DEMO_MAX_BET = 500;
export const DEMO_MAX_REFILLS_PER_DAY = 3;
export const DEMO_MAX_DAILY_WAGER = 50000;

export const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

export function demoLimitState(s) {
  const wagerLeft = Math.max(0, DEMO_MAX_DAILY_WAGER - (s.dayWagered || 0));
  const refillsLeft = Math.max(0, DEMO_MAX_REFILLS_PER_DAY - (s.refills || 0));
  const exhausted = wagerLeft <= 0 || (s.balance < 1 && refillsLeft <= 0);
  return { wagerLeft, refillsLeft, exhausted, wagerPct: Math.min(100, ((s.dayWagered || 0) / DEMO_MAX_DAILY_WAGER) * 100) };
}