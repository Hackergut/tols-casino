// Deprecated: Base44 app-params kept for compatibility — now uses VITE_API_BASE
// Professional full-stack uses VITE_API_BASE + JWT, not Base44 tokens
export const appParams = {
  appId: import.meta.env.VITE_API_BASE || "/api",
  token: localStorage.getItem("tols_auth_token") || null,
  functionsVersion: "v1",
  appBaseUrl: import.meta.env.VITE_API_BASE || "/api",
};
