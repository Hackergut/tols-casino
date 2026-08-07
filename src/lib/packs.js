// Shared collectible-card / pack logic for TOLS.
// Rarity tiers, collection card pools, pack-opening RNG, id generators.

export const RARITIES = {
  common: { label: "Common", color: "#9ca3af", weight: 60, min: 50, max: 250, Icon: "Star" },
  rare: { label: "Rare", color: "#60a5fa", weight: 25, min: 250, max: 1000, Icon: "Zap" },
  epic: { label: "Epic", color: "#c084fc", weight: 10, min: 1000, max: 4000, Icon: "Gem" },
  legendary: { label: "Legendary", color: "#ccff00", weight: 4, min: 4000, max: 15000, Icon: "Crown" },
  mythic: { label: "Mythic", color: "#fb7185", weight: 1, min: 15000, max: 50000, Icon: "Sparkles" },
};

export const RARITY_ORDER = ["common", "rare", "epic", "legendary", "mythic"];

// Each collection has card pools grouped by rarity. A pack draws a weighted
// random rarity, then a random card name from that rarity tier (falls back to
// any tier if a tier is empty for the collection).
export const COLLECTIONS = {
  Pokémon: {
    accent: "#ccff00",
    cards: {
      mythic: ["Mew ex", "Rayquaza VMAX", "Lugia Star"],
      legendary: ["Charizard ex", "Mewtwo ex", "Pikachu VMAX"],
      epic: ["Gengar V", "Lucario V", "Dragonite V"],
      rare: ["Pikachu V", "Eevee V", "Sylveon V"],
      common: ["Rattata", "Pidgey", "Caterpie", "Weedle"],
    },
  },
  NBA: {
    accent: "#f97316",
    cards: {
      mythic: ["LeBron James #23", "Michael Jordan Rookie"],
      legendary: ["Stephen Curry #30", "Kobe Bryant #24"],
      epic: ["Giannis #34", "Luka Dončić #77", "Kevin Durant #7"],
      rare: ["Jayson Tatum #0", "Devin Booker #1"],
      common: ["Role Player", "Bench Guard", "Rookie Forward"],
    },
  },
  FIFA: {
    accent: "#22c55e",
    cards: {
      mythic: ["Pelé Icon", "Maradona Icon"],
      legendary: ["Mbappé Icon", "Haaland Gold", "Messi Flash"],
      epic: ["Vinícius Jr.", "Bellingham #5", "Saka #7"],
      rare: ["Foden #47", "Pedri #8", "Gavi #6"],
      common: ["Goalkeeper", "Defender", "Midfielder", "Striker"],
    },
  },
  F1: {
    accent: "#ef4444",
    cards: {
      mythic: ["Senna Legend", "Schumacher #1"],
      legendary: ["Verstappen #1", "Hamilton #44"],
      epic: ["Leclerc #16", "Norris #4", "Russell #63"],
      rare: ["Sainz #55", "Pérez #11"],
      common: ["Backmarker", "Pit Crew", "Test Driver"],
    },
  },
  UFC: {
    accent: "#dc2626",
    cards: {
      mythic: ["Jon Jones Bones", "Khabib Nurmagomedov"],
      legendary: ["Israel Adesanya", "Conor McGregor"],
      epic: ["Alex Pereira", "Islam Makhachev", "Charles Oliveira"],
      rare: ["Dustin Poirier", "Sean O'Malley"],
      common: ["Prelim Fighter", "Contender", "Rookie"],
    },
  },
  "Yu-Gi-Oh!": {
    accent: "#a855f7",
    cards: {
      mythic: ["Blue-Eyes Ultimate Dragon", "Slifer the Sky Dragon"],
      legendary: ["Dark Magician", "Blue-Eyes White Dragon", "Exodia"],
      epic: ["Dark Magician Girl", "Red-Eyes Black Dragon"],
      rare: ["Summoned Skull", "Celtic Guardian"],
      common: ["Kuriboh", "Mystical Elf", "Celtic Guardian"],
    },
  },
};

const TOTAL_WEIGHT = Object.values(RARITIES).reduce((s, r) => s + r.weight, 0);

export function rollRarity() {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const key of RARITY_ORDER) {
    roll -= RARITIES[key].weight;
    if (roll < 0) return key;
  }
  return "common";
}

export function rollInsuredValue(rarity) {
  const r = RARITIES[rarity] || RARITIES.common;
  const v = r.min + Math.random() * (r.max - r.min);
  return Math.round(v);
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateTokenId(len = 24) {
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}
export function generateGradingId() {
  return String(Math.floor(10000000 + Math.random() * 89999999));
}

function pickCardName(collection, rarity) {
  const col = COLLECTIONS[collection];
  if (!col) return "Mystery Card";
  const pool = col.cards[rarity] || [];
  if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
  const all = Object.values(col.cards).flat();
  return all.length ? all[Math.floor(Math.random() * all.length)] : "Mystery Card";
}

// Open a pack: returns an array of generated card objects (not yet persisted).
export function openPack(pack) {
  const count = pack.cards_per_pack || 3;
  const cards = [];
  for (let i = 0; i < count; i++) {
    const rarity = rollRarity();
    cards.push({
      collection: pack.collection,
      card_name: pickCardName(pack.collection, rarity),
      rarity,
      insured_value: rollInsuredValue(rarity),
      currency: pack.currency || "USDT",
      token_id: generateTokenId(),
      grading_company: "PSA",
      grading_id: generateGradingId(),
      image: "",
      image_back: "",
      pack_name: pack.name,
      is_new: true,
    });
  }
  return cards;
}

export const rarityColor = (r) => (RARITIES[r] || RARITIES.common).color;
export const rarityLabel = (r) => (RARITIES[r] || RARITIES.common).label;
export const collectionAccent = (c) => (COLLECTIONS[c] ? COLLECTIONS[c].accent : "#ccff00");