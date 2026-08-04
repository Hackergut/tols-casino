import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/nav/MobileNav";
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