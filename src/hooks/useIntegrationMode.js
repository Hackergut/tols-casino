import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const fallback = {
  paymentsMode: "sandbox",
  slotsMode: "sandbox",
  livePaymentsEnabled: false,
  liveSlotsEnabled: false,
  supportEmail: "support@tols.example",
  notice: "Sandbox mode",
};

async function fetchMode() {
  try {
    const res = await base44.functions.invoke("getIntegrationMode", {});
    return { ...fallback, ...(res.data || {}) };
  } catch {
    return fallback;
  }
}

export function useIntegrationMode() {
  const { data, isLoading } = useQuery({
    queryKey: ["integration-mode"],
    queryFn: fetchMode,
    staleTime: 30_000,
  });
  return { mode: data || fallback, loading: isLoading };
}
