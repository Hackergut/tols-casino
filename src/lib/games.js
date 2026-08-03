export const GAMES = [
  { id: "dice", name: "Dice", slug: "dice", category: "originals", playable: true, image: "https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/ebd5aec0d_IMG_1873.png", accent: "#ccff00" },
  { id: "mines", name: "Mines", slug: "mines", category: "originals", playable: true, image: "https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/b5c45462a_IMG_1869.png", accent: "#ccff00" },
  { id: "keno", name: "Keno", slug: "keno", category: "originals", playable: true, image: null, accent: "#ccff00" },
  { id: "plinko", name: "Plinko", slug: "plinko", category: "originals", playable: true, image: null, accent: "#ccff00" },
  { id: "coinflip", name: "Coinflip", slug: "coinflip", category: "originals", playable: true, image: "https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/b5c45462a_IMG_1869.png", accent: "#ccff00" },
  { id: "crash", name: "Crash Tols", slug: "crash", category: "originals", playable: true, image: "https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/10462a619_IMG_1872.png", accent: "#ccff00" },
  { id: "limbo", name: "Limbo", slug: "limbo", category: "originals", playable: true, image: null, accent: "#ccff00" },
  { id: "wheel", name: "Wheel Tols", slug: "wheel", category: "originals", playable: true, image: "https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/38f6da734_IMG_1870.png", accent: "#ccff00" },
  { id: "roulette", name: "Roulette Tols", slug: "roulette", category: "table", playable: false, image: "https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/38f6da734_IMG_1870.png", accent: "#ccff00" },
  { id: "baccarat", name: "Baccarat Tols", slug: "baccarat", category: "table", playable: false, image: "https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/6d589a05c_IMG_1871.png", accent: "#ccff00" },
];

export const CATEGORIES = [
  { id: "originals", label: "Originali", icon: "Sparkles" },
  { id: "slots", label: "Slot", icon: "Cherry" },
  { id: "live", label: "Casinò dal vivo", icon: "Video" },
  { id: "table", label: "Giochi da Tavolo", icon: "Spade" },
];

export function getGame(slug) {
  return GAMES.find((g) => g.slug === slug);
}