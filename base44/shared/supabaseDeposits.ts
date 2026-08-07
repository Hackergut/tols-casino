// Deposits are stored in the builder's Supabase project (table public.deposits).
// The Base44 Deposit entity stays in place as the trigger source for the
// affiliate-commission and large-deposit workflows; Supabase is the ledger.
const PROJECT_REF = "bnoajspucuigmsiamekm";

async function serviceKey(base44) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("supabase");
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const keys = await res.json();
  const k = (keys || []).find((x) => x.name === "service_role");
  if (!k) throw new Error("Supabase service_role key unavailable");
  return k.api_key;
}

// Insert-or-update a deposit row keyed by its unique tx_hash.
export async function upsertSupabaseDeposit(base44, deposit) {
  const key = await serviceKey(base44);
  const res = await fetch(`https://${PROJECT_REF}.supabase.co/rest/v1/deposits?on_conflict=tx_hash`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(deposit),
  });
  if (!res.ok) throw new Error(`Supabase deposit write failed: ${res.status} ${await res.text()}`);
  return (await res.json())[0];
}