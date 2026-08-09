// Seed first admin: node scripts/seed-admin.js admin@tols.local
import { createClient } from '@base44/sdk';
const appId = process.env.VITE_BASE44_APP_ID;
const token = process.env.BASE44_SERVICE_TOKEN; // service role token
if (!appId || !token) { console.error("Set VITE_BASE44_APP_ID and BASE44_SERVICE_TOKEN"); process.exit(1); }
const base44 = createClient({ appId, token, requiresAuth: true });
const email = process.argv[2] || "admin@tols.local";
const user = await base44.entities.User.filter({ email });
if (user.length) { await base44.entities.User.update(user[0].id, { role: "admin" }); console.log("Promoted", email); }
else console.log("User not found, register first at /register with", email);
