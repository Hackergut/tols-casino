import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getAggregatorConfig, isConfigured } from '../../shared/aggregator.ts';

type SlotItem = {
  slug?: string;
  identifier?: string;
  id?: string | number;
  uuid?: string;
  external_id?: string;
  title?: string;
  name?: string;
  provider?: string | { name?: string };
  vendor?: string;
  image?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  rtp?: number | string;
  volatility?: string;
  has_demo?: boolean;
  has_real?: boolean;
  demo_url?: string;
  description?: string;
};

function providerName(value: SlotItem['provider']) {
  if (!value) return 'Unknown';
  if (typeof value === 'string') return value;
  return value.name || 'Unknown';
}

export default async function(req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Only admins can synchronize the catalog.' }, { status: 403 });
    }

    const cfg = await getAggregatorConfig(base44);
    if (!isConfigured(cfg)) {
      return Response.json({
        error: 'Aggregator not configured. Add API credentials in Admin → Slot aggregator.'
      }, { status: 503 });
    }

    const urls = [
      `${cfg.baseUrl}/api/games?limit=1000`,
      `${cfg.baseUrl}/api/slots?limit=1000`,
      `${cfg.baseUrl}/games?limit=1000`,
    ];

    let response: Response | null = null;
    let lastError = '';
    for (const url of urls) {
      const r = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${cfg.apiKey}`,
          'X-Merchant-Id': cfg.operatorId,
          'Accept': 'application/json'
        }
      });
      if (r.ok) { response = r; break; }
      lastError = `${r.status} ${(await r.text().catch(() => '')).slice(0, 180)}`;
    }

    if (!response) {
      return Response.json({
        error: `Aggregator catalog feed unavailable. Tried /api/games, /api/slots, /games. ${lastError}`
      }, { status: 502 });
    }

    const json = await response.json();
    const items: SlotItem[] = Array.isArray(json) ? json : (json.data || json.games || json.results || []);

    const existing = await base44.asServiceRole.entities.SlotGame.list('-created_date', 1000);
    const bySlug = new Map((existing || []).map((g: any) => [g.slug, g]));

    let created = 0;
    let updated = 0;
    const seen = new Set<string>();

    for (const it of items) {
      const rawSlug = String(it.slug || it.identifier || it.id || it.uuid || '').trim();
      const slug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (!slug) continue;
      seen.add(slug);

      const external_id = String(it.external_id || it.id || it.uuid || it.identifier || slug);
      const payload = {
        slug,
        name: it.title || it.name || slug,
        provider: providerName(it.provider) || it.vendor || 'Unknown',
        image: it.image || it.thumbnail || it.thumbnail_url || '',
        rtp: Number(it.rtp) || 0,
        volatility: it.volatility || '',
        external_id,
        has_demo: it.has_demo !== false,
        has_real: it.has_real === true,
        enabled: true,
        demo_url: it.demo_url || '',
        description: it.description || '',
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

    return Response.json({ created, updated, total: items.length, seen: seen.size });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Catalog sync error' }, { status: 500 });
  }
}
