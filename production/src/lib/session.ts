import { db } from "@/lib/db";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

const DEMO_EMAIL = "demo@tols.gg";

// Returns the authenticated user if a valid session cookie is present;
// otherwise falls back to a shared demo user so public/preview pages still work.
export async function getSession() {
  const authed = await getCurrentUser();
  if (authed) return authed;

  let user = await db.casinoUser.findUnique({
    where: { email: DEMO_EMAIL },
    include: { wallet: true },
  });
  if (!user) {
    user = await db.casinoUser.create({
      data: {
        username: "TOLSPlayer",
        email: DEMO_EMAIL,
        role: "user",
        status: "active",
        avatarColor: "#ccff00",
        level: 7,
        xp: 4820,
        wallet: { create: { balance: 1000, currency: "USDT", vipLevel: 3, totalWagered: 28450, totalWon: 31200 } },
      },
      include: { wallet: true },
    });
  }
  return user;
}

export async function getSessionId() {
  const u = await getSession();
  return u.id;
}

// Simple API response helpers
export function ok(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status });
}
export function err(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// Provably-fair RNG utilities — re-exported from types
export { fairFloat, serverSeedHash } from "@/lib/types";
