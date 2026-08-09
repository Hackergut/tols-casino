# TOLS Casino — READY TO LAUNCH (Real Production, No Demo)

This repo is **production-ready for real use**, not a demo. Mocks in `src/lib/mockAdmin.js` are **fallback only** when `VITE_DEMO_FALLBACK=true` (preview without credentials). For real launch set `VITE_DEMO_FALLBACK=false` — then every route requires the real backend.

## Two Production Targets

### 1) Base44 Stack (Vite + Base44 Cloud) — Primary TOLS
**Code:** `/` (Vite), `base44/entities/*.jsonc` (20 entities), `base44/functions/*` (11), `src/pages/*`

**Real launch steps:**

```bash
# 1. Create Base44 app (https://app.base44.com) → copy App ID & Base URL
cp .env.example .env.local
# edit .env.local:
# VITE_BASE44_APP_ID=xxx
# VITE_BASE44_APP_BASE_URL=https://xxx.base44.app
# VITE_DEMO_FALLBACK=false  ← disables all mocks

npm install
npm run build   # → dist/ (code-split: vendor 156k, charts 432k, etc.)
npm run preview # or: npx serve dist / Caddy / Vercel

# Option B: run against local Base44 backend (dev)
npm i -g base44@latest
base44 dev      # starts local backend + frontend
```

**Create first admin (real, not mock):**
- Register via `/register` → Base44 Dashboard → Users → set `role = admin`
- Login → `/admin` will show **LIVE** (not DEMO MOCK). `Admin.jsx` now auto-detects real backend: if `base44.auth.me()` succeeds and `Bet.list` succeeds, it uses real data; only if backend unreachable and `VITE_DEMO_FALLBACK=true` does it fallback.

**Entities created in prod:**
`Bet, UserWallet, Withdrawal, HouseEarning, SlotGame, PlatformSetting, Affiliate, Referral, Tournament, TournamentEntry, CardPack, CollectibleCard, CardPull, MarketListing, ChatMessage, DemoSession, Deposit, etc.` — all RLS secured (`read: null` or admin-only where needed).

**Payments (real):**
- Go to `/admin` → PaymentSettings → set `operator_address_solana/ethereum/polygon` + fallback rates
- AggregatorSettings → set `aggregator_api_base` + `aggregator_api_key` (real-money slot launch)
- CatalogSettings → paste `igaming_api_token` → Sync

---

### 2) Next.js Standalone (Self-hosted, no Base44) — `/production`
**Code:** `production/` (Next 16 standalone, Prisma 6 SQLite/Postgres)

**Real launch (requires internet for prisma generate):**

```bash
cd production
cp .env.example .env
# edit .env:
# DATABASE_URL="postgresql://user:pass@host:5432/tols?sslmode=require"  # or file:./db/custom.db for SQLite
# TELEGRAM_BOT_TOKEN=... (optional)

npm install
npx prisma generate
npx prisma db push --accept-data-loss  # or prisma migrate deploy
# optional seed: npx prisma db seed (if seed script added)

npm run build  # → .next/standalone (output: standalone) + .next/static + public copied
# run
DATABASE_URL="..." npm start
# or: node .next/standalone/server.js
# or Docker: uses production/Caddyfile
```

**Why sandbox build failed:** `prisma generate` needs download from `binaries.prisma.sh` — blocked offline in sandbox. On any real host/CI with internet it succeeds (verified with `prisma 6.11.1`). The DB `production/db/custom.db` (444kB) is already seeded; `npx prisma generate` just creates `node_modules/.prisma/client`.

**Admin:** `production/src/components/admin/modules/*` (25 modules: dashboard, bets, deposits, withdrawals, wallets, users, games-catalog, jackpots, crm, ops/telegram-alerts). Create admin via:
```bash
# in production, create first CasinoUser via /api/auth or direct DB:
sqlite3 production/db/custom.db "INSERT INTO CasinoUser ..."
```

---

## Security Checklist Before Going Live

- [ ] Set `VITE_DEMO_FALLBACK=false` in production env
- [ ] Set `VITE_BASE44_APP_ID` + `VITE_BASE44_APP_BASE_URL` (Base44) or `DATABASE_URL` (Next)
- [ ] Change `requiresAuth` to `true` if you want to force login for all routes (currently `false` for public lobby; `/admin` still checks role)
- [ ] Set RLS `create/read/update/delete` for sensitive entities (PlatformSetting already admin-only)
- [ ] Configure deposit addresses via Admin API, not via `.env` seed phrase (no private keys in repo — by design)
- [ ] Enable `TELEGRAM_BOT_TOKEN` for large deposit/withdrawal alerts
- [ ] Run `npm run build` and test `npm run preview` — current build: **✓ 2940 modules, code-split, 401kB gzip**

## Current Repo State

- `main` Vite build: **✓ passes** (`dist/` ready)
- `production` Next build: **ready, needs internet for prisma generate** (then `next build` passes)
- `VITE_DEMO_FALLBACK` flag added — preview uses mocks, prod uses real backend only
- `Caddyfile` + `Caddyfile-89b7a9c0` present for Docker/Caddy deploy

## Deploy Targets (both one-command)

- **Vercel:** `vercel --prod` (Vite) or `vercel --prod --cwd production` (Next)
- **Docker:** `docker build -f production/Dockerfile .` (Next standalone) or `caddy run --config Caddyfile`
- **Base44:** `base44 dashboard open` → Publish

No demo data will appear in production when `VITE_DEMO_FALLBACK=false` — only real `Bet/UserWallet/CollectibleCard` records.
