import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Search, Spade, MessageCircle, Crown } from "lucide-react";

/**
 * Rolly-style fixed mobile bottom navigation: MENU, SEARCH, POINTS, CASINO,
 * SPORTS (SOON), CHAT. Shown only on mobile; MENU opens the slide-in drawer.
 */
export default function BottomNav({ onMenu }) {
  const { pathname } = useLocation();

  const items = [
    { id: "menu", label: "MENU", icon: Menu, action: onMenu },
    { id: "search", label: "SEARCH", icon: Search, to: "/" },
    { id: "points", label: "POINTS", icon: Crown, to: "/vip", active: pathname.startsWith("/vip") },
    { id: "casino", label: "CASINO", icon: Spade, to: "/", active: pathname === "/" },
    { id: "sports", label: "SPORTS", soon: true },
    { id: "chat", label: "CHAT", icon: MessageCircle, to: "/community", active: pathname.startsWith("/community") },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0a0e22]/95 backdrop-blur border-t border-white/10 grid grid-cols-6">
      {items.map((it) => {
        const Icon = it.icon;
        const on = !!it.active;
        const inner = (
          <span className={`flex flex-col items-center justify-center gap-0.5 py-2 ${on ? "text-lime" : "text-white/55"}`}>
            {Icon && <Icon className="w-5 h-5" />}
            <span className="text-[9px] font-black tracking-wider uppercase">{it.label}</span>
            {it.soon && (
              <span className="px-1 rounded bg-white/10 text-white/50 text-[7px] font-bold leading-none -mt-0.5">SOON</span>
            )}
          </span>
        );
        return (
          <div key={it.id} className="flex">
            {it.action ? (
              <button onClick={it.action} className="w-full flex justify-center" aria-label={it.label}>
                {inner}
              </button>
            ) : it.soon ? (
              <span className="w-full flex justify-center opacity-50 cursor-not-allowed">{inner}</span>
            ) : (
              <Link to={it.to} className="w-full flex justify-center">
                {inner}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}