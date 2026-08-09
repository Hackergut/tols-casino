import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// The Base44 SDK invokes functions over POST, so the action is chosen from the
// request body: action="claim" claims today's reward, anything else returns the
// current streak status.
//
// Reward schedule (resets after day 7):
//   day 1..6 = 5 * day USDT (5,10,15,20,25,30)
//   day 7    = 50 USDT bonus
// Streak breaks (resets to 0) if more than one calendar day passes between claims.

type StreakData = { streak: number; lastClaim: string | null; totalClaimed: number };
const EMPTY: StreakData = { streak: 0, lastClaim: null, totalClaimed: 0 };

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
function rewardFor(day: number) {
  return day >= 7 ? 50 : day * 5;
}

async function getSetting(base44: any, key: string) {
  const rows = await base44.asServiceRole.entities.PlatformSetting.filter({ key }).catch(() => []);
  return rows && rows[0] ? rows[0] : null;
}
async function upsertSetting(base44: any, key: string, value: string, category: string) {
  const existing = await getSetting(base44, key);
  if (existing) await base44.asServiceRole.entities.PlatformSetting.update(existing.id, { value });
  else await base44.asServiceRole.entities.PlatformSetting.create({ key, value, category });
}

function computeStatus(data: StreakData) {
  const today = dayKey();
  const lastDay = data.lastClaim ? dayKey(new Date(data.lastClaim)) : null;
  const claimedToday = lastDay === today;

  const y = new Date(); y.setDate(y.getDate() - 1);
  const yesterday = dayKey(y);
  const broken = !!lastDay && lastDay !== today && lastDay !== yesterday;
  const current = broken ? 0 : data.streak;
  const nextDay = Math.min(7, claimedToday ? current : current + 1);
  return {
    streak: current,
    lastClaim: data.lastClaim,
    totalClaimed: data.totalClaimed,
    claimedToday,
    nextDay,
    nextReward: rewardFor(nextDay),
    canClaim: !claimedToday,
  };
}

async function loadData(base44: any, userId: string): Promise<StreakData> {
  const row = await getSetting(base44, `daily-streak-${userId}`);
  if (!row) return { ...EMPTY };
  try { return { ...EMPTY, ...JSON.parse(row.value) }; } catch { return { ...EMPTY }; }
}

export default async function(req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Login required' }, { status: 401 });

    const key = `daily-streak-${user.id}`;

    const body = await req.json().catch(() => ({}));
    if (body.action !== 'claim') {
      return Response.json(computeStatus(await loadData(base44, user.id)));
    }

    const data = await loadData(base44, user.id);
    const status = computeStatus(data);
    if (status.claimedToday) return Response.json({ error: 'Already claimed today' }, { status: 409 });

    const newStreak = status.streak + 1;
    const reward = rewardFor(newStreak);
    const next: StreakData = {
      streak: newStreak > 7 ? 1 : newStreak,
      lastClaim: new Date().toISOString(),
      totalClaimed: +(data.totalClaimed + reward).toFixed(2),
    };

    const wallets = await base44.asServiceRole.entities.UserWallet.filter({ created_by_id: user.id });
    if (!wallets || !wallets.length) return Response.json({ error: 'Wallet not found' }, { status: 404 });
    const w = wallets[0];
    const newBalance = +(Number(w.balance || 0) + reward).toFixed(2);
    await base44.asServiceRole.entities.UserWallet.update(w.id, { balance: newBalance });
    await upsertSetting(base44, key, JSON.stringify(next), 'daily-streak');

    return Response.json({
      ...computeStatus(next), reward, balance: newBalance,
    });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Daily streak error' }, { status: 500 });
  }
}
