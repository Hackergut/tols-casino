import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export function useAchievements() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("getAchievements", {});
      setData(res.data || null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const celebrate = useCallback(async (newlyUnlocked) => {
    if (!newlyUnlocked || !newlyUnlocked.length) return;
    // Persist as in-app notifications so they appear in the bell.
    await Promise.all(newlyUnlocked.map((a) =>
      base44.entities.AppNotification.create({
        type: "achievement",
        title: `Achievement unlocked: ${a.name}`,
        message: a.desc,
        amount: 0,
        link: "/vip",
      }).catch(() => {})
    ));
  }, []);

  useEffect(() => {
    if (data?.newlyUnlocked?.length) celebrate(data.newlyUnlocked);
  }, [data, celebrate]);

  return { data, loading, reload: load };
}
