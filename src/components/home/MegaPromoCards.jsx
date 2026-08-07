import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Crosshair, Target, Gift, Trophy, ChevronLeft, ChevronRight } from "lucide-react";

const IMGS = {
  mega: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/a4f6af45f_IMG_1973.png",
  gauntlet: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/bdced99c6_IMG_1971.png",
  live: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/c02228216_IMG_1976.jpg",
  king: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/bf77160cc_IMG_1974.jpg",
};

const CARDS = [
  { img: IMGS.mega, to: "/tournaments", amount: "$100,000", brand: "TOLS", title: "MEGA DROP!", copy: "Hit all selected targets for legendary prizes!", cta: "PLAY. HIT. WIN." },
  { img: IMGS.gauntlet, to: "/games/category/originals", amount: "$50,000", brand: "ORIGINALS", title: "GAUNTLET!", copy: "Hit all selected targets for ", copyHi: "prizes!", cta: "PLAY. HIT. WIN.", split: true, features: [
    { icon: Target, t: "HIT TARGETS", b: "Complete missions" },
    { icon: Gift, t: "EARN REWARDS", b: "Big prizes every day" },
    { icon: Trophy, t: "BE THE LEGEND", b: "Top players. Biggest wins." },
  ] },
  { img: IMGS.live, to: "/games/category/live", amount: "$25,000", brand: "TOLS", title: "LIVE DROP!", copy: "Roulette, slots & dice — provably fair, onchain.", cta: "SPIN. WIN. WIN." },
  { img: IMGS.mega, to: "/swap", amount: "SWAP", brand: "TOLS", title: "CARDS!", copy: "Estrazione gacha — chase mythic, completa i set tematici.", cta: "OPEN. PULL. COLLECT.", split: true, features: [
    { icon: Gift, t: "GACHA PULL", b: "3 carte per pack" },
    { icon: Trophy, t: "CHASE MYTHIC", b: "Rarità pesate" },
    { icon: Target, t: "90% BUYBACK", b: "Valore garantito" },
  ] },
];

function Brand() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-black tracking-widest uppercase">
      <span className="text-white">TOLS</span><span className="text-lime">GAMING</span>
    </span>
  );
}

export default function MegaPromoCards() {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const count = CARDS.length;

  const scrollTo = useCallback((i) => {
    const el = trackRef.current;
    if (!el) return;
    const wrapped = ((i % count) + count) % count;
    el.scrollTo({ left: wrapped * el.clientWidth, behavior: "smooth" });
    setIndex(wrapped);
  }, [count]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIndex(Math.round(el.scrollLeft / el.clientWidth)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="relative">
      <div ref={trackRef} className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory" data-no-swipe>
        {CARDS.map((c, i) => (
          <div key={i} className="shrink-0 w-full snap-start px-0.5">
            <Link to={c.to} className="group relative block h-[280px] sm:h-[340px] overflow-hidden rounded-2xl border border-white/15 hover:border-lime/50 transition">
              <Image src={c.img} fittingType="fill" className="absolute inset-0 w-full h-full transition duration-500 group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
              <div className="relative z-10 h-full flex flex-col justify-between p-5 sm:p-8">
                <div className="flex justify-end"><Brand /></div>
                <div>
                  <h2 className="font-display uppercase leading-[0.92] text-4xl sm:text-6xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                    <span className="text-lime">{c.amount}</span> <span className="text-white">{c.brand}</span> <span className="text-lime">{c.title}</span>
                  </h2>
                  <p className="mt-3 text-sm sm:text-lg text-white/90 max-w-[70%] drop-shadow">
                    {c.copy}{c.copyHi && <span className="text-lime font-bold">{c.copyHi}</span>}
                  </p>
                  {c.features && (
                    <div className="mt-4 flex gap-2.5 max-w-md">
                      {c.features.map((f) => (
                        <div key={f.t} className="flex-1 rounded-xl border border-lime/40 bg-black/40 backdrop-blur-sm p-2.5 flex flex-col items-center text-center">
                          <f.icon className="w-4 h-4 text-lime mb-1" />
                          <p className="text-[10px] font-black text-white leading-tight">{f.t}</p>
                          <p className="text-[9px] text-white/55 leading-tight mt-0.5">{f.b}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {c.split ? (
                  <div className="-mx-5 sm:-mx-8 flex h-10">
                    <span className="flex items-center gap-1.5 px-4 bg-lime text-black font-black text-xs tracking-wide"><span>&gt;</span> {c.cta}</span>
                    <span className="flex-1 flex items-center px-4 bg-black text-white text-[10px] font-bold tracking-widest">ONLY ON TOLS</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-2 h-9 w-fit pl-3 pr-3.5 rounded-full border border-lime bg-black/55 backdrop-blur-sm">
                    <Crosshair className="w-4 h-4 text-lime" />
                    <span className="text-[13px] font-black tracking-wide"><span className="text-white">{c.cta.replace("WIN.", "")}</span><span className="text-lime">WIN.</span></span>
                    <span className="text-[9px] text-white/65 font-bold tracking-widest">ONLY ON TOLS</span>
                  </span>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      <button onClick={() => scrollTo(index - 1)} aria-label="Previous" className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-black/60 border border-white/15 text-white hover:text-lime hover:border-lime/40 transition">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => scrollTo(index + 1)} aria-label="Next" className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-black/60 border border-white/15 text-white hover:text-lime hover:border-lime/40 transition">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {CARDS.map((_, i) => (
          <button key={i} onClick={() => scrollTo(i)} aria-label={`Slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-lime" : "w-1.5 bg-white/30"}`} />
        ))}
      </div>
    </section>
  );
}