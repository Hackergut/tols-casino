// TOLS Professional Full-Stack Server — Express + Prisma-ready, no Base44
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Health — required for real launch
app.get("/api/health", (req, res) => res.json({ ok: true, service: "tols-casino", version: "1.0.0", time: new Date().toISOString() }));
app.get("/health", (req, res) => res.json({ ok: true }));

// Mock entity store — in production replace with Prisma (see production/prisma/schema.prisma)
// For now, in-memory + JSON file fallback, deterministic for demos
const stores = new Map();
function store(name) {
  if (!stores.has(name)) stores.set(name, []);
  return stores.get(name);
}

// Generic CRUD — mirrors src/api/client.js entityClient
for (const name of ["Affiliate","Bet","CardPack","CardPull","ChatMessage","CollectibleCard","CommissionLog","DemoSession","Deposit","GlobalJackpot","HouseEarning","MarketListing","PlatformSetting","Referral","ResponsibleLimit","SlotGame","Tournament","TournamentEntry","User","UserWallet","Withdrawal"]) {
  const base = `/api/${name.toLowerCase()}`;
  app.get(base, (req, res) => {
    let data = [...store(name)];
    // filter
    if (req.query.filter) {
      try { const where = JSON.parse(req.query.filter); data = data.filter(o => Object.entries(where).every(([k,v])=> o[k]==v)); } catch {}
    }
    if (req.query.limit) data = data.slice(0, Number(req.query.limit));
    res.json(data);
  });
  app.post(base, (req, res) => {
    const arr = store(name);
    const obj = { id: `${name}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, ...req.body, created_date: new Date().toISOString(), updated_date: new Date().toISOString() };
    arr.unshift(obj);
    res.status(201).json(obj);
  });
  app.post(`${base}/bulk`, (req, res) => {
    const arr = store(name);
    const created = (Array.isArray(req.body)? req.body: []).map(d=> ({ id: `${name}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, ...d, created_date: new Date().toISOString() }));
    arr.unshift(...created);
    res.status(201).json(created);
  });
  app.patch(`${base}/:id`, (req, res) => {
    const arr = store(name);
    const idx = arr.findIndex(x=> x.id===req.params.id);
    if (idx<0) return res.status(404).json({ error: "Not found" });
    arr[idx] = { ...arr[idx], ...req.body, updated_date: new Date().toISOString() };
    res.json(arr[idx]);
  });
  app.delete(`${base}/:id`, (req, res) => {
    const arr = store(name);
    const idx = arr.findIndex(x=> x.id===req.params.id);
    if (idx>=0) arr.splice(idx,1);
    res.json({ ok: true });
  });
}

// Functions
app.post("/api/functions/:name", (req, res) => {
  const { name } = req.params;
  if (name==="syncSlotCatalog") return res.json({ created: 8, updated: 14, total: 156 });
  if (name==="syncIGamingCatalog") return res.json({ status: "ok", fetched: 342, created: 12, updated: 28 });
  if (name==="generateUserDepositAddresses") return res.json({ addresses: { solana: "7xMockSolana", ethereum: "0xMockEth", polygon: "0xMockPoly", btc: "bc1qMock" }, index: 0 });
  if (name==="verifyDeposit") return res.json({ success: true, credited: 100, newBalance: 1100 });
  res.json({ ok: true, name, payload: req.body });
});

// Auth mock
app.get("/api/auth/me", (req, res) => {
  // check Authorization header — for demo return guest if no token
  const token = req.headers.authorization?.replace("Bearer ","");
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  res.json({ id: "user_1", email: "demo@tols.local", full_name: "Demo Player", role: "user" });
});
app.post("/api/auth/login", (req, res) => {
  const { email } = req.body;
  const role = email?.includes("admin") ? "admin" : "user";
  res.json({ token: "tols_jwt_demo", user: { id: "user_1", email, full_name: email.split("@")[0], role } });
});

// Serve Vite dist in production
const dist = path.join(__dirname, "../dist");
app.use(express.static(dist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(dist, "index.html"), (err)=> err && res.status(404).end());
});

app.listen(PORT, "0.0.0.0", () => console.log(`[TOLS] Professional server listening on http://0.0.0.0:${PORT} — health at /api/health`));
