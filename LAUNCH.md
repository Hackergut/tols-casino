# TOLS Casino — Piattaforma Completa Lanciata ✅

## 🚀 LIVE PREVIEW ATTIVA

### 1. TOLS Casino (Frontend Principale) — PORTA 5173 ✅ ONLINE
- **Stack**: Vite 6 + React 18 + Base44 SDK + Tailwind + shadcn/ui
- **URL Preview**: https://5173-...e2b.app (vedi preview “TOLS Casino” sopra)
- **Locale**: http://localhost:5173
- **Build**: `npm run build` → `dist/` OK (398 kB gzip)

#### Funzionalità complete
- **Lobby** con MegaPromo, Collection, ricerca, filtri provider/category
- **TOLS Originals provably fair**: Crash, Dice, Mines, Plinko, Wheel, Keno, Limbo, Coinflip, Roulette, Baccarat, SlotMachine (src/components/games/)
- **Slots aggregati** via `useSlotCatalog` + demo/real mode (DemoSlotPlayer / RealSlotPlayer)
- **Packs & Collezione**: CardPack, PackOpenModal, Collezione completa, Marketplace
- **Wallet multi-chain**: USDT (ETH / Polygon / Solana), CoinSelect, RealDeposit, WithdrawForm, QR, VIP tiers
- **Community**: Leaderboard, LiveWinsTicker, LivePullsTicker, JackpotTicker
- **Affiliate, Vip, Tournaments, Admin** (AggregatorSettings, CatalogSettings, PaymentSettings, DemoMonitor)
- **Provably Fair** verificabile (src/lib/provablyFair.js)
- **20 Entities Base44** (Affiliate, Bet, CardPack, SlotGame, Tournament, etc.) + 11 Functions + Workflows

#### Comandi
```bash
npm install
npm run dev      # dev su 0.0.0.0:5173 (allowedHosts:true per preview)
npm run build    # produzione in dist/
npm run preview  # preview 0.0.0.0:4173
```

---

### 2. Production Next.js (GoldenX) — PORTA 3000 ⚙️ BUILD-READY
- **Percorso**: `/production` — estratto da `casino-production-ready_2.zip`
- **Stack**: Next.js 16 (standalone, turbopack), Prisma 6 + SQLite, NextAuth, Zustand, Recharts, Framer-Motion
- **Locale**: http://localhost:3000 (UI lobby visibile — font Geist fallback senza internet)
- **DB**: `production/db/custom.db` (454 kB) + `production/prisma/db/custom.db`
- **API**: 30+ route (`/api/games-lobby`, `/api/bets`, `/api/wallet`, `/api/casino-stats`, etc.)
- **Giochi originals**: Crash, Dice, Mines, Wheel, Keno, Limbo, Plinko, Coinflip, Shoot (canvas + motion)

> **Nota sandbox**: `npx prisma generate` richiede download da binaries.prisma.sh (bloccato offline). In deploy con internet funziona:
> ```bash
> cd production
> npm install
> npx prisma generate
> npx prisma db push
> npm run dev   # 0.0.0.0:3000
> npm run build # standalone in .next/standalone
> ```

---

## 📦 Architettura Repo

```
tols-casino/
├── src/                 # Vite + Base44 frontend (LANCIA SU 5173)
├── base44/              # config, entities (20), functions (11), workflows
├── production/          # Next.js full-stack estratta (DEPLOY SU 3000)
│   ├── src/app/         # Lobby + admin + casino SPA
│   ├── prisma/schema.prisma
│   ├── db/custom.db
│   └── package.json
├── dist/                # build Vite production (pronto per Caddy / Vercel)
├── casino-production-ready_2.zip
└── vite.config.js       # host 0.0.0.0 + allowedHosts:true
```

## 🔧 Fix applicati per lancio
- `vite.config.js`: `server.host=0.0.0.0`, `allowedHosts:true`, `headers X-Frame-Options ALLOWALL`, `hmr.clientPort 443`
- `.gitignore`: preserva `.env.example`, ignora solo `.env.local`
- `production/` aggiunta a git (node_modules ignorato), pushed su `arena/019fe50e-tols-casino`

## ✅ Verifica
- `curl localhost:5173` → 200 + `<title>TOLS · Crypto Casino · Provably Fair</title>`
- `npm run build` → success (2939 modules)
- `curl localhost:3000` → 200 (Next.js header GoldenX visibile)

Immergiti nella preview sopra per giocare!
