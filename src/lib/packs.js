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

// Real artwork used as the card portrait when a card has no explicit image.
export const COLLECTION_IMAGES = {
  Pokémon: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/65f40b6cc_generated_image.png",
  NBA: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/a42e9308c_generated_image.png",
  FIFA: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/77f5c3b45_generated_image.png",
  F1: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/9b5db9a50_generated_image.png",
  UFC: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/8175ff251_generated_image.png",
  "Yu-Gi-Oh!": "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/06dd27d82_generated_image.png",
};

// Per-card artwork: each named card gets its own portrait so two cards from the
// same collection never look identical. Falls back to the collection art.
const P = {
  fireDragon: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/1b5e02973_generated_image.png",
  electric: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/4eb4367cb_generated_image.png",
  dunk: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/6cdaa506c_generated_image.png",
  shooter: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/3fbb63c5b_generated_image.png",
  striker: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/0524e41f3_generated_image.png",
  winger: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/6c329aca0_generated_image.png",
  driver: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/92bc11b61_generated_image.png",
  raceCar: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/aa0314cdc_generated_image.png",
  fighter: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/64eae1d46_generated_image.png",
  champion: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/1e3da7f2d_generated_image.png",
  whiteDragon: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/411a1f008_generated_image.png",
  sorcerer: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/2bd46d056_generated_image.png",
};

export const CARD_IMAGES = {
  // Pokémon
  "Charizard ex": P.fireDragon, "Rayquaza VMAX": P.fireDragon, "Dragonite V": P.fireDragon,
  "Pikachu VMAX": P.electric, "Pikachu V": P.electric, "Mewtwo ex": P.electric,
  // NBA
  "LeBron James #23": P.dunk, "Michael Jordan Rookie": P.dunk, "Giannis #34": P.dunk,
  "Stephen Curry #30": P.shooter, "Kobe Bryant #24": P.shooter, "Devin Booker #1": P.shooter,
  // FIFA
  "Haaland Gold": P.striker, "Pelé Icon": P.striker, "Mbappé Icon": P.striker,
  "Messi Flash": P.winger, "Maradona Icon": P.winger, "Vinícius Jr.": P.winger,
  // F1
  "Verstappen #1": P.driver, "Hamilton #44": P.driver, "Leclerc #16": P.driver,
  "Senna Legend": P.raceCar, "Schumacher #1": P.raceCar, "Norris #4": P.raceCar,
  // UFC
  "Jon Jones Bones": P.fighter, "Israel Adesanya": P.fighter, "Alex Pereira": P.fighter,
  "Khabib Nurmagomedov": P.champion, "Conor McGregor": P.champion, "Islam Makhachev": P.champion,
  // Yu-Gi-Oh!
  "Blue-Eyes White Dragon": P.whiteDragon, "Blue-Eyes Ultimate Dragon": P.whiteDragon, "Red-Eyes Black Dragon": P.whiteDragon,
  "Dark Magician": P.sorcerer, "Dark Magician Girl": P.sorcerer, "Exodia": P.sorcerer, "Slifer the Sky Dragon": P.sorcerer,
};

export function collectionImage(card) {
  if (card?.image) return card.image;
  return CARD_IMAGES[card?.card_name] || COLLECTION_IMAGES[card?.collection] || "";
}

const TOTAL_WEIGHT = Object.values(RARITIES).reduce((s, r) => s + r.weight, 0);

// rollRarity accepts optional per-pack drop rates (rarity -> weight). When
// omitted, the global RARITIES weights are used.
export function rollRarity(rates) {
  const weights = rates && typeof rates === "object" ? rates : null;
  const total = weights
    ? RARITY_ORDER.reduce((s, k) => s + (weights[k] ?? RARITIES[k].weight), 0)
    : TOTAL_WEIGHT;
  let roll = Math.random() * total;
  for (const key of RARITY_ORDER) {
    roll -= weights ? (weights[key] ?? RARITIES[key].weight) : RARITIES[key].weight;
    if (roll < 0) return key;
  }
  return "common";
}

// Resolve a pack's drop rates (stored as a JSON string on the entity).
export function packDropRates(pack) {
  const dr = pack?.drop_rates;
  if (!dr) return null;
  if (typeof dr === "string") { try { return JSON.parse(dr); } catch { return null; } }
  return dr;
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
  const rates = packDropRates(pack);
  const cards = [];
  for (let i = 0; i < count; i++) {
    const rarity = rollRarity(rates);
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

// Dynamic border / glow visual recipe per rarity tier. Legendary and Mythic get
// the full neon treatment (animated pulsing halo) so they pop instantly in
// collection and marketplace grids. Returns:
//  - border: CSS borderColor value
//  - borderWidth: px
//  - glow: box-shadow string (halo around the card)
//  - haloColor: for radial background tints
//  - animate: whether to pulse the halo (legendary+)
//  - tier: 0..4 numeric rank (useful for sorting / opacity ramps)
export function rarityVisual(rarity) {
  const c = rarityColor(rarity);
  switch (rarity) {
    case "mythic":
      return {
        border: c, borderWidth: 3,
        glow: `0 0 0 1px ${c}, 0 0 34px -2px ${c}, 0 0 60px -10px ${c}`,
        haloColor: c, animate: true, tier: 4,
      };
    case "legendary":
      return {
        border: c, borderWidth: 3,
        glow: `0 0 0 1px ${c}, 0 0 26px -3px ${c}, 0 0 48px -12px ${c}`,
        haloColor: c, animate: true, tier: 3,
      };
    case "epic":
      return {
        border: c, borderWidth: 2,
        glow: `0 0 0 1px ${c}66, 0 0 18px -6px ${c}`,
        haloColor: c, animate: false, tier: 2,
      };
    case "rare":
      return {
        border: c, borderWidth: 2,
        glow: `0 0 0 1px ${c}55, 0 0 12px -8px ${c}`,
        haloColor: c, animate: false, tier: 1,
      };
    case "common":
    default:
      return {
        border: c, borderWidth: 1,
        glow: `0 0 0 1px ${c}33`,
        haloColor: c, animate: false, tier: 0,
      };
  }
}
export const collectionAccent = (c) => (COLLECTIONS[c] ? COLLECTIONS[c].accent : "#ccff00");

// Thematic 3-code position/role stack shown under the OVR rating box.
export const COLLECTION_CODES = {
  Pokémon: ["HP", "TYPE", "STAGE"],
  NBA: ["OVR", "POS", "TEAM"],
  FIFA: ["OVR", "POS", "NAT"],
  F1: ["OVR", "POS", "TEAM"],
  UFC: ["OVR", "LW", "STRIKER"],
  "Yu-Gi-Oh!": ["ATK", "DEF", "LVL"],
};
export const collectionCodes = (c) => COLLECTION_CODES[c] || ["OVR", "TOLS", "CARD"];

// Derive a 70–99 overall rating from rarity + insured value percentile.
const OVR_BASE = { common: 72, rare: 81, epic: 86, legendary: 92, mythic: 97 };
export function ovrFor(card) {
  const r = RARITIES[card.rarity] || RARITIES.common;
  const base = OVR_BASE[card.rarity] ?? 75;
  const v = Number(card.insured_value || 0);
  const pct = r.max > r.min ? Math.min(1, Math.max(0, (v - r.min) / (r.max - r.min))) : 0.5;
  return Math.min(99, Math.round(base + pct * 4));
}

// Split a card name into a short first label + a big last name for the nameplate.
export function nameParts(card) {
  const n = String(card.card_name || "").trim();
  if (!n) return { first: "", last: "TOLS" };
  const tokens = n.split(/\s+/);
  if (tokens.length === 1) return { first: "", last: tokens[0].toUpperCase() };
  return { first: tokens[0].toUpperCase(), last: tokens.slice(1).join(" ").toUpperCase() };
}

export function collectionAbbr(c) {
  const s = String(c || "").replace(/[^a-zA-Z0-9]/g, "");
  return s.slice(0, 3).toUpperCase() || "TOLS";
}

// Unique card names that make up a thematic set (across all rarities).
export function collectionCardList(c) {
  const col = COLLECTIONS[c];
  if (!col) return [];
  const set = new Set();
  Object.values(col.cards).forEach((arr) => arr.forEach((n) => set.add(n)));
  return Array.from(set).sort();
}

export const COLLECTION_NAMES = Object.keys(COLLECTIONS);