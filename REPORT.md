# Private Audit Report — tols-casino

> Branch: audit/vercel-setup

## Executive summary

This repository is a Vite + React frontend intended to run as a static Single Page App (SPA) and integrate with the Base44 backend platform, Stripe, and on-chain wallets (Ethers / Solana). It's ready to be hosted on Vercel after environment variables are configured. This report lists findings, required env vars, deploy steps, and recommended follow-ups.

## Quick readiness checklist

- [x] Builds locally with `npm run build` (Vite)
- [x] Entry point: `src/main.jsx` -> `src/App.jsx`
- [x] Uses `@base44/vite-plugin` and `import.meta.env` VITE_ variables for runtime config
- [ ] Env vars must be configured in Vercel (see section below)
- [ ] Verify any client-only secret usage (do not expose server secrets)
- [ ] Confirm licensing and regulatory constraints for gambling content before public deploy

## Required environment variables (observed in code)

These keys are referenced by code or by the README. I scanned `src/` for `import.meta.env.VITE_` usage and found the following direct references:

- VITE_BASE44_APP_ID — referenced in `src/lib/app-params.js` (used to identify Base44 app)
- VITE_BASE44_APP_BASE_URL — referenced in `src/lib/app-params.js` (Base44 backend base URL)
- VITE_BASE44_FUNCTIONS_VERSION — referenced in `src/lib/app-params.js`

Other likely env vars (used by third-party SDKs in runtime or expected by README):

- VITE_STRIPE_PK — Stripe publishable key (frontend)
- VITE_RPC_URL_* or VITE_SOLANA_RPC — RPC endpoints for blockchain integrations (if used)

I will include placeholders in the Vercel setup. If you want me to create the Vercel project and provision these env vars, provide the values for the keys above.

## Security & compliance notes

- Client-side environment variables must be VITE_ prefixed only for non-secret public values (e.g. publishable keys). Do NOT store server-side secrets or private keys in Vercel's front-end env vars.
- This project appears to be a gambling/casino UI. Confirm local legal/regulatory compliance and payment handling rules for any target markets.
- Review third-party SDK usage (Stripe, Solana/Ethers) for CSP and integrity requirements.

## Bundle & performance notes

- Large deps observed: three, framer-motion, ethers, @stripe packages, @radix-ui libraries. Analyze with `vite build --watch` or use `@rollup/plugin-visualizer` to inspect bundle splits before public release.
- Consider code-splitting heavy routes (GamePlay, Admin) to reduce initial load.

## Files & representative code notes

- `src/main.jsx` — app entry
- `src/App.jsx` — routes, providers, Auth flow. Key auth redirects and loading handling live here.
- `src/lib/app-params.js` — central point reading `import.meta.env.VITE_*` variables; defines keys that must be set.
- `src/components/WalletProvider.jsx` — wallet integration (review for on-chain RPC keys & user flows)
- `index.html` — Vite entry HTML (meta, title, base)

## Recommended immediate changes (priority order)

1. Add `vercel.json` with static-build config and SPA rewrite.
2. Add `VERCEL_SETUP.md` with exact env vars to set in Vercel and the minimal CI/deploy checklist.
3. Add a GitHub secret-less place to list which env var names are required (REPORT.md already lists them) but do NOT commit any secret values.
4. Optional: Add an experiment branch that splits heavy libs and measures Lighthouse scores.
5. (If desired) I can create the Vercel project, link this repo, set env vars, and trigger an initial deploy.

## Vercel deploy checklist (what I will do if you provide Vercel token)

- Create a new Vercel project named `tols-casino` and connect it to `Hackergut/tols-casino` GitHub repo.
- Set project framework: `Other (Static)` or let Vercel auto-detect (Vite).
- Build command: `npm run build` (or leave default)
- Output directory: `dist`
- Environment variables to set (values you provide):
  - VITE_BASE44_APP_ID
  - VITE_BASE44_APP_BASE_URL
  - VITE_BASE44_FUNCTIONS_VERSION (optional)
  - VITE_STRIPE_PK (optional)
  - Any other VITE_ keys you want
- Trigger first deployment on `main` branch or your preferred branch. For now I will point project to this repo and allow preview deploys from branches.

## How to provide credentials (sensitive)

If you want me to create the Vercel project and set env vars, provide a Vercel personal access token with `projects:write` and `env:write` scopes. Paste it here (private). Alternatively, you can invite my GitHub account as a Vercel collaborator (or provide a user-specific link) and I will proceed — but an access token is the fastest.

IMPORTANT: sharing tokens in a public chat is sensitive. This chat will be stored in the conversation; ensure you are comfortable pasting the token here or instead paste it into a temporary secret-sharing tool and provide the link.

## Next steps I will take now (unless you ask me to wait)

1. Add `REPORT.md` (this file) to branch `audit/vercel-setup` (done here via the commit).
2. Add `vercel.json` and `VERCEL_SETUP.md` to the branch with placeholder env var names.
3. Open a draft PR (I will create a branch and commit; please review before merge).
4. If you provide a Vercel token and env var values, I will create the Vercel project and set env vars, then trigger the first deployment and report back the deployment URL.

If you want me to proceed with creating the Vercel project and deploying, reply with:

- Vercel personal access token (sensitive), and
- Values for the env vars you want set (VITE_BASE44_APP_ID, VITE_BASE44_APP_BASE_URL, optionally VITE_STRIPE_PK, VITE_BASE44_FUNCTIONS_VERSION).

If you prefer not to share tokens, I will leave the branch with the PR and instructions so you can create the Vercel project yourself.
