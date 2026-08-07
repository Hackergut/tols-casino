import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// App Store-required account deletion: wipes the user's owned data across the
// platform. The auth account itself cannot be removed via the SDK, so this
// clears all associated user data; the client then logs the user out.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Login required' }, { status: 401 });
    const uid = user.id;
    const sr = base44.asServiceRole.entities;
    const owned = { created_by_id: uid };

    await sr.UserWallet.deleteMany(owned);
    await sr.Bet.deleteMany(owned);
    await sr.Withdrawal.deleteMany(owned);
    await sr.Deposit.deleteMany(owned);
    await sr.TournamentEntry.deleteMany(owned);
    await sr.ChatMessage.deleteMany(owned);

    // HouseEarning / CommissionLog are house-side audit/affiliate records and
    // are intentionally preserved for accounting integrity.

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message || 'Deletion error' }, { status: 500 });
  }
}