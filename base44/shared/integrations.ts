export async function getIntegrationSettings(base44: any) {
  const rows = await base44.asServiceRole.entities.PlatformSetting.filter({ category: 'integrations' }).catch(() => []);
  const get = (key: string, fallback = '') => {
    const row = (rows || []).find((r: any) => r.key === key);
    return row?.value || fallback;
  };
  return {
    paymentsMode: get('payments_mode', 'sandbox'),
    slotsMode: get('slots_mode', 'sandbox'),
    supportEmail: get('support_email', 'support@tols.example'),
    livePaymentsEnabled: get('payments_mode', 'sandbox') === 'live',
    liveSlotsEnabled: get('slots_mode', 'sandbox') === 'live',
  };
}
