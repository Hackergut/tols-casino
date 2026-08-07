// Aggregator credentials are stored as PlatformSetting records (category
// "aggregator") so admins can manage them from the Admin panel without
// touching platform secrets. Backend functions read them with the service
// role client, which bypasses RLS.
export async function getAggregatorConfig(base44) {
  const list = await base44.asServiceRole.entities.PlatformSetting.filter({ category: "aggregator" });
  const get = (k) => {
    const s = (list || []).find((x) => x.key === k);
    return s ? s.value || "" : "";
  };
  return {
    baseUrl: get("aggregator_api_base").replace(/\/$/, ""),
    apiKey: get("aggregator_api_key"),
    operatorId: get("aggregator_operator_id"),
    apiSecret: get("aggregator_api_secret"),
    callbackUrl: get("aggregator_callback_url"),
  };
}

export function isConfigured(cfg) {
  return Boolean(cfg.baseUrl && cfg.apiKey);
}