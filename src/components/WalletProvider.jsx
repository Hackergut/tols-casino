import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { VIP_TIERS, tierForWagered } from "@/lib/vipTiers";
import { contributeToJackpot } from "@/lib/jackpot";
import { DEMO_START, DEMO_MAX_BET, DEMO_MAX_REFILLS_PER_DAY, DEMO_MAX_DAILY_WAGER, dayKey, demoLimitState } from "@/lib/demoLimits";
import DemoLimitBanner from "@/components/games/DemoLimitBanner";

export const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  const ensureDepositAddresses = useCallback(async (w) => {
    if (w.deposit_addresses) return w;
    try {
      const res = await base44.functions.invoke("generateUserDepositAddresses", { wallet_id: w.id });
      const d = res.data;
      if (d && d.addresses) {
        return { ...w, deposit_addresses: JSON.stringify(d.addresses), deposit_index: d.index || 0 };
      }
    } catch (e) { /* ignore — generated on demand */ }
    return w;
  }, []);

  const loadWallet = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      if (!user) return;
      const list = await base44.entities.UserWallet.filter({ created_by_id: user.id });
      if (list && list.length) {
        setWallet(await ensureDepositAddresses(list[0]));
      } else {
        const created = await base44.entities.UserWallet.create({ balance: 1000, currency: "USDT", vip_level: 1, xp: 0, total_wagered: 0 });
        setWallet(await ensureDepositAddresses(created));
      }
    } catch (e) {
      // user not authenticated — run in guest/local mode
      const local = JSON.parse(localStorage.getItem("tols_wallet") || "null");
      if (!local) {
        const w = { id: "guest", balance: 1000, currency: "USDT", vip_level: 1, xp: 0, total_wagered: 0 };
        localStorage.setItem("tols_wallet", JSON.stringify(w));
        setWallet(w);
      } else {
        setWallet(local);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const updateBalance = useCallback(async (delta, wagered = 0) => {
    if (!wallet) return { bonus: 0, promoted: false };
    const newWagered = +(wallet.total_wagered + Math.abs(wagered)).toFixed(2);
    const oldTier = tierForWagered(wallet.total_wagered);
    const t = tierForWagered(newWagered);
    const promoted = t.level > oldTier.level;
    const bonus = promoted ? t.level_up_bonus : 0;
    const newBalance = Math.max(0, +(wallet.balance + delta + bonus).toFixed(2));
    const next = {
      ...wallet,
      balance: newBalance,
      xp: Math.round(wallet.xp + Math.abs(wagered)),
      total_wagered: newWagered,
      vip_level: Math.max(wallet.vip_level || 1, t.level),
    };
    setWallet(next);
    if (wallet.id === "guest") {
      localStorage.setItem("tols_wallet", JSON.stringify(next));
    } else {
      try {
        await base44.entities.UserWallet.update(wallet.id, {
          balance: newBalance,
          xp: next.xp,
          total_wagered: newWagered,
          vip_level: next.vip_level,
        });
      } catch (e) { /* ignore */ }
    }
    return { bonus, promoted, tier: t };
  }, [wallet]);

  const recordBet = useCallback(async (bet) => {
    try {
      if (wallet && wallet.id !== "guest") {
        const created = await base44.entities.Bet.create(bet);
        const wager = +(bet.amount || 0).toFixed(2);
        const payout = +(bet.payout || 0).toFixed(2);
        await base44.entities.HouseEarning.create({
          game_id: bet.game_id || "",
          game_name: bet.game_name || "",
          bet_id: created?.id || "",
          wager,
          payout,
          house_profit: +(wager - payout).toFixed(2),
          currency: bet.currency || "USDT",
        });
        // every real wager feeds the global progressive pot (and can hit it)
        const jp = await contributeToJackpot(wager);
        if (jp.won && jp.prize > 0) await updateBalance(jp.prize, 0);

        // Sync the player's real stats into every tournament they joined so
        // the leaderboard reflects live, account-based wagering.
        try {
          const won = bet.result === "win";
          const entries = await base44.entities.TournamentEntry.filter({});
          if (entries && entries.length) {
            await base44.entities.TournamentEntry.bulkUpdate(
              entries.map((e) => ({
                id: e.id,
                wagered: +((e.wagered || 0) + wager).toFixed(2),
                wins: (e.wins || 0) + (won ? 1 : 0),
                biggest_win: Math.max(e.biggest_win || 0, payout),
              }))
            );
          }
        } catch (e) { /* ignore */ }
      }
    } catch (e) { /* ignore */ }
  }, [wallet, updateBalance]);

  const requestWithdrawal = useCallback(async ({ amount, wallet_address, chain }) => {
    if (!wallet) throw new Error("Wallet unavailable");
    const amt = +Number(amount).toFixed(2);
    if (!amt || amt <= 0) throw new Error("Invalid amount");
    if (!wallet_address || wallet_address.length < 8) throw new Error("Invalid wallet address");
    if (amt > wallet.balance) throw new Error(`Insufficient balance. Available: ${wallet.balance} ${wallet.currency}`);

    const balanceBefore = +wallet.balance.toFixed(2);
    const balanceAfter = +(balanceBefore - amt).toFixed(2);

    // create withdrawal record (auth users) or local stub (guest)
    let record;
    if (wallet.id !== "guest") {
      record = await base44.entities.Withdrawal.create({
        amount: amt,
        currency: wallet.currency,
        wallet_address,
        chain,
        status: "pending",
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      });
    } else {
      record = { id: "local_" + Date.now(), amount: amt, currency: wallet.currency, wallet_address, chain, status: "pending", balance_before: balanceBefore, balance_after: balanceAfter, created_date: new Date().toISOString() };
      const hist = JSON.parse(localStorage.getItem("tols_withdrawals") || "[]");
      hist.unshift(record);
      localStorage.setItem("tols_withdrawals", JSON.stringify(hist));
    }

    // deduct balance immediately (held until processed)
    await updateBalance(-amt, 0);

    return record;
  }, [wallet, updateBalance]);

  const vipTier = wallet ? tierForWagered(wallet.total_wagered) : VIP_TIERS[0];
  const value = { wallet, loading, updateBalance, recordBet, requestWithdrawal, reload: loadWallet, vipTier };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

// Demo (fun-money) wallet override for the TOLS originals. When a game is
// wrapped in <DemoWalletProvider>, useWallet() resolves to this virtual wallet
// so the real balance is never touched. recordBet is a no-op (no Bet /
// HouseEarning / jackpot pollution). Balance auto-tops-up so demo stays fun.
function freshDemo() {
  return {
    id: "demo", balance: DEMO_START, currency: "FUN", vip_level: 1, xp: 0,
    total_wagered: 0, day: dayKey(), dayWagered: 0, refills: 0, bets: 0, payout: 0, gameStats: {},
  };
}

export function DemoWalletProvider({ children }) {
  const [demo, setDemo] = useState(() => {
    try {
      const l = JSON.parse(localStorage.getItem("tols_demo_wallet") || "null");
      if (l && typeof l.balance === "number") {
        // a new UTC day resets the demo allowance
        if (l.day !== dayKey()) return freshDemo();
        return { ...freshDemo(), ...l, gameStats: l.gameStats || {} };
      }
    } catch {}
    return freshDemo();
  });

  const persist = (w) => { try { localStorage.setItem("tols_demo_wallet", JSON.stringify(w)); } catch {} };
  const dirty = React.useRef(false);
  const sessionId = React.useRef(null);
  const latest = React.useRef(demo);
  latest.current = demo;

  const updateBalance = useCallback((delta, wagered = 0) => {
    setDemo((prev) => {
      const state = demoLimitState(prev);
      const add = Math.abs(wagered);
      // hard daily wager ceiling — no further fun-money play once reached
      if (add > 0 && state.wagerLeft <= 0) return prev;

      const dayWagered = +(prev.dayWagered + add).toFixed(2);
      let balance = +(prev.balance + delta).toFixed(2);
      let refills = prev.refills;
      if (balance < 1) {
        if (refills < DEMO_MAX_REFILLS_PER_DAY && dayWagered < DEMO_MAX_DAILY_WAGER) {
          refills += 1;
          balance = DEMO_START;
        } else {
          balance = 0; // demo allowance exhausted for today
        }
      }
      const w = {
        ...prev, balance, refills, dayWagered,
        xp: Math.round(prev.xp + add),
        total_wagered: +(prev.total_wagered + add).toFixed(2),
      };
      persist(w);
      return w;
    });
    return { bonus: 0, promoted: false, tier: VIP_TIERS[0] };
  }, []);

  // Demo bets are tracked (never written to the real Bet / HouseEarning ledger)
  // so the platform can monitor demo volume and demo RTP per game.
  const recordBet = useCallback((bet) => {
    setDemo((prev) => {
      const gid = bet.game_id || bet.game_name || "unknown";
      const g = prev.gameStats[gid] || { n: 0, w: 0, p: 0, name: bet.game_name || gid };
      const gameStats = {
        ...prev.gameStats,
        [gid]: { n: g.n + 1, w: +(g.w + (bet.amount || 0)).toFixed(2), p: +(g.p + (bet.payout || 0)).toFixed(2), name: bet.game_name || gid },
      };
      const w = { ...prev, gameStats, bets: prev.bets + 1, payout: +(prev.payout + (bet.payout || 0)).toFixed(2) };
      persist(w);
      return w;
    });
    dirty.current = true;
  }, []);

  // Flush the aggregated demo session to the backend every 10s (one record per
  // player per day) so demo activity is monitored server-side too.
  useEffect(() => {
    const flush = async () => {
      if (!dirty.current) return;
      dirty.current = false;
      const s = latest.current;
      const payload = {
        day: s.day,
        bets: s.bets,
        wagered: s.dayWagered,
        payout: s.payout,
        refills: s.refills,
        exhausted: demoLimitState(s).exhausted,
        game_stats: JSON.stringify(s.gameStats),
        currency: "FUN",
      };
      try {
        if (sessionId.current) {
          await base44.entities.DemoSession.update(sessionId.current, payload);
        } else {
          const user = await base44.auth.me();
          const existing = await base44.entities.DemoSession.filter({ created_by_id: user.id, day: s.day });
          if (existing && existing.length) {
            sessionId.current = existing[0].id;
            await base44.entities.DemoSession.update(sessionId.current, payload);
          } else {
            const created = await base44.entities.DemoSession.create({ ...payload, player_alias: user.full_name || user.email || "player" });
            sessionId.current = created.id;
          }
        }
      } catch (e) { /* guest / offline — local tracking only */ }
    };
    const id = setInterval(flush, 10000);
    return () => { clearInterval(id); flush(); };
  }, []);

  const requestWithdrawal = useCallback(() => { throw new Error("Not available in demo mode"); }, []);

  const limits = demoLimitState(demo);
  const value = {
    wallet: demo, loading: false, updateBalance, recordBet, requestWithdrawal,
    reload: () => {}, vipTier: VIP_TIERS[0], isDemo: true, demoLimits: limits, maxBet: DEMO_MAX_BET,
  };
  return (
    <WalletContext.Provider value={value}>
      <DemoLimitBanner limits={limits} wallet={demo} />
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}