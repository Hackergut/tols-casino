import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Home, Gamepad2, Trophy, MessageCircle } from "lucide-react";

export default function BottomNav({ onMenu }) {
  // Visible on mobile+tablet (<1024), hidden on desktop — exact sync with Sidebar
  const { pathname } = useLocation();
  const items = [
    { id: "menu", label: "Menu", icon: Menu, action: onMenu },
    { id: "home", label: "Home", icon: Home, to: "/", active: pathname === "/" },
    { id: "games", label: "Games", icon: Gamepad2, to: "/games/category/originals", active: pathname.startsWith("/game") },
    { id: "race", label: "Race", icon: Trophy, to: "/tournaments", active: pathname.startsWith("/tournaments") },
    { id: "chat", label: "Chat", icon: MessageCircle, to: "/community", active: pathname.startsWith("/community") },
  ];
  return <motion.nav initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25, ease: [0.16,1,0.3,1] }} className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-black/95 backdrop-blur border-t border-white/10 grid grid-cols-5 safe-area-bottom">{items.map((item) => {
    const Icon = item.icon;
    const inner = <span className={`flex flex-col items-center justify-center gap-1 py-2.5 ${item.active ? "text-lime" : "text-white/50"}`}><Icon className="w-[22px] h-[22px]" /><span className="text-[9px] font-black uppercase">{item.label}</span></span>;
    return item.action ? <button key={item.id} onClick={item.action}>{inner}</button> : <Link key={item.id} to={item.to}>{inner}</Link>;
  })}</motion.nav>;
}