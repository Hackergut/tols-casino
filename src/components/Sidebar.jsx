import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Sparkles, Gamepad2, Radio, Spade, Trophy, Crown, Users, Wallet, MessageCircle, Headphones, BarChart3, Layers, Album, Repeat, Store } from "lucide-react";

const ITEMS = [
  { id: "Lobby", icon: Home, to: "/", label: "Lobby" },
  { id: "Originals", icon: Sparkles, to: "/games/category/originals", label: "Originals" },
  { id: "Slots", icon: Gamepad2, to: "/games/category/slots", label: "Slots" },
  { id: "Live", icon: Radio, to: "/games/category/live", label: "Live Casino" },
  { id: "Table", icon: Spade, to: "/games/category/table", label: "Table Games" },
  { id: "Tournaments", icon: Trophy, to: "/tournaments", label: "Race" },
  { id: "Packs", icon: Layers, to: "/packs", label: "Packs" },
  { id: "Collection", icon: Album, to: "/collection", label: "Collection" },
  { id: "Market", icon: Store, to: "/marketplace", label: "Market" },
  { id: "VIP", icon: Crown, to: "/vip", label: "VIP" },
  { id: "Affiliate", icon: Users, to: "/affiliate", label: "Affiliate" },
  { id: "Wallet", icon: Wallet, to: "/wallet", label: "Wallet" },
  { id: "Community", icon: MessageCircle, to: "/community", label: "Chat" },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden lg:flex flex-col shrink-0 sticky top-0 h-screen w-[72px] bg-[#0a0a0a] border-r border-white/[0.06] z-40">
      <Link to="/" className="h-[56px] grid place-items-center border-b border-white/[0.06]" aria-label="TOLS home">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-lime text-black font-black text-[16px]">T</span>
      </Link>
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-2">
        {ITEMS.map((item) => <SideIcon key={item.id} item={item} pathname={pathname} />)}
      </nav>
      <div className="p-2 border-t border-white/[0.06]">
        <div className="h-8 rounded-lg bg-lime/10 border border-lime/20 grid place-items-center text-[10px] font-black text-lime">TOLS<br/>PRO</div>
      </div>
    </aside>
  );
}

function SideIcon({ item, pathname }) {
  const Icon = item.icon;
  const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
  return (
    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
      <Link to={item.to} title={item.label} className={`group flex flex-col items-center justify-center gap-0.5 mx-1.5 my-0.5 py-2 rounded-xl transition ${active ? "bg-white text-black" : "text-white/55 hover:bg-white/[0.06] hover:text-white"}`}>
        <Icon className={`w-[20px] h-[20px] ${active ? "text-black" : "text-white/70 group-hover:text-white"}`} />
        <span className={`text-[9px] font-bold tracking-wide leading-none ${active ? "text-black" : "text-white/50"}`}>{item.label}</span>
      </Link>
    </motion.div>
  );
}