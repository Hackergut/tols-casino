import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { fireTelegramAlert } from "@/lib/telegram";
import { ok, err } from "@/lib/session";

const RANDOM_COLORS = ["#ccff00", "#22d3ee", "#a855f7", "#f59e0b", "#ec4899", "#4ade80"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return err("Invalid request", 400);

  const username = String(body.username ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const referralCode = String(body.referralCode ?? "").trim();

  // ── Validation ──
  if (username.length < 3 || username.length > 20) return err("Username must be 3–20 characters", 400);
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return err("Username may only contain letters, numbers, and underscores", 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err("Enter a valid email address", 400);
  if (password.length < 8) return err("Password must be at least 8 characters", 400);

  // ── Uniqueness ──
  const existing = await db.casinoUser.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return err(existing.email === email ? "An account with that email already exists" : "That username is taken", 409);
  }

  const passwordHash = await hashPassword(password);
  const avatarColor = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];

  const user = await db.casinoUser.create({
    data: {
      username,
      email,
      password: passwordHash,
      role: "user",
      status: "active",
      avatarColor,
      level: 1,
      xp: 0,
      wallet: { create: { balance: 0, currency: "USDT", vipLevel: 1, totalWagered: 0, totalWon: 0 } },
    },
    include: { wallet: true },
  });

  // ── If a valid referral code was supplied, attach the referral ──
  if (referralCode) {
    const affiliate = await db.affiliate.findUnique({ where: { referralCode } });
    if (affiliate) {
      await db.referral.create({
        data: { affiliateId: affiliate.id, playerAlias: username, status: "active" },
      });
      await db.affiliate.update({
        where: { id: affiliate.id },
        data: { totalReferrals: { increment: 1 } },
      });
    }
  }

  await createSession(user.id);

  // ── Telegram: new registration ──
  fireTelegramAlert({
    event: "registration",
    title: "🆕 New registration",
    message: `User: ${username}\nEmail: ${email}${referralCode ? `\nReferral: ${referralCode}` : ""}\nTime: ${new Date().toISOString()}`,
  });

  return ok({
    id: user.id,
    username: user.username,
    email: user.email,
    avatarColor: user.avatarColor,
    level: user.level,
    balance: user.wallet?.balance ?? 0,
    currency: user.wallet?.currency ?? "USDT",
    vipLevel: user.wallet?.vipLevel ?? 1,
  });
}
