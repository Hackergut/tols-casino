import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, Gamepad2, Radio, Spade, Trophy, Crown, Users, Wallet, MessageCircle, Headphones } from "lucide-react";

const ITEMS = [
  { id: "home", icon: Home, to: "/" },
  { id: "originals", icon: Sparkles, to: "/games/category/originals" },
  { id: "slots", icon: Gamepad2, to: "/games/category/slots" },
  { id: "live", icon: Radio, to: "/games/category/live" },
  { id: "table", icon: Spade, to: "/games/category/table" },
  { id: "tournaments", icon: Trophy, to: "/tournaments" },
  { id: "vip", icon: Crown, to: "/vip" },
  { id: "affiliate", icon: Users, to: "/affiliate" },
  { id: "wallet", icon: Wallet, to: "/wallet" },
  { id: "community", icon: MessageCircle, to: "/community" },
  { id: "support", icon: Headphones, to: "/contact" },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden lg:flex flex-col shrink-0 sticky top-0 h-screen w-[72px] bg-[#0f1221] border-r border-white/10 z-40">
      <Link to="/" className="h-16 grid place-items-center border-b border-white/10" aria-label="TOLS home">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-lime text-black font-display text-xl">T</span>
      </Link>
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-3">
        {ITEMS.slice(0, 5).map((item) => <SideIcon key={item.id} item={item} pathname={pathname} />)}
        <div className="mx-3 my-2 border-t border-white/8" />
        {ITEMS.slice(5).map((item) => <SideIcon key={item.id} item={item} pathname={pathname} />)}
      </nav>
    </aside>
  );
}

function SideIcon({ item, pathname }) {
  const Icon = item.icon;
  const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
  return (
    <Link to={item.to} title={item.id} className={`group flex items-center justify-center mx-3 my-1 h-12 rounded-xl transition ${active ? "bg-lime" : "hover:bg-white/8"}`}>
      <Icon className={`w-[22px] h-[22px] ${active ? "text-[#0f1221]" : "text-white/65 group-hover:text-white"}`} />
    </Link>
  );
}