import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { requireInternalCaller } from '../../shared/internalAuth.ts';

const ALERT_MARKER = "[admin-alerted]";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Only the workflow (no user session) or an admin may trigger admin alerts.
    const denied = await requireInternalCaller(base44);
    if (denied) return denied;

    const body = await req.json().catch(() => ({}));
    const deposit_id = body.deposit_id || "";
    if (!deposit_id) return Response.json({ notified: false, reason: "no_deposit_id" }, { status: 400 });

    // Alert content comes from the stored deposit, never from the request body
    const deposit = await base44.asServiceRole.entities.Deposit.get(deposit_id).catch(() => null);
    if (!deposit) return Response.json({ notified: false, reason: "deposit_not_found" }, { status: 404 });
    // Real deposits only, and one alert per deposit — replayed or forged calls are no-ops
    if (deposit.status !== "confirmed") return Response.json({ notified: false, reason: "not_confirmed" });
    if ((deposit.description || "").includes(ALERT_MARKER)) {
      return Response.json({ notified: false, reason: "already_alerted" });
    }

    const amount = Number(deposit.amount) || 0;
    const chain = deposit.chain || "";
    const currency = deposit.currency || "USDT";
    const from_address = deposit.from_address || "";
    const tx_hash = deposit.tx_hash || "";

    // Configurable threshold from PlatformSetting (default 1000 USDT)
    let threshold = 1000;
    try {
      const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: "large_deposit_threshold" });
      if (settings && settings.length && settings[0].value) {
        const n = Number(settings[0].value);
        if (!Number.isNaN(n) && n > 0) threshold = n;
      }
    } catch (e) { /* default */ }

    if (amount < threshold) {
      return Response.json({ notified: false, amount, threshold, reason: "below_threshold" });
    }

    // Notify the admin team (registered app users)
    const users = await base44.asServiceRole.entities.User.list();
    const admins = (users || []).filter((u) => u.role === "admin" && u.email);
    if (!admins.length) {
      return Response.json({ notified: false, reason: "no_admins" });
    }

    const subject = `🚨 Large deposit alert: ${amount} ${currency} on ${chain}`;
    const text =
      `A deposit exceeding the configured threshold (${threshold} ${currency}) was received.\n\n` +
      `Amount: ${amount} ${currency}\n` +
      `Chain: ${chain}\n` +
      `From: ${from_address || "—"}\n` +
      `Tx hash: ${tx_hash || "—"}\n` +
      `Deposit ID: ${deposit_id || "—"}\n\n` +
      `Review it in the Admin dashboard.`;

    await base44.asServiceRole.entities.Deposit.update(deposit_id, {
      description: `${(deposit.description || "").slice(0, 900)} ${ALERT_MARKER}`.trim(),
    });

    const results = [];
    for (const a of admins) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({ to: a.email, subject, body: text });
        results.push({ email: a.email, ok: true });
      } catch (e) {
        results.push({ email: a.email, ok: false, error: e.message });
      }
    }

    return Response.json({ notified: true, amount, threshold, recipients: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}