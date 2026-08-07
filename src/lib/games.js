// Real TOLS provably-fair games (originals + table). Slot catalog comes from the
// synced SlotGame DB entity — not hardcoded here.
export const GAMES = [
  { id: "dice", name: "Dice", slug: "dice", category: "originals", playable: true, accent: "#ccff00" },
  { id: "mines", name: "Mines", slug: "mines", category: "originals", playable: true, accent: "#ff4f6a" },
  { id: "keno", name: "Keno", slug: "keno", category: "originals", playable: true, accent: "#4f8aff" },
  { id: "plinko", name: "Plinko", slug: "plinko", category: "originals", playable: true, accent: "#ff8a4f" },
  { id: "coinflip", name: "Coinflip", slug: "coinflip", category: "originals", playable: true, accent: "#ccff00" },
  { id: "crash", name: "Crash Tols", slug: "crash", category: "originals", playable: true, accent: "#ff4f2a" },
  { id: "limbo", name: "Limbo", slug: "limbo", category: "originals", playable: true, accent: "#4fa3ff" },
  { id: "wheel", name: "Wheel Tols", slug: "wheel", category: "originals", playable: true, accent: "#b04fff" },
  { id: "roulette", name: "Roulette Tols", slug: "roulette", category: "table", playable: true, accent: "#ff4f6a" },
  { id: "baccarat", name: "Baccarat Tols", slug: "baccarat", category: "table", playable: true, accent: "#ccff00" },
  { id: "neon-vault", name: "Neon Vault", slug: "neon-vault", category: "originals", playable: true, accent: "#b04fff" },
];

export const CATEGORIES = [
  { id: "originals", label: "Originals", icon: "Sparkles" },
  { id: "slots", label: "Slots", icon: "Cherry" },
  { id: "table", label: "Table Games", icon: "Spade" },
];

export function getGame(slug) {
  return GAMES.find((g) => g.slug === slug);
}