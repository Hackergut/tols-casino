import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const PERIOD_MS = {
  daily: 24 * 3600e3,
  weekly: 7 * 24 * 3600e3,
  monthly: 30 * 24 * 3600e3,
};

function periodStart(period) {
  if (period === "weekly") {
    const d = new Date(); const day = (d.getDay() + 6) % 7;
    d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - day);
    return d.getTime();
  }
  if (period === "monthly") {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(1);
    return d.getTime();
  }
  const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime();
}

export function useResponsibleLimits() {
  const [limits, setLimits] = useState([]);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      if (!me) { setLimits([]); setBets([]); return; }
      const [l, b] = await Promise.all([
        base44.entities.ResponsibleLimit.filter({ created_by_id: me.id }).catch(() => []),
        base44.entities.Bet.filter({ created_by_id: me.id }, "-created_date", 500).catch(() => []),
      ]);
      setLimits(l || []); setBets(b || []);
    } catch {
      setLimits([]); setBets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 60000); return () => { clearInterval(id); }; }, [load]);

  const active = limits.filter((l) => l.active);
  const exclusion = active.find((l) => l.type === "self_exclusion" && l.exclude_until && new Date(l.exclude_until).getTime() > Date.now());

  const get = (type) => active.find((l) => l.type === type);
  const sumBetsSince = (start) => bets
    .filter((b) => new Date(b.created_date).getTime() >= start)
    .reduce((s, b) => s + Number(b.amount || 0), 0);

  const wagerLimit = get("wager");
  const wageredInPeriod = wagerLimit ? sumBetsSince(periodStart(wagerLimit.period)) : 0;
  const wagerRemaining = wagerLimit ? Math.max(0, Number(wagerLimit.limit_value) - wageredInPeriod) : Infinity;

  const lossLimit = get("loss");
  let lossInPeriod = 0;
  if (lossLimit) {
    const start = periodStart(lossLimit.period);
    bets.filter((b) => new Date(b.created_date).getTime() >= start).forEach((b) => {
      lossInPeriod += Number(b.amount || 0) - Number(b.payout || 0);
    });
    lossInPeriod = Math.max(0, lossInPeriod);
  }
  const lossRemaining = lossLimit ? Math.max(0, Number(lossLimit.limit_value) - lossInPeriod) : Infinity;

  // Session start time is stored in localStorage; first game interaction starts it.
  const sessionLimit = get("session");
  const [sessionStart, setSessionStart] = useState(() => {
    try { return Number(localStorage.getItem("tols_session_start") || 0); } catch { return 0; }
  });
  useEffect(() => {
    if (!sessionLimit) return;
    if (!sessionStart) {
      const now = Date.now();
      try { localStorage.setItem("tols_session_start", String(now)); } catch {}
      setSessionStart(now);
    }
    const id = setInterval(() => setSessionStart((v) => v), 30000);
    return () => clearInterval(id);
  }, [sessionLimit, sessionStart]);
  const sessionMinutes = sessionLimit && sessionStart ? (Date.now() - sessionStart) / 60000 : 0;
  const sessionExpired = sessionLimit ? sessionMinutes >= Number(sessionLimit.limit_value) : false;

  const canBet = useCallback((amount = 0) => {
    if (exclusion) return { ok: false, reason: `Self-exclusion active until ${new Date(exclusion.exclude_until).toLocaleString()}.` };
    if (sessionExpired) return { ok: false, reason: `Session limit reached (${Number(sessionLimit.limit_value)} min). Take a break.` };
    if (wagerLimit && wageredInPeriod + Number(amount) > Number(wagerLimit.limit_value)) {
      return { ok: false, reason: `Wager limit reached for this ${wagerLimit.period} period (${Number(wagerLimit.limit_value)} USDT).` };
    }
    if (lossLimit && lossInPeriod >= Number(lossLimit.limit_value)) {
      return { ok: false, reason: `Loss limit reached for this ${lossLimit.period} period.` };
    }
    return { ok: true };
  }, [exclusion, sessionExpired, sessionLimit, wagerLimit, wageredInPeriod, lossLimit, lossInPeriod]);

  return {
    loading,
    limits,
    exclusion,
    canBet,
    wagerLimit, wageredInPeriod, wagerRemaining,
    lossLimit, lossInPeriod, lossRemaining,
    sessionLimit, sessionMinutes, sessionExpired,
    reload: load,
  };
}
