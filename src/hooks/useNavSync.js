import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/client";

// Sync exact navigation state backend ↔ frontend for every minimal detail
// - Frontend: location.pathname + search → localStorage + backend PlatformSetting
// - Backend: PlatformSetting category=nav_sync key=last_route_{userId}
// - Also sync referral code, last game, last category for personalization

export function useNavSync() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const route = pathname + search;
    // frontend → local
    try { localStorage.setItem("tols_last_route", route); } catch {}
    // frontend → backend (exact sync, fire-and-forget, no blocking)
    (async () => {
      try {
        const user = await base44.auth.me().catch(() => null);
        if (!user) return;
        const key = `last_route_${user.id}`;
        const existing = await base44.entities.PlatformSetting.filter({ category: "nav_sync", key }).catch(() => []);
        const payload = { key, value: route, category: "nav_sync", description: `Last route for ${user.id}` };
        if (existing?.length) await base44.entities.PlatformSetting.update(existing[0].id, { value: route }).catch(()=>{});
        else await base44.entities.PlatformSetting.create(payload).catch(()=>{});
      } catch {}
    })();
  }, [pathname, search]);

  // Also sync referral code exact
  useEffect(() => {
    try {
      const ref = new URLSearchParams(search).get("ref") || new URLSearchParams(window.location.search).get("ref");
      if (ref && !localStorage.getItem("tols_referral_code")) {
        localStorage.setItem("tols_referral_code", ref);
        // backend sync
        base44.auth.me().then((u)=>{
          if (!u) return;
          base44.entities.PlatformSetting.create({ key: `referral_${u.id}`, value: ref, category: "referral_sync" }).catch(()=>{});
        }).catch(()=>{});
      }
    } catch {}
  }, [search]);
}
