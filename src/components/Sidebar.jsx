import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, ChevronDown, Globe } from "lucide-react";
import TolsLogo from "@/components/TolsLogo";
import JackpotTicker from "@/components/JackpotTicker";
import ProductToggle from "@/components/nav/ProductToggle";
import SidebarOriginals from "@/components/nav/SidebarOriginals";
import { NavItem, NavGroup } from "@/components/nav/NavItem";
import { NAV_TOP, NAV_CASINO, NAV_PROMOS, NAV_FOOTER } from "@/components/nav/navItems";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [casinoOpen, setCasinoOpen] = useState(true);
  const [originalsOpen, setOriginalsOpen] = useState(true);

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen bg-background border-r border-white/5 z-40 transition-[width] duration-300 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className={`flex items-center h-16 shrink-0 border-b border-white/5 ${collapsed ? "justify-center" : "justify-between px-4"}`}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <TolsLogo size="sm" />
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">.casino</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-white/40 hover:text-lime hover:bg-white/5 transition"
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      <div className="pt-3">
        <ProductToggle collapsed={collapsed} />
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-4">
        <div className="space-y-0.5">
          {NAV_TOP.map((i) => <NavItem key={i.id} item={i} collapsed={collapsed} />)}
        </div>

        <div>
          <button
            onClick={() => setCasinoOpen((o) => !o)}
            className={`flex items-center w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.18em] text-white/35 hover:text-white/70 transition ${
              collapsed ? "justify-center" : "px-3"
            }`}
          >
            {!collapsed && <span className="flex-1 text-left">Casino</span>}
            <ChevronDown className={`w-4 h-4 transition ${casinoOpen ? "" : "-rotate-90"}`} />
          </button>
          {casinoOpen && (
            <div className="space-y-0.5">
              {NAV_CASINO.map((i) => <NavItem key={i.id} item={i} collapsed={collapsed} />)}
            </div>
          )}
        </div>

        {!collapsed && (
          <div>
            <button
              onClick={() => setOriginalsOpen((o) => !o)}
              className="flex items-center w-full h-10 px-3 rounded-xl text-[10px] font-black uppercase tracking-[0.18em] text-white/35 hover:text-white/70 transition"
            >
              <span className="flex-1 text-left">Originals</span>
              <ChevronDown className={`w-4 h-4 transition ${originalsOpen ? "" : "-rotate-90"}`} />
            </button>
            {originalsOpen && <SidebarOriginals />}
          </div>
        )}

        <NavGroup title="Promotions" collapsed={collapsed}>
          {NAV_PROMOS.map((i) => <NavItem key={i.id} item={i} collapsed={collapsed} />)}
        </NavGroup>
      </nav>

      <div className="shrink-0 border-t border-white/5 p-3 space-y-1">
        {NAV_FOOTER.map((i) => <NavItem key={i.id} item={i} collapsed={collapsed} />)}
        {!collapsed && (
          <div className="flex items-center gap-3 h-10 px-3 text-sm font-semibold text-white/40">
            <Globe className="w-[19px] h-[19px]" /> English
          </div>
        )}
        <div className="pt-1">
          {collapsed ? (
            <Link to="/tournaments" className="block text-center py-2 rounded-xl bg-lime/10 border border-lime/20 text-[9px] font-black text-lime">POT</Link>
          ) : (
            <JackpotTicker />
          )}
        </div>
      </div>
    </aside>
  );
}