import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getIntegrationSettings } from '../../shared/integrations.ts';

function isAddress(chain: string, addr: string) {
  const a = (addr || '').trim();
  if (chain === 'solana') return a.length >= 32 && a.length <= 44;
  return /^0x[a-fA-F0-9]{40}$/.test(a);
}

export default async function(req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Login required' }, { status: 401 });

    const integrations = await getIntegrationSettings(base44);
    if (!integrations.livePaymentsEnabled) {
      return Response.json({
        error: 'Affiliate payouts are disabled in sandbox mode. Enable live payments after compliance review.'
      }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const address = String(body.address || '').trim();
    const chain = String(body.chain || 'solana');
    if (!['solana', 'ethereum', 'polygon'].includes(chain)) {
      return Response.json({ error: 'Invalid chain' }, { status: 400 });
    }
    if (!isAddress(chain, address)) {
      return Response.json({ error: 'Invalid wallet address for the selected chain' }, { status: 422 });
    }

    const rows = await base44.asServiceRole.entities.Affiliate.filter({ created_by_id: user.id });
    if (!rows || !rows.length) return Response.json({ error: 'Affiliate account not found' }, { status: 404 });
    const aff = rows[0];

    // Recompute pending from commissions ledger to avoid trusting the cached column.
    const logs = await base44.asServiceRole.entities.CommissionLog.filter({ affiliate_id: aff.id });
    const earned = (logs || []).reduce((s: number, l: any) => s + Number(l.commission || 0), 0);
    const pending = +Math.max(0, earned - Number(aff.paid_commission || 0)).toFixed(2);
    const MIN_PAYOUT = 50;
    if (pending < MIN_PAYOUT) {
      return Response.json({ error: `Minimum payout is ${MIN_PAYOUT} USDT` }, { status: 422 });
    }

    const updatedPaid = +(Number(aff.paid_commission || 0) + pending).toFixed(2);
    await base44.asServiceRole.entities.Affiliate.update(aff.id, {
      paid_commission: updatedPaid,
      pending_commission: 0,
      payout_address: address,
    });

    // Record the payout as a withdrawal request so the ops team can process it
    // through the same review queue as player withdrawals.
    await base44.asServiceRole.entities.Withdrawal.create({
      amount: pending,
      currency: 'USDT',
      wallet_address: address,
      chain,
      status: 'pending',
      balance_before: 0,
      balance_after: 0,
      description: `Affiliate commission payout for ${user.full_name || user.email || user.id}`,
    });

    return Response.json({ success: true, amount: pending, paid_commission: updatedPaid });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Payout request failed' }, { status: 500 });
  }
}
