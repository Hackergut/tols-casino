import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { X, Search } from "lucide-react";
import Sidebar, { NAV_MAIN, NAV_CATS, NAV_GAMES, NAV_BOTTOM } from "@/components/Sidebar";
import Header from "@/components/Header";
import CookieNotice from "@/components/CookieNotice";
import SupportButton from "@/components/SupportButton";
import OnboardingTour from "@/components/OnboardingTour";
import { useSwipe } from "@/hooks/useSwipe";

export default function Layout() {
  const [mobileNav, setMobileNav] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Blocca scroll body + chiudi con Escape quando il drawer è aperto
  useEffect(() => {
    if (mobileNav) {
      document.body.style.overflow = "hidden";
      const onKey = (e) => e.key === "Escape" && setMobileNav(false);
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [mobileNav]);

  // Swipe da bordo sinistro → apre il drawer; swipe a sinistra → chiude
  useSwipe({ edge: 26, onSwipeRight: () => setMobileNav(true), disabled: !isMobile || mobileNav });
  useSwipe({ onSwipeLeft: () => setMobileNav(false), disabled: !mobileNav, guardInteractive: false });

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <Header onMenu={() => setMobileNav(true)} />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile sidebar drawer a scomparsa */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${
          mobileNav ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileNav(false)} />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-[#0f0f0f] border-r border-white/10 overflow-y-auto scrollbar-hide transition-transform duration-300 ease-out ${
            mobileNav ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <MobileNav onClose={() => setMobileNav(false)} />
        </aside>
      </div>

      <CookieNotice />
      <SupportButton />
      <OnboardingTour />
    </div>
  );
}

function MobileNav({ onClose }) {
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
        <Link to="/" onClick={onClose} className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter italic" style={{ color: "#ccff00", textShadow: "0 0 18px rgba(204,255,0,0.5)" }}>
            TOLS
          </span>
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">.casino</span>
        </Link>
        <button onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 h-11 px-3 rounded-xl bg-[#1a1a1a] border border-white/5 focus-within:border-lime/30 transition">
          <Search className="w-4 h-4 text-white/40" />
          <input placeholder="Search games" className="bg-transparent outline-none text-sm text-white/80 placeholder-white/40 w-full" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-5">
        <MSection items={NAV_MAIN} isActive={isActive} onClose={onClose} />
        <MGroup title="Categories">
          <MSection items={NAV_CATS} isActive={isActive} onClose={onClose} />
        </MGroup>
        <MGroup title="Games">
          <MSection items={NAV_GAMES} isActive={isActive} onClose={onClose} />
        </MGroup>
      </nav>

      <div className="shrink-0 border-t border-white/5 p-3 space-y-1">
        {NAV_BOTTOM.map((item) => (
          <MItem key={item.id} item={item} active={isActive(item)} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}

function MGroup({ title, children }) {
  return (
    <div>
      <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">{title}</p>
      {children}
    </div>
  );
}

function MSection({ items, isActive, onClose }) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <MItem key={item.id} item={item} active={isActive(item)} onClose={onClose} />
      ))}
    </div>
  );
}

function MItem({ item, active, onClose }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onClose}
      className={`group flex items-center gap-3 h-12 px-3 rounded-xl text-sm font-semibold transition ${
        active ? "bg-lime/15 text-lime" : "text-white/70 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className={`shrink-0 ${active ? "text-lime" : "text-white/60 group-hover:text-white"}`} style={{ width: 20, height: 20 }} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className="px-1.5 py-0.5 rounded-full bg-lime text-black text-[10px] font-black">{item.badge}</span>
      )}
    </Link>
  );
}