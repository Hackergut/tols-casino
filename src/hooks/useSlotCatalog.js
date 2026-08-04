import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Real slot catalog: loaded from the synced SlotGame entity (no hardcoded mockups).
export function useSlotCatalog() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    base44.entities.SlotGame.filter({ enabled: true })
      .then((list) => {
        if (!active) return;
        const arr = (list || []).filter((s) => s && s.slug);
        // newest first when available
        arr.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
        setSlots(arr);
      })
      .catch(() => active && setSlots([]))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return { slots, loading };
}