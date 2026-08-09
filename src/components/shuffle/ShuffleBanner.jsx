import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const BANNERS = [
  { id: 1, title: "THE LEVEL UP!", subtitle: "Up to $50K Daily", color: "#00e701", accent: "#bfff00", to: "/tournaments", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=400&fit=crop" },
  { id: 2, title: "20K CLUTCH UP", subtitle: "Weekly Sports Challenge", color: "#ff4d00", accent: "#ff8a00", to: "/tournaments", image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&h=400&fit=crop" },
  { id: 3, title: "$1M WEEKLY AIRDROP", subtitle: "Shuffle Airdrop is Live", color: "#00d4ff", accent: "#a3ff12", to: "/vip", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=400&fit=crop" },
  { id: 4, title: "$100K WEEKLY RACE", subtitle: "Compete & Win Big", color: "#ffcc00", accent: "#ff9500", to: "/tournaments", image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=400&fit=crop" },
];

export default function ShuffleBanner() {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  useEffect(() => {
    timer.current = setInterval(() => setIdx((i) => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(timer.current);
  }, []);
  const go = (dir) => setIdx((i) => (i + dir + BANNERS.length) % BANNERS.length);
  const b = BANNERS[idx];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121212] group">
      <div className="relative h-[160px] sm:h-[220px] lg:h-[280px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10" />
        <img src={b.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-[1.02] transition duration-700" />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-10 max-w-[55%]">
          <p className="text-[10px] sm:text-xs font-black tracking-[0.2em] text-white/50 uppercase">Featured Promotion</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black italic tracking-tighter text-white leading-none mt-1" style={{ textShadow: `0 0 30px ${b.color}66` }}>{b.title}</h2>
          <p className="text-sm sm:text-base font-bold text-white/70 mt-1">{b.subtitle}</p>
          <Link to={b.to} className="mt-4 inline-flex h-9 px-5 items-center rounded-full bg-white text-black text-sm font-black hover:bg-lime transition w-fit">Join Now</Link>
        </div>
        {/* dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/30"}`} />
          ))}
        </div>
        <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 grid place-items-center rounded-full bg-black/50 border border-white/10 text-white/70 hover:bg-white hover:text-black transition opacity-0 group-hover:opacity-100"><ChevronLeft className="w-4 h-4" /></button>
        <button onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 grid place-items-center rounded-full bg-black/50 border border-white/10 text-white/70 hover:bg-white hover:text-black transition opacity-0 group-hover:opacity-100"><ChevronRight className="w-4 h-4" /></button>
      </div>
      {/* Shuffle mini promo strip like original */}
      <div className="hidden lg:flex gap-2 p-2 bg-[#0a0a0a] border-t border-white/5">
        {BANNERS.slice(0, 4).map((x, i) => (
          <button key={x.id} onClick={() => setIdx(i)} className={`flex-1 h-[52px] rounded-xl overflow-hidden relative border ${i === idx ? "border-lime/50" : "border-white/5"} hover:border-white/10 transition`}>
            <img src={x.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
            <span className="absolute inset-0 flex items-center px-3 text-[11px] font-black text-white tracking-wide">{x.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
