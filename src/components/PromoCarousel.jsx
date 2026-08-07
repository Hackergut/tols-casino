import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GameArt from "@/components/GameArt";

const SLIDES = [
  { eyebrow: "INSTANT", title: "VIP MATCH", copy: "Bring your VIP status, claim rewards instantly.", cta: "MATCH STATUS NOW", to: "/vip", slug: "dice" },
  { eyebrow: "TOLS", title: "ZK-ORIGINALS", copy: "First-ever games with logic, RTP & RNG proven onchain.", cta: "TRY NOW", to: "/games/category/originals", slug: "crash" },
  { eyebrow: "EARN", title: "POINTS FASTER", copy: "Activate boosts and earn up to 20% more.", cta: "BOOST NOW", to: "/affiliate", slug: "plinko" },
];

export default function PromoCarousel() {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const count = SLIDES.length;

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
      raf = requestAnimationFrame(() => {
        setIndex(Math.round(el.scrollLeft / el.clientWidth));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="relative pt-2">
      <div ref={trackRef} className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory" data-no-swipe>
        {SLIDES.map((s) => (
          <div key={s.title} className="shrink-0 w-full snap-start px-0.5">
            <Link to={s.to} className="group relative block h-[200px] sm:h-[240px] overflow-hidden rounded-2xl border border-white/15 bg-card hover:border-lime/50 transition">
              <GameArt slug={s.slug} className="absolute inset-0 opacity-60 group-hover:scale-[1.03] transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/10" />
              <div className="relative z-10 flex h-full flex-col items-start justify-center p-6 sm:p-10 max-w-[60%]">
                <p className="font-display text-xl text-white">{s.eyebrow}</p>
                <h2 className="font-display text-4xl sm:text-5xl leading-[0.9] text-lime uppercase">{s.title}</h2>
                <p className="mt-3 text-sm text-white/65 max-w-[280px]">{s.copy}</p>
                <span className="mt-5 inline-flex items-center h-9 px-4 rounded-lg bg-white/10 border border-white/20 text-xs font-black text-white backdrop-blur-sm">{s.cta}</span>
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
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => scrollTo(i)} aria-label={`Slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-lime" : "w-1.5 bg-white/30"}`} />
        ))}
      </div>
    </section>
  );
}