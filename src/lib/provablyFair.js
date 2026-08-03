// Provably fair engine (client-side demo implementation)
// Real production: server seed held server-side, only hash revealed pre-bet.

export function randomSeed(len = 32) {
  const chars = "abcdef0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function sha256Hex(message) {
  const buf = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// HMAC-based RNG: returns float in [0, 1) from a seed/nonce combo
export async function rngFloat(serverSeed, clientSeed, nonce) {
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(serverSeed),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    new TextEncoder().encode(`${clientSeed}:${nonce}`)
  );
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  // take first 8 hex chars -> 32-bit int -> /2^32
  const int = parseInt(hex.slice(0, 8), 16);
  return int / 0x100000000;
}

// House edge applied. multiplier for a target probability p (0<p<1)
export function multiplierForProbability(p, houseEdge = 0.01) {
  return (1 - houseEdge) / p;
}

export function verifyRoll(serverSeed, clientSeed, nonce, roll) {
  // stub for the verification panel
  return true;
}