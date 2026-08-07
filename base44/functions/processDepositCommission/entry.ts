import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Only the workflow (no user session) or an admin may run commission payouts.
    const caller = await base44.auth.me().catch(() => null);
    if (caller && caller.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const deposit_id = body.deposit_id || "";
    if (!deposit_id) return Response.json({ processed: false, reason: "no_deposit_id" }, { status: 400 });

    // Load the verified deposit (workflow context — no user session, use service role)
    const deposit = await base44.asServiceRole.entities.Deposit.get(deposit_id).catch(() => null);
    if (!deposit) return Response.json({ processed: false, reason: "deposit_not_found" });
    if (deposit.status !== "confirmed") return Response.json({ processed: false, reason: "not_confirmed" });

    // Idempotency: one commission per deposit, ever (blocks replayed invocations)
    const alreadyLogged = await base44.asServiceRole.entities.CommissionLog.filter({ deposit_id });
    if (alreadyLogged && alreadyLogged.length) {
      return Response.json({ processed: false, reason: "already_processed", deposit_id });
    }

    // The deposit must be linked to a referral (affiliate code stamped at deposit time)
    const refCode = (deposit.referral_code || "").trim();
    if (!refCode) return Response.json({ processed: false, reason: "no_referral_code" });

    // Find the Affiliate that owns this referral code
    const affiliates = await base44.asServiceRole.entities.Affiliate.filter({ referral_code: refCode });
    if (!affiliates || !affiliates.length) return Response.json({ processed: false, reason: "affiliate_not_found" });
    const affiliate = affiliates[0];

    // Resolve the depositor alias to match the Referral record (player_alias == email/full_name)
    let playerAlias = "";
    if (deposit.created_by_id) {
      try {
        const u = await base44.asServiceRole.entities.User.get(deposit.created_by_id).catch(() => null);
        if (u) playerAlias = (u.email || u.full_name || "").toLowerCase();
      } catch (e) { /* ignore */ }
    }

    // Find the Referral owned by this affiliate for this depositor
    const refs = await base44.asServiceRole.entities.Referral.filter({ affiliate_code: refCode });
    let referral = null;
    if (refs && refs.length) {
      if (playerAlias) referral = refs.find((r) => (r.player_alias || "").toLowerCase() === playerAlias) || null;
      if (!referral) referral = refs[0]; // fallback when only one referral exists under this affiliate
    }
    if (!referral) return Response.json({ processed: false, reason: "referral_not_found" });

    // Commission config: PlatformSetting is the source of truth (per request), Affiliate fields are the per-affiliate fallback
    const getSetting = async (key) => {
      try {
        const s = await base44.asServiceRole.entities.PlatformSetting.filter({ key });
        if (s && s.length && s[0].value !== "" && s[0].value != null) return s[0].value;
      } catch (e) {}
      return "";
    };
    const psPlan = await getSetting("affiliate_commission_plan");
    const psRate = await getSetting("affiliate_commission_rate");
    const psCpa = await getSetting("affiliate_cpa_amount");

    let plan = "revshare";
    if (psPlan && ["revshare", "cpa", "hybrid"].includes(psPlan)) plan = psPlan;
    else if (affiliate.commission_plan) plan = affiliate.commission_plan;

    let rate = 25;
    if (psRate && !Number.isNaN(Number(psRate))) rate = Number(psRate);
    else if (Number(affiliate.commission_rate)) rate = Number(affiliate.commission_rate);

    let cpaAmount = 50;
    if (psCpa && !Number.isNaN(Number(psCpa))) cpaAmount = Number(psCpa);
    else if (Number(affiliate.cpa_amount)) cpaAmount = Number(affiliate.cpa_amount);

    const depositAmount = Number(deposit.amount) || 0;
    let commission = 0;
    if (plan === "cpa") {
      // one-time CPA bounty on the player's first deposit
      if (referral.status !== "deposited") commission = cpaAmount;
    } else if (plan === "hybrid") {
      if (referral.status !== "deposited") commission = cpaAmount;
      commission += depositAmount * (rate / 100);
    } else {
      // revshare: a share of the deposit
      commission = depositAmount * (rate / 100);
    }
    commission = Math.round(commission * 100) / 100;
    if (commission <= 0) return Response.json({ processed: false, reason: "zero_commission", plan, rate, cpaAmount });

    // Credit the Affiliate
    const newPending = Math.round(((Number(affiliate.pending_commission) || 0) + commission) * 100) / 100;
    const newTotal = Math.round(((Number(affiliate.total_commission) || 0) + commission) * 100) / 100;
    await base44.asServiceRole.entities.Affiliate.update(affiliate.id, {
      pending_commission: newPending,
      total_commission: newTotal,
    });

    // Update the Referral
    const newRefCommission = Math.round(((Number(referral.commission_earned) || 0) + commission) * 100) / 100;
    const newRefPayout = Math.round(((Number(referral.total_payout) || 0) + commission) * 100) / 100;
    await base44.asServiceRole.entities.Referral.update(referral.id, {
      status: "deposited",
      commission_earned: newRefCommission,
      total_payout: newRefPayout,
    });

    // Log the transaction
    await base44.asServiceRole.entities.CommissionLog.create({
      affiliate_id: affiliate.id,
      referral_id: referral.id,
      deposit_id: deposit.id,
      deposit_amount: depositAmount,
      commission,
      plan,
      rate,
      currency: deposit.currency || "USDT",
      description: `Affiliate commission from deposit ${deposit.tx_hash || deposit.id}`,
    });

    return Response.json({
      processed: true,
      affiliate_id: affiliate.id,
      referral_id: referral.id,
      deposit_id: deposit.id,
      commission,
      plan,
      rate,
      cpaAmount,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}