import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// GET /api/achievements equivalent for Base44.
// Computes achievements from the player's Bet ledger and returns any newly
// unlocked ones since the last check. The set of "seen" unlocked ids is stored
// in PlatformSetting so the UI can pop a celebration once per achievement.

type A = { id: string; name: string; desc: string; icon: string; unlocked: boolean; category: string };

function compute(stats: {
  totalWagered: number; wins: number; losses: number; biggestWin: number;
  betCount: number; level: number; gameWins: Record<string, number>;
  cardsCount: number; mythicCount: number;
}): A[] {
  const g = (id: string) => stats.gameWins[id] || 0;
  return [
    { id: 'first_bet', name: 'First Bet', desc: 'Place your first bet', icon: '🎲', unlocked: stats.betCount >= 1, category: 'General' },
    { id: 'high_roller', name: 'High Roller', desc: 'Wager 1,000 total', icon: '💎', unlocked: stats.totalWagered >= 1000, category: 'General' },
    { id: 'whale', name: 'Whale', desc: 'Wager 10,000 total', icon: '🐋', unlocked: stats.totalWagered >= 10000, category: 'General' },
    { id: 'legend', name: 'TOLS Legend', desc: 'Wager 100,000 total', icon: '👑', unlocked: stats.totalWagered >= 100000, category: 'General' },
    { id: 'winner', name: 'Winner', desc: 'Win 10 bets', icon: '🏆', unlocked: stats.wins >= 10, category: 'General' },
    { id: 'streak', name: 'Hot Streak', desc: 'Win 50 bets', icon: '🔥', unlocked: stats.wins >= 50, category: 'General' },
    { id: 'big_win', name: 'Big Win', desc: 'Win 100 in a single bet', icon: '💰', unlocked: stats.biggestWin >= 100, category: 'General' },
    { id: 'huge_win', name: 'Huge Win', desc: 'Win 1,000 in a single bet', icon: '⚡', unlocked: stats.biggestWin >= 1000, category: 'General' },
    { id: 'collector', name: 'Collector', desc: 'Own 5 collectible cards', icon: '🃏', unlocked: stats.cardsCount >= 5, category: 'Collection' },
    { id: 'mythic_pull', name: 'Mythic Pull', desc: 'Own a Mythic card', icon: '✨', unlocked: stats.mythicCount >= 1, category: 'Collection' },
    { id: 'dice_roller', name: 'Dice Roller', desc: 'Win 5 Dice bets', icon: '🎲', unlocked: g('dice') >= 5, category: 'Games' },
    { id: 'dice_master', name: 'Dice Master', desc: 'Win 20 Dice bets', icon: '🎯', unlocked: g('dice') >= 20, category: 'Games' },
    { id: 'crash_survivor', name: 'Crash Survivor', desc: 'Win 5 Crash bets', icon: '🚀', unlocked: g('crash') >= 5, category: 'Games' },
    { id: 'crash_master', name: 'Crash Master', desc: 'Win 20 Crash bets', icon: '💥', unlocked: g('crash') >= 20, category: 'Games' },
    { id: 'plinko_pro', name: 'Plinko Pro', desc: 'Win 5 Plinko bets', icon: '⚪', unlocked: g('plinko') >= 5, category: 'Games' },
    { id: 'mine_sweeper', name: 'Mine Sweeper', desc: 'Win 5 Mines bets', icon: '💣', unlocked: g('mines') >= 5, category: 'Games' },
    { id: 'limbo_riser', name: 'Limbo Riser', desc: 'Win 5 Limbo bets', icon: '📈', unlocked: g('limbo') >= 5, category: 'Games' },
    { id: 'coin_flipper', name: 'Coin Flipper', desc: 'Win 5 Coin Flip bets', icon: '🪙', unlocked: g('coinflip') >= 5, category: 'Games' },
    { id: 'wheel_spinner', name: 'Wheel Spinner', desc: 'Win 5 Wheel bets', icon: '🎡', unlocked: g('wheel') >= 5, category: 'Games' },
    { id: 'keno_caller', name: 'Keno Caller', desc: 'Win 5 Keno bets', icon: '🔢', unlocked: g('keno') >= 5, category: 'Games' },
  ];
}

export default async function(req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Login required' }, { status: 401 });

    const bets = await base44.entities.Bet.filter({ created_by_id: user.id }).catch(() => []);
    let totalWagered = 0, wins = 0, biggestWin = 0;
    const gameWins: Record<string, number> = {};
    for (const b of bets || []) {
      totalWagered += Number(b.amount || 0);
      if (b.result === 'win') {
        wins++;
        biggestWin = Math.max(biggestWin, Number(b.payout || 0));
        const gid = String(b.game_id || b.game_name || 'unknown');
        gameWins[gid] = (gameWins[gid] || 0) + 1;
      }
    }

    let cardsCount = 0, mythicCount = 0;
    try {
      const cards = await base44.entities.CollectibleCard.filter({ created_by_id: user.id }).catch(() => []);
      cardsCount = (cards || []).length;
      mythicCount = (cards || []).filter((c: any) => String(c.rarity || '').toLowerCase() === 'mythic').length;
    } catch { /* cards optional */ }

    const all = compute({
      totalWagered, wins, losses: (bets || []).length - wins, biggestWin,
      betCount: (bets || []).length, level: Number(user.level || user.vip_level || 1),
      gameWins, cardsCount, mythicCount,
    });

    const key = `seen-achievements-${user.id}`;
    const rows = await base44.asServiceRole.entities.PlatformSetting.filter({ key }).catch(() => []);
    let seen: string[] = [];
    if (rows && rows[0]) { try { seen = JSON.parse(rows[0].value); } catch {} }

    const newlyUnlocked = all.filter((a) => a.unlocked && !seen.includes(a.id));
    const unlockedIds = all.filter((a) => a.unlocked).map((a) => a.id);
    const payload = JSON.stringify(unlockedIds);
    if (rows && rows[0]) await base44.asServiceRole.entities.PlatformSetting.update(rows[0].id, { value: payload });
    else await base44.asServiceRole.entities.PlatformSetting.create({ key, value: payload, category: 'achievements' });

    return Response.json({
      achievements: all,
      newlyUnlocked,
      totalUnlocked: unlockedIds.length,
      totalAchievements: all.length,
    });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Achievements error' }, { status: 500 });
  }
}
