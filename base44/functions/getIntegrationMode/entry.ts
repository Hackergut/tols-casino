import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

type Mode = 'sandbox' | 'live';

const DEFAULTS = {
  payments_mode: 'sandbox',
  slots_mode: 'sandbox',
  support_email: 'support@tols.example',
};

function safe(value: unknown, fallback: string) {
  const v = String(value || '').trim().toLowerCase();
  return v || fallback;
}

export default async function(req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const rows = await base44.asServiceRole.entities.PlatformSetting.filter({ category: 'integrations' }).catch(() => []);
    const get = (key: keyof typeof DEFAULTS) => {
      const row = (rows || []).find((r: any) => r.key === key);
      return safe(row?.value, DEFAULTS[key]);
    };

    const paymentsMode = get('payments_mode') as Mode;
    const slotsMode = get('slots_mode') as Mode;

    return Response.json({
      paymentsMode,
      slotsMode,
      livePaymentsEnabled: paymentsMode === 'live',
      liveSlotsEnabled: slotsMode === 'live',
      supportEmail: get('support_email'),
      notice: 'This build ships integration-ready stubs. Live money movement and provider sessions remain disabled until an admin explicitly enables them after legal, KYC/AML, payments, and security review.',
    });
  } catch (error: any) {
    return Response.json({
      paymentsMode: 'sandbox',
      slotsMode: 'sandbox',
      livePaymentsEnabled: false,
      liveSlotsEnabled: false,
      supportEmail: DEFAULTS.support_email,
      error: error?.message || 'Could not load integration mode',
    });
  }
}
