# Vercel setup & deployment

This document describes the steps to deploy this project to Vercel and the environment variables the app expects.

## Build settings
- Framework: Vite (static build)
- Build command: npm run build
- Output directory: dist

## Environment variables to add in Vercel (do NOT commit secrets)
- VITE_BASE44_APP_ID
- VITE_BASE44_APP_BASE_URL
- VITE_BASE44_FUNCTIONS_VERSION (optional)
- VITE_STRIPE_PK (optional)
- Any VITE_ RPC keys needed for wallet integrations

## SPA routing
Vercel needs a rewrite so that client-side routing works. `vercel.json` in this branch includes a rewrite to `index.html` for all routes.

## Preview & Production
- I recommend creating the Vercel project and enabling Preview Deployments for branches. The first deploy can be triggered from the `main` branch or this `audit/vercel-setup` branch for a preview URL.

## If you want me to create & configure the Vercel project
Provide a Vercel personal access token with `projects:write` and `env:write` scopes and the env var values you want set. I will:
1. Create the Vercel project and link it to the repo.
2. Add the env variables to the project.
3. Trigger the initial deploy and report the URL.

