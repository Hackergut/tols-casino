# TOLS Casino — Professional Full-Stack Crypto Casino

**Shuffle.com clone + TOLS lime design — Provably fair, production ready**

No Base44 dependency — pure professional stack: Vite React + Express + Prisma.

## Architecture
```
tols-casino/
├── src/                 # Vite React frontend (Shuffle clone, TOLS lime #ccff00)
│   ├── api/client.js    # Professional vendor-agnostic client (fetch + JWT, no @base44/sdk)
│   ├── pages/           # Home, Admin, Affiliate/Bonus/Redeem, Packs, Wallet QR, etc.
│   ├── components/      # ShuffleBanner, GameRail, TolsGameCard, Wallet QR, etc.
│   └── lib/             # bonus, mockAdmin (demo fallback), gameEngine, provablyFair
├── server/              # Professional Express server (port 3001)
│   └── index.js         # REST CRUD for 21 entities + functions + health
├── production/          # Next.js standalone + Prisma SQLite/Postgres (alternative stack)
├── scripts/             # setup-production.sh, seed-admin.js
├── dist/                # Vite build (code-split)
└── vite.config.js       # No @base44/vite-plugin, pure Vite
```

## Quick Start (Professional)
```bash
npm install
npm run server      # Express API on :3001 (health at /api/health)
npm run dev         # Vite on :5173 (proxy /api → :3001 via VITE_API_BASE)
# or full:
npm run dev:full    # both

# Production
npm run build       # → dist/
VITE_API_BASE=/api npm run preview
# or
node server/index.js  # serves dist + API
```

## Env
Copy `.env.example` → `.env.local`:
```
VITE_API_BASE=http://localhost:3001/api
VITE_DEMO_FALLBACK=false  # true = localStorage mock when offline, false = real only
DATABASE_URL=postgresql://... # for production Prisma (optional, server currently in-memory)
```

## Why no Base44?
`src/api/base44Client.js` now re-exports `src/api/client.js` (deprecated wrapper). All 229 `base44` imports still work but resolve to the professional client. Migration is drop-in — no code change needed for callers. To fully remove, replace:
```js
import { base44 } from "@/api/base44Client" → import { tols } from "@/api/client"
```

## Deploy
- Vercel: `vercel --prod` (set VITE_API_BASE)
- Docker: `docker build -t tols . && docker run -p 3001:3001 -p 4173:4173 tols`
- Caddy: `caddy run --config Caddyfile` (serves dist + proxies /api)

