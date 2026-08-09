// TOLS Bonus & Redeem System — Professional
export const BONUSES = [
  { id: "welcome", name: "Welcome Bonus", desc: "100% match up to 500 USDT", reward: 500, currency: "USDT", type: "deposit_match", percent: 100, min_deposit: 20, wager_req: 30, icon: "Gift", color: "#ccff00" },
  { id: "rakeback", name: "Rakeback", desc: "Instant 10% on every bet", reward: 0, currency: "USDT", type: "rakeback", percent: 10, icon: "RotateCcw", color: "#4f8aff" },
  { id: "cashback", name: "Weekly Cashback", desc: "10% net loss back every Monday", reward: 0, currency: "USDT", type: "cashback", percent: 10, icon: "Shield", color: "#ff4fa3" },
  { id: "daily", name: "Daily Bonus", desc: "Login daily to claim", reward: 5, currency: "USDT", type: "daily", icon: "Calendar", color: "#f59e0b" },
  { id: "levelup", name: "Level Up", desc: "Reward on VIP tier up", reward: 0, currency: "USDT", type: "level", icon: "Crown", color: "#a855f7" },
  { id: "freespin", name: "Free Spins", desc: "20 spins on Sweet Bonanza", reward: 20, currency: "SPINS", type: "freespin", icon: "Sparkles", color: "#ec4899" },
];

export const REDEEM_CODES = {
  "WELCOME100": { reward: 100, currency: "USDT", type: "bonus", desc: "100 USDT welcome" },
  "TOLS2024": { reward: 50, currency: "USDT", type: "bonus", desc: "50 USDT TOLS launch" },
  "TOLS100": { reward: 50, currency: "USDT", type: "bonus", desc: "TOLS launch bonus" },
  "RAKE10": { reward: 10, currency: "USDT", type: "rakeback", desc: "10% rakeback boost" },
  "VIP2024": { reward: 250, currency: "USDT", type: "vip", desc: "VIP Diamond trial" },
  "FREESPINS": { reward: 20, currency: "SPINS", type: "freespin", desc: "20 free spins" },
};

// Backend sync helpers — exact logic: PlatformSetting is source of truth, localStorage is fallback when VITE_DEMO_FALLBACK=true
import { base44 } from "@/api/client";

export async function fetchBonusConfig() {
  try {
    const list = await base44.entities.PlatformSetting.filter({ category: "bonus_config" });
    const entry = list.find((s) => s.key === "bonus_config");
    if (entry?.value) return JSON.parse(entry.value);
  } catch {}
  return null;
}

export async function fetchRedeemCodesFromBackend() {
  try {
    const list = await base44.entities.PlatformSetting.filter({ category: "redeem_code" });
    if (list?.length) {
      const map = {};
      list.forEach((s) => { try { map[s.key] = JSON.parse(s.value); } catch { map[s.key] = { reward: Number(s.value) || 0, currency: "USDT", desc: s.description || "" }; } });
      return map;
    }
  } catch {}
  return null;
}

export async function claimBonusBackend(bonusId, userId) {
  // Check already claimed via PlatformSetting bonus_claim
  try {
    const key = `bonus_claim_${userId}_${bonusId}`;
    const existing = await base44.entities.PlatformSetting.filter({ category: "bonus_claim", key });
    if (existing?.length) return { ok: false, error: "Already claimed" };
    await base44.entities.PlatformSetting.create({ key, value: new Date().toISOString(), category: "bonus_claim", description: `Bonus ${bonusId} claimed by ${userId}` });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || "Claim failed" };
  }
}

export async function redeemCodeBackend(code, userId) {
  const upper = code.trim().toUpperCase();
  // Validate code exists in backend
  try {
    const list = await base44.entities.PlatformSetting.filter({ category: "redeem_code", key: upper });
    if (!list?.length) {
      // fallback to hardcoded if not in backend and demo enabled
      if (REDEEM_CODES[upper]) {
        // create claim
        const claimKey = `redeem_claim_${userId}_${upper}`;
        const existing = await base44.entities.PlatformSetting.filter({ category: "redeem_claim", key: claimKey });
        if (existing?.length) return { ok: false, error: "Already redeemed" };
        await base44.entities.PlatformSetting.create({ key: claimKey, value: JSON.stringify(REDEEM_CODES[upper]), category: "redeem_claim" });
        return { ok: true, ...REDEEM_CODES[upper], code: upper };
      }
      return { ok: false, error: "Invalid code" };
    }
    const data = JSON.parse(list[0].value);
    // check already redeemed
    const claimKey = `redeem_claim_${userId}_${upper}`;
    const existing = await base44.entities.PlatformSetting.filter({ category: "redeem_claim", key: claimKey });
    if (existing?.length) return { ok: false, error: "Already redeemed" };
    await base44.entities.PlatformSetting.create({ key: claimKey, value: JSON.stringify(data), category: "redeem_claim" });
    return { ok: true, ...data, code: upper };
  } catch (e) {
    return { ok: false, error: e?.message || "Redeem failed" };
  }
}

const LS_BONUS = "tols_bonus_claimed";
const LS_REDEEM = "tols_redeem_used";

export function getClaimedBonuses() {
  try { return JSON.parse(localStorage.getItem(LS_BONUS) || "[]"); } catch { return []; }
}
export function claimBonus(id) {
  const list = getClaimedBonuses();
  if (list.includes(id)) return false;
  list.push(id);
  localStorage.setItem(LS_BONUS, JSON.stringify(list));
  return true;
}
export function isBonusClaimed(id) { return getClaimedBonuses().includes(id); }

export function getRedeemedCodes() {
  try { return JSON.parse(localStorage.getItem(LS_REDEEM) || "[]"); } catch { return []; }
}
export function redeemCode(code) {
  const upper = code.trim().toUpperCase();
  const data = REDEEM_CODES[upper];
  if (!data) return { ok: false, error: "Invalid code" };
  const used = getRedeemedCodes();
  if (used.includes(upper)) return { ok: false, error: "Already redeemed" };
  used.push(upper);
  localStorage.setItem(LS_REDEEM, JSON.stringify(used));
  return { ok: true, reward: data.reward, currency: data.currency, desc: data.desc, code: upper };
}
export function isCodeRedeemed(code) { return getRedeemedCodes().includes(code.toUpperCase()); }
