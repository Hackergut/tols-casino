import { Home, Trophy, Sparkles, Gamepad2, Spade, Crown, Users, Newspaper, Headphones, MessageCircle, Radio, Layers, Album } from "lucide-react";

export const NAV_TOP = [
  { id: "home", label: "Home", icon: Home, to: "/" },
  { id: "competitions", label: "Tournaments", icon: Trophy, to: "/tournaments" },
];

export const NAV_CASINO = [
  { id: "originals", label: "TOLS Originals", icon: Sparkles, to: "/games/category/originals" },
  { id: "slots", label: "Slots", icon: Gamepad2, to: "/games/category/slots" },
  { id: "live", label: "Live Casino", icon: Radio, to: "/games/category/live" },
  { id: "table", label: "Table Games", icon: Spade, to: "/games/category/table" },
  { id: "packs", label: "Card Packs", icon: Layers, to: "/packs" },
  { id: "collection", label: "La mia collezione", icon: Album, to: "/collection" },
];

export const NAV_PROMOS = [
  { id: "vip", label: "VIP & Rewards", icon: Crown, to: "/vip" },
  { id: "affiliate", label: "Affiliate", icon: Users, to: "/affiliate" },
];

export const NAV_FOOTER = [
  { id: "community", label: "Community", icon: MessageCircle, to: "/community" },
  { id: "about", label: "About", icon: Newspaper, to: "/about" },
  { id: "support", label: "Support", icon: Headphones, to: "/contact" },
];