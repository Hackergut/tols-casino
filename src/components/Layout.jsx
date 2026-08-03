import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CookieNotice from "@/components/CookieNotice";
import SupportButton from "@/components/SupportButton";

export default function Layout() {
  const [mobileNav, setMobileNav] = useState(false);

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

      {/* Mobile sidebar overlay */}
      {mobileNav && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileNav(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#0f0f0f] border-r border-white/10 overflow-y-auto">
            <MobileNav onClose={() => setMobileNav(false)} />
          </div>
        </div>
      )}

      <CookieNotice />
      <SupportButton />
    </div>
  );
}

function MobileNav({ onClose }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
        <span className="text-2xl font-black italic" style={{ color: "#ccff00" }}>TOLS</span>
        <button onClick={onClose} className="text-white/50 text-sm font-bold">Chiudi</button>
      </div>
      <div className="p-4 space-y-3">
        <a href="/?cat=originals" className="block py-2 text-white/70 font-semibold">Originali</a>
        <a href="/?cat=slots" className="block py-2 text-white/70 font-semibold">Slot</a>
        <a href="/?cat=table" className="block py-2 text-white/70 font-semibold">Giochi da Tavolo</a>
        <a href="/?cat=live" className="block py-2 text-white/70 font-semibold">Live Dealers</a>
        <div className="border-t border-white/5 my-2" />
        <a href="/game/roulette" className="block py-2 text-white/70 font-semibold">Roulette</a>
        <a href="/game/baccarat" className="block py-2 text-white/70 font-semibold">Baccarat</a>
        <div className="border-t border-white/5 my-2" />
        <a href="/vip" className="block py-2 text-white/70 font-semibold">VIP</a>
        <a href="/affiliate" className="block py-2 text-white/70 font-semibold">Affiliati</a>
      </div>
    </div>
  );
}