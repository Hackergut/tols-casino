import React, { useState } from "react";
import Header from "@/components/Header";
import SubNav from "@/components/SubNav";
import HeroBanners from "@/components/HeroBanners";
import GameGrid from "@/components/GameGrid";

export default function Home() {
  const [active, setActive] = useState("home");

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Header />
      <SubNav active={active} onChange={setActive} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8">
        <HeroBanners />
        <GameGrid title="TOLS GAMES" />
        {active === "home" && (
          <>
            <GameGrid title="Originali" filter="originals" />
            <GameGrid title="Giochi da Tavolo" filter="table" />
          </>
        )}
        {active !== "home" && <GameGrid title="Categoria" filter={active} />}
      </main>
      <footer className="border-t border-white/5 mt-12 py-8 text-center text-xs text-white/30">
        <span className="text-lime font-black">TOLS</span> · Crypto Casino · Provably Fair
      </footer>
    </div>
  );
}