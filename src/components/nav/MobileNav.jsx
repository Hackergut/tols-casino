import React from "react";
import { Link } from "react-router-dom";
import { X, Globe } from "lucide-react";
import TolsLogo from "@/components/TolsLogo";
import JackpotTicker from "@/components/JackpotTicker";
import ProductToggle from "@/components/nav/ProductToggle";
import SidebarOriginals from "@/components/nav/SidebarOriginals";
import { NavItem, NavGroup } from "@/components/nav/NavItem";
import { NAV_TOP, NAV_CASINO, NAV_PROMOS, NAV_FOOTER } from "@/components/nav/navItems";

export default function MobileNav({ onClose }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
        <Link to="/" onClick={onClose} className="flex items-center gap-2">
          <TolsLogo size="sm" />
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">.casino</span>
        </Link>
        <button onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 text-white/70 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="pt-3">
        <ProductToggle />
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-4">
        <div className="space-y-0.5">
          {NAV_TOP.map((i) => <NavItem key={i.id} item={i} onClick={onClose} />)}
        </div>
        <NavGroup title="Casino">
          {NAV_CASINO.map((i) => <NavItem key={i.id} item={i} onClick={onClose} />)}
        </NavGroup>
        <NavGroup title="Originals">
          <SidebarOriginals onNavigate={onClose} />
        </NavGroup>
        <NavGroup title="Promotions">
          {NAV_PROMOS.map((i) => <NavItem key={i.id} item={i} onClick={onClose} />)}
        </NavGroup>
      </nav>

      <div className="shrink-0 border-t border-white/5 p-3 space-y-1">
        {NAV_FOOTER.map((i) => <NavItem key={i.id} item={i} onClick={onClose} />)}
        <div className="flex items-center gap-3 h-10 px-3 text-sm font-semibold text-white/40">
          <Globe className="w-[19px] h-[19px]" /> English
        </div>
        <JackpotTicker />
      </div>
    </div>
  );
}