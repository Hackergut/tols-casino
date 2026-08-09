import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser, Unauthorized } from "@/lib/auth";
import { ok, err } from "@/lib/session";
import { fireTelegramAlert } from "@/lib/telegram";
import { CHAINS } from "@/lib/chains";

// POST /api/deposits/confirm — confirm a pending deposit and credit the wallet.
// Admin-only. In a full setup this is called by an on-chain watcher once the
// configured number of confirmations is reached; here an operator confirms a
// verified payment. Crediting is idempotent (guarded by `credited`).
export async function POST(req: NextRequest) {
  let admin;
  try {
    admin = await requireUser();
  } catch (e) {
    if (e instanceof Unauthorized) return err("Not authenticated", 401);
    throw e;
  }
  if (admin.role !== "admin") return err("Admin only", 403);

  const body = await req.json().catch(() => null);
  if (!body?.depositId) return err("depositId required", 400);
  const txHash = String(body.txHash ?? "").trim();

  const deposit = await db.casinoDeposit.findUnique({ where: { id: String(body.depositId) } });
  if (!deposit) return err("Deposit not found", 404);
  if (deposit.credited) return err("Deposit already credited", 409);

  // Credit + mark confirmed atomically.
  const [, wallet] = await db.$transaction([
    db.casinoDeposit.update({
      where: { id: deposit.id },
      data: { status: "confirmed", credited: true, txHash: txHash || deposit.txHash },
    }),
    db.casinoWallet.update({
      where: { userId: deposit.userId },
      data: { balance: { increment: deposit.amount } },
    }),
  ]);

  const player = await db.casinoUser.findUnique({ where: { id: deposit.userId } });

  fireTelegramAlert({
    event: "deposit",
    title: "✅ Deposit confirmed",
    message:
      `User: ${player?.username ?? deposit.userId}\n` +
      `Chain: ${CHAINS[deposit.chain]?.name ?? deposit.chain}\n` +
      `Amount: ${deposit.amount} ${deposit.currency}\n` +
      `New balance: ${wallet.balance} ${wallet.currency}\n` +
      (txHash ? `Tx: ${txHash}` : ""),
  });

  return ok({ id: deposit.id, credited: true, newBalance: wallet.balance });
}
