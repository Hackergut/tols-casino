import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { validateEuroVirtualsCallback } from '../../shared/eurovirtuals.ts';
import { getAggregatorConfig, isConfigured } from '../../shared/aggregator.ts';

// EuroVirtuals callback endpoint.
// Authenticates the request via the SHA-1 + MD5 token scheme, then — when the
// callback requests a catalog sync (`action === "sync"` in the JSON body) —
// pulls the game feed from the configured aggregator and upserts SlotGame records.
export default async function(req) {
  try {
    const auth = await validateEuroVirtualsCallback(req);
    if (!auth.valid) {
      return Response.json({ ok: false, error: auth.reason }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    let body = {};
    try {
      body = await req.json();
    } catch (_) {
      body = {};
    }

    // Sync games on explicit request, otherwise just acknowledge the callback.
    if (body && body.action === "sync") {
      const cfg = await getAggregatorConfig(base44);
      if (!isConfigured(cfg)) {
        return Response.json({
          ok: false,
          error: "Slot aggregator not configured. An admin must add the aggregator credentials in the Admin panel.",
        }, { status: 503 });
      }

      const r = await fetch(`${cfg.baseUrl}/api/games?limit=1000`, {
        headers: {
          Authorization: `Bearer ${cfg.apiKey}`,
          'X-Merchant-Id': cfg.operatorId,
          Accept: 'application/json',
        },
      });
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        return Response.json({
          ok: false,
          error: `Feed aggregatore non disponibile (${r.status}). ${t.slice(0, 200)}`,
        }, { status: 502 });
      }
      const json = await r.json();
      const items = Array.isArray(json) ? json : json.data || json.games || [];

      const existing = await base44.asServiceRole.entities.SlotGame.list('-created_date', 1000);
      const bySlug = new Map((existing || []).map((g) => [g.slug, g]));

      let created = 0;
      let updated = 0;
      for (const it of items) {
        const slug = String(it.slug || it.identifier || it.id || '')
          .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (!slug) continue;
        const payload = {
          slug,
          name: it.title || it.name || slug,
          provider: it.provider || it.vendor || 'Unknown',
          image: it.image || it.thumbnail || '',
          rtp: Number(it.rtp) || 0,
          volatility: it.volatility || '',
          external_id: String(it.id || it.uuid || it.identifier || ''),
          has_demo: it.has_demo !== false,
          has_real: it.has_real !== false,
          enabled: true,
        };
        const prev = bySlug.get(slug);
        if (prev) {
          await base44.asServiceRole.entities.SlotGame.update(prev.id, payload);
          updated++;
        } else {
          const rec = await base44.asServiceRole.entities.SlotGame.create(payload);
          bySlug.set(slug, rec);
          created++;
        }
      }
      return Response.json({ ok: true, validated: true, sync: { created, updated, total: items.length } });
    }

    return Response.json({ ok: true, validated: true, received: body });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}