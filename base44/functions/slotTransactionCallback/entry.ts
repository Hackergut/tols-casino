import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getAggregatorConfig } from '../../shared/aggregator.ts';

// Generic aggregator transaction webhook for REAL-MONEY slot play.
// Closes the income/outcome loop: debits the wallet on bet, credits on win/refund,
// records Bet + HouseEarning, and feeds the global progressive pot.
//
// Expected request (no user auth — validated by signature):
//   Header: X-Signature: hex HMAC-SHA256(rawBody, aggregator_api_secret)  (falls back to api_key)
//   JSON body, one of:
//     { type: "round", player_id, game_id, round_id, bet, win, tx_id, currency }
//     { type: "bet"|"win"|"refund", player_id, game_id, round_id, amount, tx_id, currency }
//   amounts are in USDT. tx_id is the idempotency key.
//
// NOTE: adapt the signature scheme / payload field names to your aggregator's
// callback spec once credentials are configured.

async function hmacHex(secret, msg) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function feedJackpot(base44, wager) {
  try {
    const wagerNum = Math.abs(Number(wager) || 0);
    if (wagerNum <= 0) return;
    const pots = await base44.asServiceRole.entities.GlobalJackpot.list();
    const pot = pots && pots.length ? pots[0] : await base44.asServiceRole.entities.GlobalJackpot.create({ amount: 250, currency: 'USDT' });
    const next = +(Number(pot.amount || 0) + wagerNum * 0.01).toFixed(2);
    await base44.asServiceRole.entities.GlobalJackpot.update(pot.id, { amount: next, contributions_count: (pot.contributions_count || 0) + 1 });
  } catch (e) { /* never block the loop on the pot */ }
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const cfg = await getAggregatorConfig(base44);
    const secret = cfg.apiSecret || cfg.apiKey;
    if (!secret) return Response.json({ error: 'Aggregator secret not configured' }, { status: 503 });

    const raw = await req.text();
    const sig = req.headers.get('x-signature') || req.headers.get('x-aggregator-signature') || '';
    const expected = await hmacHex(secret, raw);
    if (!sig || sig.toLowerCase() !== expected) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(raw);
    const type = String(body.type || '').toLowerCase();
    const playerId = String(body.player_id || body.playerId || '');
    const gameId = String(body.game_id || body.gameId || body.external_id || '');
    const roundId = String(body.round_id || body.roundId || body.round || '');
    const txId = String(body.tx_id || body.transaction_id || body.id || roundId || '');
    const currency = String(body.currency || 'USDT');
    if (!playerId) return Response.json({ error: 'player_id required' }, { status: 400 });

    const wallets = await base44.asServiceRole.entities.UserWallet.filter({ created_by_id: playerId });
    if (!wallets || !wallets.length) return Response.json({ error: 'wallet not found' }, { status: 404 });
    const w = wallets[0];

    let gameName = '';
    if (gameId) {
      const slots = await base44.asServiceRole.entities.SlotGame.filter({ external_id: gameId }).catch(() => []);
      if (slots && slots.length) gameName = slots[0].name || '';
    }

    const idemKey = 'slotcb:' + txId;

    if (type === 'round') {
      const bet = Number(body.bet || body.stake || 0);
      const win = Number(body.win || body.payout || 0);
      if (bet <= 0 && win <= 0) return Response.json({ error: 'empty round' }, { status: 400 });
      const dup = await base44.asServiceRole.entities.Bet.filter({ description: idemKey }).catch(() => []);
      if (dup && dup.length) return Response.json({ ok: true, idempotent: true });

      const net = +(win - bet).toFixed(2);
      const newBalance = Math.max(0, +(Number(w.balance || 0) + net).toFixed(2));
      await base44.asServiceRole.entities.UserWallet.update(w.id, {
        balance: newBalance,
        total_wagered: +(Number(w.total_wagered || 0) + bet).toFixed(2),
      });
      await base44.asServiceRole.entities.Bet.create({
        game_id: gameId || 'slot',
        game_name: gameName,
        amount: bet,
        currency,
        multiplier: bet > 0 ? +(win / bet).toFixed(4) : 0,
        payout: win,
        result: win > 0 ? 'win' : 'lose',
        client_seed: roundId,
        server_seed_hash: '',
        nonce: 0,
        description: idemKey,
      });
      await base44.asServiceRole.entities.HouseEarning.create({
        game_id: gameId || 'slot',
        game_name: gameName,
        bet_id: '',
        wager: bet,
        payout: win,
        house_profit: +(bet - win).toFixed(2),
        currency,
      });
      await feedJackpot(base44, bet);
      return Response.json({ ok: true, balance: newBalance });
    }

    if (type === 'bet') {
      const amount = Number(body.amount || 0);
      if (amount <= 0) return Response.json({ error: 'invalid amount' }, { status: 400 });
      const dup = await base44.asServiceRole.entities.Bet.filter({ description: idemKey }).catch(() => []);
      if (dup && dup.length) return Response.json({ ok: true, idempotent: true });
      const newBalance = Math.max(0, +(Number(w.balance || 0) - amount).toFixed(2));
      await base44.asServiceRole.entities.UserWallet.update(w.id, {
        balance: newBalance,
        total_wagered: +(Number(w.total_wagered || 0) + amount).toFixed(2),
      });
      await base44.asServiceRole.entities.Bet.create({
        game_id: gameId || 'slot', game_name: gameName, amount, currency, multiplier: 0, payout: 0, result: 'lose',
        client_seed: roundId, server_seed_hash: '', nonce: 0, description: idemKey,
      });
      await feedJackpot(base44, amount);
      return Response.json({ ok: true, balance: newBalance });
    }

    if (type === 'win' || type === 'refund') {
      const amount = Number(body.amount || 0);
      if (amount <= 0) return Response.json({ error: 'invalid amount' }, { status: 400 });
      const winKey = 'slotwin:' + txId;
      const dup = await base44.asServiceRole.entities.Bet.filter({ description: winKey }).catch(() => []);
      if (dup && dup.length) return Response.json({ ok: true, idempotent: true });
      const newBalance = +(Number(w.balance || 0) + amount).toFixed(2);
      await base44.asServiceRole.entities.UserWallet.update(w.id, { balance: newBalance });
      const bets = await base44.asServiceRole.entities.Bet.filter({ client_seed: roundId }).catch(() => []);
      const orig = bets && bets.length ? bets[0] : null;
      if (orig) {
        await base44.asServiceRole.entities.Bet.update(orig.id, {
          payout: amount,
          result: type === 'win' ? 'win' : 'lose',
          multiplier: orig.amount > 0 ? +(amount / orig.amount).toFixed(4) : 0,
        });
        await base44.asServiceRole.entities.HouseEarning.create({
          game_id: orig.game_id, game_name: orig.game_name, bet_id: orig.id, wager: orig.amount, payout: amount,
          house_profit: +(orig.amount - amount).toFixed(2), currency,
        });
      } else {
        await base44.asServiceRole.entities.HouseEarning.create({
          game_id: gameId || 'slot', game_name: gameName, bet_id: '', wager: 0, payout: amount,
          house_profit: +(-amount).toFixed(2), currency,
        });
      }
      await base44.asServiceRole.entities.Bet.create({
        game_id: gameId || 'slot', game_name: gameName, amount: 0, currency, multiplier: 0, payout: amount,
        result: type === 'win' ? 'win' : 'lose', client_seed: roundId, server_seed_hash: '', nonce: 0, description: winKey,
      });
      return Response.json({ ok: true, balance: newBalance });
    }

    return Response.json({ error: 'unknown type: ' + type }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || 'callback error' }, { status: 500 });
  }
}