// Shared trust-boundary guard for functions that are meant to be invoked only
// by platform workflows or by an admin — never by an app user or an anonymous
// caller. Returns a Response to return immediately, or null when allowed.
//
// The workflow runner authenticates with this internal token, passed in the
// request body by the workflow definitions. Both the workflow definitions and
// this module live server-side only and are never served to clients.
const INTERNAL_TOKEN = "b44i_7f3e9c2a51d84b6f8e0a4c7d92135f6e_zQ8kXw41";

export async function requireInternalCaller(base44, providedToken) {
  // Platform workflow invocation carrying the shared internal token
  if (typeof providedToken === "string" && providedToken.length > 0 && providedToken === INTERNAL_TOKEN) {
    return null;
  }
  // Admin dashboard action
  const caller = await base44.auth.me().catch(() => null);
  if (caller && caller.role === "admin") return null;
  // Anonymous or non-admin caller: denied
  return Response.json({ error: "Forbidden" }, { status: 403 });
}