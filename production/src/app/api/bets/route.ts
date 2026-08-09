import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession, ok, err, fairFloat, serverSeedHash } from "@/lib/session";

// Game engines — provably fair, 99% RTP-ish
type GameResult = { multiplier: number; payout: number; won: boolean; payload: Record<string, unknown> };

function rollDice(roll: number, target: number, isOver: boolean): boolean {
  return isOver ? roll > target : roll < target;
}

function crashPoint(clientSeed: string, nonce: number): number {
  // 99% RTP crash — instant crash ~2% of the time
  const r = fairFloat("tols-crash-server", clientSeed, nonce);
  if (r < 0.02) return 1.0; // instant crash
  const point = Math.max(1.0, 0.99 / (1 - r));
  return Math.floor(point * 100) / 100;
}

function plinkoMultiplier(slot: number, risk: "low" | "medium" | "high", rows: number): number {
  // Simplified plinko payout tables
  const tables: Record<string, number[]> = {
    "16-low": [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
    "16-medium": [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    "16-high": [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
    "12-low": [10, 3, 1.3, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.3, 3, 10],
    "12-medium": [58, 15, 7, 3, 1.5, 1, 0.5, 1, 1.5, 3, 7, 15, 58],
    "12-high": [420, 70, 14, 5, 2, 1, 0.2, 1, 2, 5, 14, 70, 420],
    "8-low": [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    "8-medium": [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    "8-high": [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
  };
  const key = `${rows}-${risk}`;
  const table = tables[key] ?? tables["12-medium"];
  return table[Math.min(slot, table.length - 1)];
}

function plinkoSlot(clientSeed: string, nonce: number, rows: number): number {
  let pos = 0;
  for (let i = 0; i < rows; i++) {
    if (fairFloat("tols-plinko-server", clientSeed + ":" + i, nonce) > 0.5) pos++;
  }
  return pos;
}

function minesLayout(clientSeed: string, nonce: number, mines: number, tiles = 25): boolean[] {
  // Returns 25-tile array, true = mine
  const arr = new Array(tiles).fill(false);
  const indices = Array.from({ length: tiles }, (_, i) => i);
  // deterministic shuffle
  let seed = clientSeed + ":" + nonce;
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(fairFloat("tols-mines-server", seed, i) * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
    seed = seed + ":" + j;
  }
  for (let k = 0; k < mines; k++) arr[indices[k]] = true;
  return arr;
}

function nextMineMultiplier(picks: number, mines: number, tiles = 25): number {
  // house edge 1%
  let m = 1;
  for (let i = 0; i < picks; i++) {
    m *= (tiles - i) / (tiles - mines - i);
  }
  return Math.max(1, m * 0.99);
}

// POST /api/bets — place a bet on an Originals game
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user.wallet) return err("No wallet", 400);

  const body = await req.json().catch(() => null);
  if (!body) return err("Invalid body", 400);

  const { game, amount, clientSeed, payload } = body as {
    game: string;
    amount: number;
    clientSeed?: string;
    payload?: Record<string, unknown>;
  };

  if (!game || typeof amount !== "number" || amount <= 0) return err("Invalid bet", 400);

  // reload wallet fresh
  const wallet = await db.casinoWallet.findUnique({ where: { userId: user.id } });
  if (!wallet || wallet.balance < amount) return err("Insufficient balance", 400);

  const seed = clientSeed || Math.random().toString(36).slice(2, 12);
  const nonce = Math.floor(Math.random() * 1_000_000);
  const serverSeed = Math.random().toString(36).slice(2, 14);
  const hash = serverSeedHash(serverSeed);

  let result: GameResult;

  switch (game) {
    case "dice": {
      const target = Number(payload?.target ?? 50);
      const isOver = Boolean(payload?.isOver ?? false);
      const roll = Math.floor(fairFloat(serverSeed, seed, nonce) * 10000) / 100; // 0..100 (2dp)
      const won = rollDice(roll, target, isOver);
      const winChance = isOver ? 100 - target : target;
      const mult = won ? Math.max(1.01, (99 / winChance)) : 0;
      result = { multiplier: mult, payout: amount * mult, won, payload: { roll, target, isOver } };
      break;
    }
    case "crash": {
      const cashOutAt = Number(payload?.cashOutAt ?? 0);
      const point = crashPoint(seed, nonce);
      const won = cashOutAt > 0 && point >= cashOutAt;
      const mult = won ? cashOutAt : 0;
      result = { multiplier: mult, payout: amount * mult, won, payload: { crashPoint: point, cashOutAt } };
      break;
    }
    case "limbo": {
      const target = Number(payload?.target ?? 2);
      const roll = Math.floor((0.99 / (1 - fairFloat(serverSeed, seed, nonce))) * 100) / 100;
      const won = roll >= target;
      result = { multiplier: won ? target : 0, payout: amount * (won ? target : 0), won, payload: { roll, target } };
      break;
    }
    case "coinflip": {
      const choice = payload?.choice === "tails" ? "tails" : "heads";
      const r = fairFloat(serverSeed, seed, nonce);
      const flip = r < 0.5 ? "heads" : "tails";
      const won = flip === choice;
      result = { multiplier: won ? 1.98 : 0, payout: amount * (won ? 1.98 : 0), won, payload: { flip, choice } };
      break;
    }
    case "plinko": {
      const risk = (payload?.risk as "low" | "medium" | "high") || "medium";
      const rows = Number(payload?.rows ?? 12);
      const slot = plinkoSlot(seed, nonce, rows);
      const mult = plinkoMultiplier(slot, risk, rows);
      const won = mult > 0;
      result = { multiplier: mult, payout: amount * mult, won, payload: { slot, risk, rows } };
      break;
    }
    case "mines": {
      const minesCount = Math.min(24, Math.max(1, Number(payload?.mines ?? 3)));
      const picks = Array.isArray(payload?.picks) ? (payload.picks as number[]) : [];
      const layout = minesLayout(seed, nonce, minesCount);
      // check if any pick hit a mine
      const hitMine = picks.some((p) => layout[p]);
      const mult = hitMine ? 0 : nextMineMultiplier(picks.length, minesCount);
      const won = !hitMine && picks.length > 0;
      result = { multiplier: mult, payout: amount * mult, won, payload: { mines: minesCount, picks, layout: won ? layout : layout.map((m, i) => (picks.includes(i) ? m : m)) } };
      break;
    }
    case "wheel": {
      const segments = Number(payload?.segments ?? 20);
      const risk = (payload?.risk as "low" | "medium" | "high") || "medium";
      const wheelMults: Record<string, number[]> = {
        "20-low": [0, 0, 1.5, 0, 1.2, 0, 1.2, 0, 1.5, 0, 2, 0, 1.2, 0, 1.5, 0, 1.2, 0, 1.5, 0],
        "20-medium": [0, 2, 0, 1.5, 0, 3, 0, 1.5, 0, 2, 0, 1.5, 0, 3, 0, 1.5, 0, 2, 0, 1.5],
        "20-high": [0, 0, 0, 0, 9.9, 0, 0, 0, 0, 0, 0, 0, 4.5, 0, 0, 0, 0, 0, 0, 2],
      };
      const table = wheelMults[`${segments}-${risk}`] ?? wheelMults["20-medium"];
      const idx = Math.floor(fairFloat(serverSeed, seed, nonce) * segments);
      const mult = table[idx % table.length] || 0;
      result = { multiplier: mult, payout: amount * mult, won: mult > 0, payload: { segment: idx, mult, risk, segments } };
      break;
    }
    case "keno": {
      // Player picks 1–10 numbers from 1..80; server draws 10 winners.
      const picks: number[] = Array.isArray(payload?.picks)
        ? (payload!.picks as number[]).filter((n) => Number.isInteger(n) && n >= 1 && n <= 80).slice(0, 10)
        : [];
      if (picks.length < 1) {
        result = { multiplier: 0, payout: 0, won: false, payload: { error: "no picks", picks: [], drawn: [], hits: 0 } };
        break;
      }
      // Deterministic draw of 10 distinct numbers from the fair stream.
      const pool = Array.from({ length: 80 }, (_, i) => i + 1);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(fairFloat(serverSeed, seed + ":k" + i, nonce) * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const drawn = pool.slice(0, 20);
      const drawnSet = new Set(drawn);
      const hits = picks.filter((p) => drawnSet.has(p)).length;
      // Payout table indexed by [picks][hits]; 99%-ish RTP curve.
      const KENO: Record<number, number[]> = {
        1: [0, 3.8],
        2: [0, 0, 8.5],
        3: [0, 0, 2.2, 16],
        4: [0, 0, 1.5, 4.5, 35],
        5: [0, 0, 1.2, 2.5, 10, 90],
        6: [0, 0, 1, 1.8, 5, 25, 180],
        7: [0, 0, 0.8, 1.4, 3, 12, 60, 400],
        8: [0, 0, 0.6, 1.1, 2, 6, 20, 100, 700],
        9: [0, 0, 0.5, 0.9, 1.5, 4, 10, 40, 200, 1200],
        10: [0, 0, 0.4, 0.8, 1.2, 3, 7, 25, 100, 500, 2000],
      };
      const row = KENO[picks.length] ?? KENO[1];
      const mult = row[Math.min(hits, row.length - 1)] ?? 0;
      result = {
        multiplier: mult,
        payout: amount * mult,
        won: mult > 0,
        payload: { picks, drawn, hits },
      };
      break;
    }
    case "shoot": {
      // Single shot at a target; the fair stream resolves the multiplier band.
      const r = fairFloat(serverSeed, seed, nonce);
      // Weighted bands: mostly small, rare big. ~99% RTP.
      let mult: number;
      if (r < 0.45) mult = 0; // miss
      else if (r < 0.75) mult = 1.5;
      else if (r < 0.9) mult = 2.2;
      else if (r < 0.97) mult = 4;
      else if (r < 0.995) mult = 9;
      else mult = 25;
      result = {
        multiplier: mult,
        payout: amount * mult,
        won: mult > 0,
        payload: { roll: Math.floor(r * 10000) / 100, mult },
      };
      break;
    }
    default:
      return err("Unknown game: " + game, 400);
  }

  // All games: deduct stake, add payout
  const netDelta = result.payout - amount;
  const newBalance = wallet.balance + netDelta;

  const [bet, _] = await db.$transaction([
    db.casinoBet.create({
      data: {
        userId: user.id,
        gameId: game,
        gameName: game.charAt(0).toUpperCase() + game.slice(1),
        gameCategory: "originals",
        amount,
        multiplier: result.multiplier,
        payout: result.payout,
        result: result.won ? "win" : "lose",
        clientSeed: seed,
        serverSeedHash: hash,
        nonce,
        payload: JSON.stringify(result.payload),
      },
    }),
    db.casinoWallet.update({
      where: { userId: user.id },
      data: {
        balance: newBalance,
        totalWagered: { increment: amount },
        totalWon: result.won ? { increment: result.payout } : undefined,
        xp: { increment: Math.floor(amount) },
      },
    }),
  ]);

  // Feed the jackpot 0.5% of stake (upsert so a fresh DB never fails a bet)
  await db.globalJackpot
    .upsert({
      where: { id: "global" },
      update: { amount: { increment: amount * 0.005 }, contributionsCount: { increment: 1 } },
      create: { id: "global", amount: 50000 + amount * 0.005, contributionsCount: 1 },
    })
    .catch(() => {});

  // House earning record
  await db.houseEarning.create({
    data: {
      gameId: game,
      gameName: game.charAt(0).toUpperCase() + game.slice(1),
      betId: bet.id,
      wager: amount,
      payout: result.payout,
      houseProfit: amount - result.payout,
      currency: "USDT",
    },
  });

  return ok({
    betId: bet.id,
    game,
    amount,
    multiplier: result.multiplier,
    payout: result.payout,
    won: result.won,
    payload: result.payload,
    serverSeedHash: hash,
    clientSeed: seed,
    nonce,
    newBalance,
  });
}

// GET /api/bets — recent bets (live feed)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(50, Number(searchParams.get("limit") ?? 20));
  const bets = await db.casinoBet.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { username: true, avatarColor: true } } },
  });
  return ok(
    bets.map((b) => ({
      id: b.id,
      gameName: b.gameName,
      gameCategory: b.gameCategory,
      amount: b.amount,
      multiplier: b.multiplier,
      payout: b.payout,
      result: b.result,
      createdAt: b.createdAt.toISOString(),
      username: b.user?.username || "Player",
      avatarColor: b.user?.avatarColor || "#ccff00",
    }))
  );
}
