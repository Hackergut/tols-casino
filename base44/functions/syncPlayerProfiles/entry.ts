import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Recomputes PlayerProfile records from the live ledger (User, Bet, Deposit,
// Withdrawal). Idempotent: one PlayerProfile per user keyed by external_id.
// Admin-only. Risk level and segment are derived heuristically so ops staff
// have a starting point; they can be manually overridden afterwards.

function riskLevel(bets: number, net: number, vip: number) {
  if (vip >= 4) return "vip";
  if (bets > 0 && net < -5000) return "high";
  if (bets > 0 && net > 5000) return "vip";
  return "normal";
}

function segment(bets: number, deposits: number, last: string | null, vip: number) {
  if (vip >= 4) return "vip";
  if (deposits >= 10) return "whale";
  if (!last) return "new";
  const days = (Date.now() - new Date(last).getTime()) / 86400000;
  if (days > 30) return "dormant";
  if (bets > 50) return "active";
  return "standard";
}

export default async function(req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me || me.role !== "admin") return Response.json({ error: "Admin only" }, { status: 403 });

    const [users, bets, deposits, withdrawals, wallets] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.Bet.list("-created_date", 5000),
      base44.asServiceRole.entities.Deposit.list("-created_date", 1000),
      base44.asServiceRole.entities.Withdrawal.list("-created_date", 1000),
      base44.asServiceRole.entities.UserWallet.list(),
    ]);

    const walletByUser = new Map<string, any>();
    for (const w of wallets || []) walletByUser.set(w.created_by_id, w);

    const byUser = new Map<string, { totalBets: number; totalWins: number; totalLosses: number; wagered: number; paid: number; lastAt: string | null }>();
    for (const b of bets || []) {
      const id = b.created_by_id;
      if (!id) continue;
      const cur = byUser.get(id) || { totalBets: 0, totalWins: 0, totalLosses: 0, wagered: 0, paid: 0, lastAt: null };
      cur.totalBets += 1;
      cur.wagered += Number(b.amount || 0);
      cur.paid += Number(b.payout || 0);
      if (b.result === "win") cur.totalWins += 1; else cur.totalLosses += 1;
      if (!cur.lastAt || (b.created_date || "") > cur.lastAt) cur.lastAt = b.created_date || null;
      byUser.set(id, cur);
    }

    const depByUser = new Map<string, { total: number; count: number; first: string | null }>();
    for (const d of deposits || []) {
      if (d.status !== "confirmed") continue;
      const id = d.created_by_id; if (!id) continue;
      const cur = depByUser.get(id) || { total: 0, count: 0, first: null };
      cur.total += Number(d.amount || 0); cur.count += 1;
      if (!cur.first || (d.created_date || "") < cur.first) cur.first = d.created_date;
      depByUser.set(id, cur);
    }
    const wdByUser = new Map<string, number>();
    for (const w of withdrawals || []) {
      if (w.status === "rejected") continue;
      wdByUser.set(w.created_by_id, (wdByUser.get(w.created_by_id) || 0) + Number(w.amount || 0));
    }

    const existing = await base44.asServiceRole.entities.PlayerProfile.list();
    const byExternal = new Map<string, any>();
    for (const p of existing || []) byExternal.set(p.external_id, p);

    let created = 0, updated = 0;
    for (const u of users || []) {
      const id = u.id;
      const stats = byUser.get(id);
      const deps = depByUser.get(id);
      const wallet = walletByUser.get(id);
      const netProfit = stats ? +(stats.paid - stats.wagered).toFixed(2) : 0;
      const vip = Number(wallet?.vip_level || u.level || 1);
      const totalDeposits = +(deps?.total || 0).toFixed(2);
      const totalWithdrawals = +(wdByUser.get(id) || 0).toFixed(2);
      const risk = riskLevel(stats?.totalBets || 0, netProfit, vip);
      const seg = segment(stats?.totalBets || 0, deps?.count || 0, stats?.lastAt || null, vip);
      const payload = {
        username: u.full_name || (u.email ? u.email.split("@")[0] : id.slice(0, 8)),
        email: u.email || "",
        avatar: "",
        last_login_at: u.last_login || stats?.lastAt || null,
        registered_at: u.created_date || new Date().toISOString(),
        total_deposits: totalDeposits,
        total_withdrawals: totalWithdrawals,
        total_bets: stats?.totalBets || 0,
        total_wins: stats?.totalWins || 0,
        total_losses: stats?.totalLosses || 0,
        net_profit: netProfit,
        risk_level: risk,
        segment: seg,
      };
      const prev = byExternal.get(id);
      if (prev) {
        await base44.asServiceRole.entities.PlayerProfile.update(prev.id, payload);
        updated += 1;
      } else {
        await base44.asServiceRole.entities.PlayerProfile.create({ external_id: id, ...payload });
        created += 1;
      }
    }

    return Response.json({ created, updated, total: (users || []).length });
  } catch (error: any) {
    return Response.json({ error: error.message || "Sync error" }, { status: 500 });
  }
}
