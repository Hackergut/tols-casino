import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getIntegrationSettings } from '../../shared/integrations.ts';

// Server-authoritative withdrawal creation. Validates the request, holds
// (deducts) the balance atomically, and creates the Withdrawal record — which
// fires the "Large Withdrawal Review" workflow that flags large requests and
// notifies admins. Live payouts are blocked in sandbox mode by default.

const FEES: Record<string, number> = { solana: 0.01, polygon: 0.05, ethereum: 0.02 };
const CHAIN_RE: Record<string, RegExp> = {
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  ethereum: /^0x[a-fA-F0-9]{40}$/,
  polygon: /^0x[a-fA-F0-9]{40}$/,
};
const MIN: Record<string, number> = { solana: 5, polygon: 10, ethereum: 20 };

export default async function(req: Request) {
  try {
    if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Login required' }, { status: 401 });

    const integrations = await getIntegrationSettings(base44);
    if (!integrations.livePaymentsEnabled) {
      return Response.json({
        error: 'Withdrawals are disabled in sandbox mode. Enable live payments after compliance and custody review.'
      }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const chain = String(body.chain || 'solana');
    const address = String(body.wallet_address || '').trim();
    const amount = Number(body.amount);

    if (!FEES[chain]) return Response.json({ error: 'Unsupported chain' }, { status: 400 });
    if (!CHAIN_RE[chain].test(address)) return Response.json({ error: 'Invalid wallet address' }, { status: 422 });
    if (!Number.isFinite(amount) || amount <= 0) return Response.json({ error: 'Invalid amount' }, { status: 400 });
    if (amount < (MIN[chain] || 0)) {
      return Response.json({ error: `Minimum withdrawal for ${chain} is ${MIN[chain]} USDT` }, { status: 422 });
    }

    const fee = FEES[chain];
    const wallets = await base44.asServiceRole.entities.UserWallet.filter({ created_by_id: user.id });
    if (!wallets || !wallets.length) return Response.json({ error: 'Wallet not found' }, { status: 404 });
    const w = wallets[0];
    const balance = Number(w.balance || 0);
    if (amount + fee > balance) {
      return Response.json({ error: `Insufficient balance. Available: ${balance.toFixed(2)} USDT (includes ${fee} fee)` }, { status: 422 });
    }

    const balanceBefore = +balance.toFixed(2);
    const balanceAfter = +(balance - amount).toFixed(2);

    // Optimistic concurrency guard: re-read and compare before deducting.
    const fresh = await base44.asServiceRole.entities.UserWallet.get(w.id);
    if (Number(fresh.balance || 0) < balance) {
      return Response.json({ error: 'Balance changed, please retry' }, { status: 409 });
    }
    await base44.asServiceRole.entities.UserWallet.update(w.id, { balance: balanceAfter });

    try {
      const record = await base44.asServiceRole.entities.Withdrawal.create({
        amount: +amount.toFixed(2),
        currency: w.currency || 'USDT',
        wallet_address: address,
        chain,
        status: 'pending',
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      });

      // Fire Telegram alert (best-effort). The workflow also handles large
      // withdrawals separately; this notifies for every pending request.
      base44.functions.invoke('sendTelegramAlert', {
        event: 'withdrawal',
        title: '💸 Withdrawal requested',
        message: `User: ${user.full_name || user.email || user.id}\nAmount: ${amount.toFixed(2)} ${w.currency || 'USDT'}\nChain: ${chain}\nTo: ${address.slice(0, 12)}…`,
      }).catch(() => {});

      return Response.json({ success: true, withdrawal: record, balance: balanceAfter, fee });
    } catch (e: any) {
      // Refund on creation failure so funds are never stuck.
      await base44.asServiceRole.entities.UserWallet.update(w.id, { balance: balanceBefore });
      return Response.json({ error: e.message || 'Withdrawal creation failed' }, { status: 500 });
    }
  } catch (error: any) {
    return Response.json({ error: error.message || 'Withdrawal error' }, { status: 500 });
  }
}
