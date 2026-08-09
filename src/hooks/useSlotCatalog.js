import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { getMockSlots } from "@/lib/mockAdmin";

// Real slot catalog, loaded once and shared across every page via react-query.
// Navigating Home -> category -> back serves the cached list instantly and only
// refetches in the background once the data is older than staleTime, so the lobby
// never re-shows a spinner for the same catalog.
async function fetchSlotCatalog() {
  try {
    const list = await base44.entities.SlotGame.filter({ enabled: true });
    const arr = (list || []).filter((s) => s && s.slug);
    if (arr.length) {
      arr.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
      return arr;
    }
  } catch {}
  return getMockSlots();
}

export function useSlotCatalog() {
  const { data, isLoading } = useQuery({
    queryKey: ["slotCatalog"],
    queryFn: fetchSlotCatalog,
    staleTime: 60_000,
  });
  return { slots: data || [], loading: isLoading };
}