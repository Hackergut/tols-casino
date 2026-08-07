import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { requireInternalCaller } from '../../shared/internalAuth.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Only the workflow (no user session) or an admin may put a withdrawal on hold.
    const denied = await requireInternalCaller(base44);
    if (denied) return denied;

    const body = await req.json().catch(() => ({}));
    const withdrawal_id = body.withdrawal_id || "";
    if (!withdrawal_id) return Response.json({ error: "withdrawal_id required" }, { status: 400 });

    const w = await base44.asServiceRole.entities.Withdrawal.get(withdrawal_id);
    if (!w) return Response.json({ error: "withdrawal not found" }, { status: 404 });
    // Only a freshly created request can be put on hold — replayed or forged
    // calls against already-reviewed/processed withdrawals are no-ops.
    if (w.status !== "pending") return Response.json({ flagged: false, reason: "not_pending", status: w.status });

    const amount = Number(w.amount) || 0;
    const currency = w.currency || "USDT";

    // Configurable review threshold from PlatformSetting (default 1000)
    let threshold = 1000;
    try {
      const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: "withdrawal_review_threshold" });
      if (settings && settings.length && settings[0].value) {
        const n = Number(settings[0].value);
        if (!Number.isNaN(n) && n > 0) threshold = n;
      }
    } catch (e) { /* default */ }

    if (amount < threshold) {
      return Response.json({ flagged: false, amount, threshold, reason: "below_threshold" });
    }

    // Wallet check for the requesting player
    let balance = null;
    let totalWagered = null;
    let vipLevel = null;
    try {
      const wallets = await base44.asServiceRole.entities.UserWallet.filter({ created_by_id: w.created_by_id });
      if (wallets && wallets.length) {
        balance = wallets[0].balance;
        totalWagered = wallets[0].total_wagered;
        vipLevel = wallets[0].vip_level;
      }
    } catch (e) { /* wallet unavailable */ }

    const suspicious = balance !== null && amount > balance;

    await base44.asServiceRole.entities.Withdrawal.update(withdrawal_id, {
      status: "pending_review",
      description: `Flagged for manual review: ${amount} ${currency} exceeds the ${threshold} ${currency} threshold.` +
        (balance !== null ? ` Wallet balance after hold: ${balance} ${currency}.` : " Wallet balance unavailable.") +
        (suspicious ? " ⚠️ Amount exceeds the recorded wallet balance." : ""),
    });

    const users = await base44.asServiceRole.entities.User.list();
    const admins = (users || []).filter((u) => u.role === "admin" && u.email);

    const subject = `🔍 Withdrawal pending review: ${amount} ${currency}`;
    const text =
      `A withdrawal above the review threshold (${threshold} ${currency}) was requested and is now on hold.\n\n` +
      `Amount: ${amount} ${currency}\n` +
      `Chain: ${w.chain || "—"}\n` +
      `Destination: ${w.wallet_address || "—"}\n` +
      `Balance before: ${w.balance_before ?? "—"} · after: ${w.balance_after ?? "—"}\n` +
      `Wallet balance on file: ${balance !== null ? balance + " " + currency : "unavailable"}\n` +
      `Total wagered: ${totalWagered ?? "—"} · VIP level: ${vipLevel ?? "—"}\n` +
      (suspicious ? `\n⚠️ The requested amount exceeds the wallet balance on record.\n` : "") +
      `\nWithdrawal ID: ${withdrawal_id}\nApprove or reject it in the Admin dashboard.`;

    const recipients = [];
    for (const a of admins) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({ to: a.email, subject, body: text });
        recipients.push({ email: a.email, ok: true });
      } catch (e) {
        recipients.push({ email: a.email, ok: false, error: e.message });
      }
    }

    return Response.json({ flagged: true, amount, threshold, balance, suspicious, recipients });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}