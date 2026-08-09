import { useEffect } from "react";
import { base44 } from "@/api/client";

// Exact backend↔frontend sync for Home: chip, query, last provider
export function useHomeSync({ chip, query }) {
  useEffect(() => {
    try { localStorage.setItem("tols_home_chip", chip || "home"); } catch {}
    // backend
    (async () => {
      try {
        const user = await base44.auth.me().catch(()=> null);
        if (!user) return;
        const key = `home_chip_${user.id}`;
        const existing = await base44.entities.PlatformSetting.filter({ category: "home_sync", key }).catch(()=>[]);
        const val = chip || "home";
        if (existing?.length) await base44.entities.PlatformSetting.update(existing[0].id, { value: val }).catch(()=>{});
        else await base44.entities.PlatformSetting.create({ key, value: val, category: "home_sync" }).catch(()=>{});
      } catch {}
    })();
  }, [chip]);

  useEffect(() => {
    if (!query) return;
    try { localStorage.setItem("tols_last_search", query); } catch {}
    (async () => {
      try {
        const user = await base44.auth.me().catch(()=> null);
        if (!user) return;
        const key = `last_search_${user.id}`;
        const existing = await base44.entities.PlatformSetting.filter({ category: "nav_sync", key }).catch(()=>[]);
        if (existing?.length) await base44.entities.PlatformSetting.update(existing[0].id, { value: query }).catch(()=>{});
        else await base44.entities.PlatformSetting.create({ key, value: query, category: "nav_sync" }).catch(()=>{});
      } catch {}
    })();
  }, [query]);
}
