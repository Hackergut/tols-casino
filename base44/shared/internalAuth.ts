// Shared trust-boundary guard for functions that are meant to be invoked only
// by platform workflows or by an admin — never by an app user or an anonymous
// caller. Returns a Response to return immediately, or null when allowed.
export async function requireInternalCaller(base44) {
  const caller = await base44.auth.me().catch(() => null);
  if (caller && caller.role === "admin") return null;      // admin dashboard action
  if (caller) return Response.json({ error: "Forbidden" }, { status: 403 }); // app user
  // No user session: the platform workflow runner. Workflow-invoked functions
  // must additionally be idempotent and validate record state themselves,
  // since an anonymous HTTP caller reaches the same path.
  return null;
}