import {
  Home, Trophy, Sparkles, Gamepad2, Spade, Disc3, Crown, Users,
  Newspaper, Headphones, MessageCircle, Coins,
} from "lucide-react";

export const NAV_TOP = [
  { id: "home", label: "Home", icon: Home, to: "/" },
  { id: "competitions", label: "Competitions", icon: Trophy, to: "/tournaments", badge: "8" },
];

export const NAV_CASINO = [
  { id: "originals", label: "Originals", icon: Sparkles, to: "/games/category/originals" },
  { id: "slots", label: "Slots", icon: Gamepad2, to: "/games/category/slots" },
  { id: "table", label: "Table Games", icon: Spade, to: "/games/category/table" },
  { id: "roulette", label: "Roulette", icon: Disc3, to: "/game/roulette" },
  { id: "baccarat", label: "Baccarat", icon: Spade, to: "/game/baccarat" },
];

export const NAV_PROMOS = [
  { id: "rewards", label: "Rewards", icon: Crown, to: "/vip", tag: "EXCLUSIVE" },
  { id: "race", label: "Weekly Race", icon: Coins, to: "/tournaments", tag: "LIVE" },
  { id: "affiliate", label: "Refer and Earn", icon: Users, to: "/affiliate" },
];

export const NAV_FOOTER = [
  { id: "community", label: "Community", icon: MessageCircle, to: "/community" },
  { id: "blog", label: "About", icon: Newspaper, to: "/about" },
  { id: "support", label: "Live Support", icon: Headphones, to: "/contact" },
];