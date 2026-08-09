// Real TOLS provably-fair games (originals + table). Slot catalog comes from the
// synced SlotGame DB entity — not hardcoded here.
export const GAMES = [
  // Shuffle-clone Originals (provably fair)
  { id: "dice", name: "Dice", slug: "dice", category: "originals", playable: true, accent: "#ccff00" },
  { id: "mines", name: "Mines", slug: "mines", category: "originals", playable: true, accent: "#ff4f6a" },
  { id: "keno", name: "Keno", slug: "keno", category: "originals", playable: true, accent: "#4f8aff" },
  { id: "limbo", name: "Limbo", slug: "limbo", category: "originals", playable: true, accent: "#4fa3ff" },
  { id: "plinko", name: "Plinko", slug: "plinko", category: "originals", playable: true, accent: "#ff8a4f" },
  { id: "crash", name: "Crash", slug: "crash", category: "originals", playable: true, accent: "#ff4f2a" },
  { id: "coinflip", name: "Coinflip", slug: "coinflip", category: "originals", playable: true, accent: "#ccff00" },
  { id: "wheel", name: "Wheel", slug: "wheel", category: "originals", playable: true, accent: "#b04fff" },
  { id: "blackjack", name: "Blackjack", slug: "blackjack", category: "originals", playable: true, accent: "#1a1a1a" },
  { id: "slide", name: "Slide", slug: "slide", category: "originals", playable: true, accent: "#00e701" },
  { id: "blitz", name: "Blitz", slug: "blitz", category: "originals", playable: true, accent: "#ff9500" },
  { id: "hilo", name: "Hilo", slug: "hilo", category: "originals", playable: true, accent: "#a855f7" },
  { id: "tower", name: "Tower", slug: "tower", category: "originals", playable: true, accent: "#ef4444" },
  { id: "chicken", name: "Chicken", slug: "chicken", category: "originals", playable: true, accent: "#f97316" },
  { id: "baccarat", name: "Baccarat", slug: "baccarat", category: "table", playable: true, accent: "#ccff00" },
  { id: "roulette", name: "Roulette", slug: "roulette", category: "table", playable: true, accent: "#ff4f6a" },
];

export const CATEGORIES = [
  { id: "originals", label: "Originals", icon: "Sparkles" },
  { id: "slots", label: "Slots", icon: "Cherry" },
  { id: "live", label: "Live Casino", icon: "Radio" },
  { id: "table", label: "Table Games", icon: "Spade" },
  { id: "game-shows", label: "Game Shows", icon: "Tv" },
  { id: "instant", label: "Instant Games", icon: "Zap" },
];

export function getGame(slug) {
  return GAMES.find((g) => g.slug === slug);
}