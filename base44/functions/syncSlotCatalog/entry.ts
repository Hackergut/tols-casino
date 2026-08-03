import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getAggregatorConfig, isConfigured } from '../../shared/aggregator.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Solo gli admin possono sincronizzare il catalogo.' }, { status: 403 });
    }

    const cfg = getAggregatorConfig();
    if (!isConfigured(cfg)) {
      return Response.json({
        error: 'Aggregatore non configurato. Imposta AGGREGATOR_API_BASE e AGGREGATOR_API_KEY in Settings → Secrets.'
      }, { status: 503 });
    }

    const r = await fetch(`${cfg.baseUrl}/api/games?limit=1000`, {
      headers: {
        'Authorization': `Bearer ${cfg.apiKey}`,
        'X-Merchant-Id': cfg.operatorId,
        'Accept': 'application/json'
      }
    });
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      return Response.json({
        error: `Feed aggregatore non disponibile (${r.status}). ${t.slice(0, 200)}`
      }, { status: 502 });
    }
    const json = await r.json();
    const items = Array.isArray(json) ? json : (json.data || json.games || []);

    const existing = await base44.asServiceRole.entities.SlotGame.list('-created_date', 1000);
    const bySlug = new Map((existing || []).map((g) => [g.slug, g]));

    let created = 0;
    let updated = 0;
    for (const it of items) {
      const slug = String(it.slug || it.identifier || it.id || '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (!slug) continue;
      const external_id = String(it.id || it.uuid || it.identifier || '');
      const payload = {
        slug,
        name: it.title || it.name || slug,
        provider: it.provider || it.vendor || 'Unknown',
        image: it.image || it.thumbnail || '',
        rtp: Number(it.rtp) || 0,
        volatility: it.volatility || '',
        external_id,
        has_demo: it.has_demo !== false,
        has_real: it.has_real !== false,
        enabled: true
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
    return Response.json({ created, updated, total: items.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}