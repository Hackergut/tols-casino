import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const deposit_id = body.deposit_id || "";
    let amount = Number(body.amount) || 0;
    let chain = body.chain || "";
    let currency = body.currency || "USDT";
    let from_address = body.from_address || "";
    let tx_hash = body.tx_hash || "";

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