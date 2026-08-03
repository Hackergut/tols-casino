import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getAggregatorConfig, isConfigured } from '../../shared/aggregator.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    let user = null;
    try { user = await base44.auth.me(); } catch (e) { user = null; }

    const body = await req.json().catch(() => ({}));
    const slug = String(body.slug || '');
    const mode = body.mode === 'real' ? 'real' : 'demo';
    if (!slug) return Response.json({ error: 'slug mancante' }, { status: 400 });

    if (mode === 'real' && !user) {
      return Response.json({ error: 'Login richiesto per la modalità soldi veri.' }, { status: 401 });
    }

    const cfg = getAggregatorConfig();
    if (!isConfigured(cfg)) {
      return Response.json({
        error: 'Aggregatore non configurato. Aggiungi le credenziali in Settings → Secrets.'
      }, { status: 503 });
    }

    const list = await base44.asServiceRole.entities.SlotGame.filter({ slug });
    const slot = list && list[0];
    if (!slot) {
      return Response.json({
        error: 'Slot non sincronizzata. Un admin deve eseguire la sincronizzazione del catalogo.'
      }, { status: 404 });
    }
    if (!slot.external_id) {
      return Response.json({
        error: 'ID aggregatore mancante. Esegui nuovamente la sincronizzazione del catalogo.'
      }, { status: 409 });
    }
    if (mode === 'real' && slot.has_real === false) {
      return Response.json({ error: 'Questa slot non è disponibile in modalità soldi veri.' }, { status: 409 });
    }
    if (mode === 'demo' && slot.has_demo === false) {
      return Response.json({ error: 'Demo non disponibile per questa slot.' }, { status: 409 });
    }

    let launch_url = '';
    if (mode === 'demo') {
      const r = await fetch(`${cfg.baseUrl}/api/games/${encodeURIComponent(slot.external_id)}/demo-url`, {
        headers: {
          'Authorization': `Bearer ${cfg.apiKey}`,
          'X-Merchant-Id': cfg.operatorId,
          'Accept': 'application/json'
        }
      });
      if (!r.ok) return Response.json({ error: `Demo non disponibile (${r.status}).` }, { status: 502 });
      const j = await r.json();
      launch_url = j.url || j.launch_url || j.demo_url || '';
    } else {
      const r = await fetch(`${cfg.baseUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfg.apiKey}`,
          'X-Merchant-Id': cfg.operatorId,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          game_id: slot.external_id,
          player_id: user.id,
          player_name: user.full_name || user.email || user.id,
          currency: 'USDT',
          return_url: '/'
        })
      });
      if (!r.ok) return Response.json({ error: `Sessione non avviata (${r.status}).` }, { status: 502 });
      const j = await r.json();
      launch_url = j.launch_url || j.url || j.session_url || '';
    }

    if (!launch_url) {
      return Response.json({ error: 'URL di lancio non ricevuto dall\'aggregatore.' }, { status: 502 });
    }
    return Response.json({ launch_url, mode });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}