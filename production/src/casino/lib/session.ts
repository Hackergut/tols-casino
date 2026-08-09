import { db } from "@/lib/db";
import { headers } from "next/headers";

const DEMO_EMAIL = "demo@tols.gg";

// Gets or creates the demo session user + wallet. Returns a normalized session object.
export async function getSession() {
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
        avatarColor: "var(--color-lime)",
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

// Provably-fair RNG utilities — re-exported from types.ts (shared with client)
export { fairFloat, serverSeedHash } from "@/lib/types";
