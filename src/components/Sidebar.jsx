import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Star, Clock3, Flame, Trophy, Gift, Sparkles, Gamepad2,
  MonitorPlay, Spade, Disc3, Crown, Users, Newspaper, Search, ChevronRight, MessageCircle,
} from "lucide-react";

const NAV_MAIN = [
  { id: "lobby", label: "Lobby", icon: Home, to: "/", match: "lobby" },
  { id: "favorites", label: "Preferiti", icon: Star, to: "/", match: null },
  { id: "latest", label: "Ultime uscite", icon: Clock3, to: "/?cat=slots", match: "cat:slots" },
  { id: "recent", label: "Giocati di recente", icon: Flame, to: "/", match: null },
  { id: "challenges", label: "Sfide", icon: Trophy, to: "/", match: null, badge: "39" },
  { id: "promotions", label: "Promozioni", icon: Gift, to: "/", match: null },
  { id: "community", label: "Community Chat", icon: MessageCircle, to: "/community", match: "path:/community" },
];

const NAV_CATS = [
  { id: "originals", label: "Originali", icon: Sparkles, to: "/?cat=originals", match: "cat:originals" },
  { id: "slots", label: "Slot", icon: Gamepad2, to: "/?cat=slots", match: "cat:slots" },
  { id: "live", label: "Live Dealers", icon: MonitorPlay, to: "/?cat=live", match: "cat:live" },
  { id: "table", label: "Giochi da Tavolo", icon: Spade, to: "/?cat=table", match: "cat:table" },
];

const NAV_GAMES = [
  { id: "roulette", label: "Roulette", icon: Disc3, to: "/game/roulette", match: "path:/game/roulette" },
  { id: "baccarat", label: "Baccarat", icon: Spade, to: "/game/baccarat", match: "path:/game/baccarat" },
];

const NAV_BOTTOM = [
  { id: "vip", label: "VIP", icon: Crown, to: "/vip", match: "path:/vip" },
  { id: "affiliate", label: "Affiliati", icon: Users, to: "/affiliate", match: "path:/affiliate" },
  { id: "blog", label: "Blog", icon: Newspaper, to: "/", match: null },
];

export default function Sidebar() {
  const loc = useLocation();
  const cat = new URLSearchParams(loc.search).get("cat");

  const isActive = (item) => {
    if (!item.match) return false;
    if (item.match === "lobby") return loc.pathname === "/" && !cat;
    if (item.match.startsWith("cat:")) return cat === item.match.split(":")[1];
    if (item.match.startsWith("path:")) return loc.pathname === item.match.split(":")[1];
    return false;
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen bg-[#0f0f0f] border-r border-white/5 z-40">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 h-16 px-5 shrink-0 border-b border-white/5">
        <span className="text-2xl font-black tracking-tighter italic" style={{ color: "#ccff00", textShadow: "0 0 18px rgba(204,255,0,0.5)" }}>
          TOLS
        </span>
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">.casino</span>
      </Link>

      {/* Search */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[#1a1a1a] border border-white/5 focus-within:border-lime/30 transition">
          <Search className="w-4 h-4 text-white/30" />
          <input placeholder="Cerca giochi" className="bg-transparent outline-none text-sm text-white/80 placeholder-white/30 w-full" />
        </div>
      </div>

      {/* Nav scroll area */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-5">
        <Section items={NAV_MAIN} isActive={isActive} />
        <Group title="Categorie">
          <Section items={NAV_CATS} isActive={isActive} />
        </Group>
        <Group title="Giochi">
          <Section items={NAV_GAMES} isActive={isActive} />
        </Group>
      </nav>

      {/* Bottom */}
      <div className="shrink-0 border-t border-white/5 p-3 space-y-1">
        {NAV_BOTTOM.map((item) => (
          <Item key={item.id} item={item} active={isActive(item)} />
        ))}
      </div>
    </aside>
  );
}

function Group({ title, children }) {
  return (
    <div>
      <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">{title}</p>
      {children}
    </div>
  );
}

function Section({ items, isActive }) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <Item key={item.id} item={item} active={isActive(item)} />
      ))}
    </div>
  );
}

function Item({ item, active }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={`group flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-semibold transition ${
        active ? "bg-lime/10 text-lime" : "text-white/60 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className={`shrink-0 ${active ? "text-lime" : "text-white/50 group-hover:text-white"}`} style={{ width: 18, height: 18 }} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className="px-1.5 py-0.5 rounded-full bg-lime text-black text-[10px] font-black">{item.badge}</span>
      )}
      {active && <ChevronRight className="w-3.5 h-3.5 text-lime" />}
    </Link>
  );
}