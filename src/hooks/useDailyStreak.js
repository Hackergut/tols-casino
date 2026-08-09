import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export function useDailyStreak() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("dailyStreak", { action: "status" });
      setData(res.data || null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const claim = useCallback(async () => {
    setClaiming(true); setToast(null);
    try {
      const res = await base44.functions.invoke("dailyStreak", { action: "claim" });
      const d = res.data || {};
      if (d.error) throw new Error(d.error);
      setData(d);
      setToast({ ok: true, text: `+${d.reward} USDT claimed! Day ${d.streak}` });
    } catch (e) {
      setToast({ ok: false, text: e.message || "Claim failed" });
    } finally {
      setClaiming(false);
      setTimeout(() => setToast(null), 3500);
    }
  }, []);

  return { data, loading, claiming, claim, toast, reload: load };
}
