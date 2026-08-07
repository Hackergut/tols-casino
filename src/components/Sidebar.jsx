import React from "react";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import { NavItem } from "@/components/nav/NavItem";
import { NAV_TOP, NAV_CASINO, NAV_PROMOS, NAV_FOOTER } from "@/components/nav/navItems";

export default function Sidebar() {
  const sections = [NAV_TOP, NAV_CASINO, NAV_PROMOS, NAV_FOOTER];
  return (
    <aside className="hidden lg:flex w-[72px] flex-col shrink-0 sticky top-0 h-screen bg-background border-r border-white/10 z-40">
      <Link to="/" className="h-16 grid place-items-center border-b border-white/10" aria-label="TOLS home">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-lime text-black font-display text-xl">T</span>
      </Link>
      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3">
        {sections.map((items, index) => (
          <div key={index} className={`space-y-1 ${index ? "mt-3 pt-3 border-t border-white/10" : ""}`}>
            {items.map((item) => <NavItem key={item.id} item={item} collapsed />)}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <div title="English" className="grid place-items-center h-11 rounded-xl text-white/40"><Globe className="w-5 h-5" /></div>
      </div>
    </aside>
  );
}