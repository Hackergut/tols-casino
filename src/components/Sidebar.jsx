import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, Globe } from "lucide-react";
import TolsLogo from "@/components/TolsLogo";
import JackpotTicker from "@/components/JackpotTicker";
import { NavItem, NavGroup } from "@/components/nav/NavItem";
import { NAV_TOP, NAV_CASINO, NAV_PROMOS, NAV_FOOTER } from "@/components/nav/navItems";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen bg-background border-r border-white/10 z-40 transition-[width] duration-300 ${collapsed ? "w-[72px]" : "w-56"}`}>
      <div className={`flex items-center h-16 border-b border-white/10 ${collapsed ? "justify-center" : "justify-between px-4"}`}>
        {!collapsed && <Link to="/"><TolsLogo size="sm" /></Link>}
        <button onClick={() => setCollapsed((v) => !v)} className="flex items-center justify-center w-9 h-9 rounded-lg text-white/40 hover:text-lime hover:bg-white/5 transition" aria-label="Toggle sidebar">
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-5">
        <div className="space-y-1">{NAV_TOP.map((i) => <NavItem key={i.id} item={i} collapsed={collapsed} />)}</div>
        <NavGroup title="Casino" collapsed={collapsed}>{NAV_CASINO.map((i) => <NavItem key={i.id} item={i} collapsed={collapsed} />)}</NavGroup>
        <NavGroup title="Account" collapsed={collapsed}>{NAV_PROMOS.map((i) => <NavItem key={i.id} item={i} collapsed={collapsed} />)}</NavGroup>
      </nav>
      <div className="border-t border-white/10 p-3 space-y-1">
        {NAV_FOOTER.map((i) => <NavItem key={i.id} item={i} collapsed={collapsed} />)}
        {!collapsed && <div className="flex items-center gap-3 h-10 px-3 text-sm font-semibold text-white/40"><Globe className="w-5 h-5" /> English</div>}
        <div className="pt-1">{collapsed ? <Link to="/tournaments" className="block text-center py-2 rounded-xl bg-lime/10 border border-lime/20 text-[9px] font-black text-lime">POT</Link> : <JackpotTicker />}</div>
      </div>
    </aside>
  );
}