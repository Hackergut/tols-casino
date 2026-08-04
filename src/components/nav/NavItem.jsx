import React from "react";
import { Link, useLocation } from "react-router-dom";

export function NavItem({ item, collapsed, onClick }) {
  const loc = useLocation();
  const Icon = item.icon;
  const active = loc.pathname === item.to || (item.to !== "/" && loc.pathname.startsWith(item.to));

  return (
    <Link
      to={item.to}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`group flex items-center gap-3 h-11 rounded-xl text-sm font-semibold transition ${
        collapsed ? "justify-center px-0" : "px-3"
      } ${active ? "bg-lime/10 text-lime" : "text-white/60 hover:text-white hover:bg-white/5"}`}
    >
      <Icon className={`shrink-0 ${active ? "text-lime" : "text-white/50 group-hover:text-white"}`} style={{ width: 19, height: 19 }} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="px-1.5 py-0.5 rounded-full bg-lime text-black text-[10px] font-black">{item.badge}</span>
          )}
          {item.tag && (
            <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[8px] font-black tracking-wider text-white/60">{item.tag}</span>
          )}
        </>
      )}
    </Link>
  );
}

export function NavGroup({ title, collapsed, children, action }) {
  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <div className="flex items-center justify-between px-3 mb-1">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">{title}</p>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}