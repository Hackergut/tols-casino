import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const BASE = "https://i-gaming.tools/api/v1";
const MAX_PAGES = 5; // ~500 slots per run — keeps each invocation under the timeout; press again to continue (hasMore)
const VMAP = { low: "Low", med_low: "Med-Low", medium: "Medium", med_high: "Med-High", high: "High", very_high: "Very High" };

function mapSlot(s) {
  return {
    slug: s.slug,
    name: s.name,
    provider: (s.provider && s.provider.name) || "Unknown",
    image: s.thumbnail_url || "",
    rtp: s.rtp_default ? parseFloat(s.rtp_default) : 0,
    volatility: VMAP[s.volatility] || s.volatility || "",
    external_id: s.slug,
    has_demo: !!s.demo_url,
    has_real: false,
    enabled: true,
    demo_url: s.demo_url || "",
  };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin")
      return Response.json({ error: "Admin only" }, { status: 403 });

    const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ category: "catalog_sync" });
    const get = (k) => { const s = settings.find((x) => x.key === k); return s ? s.value : ""; };
    const token = get("igaming_api_token");
    if (!token) return Response.json({ error: "iGaming API token not set. Add it in Admin → Catalog settings." }, { status: 503 });
    const lastTs = get("igaming_sync_ts");
    const cursor = get("igaming_sync_cursor"); // resume URL for an in-progress bulk load

    // Resume an unfinished bulk load; otherwise start fresh (incremental if we have a lastTs)
    let url = cursor || (BASE + "/slots/?page_size=100");
    if (!cursor && lastTs) url += "&updated_since=" + encodeURIComponent(lastTs);

    let fetched = 0, created = 0, updated = 0, done = false, syncTs = null;
    let status = "ok";

    const saveSetting = async (key, value) => {
      const ex = await base44.asServiceRole.entities.PlatformSetting.filter({ key });
      if (ex && ex.length) await base44.asServiceRole.entities.PlatformSetting.update(ex[0].id, { value });
      else await base44.entities.PlatformSetting.create({ key, value, category: "catalog_sync" });
    };

    for (let page = 0; page < MAX_PAGES; page++) {
      const r = await fetch(url, { headers: { Authorization: "Token " + token } });
      if (r.status === 401) return Response.json({ error: "Invalid iGaming API token" }, { status: 401 });
      if (r.status === 402) { status = "quota_exhausted"; break; }
      if (r.status === 429) { status = "rate_limited"; break; }
      if (!r.ok) return Response.json({ error: "iGaming API error " + r.status }, { status: 502 });

      const data = await r.json();
      if (page === 0) syncTs = r.headers.get("X-Sync-Timestamp");

      const slots = data.results || [];
      fetched += slots.length;
      if (slots.length) {
        const slugs = slots.map((s) => s.slug);
        let existMap = {};
        try {
          const existing = await base44.asServiceRole.entities.SlotGame.filter({ slug: { $in: slugs } });
          existing.forEach((e) => { existMap[e.slug] = e; });
        } catch {
          // fallback if $in unsupported: per-slug lookup
          for (const sl of slugs) {
            const ex = await base44.asServiceRole.entities.SlotGame.filter({ slug: sl });
            if (ex && ex.length) existMap[sl] = ex[0];
          }
        }
        const toCreate = [], toUpdate = [];
        for (const s of slots) {
          const mapped = mapSlot(s);
          const ex = existMap[s.slug];
          if (ex) toUpdate.push({ id: ex.id, ...mapped });
          else toCreate.push(mapped);
        }
        if (toCreate.length) await base44.asServiceRole.entities.SlotGame.bulkCreate(toCreate);
        if (toUpdate.length) await base44.asServiceRole.entities.SlotGame.bulkUpdate(toUpdate);
        created += toCreate.length; updated += toUpdate.length;
      }

      if (!data.next) { done = true; break; }
      url = data.next;
    }

    if (done) {
      // full sweep finished: persist sync timestamp and clear the resume cursor
      if (syncTs) await saveSetting("igaming_sync_ts", syncTs);
      await saveSetting("igaming_sync_cursor", "");
    } else {
      // still more pages: persist the next URL so the next run continues from here
      await saveSetting("igaming_sync_cursor", url);
    }

    return Response.json({ status, fetched, created, updated, hasMore: !done, lastSync: done ? syncTs : get("igaming_sync_ts") });
  } catch (error) {
    return Response.json({ error: error.message || "Sync error" }, { status: 500 });
  }
}