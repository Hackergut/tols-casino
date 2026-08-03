import { secrets } from "base44:runtime";

export function getAggregatorConfig() {
  return {
    baseUrl: (secrets.get("AGGREGATOR_API_BASE") || "").replace(/\/$/, ""),
    apiKey: secrets.get("AGGREGATOR_API_KEY") || "",
    operatorId: secrets.get("AGGREGATOR_OPERATOR_ID") || "",
    apiSecret: secrets.get("AGGREGATOR_API_SECRET") || "",
  };
}

export function isConfigured(cfg) {
  return Boolean(cfg.baseUrl && cfg.apiKey);
}