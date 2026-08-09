# TOLS Design System

## Product position

TOLS is a crypto casino-style entertainment platform. The implementation is integration-ready but ships in **sandbox mode**:

- Demo originals use virtual `FUN` balances with daily responsible-play limits.
- Real-money deposits, withdrawals, and third-party slot sessions are wired but disabled until an admin explicitly enables live mode.
- Live mode should only be activated after licensing, KYC/AML, custody, fraud, payments, callback-security, and legal review.

## Brand

- **Name:** TOLS
- **Mood:** dark, neon, arcade-luxury, fast, transparent
- **Primary color:** lime `#ccff00`
- **Background:** near-black `#070707` to charcoal `#0d0d0d`
- **Secondary accents:** red for losses, blue for sandbox/demo, amber for warnings
- **Typography:** Inter for UI; Oswald/Archivo Black for display headings

## Core layout

- Desktop: left sidebar + sticky top header + content grid.
- Mobile: hamburger drawer, compact header, bottom navigation.
- Lobby uses horizontal rails for discoverability and a full all-games grid below.
- Games use a two-column layout on desktop: left playfield, right bet panel.

## Components

- `GameCard`: branded tile for originals, thumbnail tile for provider slots.
- `GameFrame`: consistent arena chrome for TOLS originals.
- `BetPanel`: shared wager controls, quick chips, manual/auto UI, profit display.
- `WalletDrawer`: deposit/withdraw/buy/tip tabs.
- Admin cards: settings, KPI grids, charts, demo monitoring.

## UX rules

- Always show clear mode labels: **DEMO**, **SANDBOX**, or **LIVE**.
- Do not imply guaranteed profit.
- Show RTP and provably-fair labels, but never present them as winning strategies.
- Destructive or high-risk actions require confirmation.
- Empty states should explain the next action.

## Accessibility

- Minimum touch target: 40px; primary CTAs: 48-56px.
- Color is not the only signal for wins/losses; use text labels too.
- Maintain visible focus states on all interactive elements.
- Keep iframe game providers sandboxed and explicitly allowlisted.

## Full-stack map

### Frontend

- React + Vite + React Router
- TanStack Query for catalog and integration mode
- Framer Motion for transitions
- Recharts for admin analytics
- Tailwind + shadcn-style UI primitives

### Backend / Base44

- Entities: wallets, bets, deposits, withdrawals, slots, tournaments, cards, affiliates, settings.
- Functions:
  - `getIntegrationMode`: sandbox/live feature gates.
  - `generateUserDepositAddresses`: per-user custodial addresses.
  - `verifyDeposit`: on-chain verification, disabled in sandbox.
  - `launchSlotGame`: provider session launcher, disabled in sandbox for real mode.
  - `syncSlotCatalog` / `syncIGamingCatalog`: provider catalog ingestion.
  - `slotTransactionCallback`: signed webhook settlement skeleton.
  - `reviewLargeWithdrawal`: manual review workflow.

## Production readiness checklist

- [ ] Legal entity and gaming license
- [ ] Terms, privacy, AML, KYC, and geoblocking review
- [ ] Payment processor and custodial wallet approval
- [ ] Provider contract and production credentials
- [ ] HMAC/webhook signing tested with provider
- [ ] Admin audit log and staff roles
- [ ] Incident response and withdrawal runbooks
- [ ] Penetration test and secret rotation
