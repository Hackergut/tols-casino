// Aggregator credentials are stored as PlatformSetting records (category
// "aggregator") so admins can manage them from the Admin panel without
// touching platform secrets. Backend functions read them with the service
// role client, which bypasses RLS.
export async function getAggregatorConfig(base44) {
  const list = await base44.asServiceRole.entities.PlatformSetting.filter({ category: "aggregator" });
  const integrationRows = await base44.asServiceRole.entities.PlatformSetting.filter({ category: "integrations" }).catch(() => []);
  const get = (rows, k) => {
    const s = (rows || []).find((x) => x.key === k);
    return s ? s.value || "" : "";
  };
  return {
    baseUrl: get(list, "aggregator_api_base").replace(/\/$/, ""),
    apiKey: get(list, "aggregator_api_key"),
    operatorId: get(list, "aggregator_operator_id"),
    apiSecret: get(list, "aggregator_api_secret"),
    callbackUrl: get(list, "aggregator_callback_url"),
    slotsMode: get(integrationRows, "slots_mode") || "sandbox",
  };
}

export function isConfigured(cfg) {
  return Boolean(cfg.baseUrl && cfg.apiKey);
}

export function liveSlotsEnabled(cfg) {
  return cfg?.slotsMode === "live";
}