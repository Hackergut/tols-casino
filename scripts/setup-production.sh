#!/usr/bin/env bash
set -euo pipefail
echo "== TOLS Production Setup =="
if [ ! -f .env.local ] && [ ! -f .env ]; then echo "Missing .env.local — copy from .env.example"; exit 1; fi
echo "1. Installing deps..."
npm install
if [ -d production ]; then
  echo "2. Production Next deps..."
  (cd production && npm install)
  echo "3. Prisma generate..."
  (cd production && npx prisma generate)
  echo "4. DB push..."
  (cd production && npx prisma db push --accept-data-loss)
fi
echo "5. Build Vite..."
npm run build
echo "✅ Ready to launch: npm run preview (Vite) or base44 dev"
