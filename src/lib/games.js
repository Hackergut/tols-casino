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
  // ── Hacksaw Gaming ──
  { id: "wanted", name: "Wanted Dead or a Wild", slug: "wanted", category: "slots", provider: "Hacksaw Gaming", playable: false, rtp: 96.38, volatility: "Alta", accent: "#c43d2a" },
  { id: "chaos-crew-2", name: "Chaos Crew 2", slug: "chaos-crew-2", category: "slots", provider: "Hacksaw Gaming", playable: false, rtp: 96.30, volatility: "Alta", accent: "#3a3a3a" },
  { id: "le-bandit", name: "Le Bandit", slug: "le-bandit", category: "slots", provider: "Hacksaw Gaming", playable: false, rtp: 96.27, volatility: "Alta", accent: "#8b1a1a" },
  { id: "stardo-mines", name: "Stardo Mines", slug: "stardo-mines", category: "slots", provider: "Hacksaw Gaming", playable: false, rtp: 96.24, volatility: "Media", accent: "#5a3a8a" },
  { id: "hoppop", name: "Hop'N'Pop", slug: "hoppop", category: "slots", provider: "Hacksaw Gaming", playable: false, rtp: 96.20, volatility: "Alta", accent: "#ff6b9d" },
  { id: "toshi-video-club", name: "Toshi Video Club", slug: "toshi-video-club", category: "slots", provider: "Hacksaw Gaming", playable: false, rtp: 96.20, volatility: "Alta", accent: "#1a8a6a" },
  // ── Pragmatic Play ──
  { id: "sweet-bonanza", name: "Sweet Bonanza", slug: "sweet-bonanza", category: "slots", provider: "Pragmatic Play", playable: false, rtp: 96.51, volatility: "Alta", accent: "#ff4fa3" },
  { id: "gates-of-olympus", name: "Gates of Olympus", slug: "gates-of-olympus", category: "slots", provider: "Pragmatic Play", playable: false, rtp: 96.50, volatility: "Alta", accent: "#d4a017" },
  { id: "dog-house", name: "The Dog House", slug: "dog-house", category: "slots", provider: "Pragmatic Play", playable: false, rtp: 96.51, volatility: "Alta", accent: "#4fa3ff" },
  { id: "big-bass-bonanza", name: "Big Bass Bonanza", slug: "big-bass-bonanza", category: "slots", provider: "Pragmatic Play", playable: false, rtp: 96.71, volatility: "Alta", accent: "#2a8a6a" },
  { id: "sugar-rush", name: "Sugar Rush", slug: "sugar-rush", category: "slots", provider: "Pragmatic Play", playable: false, rtp: 96.50, volatility: "Alta", accent: "#ff7eb3" },
  { id: "wolf-gold", name: "Wolf Gold", slug: "wolf-gold", category: "slots", provider: "Pragmatic Play", playable: false, rtp: 96.01, volatility: "Media", accent: "#8a6a3a" },
  { id: "fruit-party", name: "Fruit Party", slug: "fruit-party", category: "slots", provider: "Pragmatic Play", playable: false, rtp: 96.50, volatility: "Alta", accent: "#ff4f4f" },
  // ── NoLimit City (immagini ufficiali fan-cdn.nolimitcity.com) ──
  { id: "afk-airport-security", name: "AFK Airport Security", slug: "afk-airport-security", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.06, volatility: "Alta", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_AFK_d294ef0970.jpg", accent: "#1a1a2a" },
  { id: "soaked-by-seamen", name: "Soaked By Seamen", slug: "soaked-by-seamen", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.10, volatility: "Alta", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_Soaked_by_Seamen_3618e8672a.jpg", accent: "#1a3a5a" },
  { id: "true-grit-redemption-2", name: "True Grit Redemption 2", slug: "true-grit-redemption-2", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.08, volatility: "Estrema", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_True_Grit_Redemption_2_1_1_39a2b44575.jpg", accent: "#8a5a1a" },
  { id: "tombstone-begins", name: "Tombstone Begins", slug: "tombstone-begins", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.03, volatility: "Estrema", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_Tombstone_Begins_With_Text_546ac56c44.png", accent: "#5a3a1a" },
  { id: "san-quentin-manhunt", name: "San Quentin Manhunt", slug: "san-quentin-manhunt", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.08, volatility: "Estrema", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_San_Quentin_Manhunt_1_18dc169434.jpg", accent: "#3a3a3a" },
  { id: "punk-rocker-3", name: "Punk Rocker 3", slug: "punk-rocker-3", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.06, volatility: "Alta", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_Punk_Rocker_3_58f4112111.jpg", accent: "#ff2a5a" },
  { id: "catfish-hunters", name: "Catfish Hunters", slug: "catfish-hunters", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.06, volatility: "Alta", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_Catfish_Hunters_47ef66edfe.jpg", accent: "#3a5a3a" },
  { id: "the-crypt-2", name: "The Crypt 2", slug: "the-crypt-2", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.08, volatility: "Estrema", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_The_Crypt_2_c9798a343b.png", accent: "#2a1a3a" },
  { id: "supersized", name: "Supersized", slug: "supersized", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.10, volatility: "Alta", image: "https://fan-cdn.nolimitcity.com/small_Icon_Text_Supersized_ac779b1c58.png", accent: "#ff4f2a" },
  { id: "golden-shower", name: "Golden Shower", slug: "golden-shower", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.10, volatility: "Alta", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_Golden_Shower_With_Text_db17e088cf.png", accent: "#d4a01a" },
  { id: "duck-hunters-happy-hour", name: "Duck Hunters: Happy Hour", slug: "duck-hunters-happy-hour", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.06, volatility: "Alta", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_Duck_Hunter_Happy_Hour_3e860e5a07.png", accent: "#1a5a3a" },
  { id: "das-xboot-2wei", name: "Das xBoot 2wei!", slug: "das-xboot-2wei", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.22, volatility: "Estrema", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_Das_x_Boat2_With_Text_b16e3ef8e8.png", accent: "#1a3a4a" },
  { id: "crazy-ex-girlfriend", name: "Crazy Ex-Girlfriend", slug: "crazy-ex-girlfriend", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.06, volatility: "Alta", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_Crazy_Ex_GF_170a6daf84.png", accent: "#ff2a6a" },
  { id: "bizarre", name: "Bizarre", slug: "bizarre", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.10, volatility: "Alta", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_Bizzare_986f388490.png", accent: "#3a5a3a" },
  { id: "outsourced-2", name: "Outsourced 2 - Balkan Engineering", slug: "outsourced-2", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.10, volatility: "Alta", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_Outsourced2_With_Text_1_cdf18037a9.png", accent: "#5a3a1a" },
  { id: "duck-hunters-2", name: "Duck Hunters 2", slug: "duck-hunters-2", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.06, volatility: "Alta", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_Duck_Hunters_2_With_Text_a33f6edc9a.png", accent: "#1a5a3a" },
  { id: "ding-dong-death", name: "Ding Dong Death", slug: "ding-dong-death", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.10, volatility: "Estrema", image: "https://fan-cdn.nolimitcity.com/small_Web_Icon_Ding_Dong_Death_With_Text_cba5958536.png", accent: "#1a1a2a" },
  { id: "gator-hunters-2", name: "Gator Hunters 2", slug: "gator-hunters-2", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.06, volatility: "Alta", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_Gator_Hunters_2_With_Text_psd_f47ab9740f.png", accent: "#3a5a1a" },
  { id: "six-feet-under", name: "Six Feet Under", slug: "six-feet-under", category: "slots", provider: "NoLimit City", playable: false, rtp: 96.10, volatility: "Estrema", image: "https://fan-cdn.nolimitcity.com/small_Website_Icon_Six_Feet_Under_With_Text_a93e5aefbc.png", accent: "#2a2a1a" },
  // ── Push Gaming ──
  { id: "razor-shark", name: "Razor Shark", slug: "razor-shark", category: "slots", provider: "Push Gaming", playable: false, rtp: 96.70, volatility: "Alta", accent: "#1a4a8a" },
  { id: "razor-returns", name: "Razor Returns", slug: "razor-returns", category: "slots", provider: "Push Gaming", playable: false, rtp: 96.59, volatility: "Alta", accent: "#2a5a9a" },
  { id: "jammin-jars", name: "Jammin' Jars", slug: "jammin-jars", category: "slots", provider: "Push Gaming", playable: false, rtp: 96.83, volatility: "Alta", accent: "#8a2a6a" },
  // ── Play'n GO ──
  { id: "book-of-dead", name: "Book of Dead", slug: "book-of-dead", category: "slots", provider: "Play'n GO", playable: false, rtp: 96.21, volatility: "Alta", accent: "#c4a01a" },
  { id: "reactoonz", name: "Reactoonz", slug: "reactoonz", category: "slots", provider: "Play'n GO", playable: false, rtp: 96.51, volatility: "Alta", accent: "#4fa3c4" },
  { id: "rise-of-olympus", name: "Rise of Olympus", slug: "rise-of-olympus", category: "slots", provider: "Play'n GO", playable: false, rtp: 96.50, volatility: "Alta", accent: "#6a4ac4" },
  { id: "fire-joker", name: "Fire Joker", slug: "fire-joker", category: "slots", provider: "Play'n GO", playable: false, rtp: 96.15, volatility: "Alta", accent: "#ff6a2a" },
  // ── NetEnt ──
  { id: "starburst", name: "Starburst", slug: "starburst", category: "slots", provider: "NetEnt", playable: false, rtp: 96.09, volatility: "Bassa", accent: "#4f8aff" },
  { id: "gonzo-quest", name: "Gonzo's Quest", slug: "gonzo-quest", category: "slots", provider: "NetEnt", playable: false, rtp: 95.97, volatility: "Media", accent: "#c4a01a" },
  { id: "dead-alive-2", name: "Dead or Alive 2", slug: "dead-alive-2", category: "slots", provider: "NetEnt", playable: false, rtp: 96.82, volatility: "Alta", accent: "#8a4a1a" },
  { id: "bloodsuckers", name: "Blood Suckers", slug: "bloodsuckers", category: "slots", provider: "NetEnt", playable: false, rtp: 98.00, volatility: "Bassa", accent: "#8a1a1a" },
  // ── Big Time Gaming ──
  { id: "bonanza", name: "Bonanza Megaways", slug: "bonanza", category: "slots", provider: "Big Time Gaming", playable: false, rtp: 96.00, volatility: "Alta", accent: "#c4a01a" },
  { id: "danger-high-voltage", name: "Danger High Voltage", slug: "danger-high-voltage", category: "slots", provider: "Big Time Gaming", playable: false, rtp: 96.22, volatility: "Alta", accent: "#ff4f2a" },
  { id: "extra-chilli", name: "Extra Chilli Megaways", slug: "extra-chilli", category: "slots", provider: "Big Time Gaming", playable: false, rtp: 96.82, volatility: "Alta", accent: "#ff2a4f" },
  // ── Relax Gaming ──
  { id: "money-train", name: "Money Train 4", slug: "money-train", category: "slots", provider: "Relax Gaming", playable: false, rtp: 96.10, volatility: "Estrema", accent: "#3a1a3a" },
  { id: "temple-tumble", name: "Temple Tumble Megaways", slug: "temple-tumble", category: "slots", provider: "Relax Gaming", playable: false, rtp: 96.27, volatility: "Alta", accent: "#1a6a4a" },
  { id: "iron-bank", name: "Iron Bank", slug: "iron-bank", category: "slots", provider: "Relax Gaming", playable: false, rtp: 96.12, volatility: "Alta", accent: "#1a4a3a" },
  // ── ELK Studios ──
  { id: "sam-on-the-beach", name: "Sam on the Beach", slug: "sam-on-the-beach", category: "slots", provider: "ELK Studios", playable: false, rtp: 96.30, volatility: "Media", accent: "#1a8a6a" },
  { id: "hidden", name: "Hidden", slug: "hidden", category: "slots", provider: "ELK Studios", playable: false, rtp: 96.40, volatility: "Alta", accent: "#3a2a5a" },
  { id: "diamo-77", name: "Diamond 77", slug: "diamo-77", category: "slots", provider: "ELK Studios", playable: false, rtp: 95.00, volatility: "Alta", accent: "#2a4a8a" },
];

export const PROVIDERS = [
  "Hacksaw Gaming",
  "Pragmatic Play",
  "NoLimit City",
  "Push Gaming",
  "Play'n GO",
  "NetEnt",
  "Big Time Gaming",
  "Relax Gaming",
  "ELK Studios",
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