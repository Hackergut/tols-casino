import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CARDS = [
  {
    kicker: "WELCOME OFFER",
    title: "100% UP TO",
    highlight: "1 BTC",
    sub: "+ 200 FREE SPINS",
    cta: "Claim Bonus",
    to: "/vip",
    accent: "#ccff00",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop", // F1 race car green
    dark: "from-black/90 via-black/40 to-transparent",
  },
  {
    kicker: "VIP PROGRAM",
    title: "UP TO 30%",
    highlight: "WEEKLY RAKEBACK",
    sub: "Unlock VIP Benefits",
    cta: "Learn More",
    to: "/vip",
    accent: "#ccff00",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=400&fit=crop", // abstract dark
    dark: "from-black/90 via-black/50 to-transparent",
  },
  {
    kicker: "TOURNAMENT",
    title: "$100,000",
    highlight: "WEEKLY RACE",
    sub: "Compete & Win Big",
    cta: "Join Now",
    to: "/tournaments",
    accent: "#ccff00",
    image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&h=400&fit=crop", // trophy
    dark: "from-black/90 via-black/40 to-transparent",
  },
  {
    kicker: "EXCLUSIVE",
    title: "25%",
    highlight: "CASHBACK",
    sub: "Every Deposit, Every Week",
    cta: "Claim Now",
    to: "/vip",
    accent: "#ccff00",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&h=400&fit=crop", // safe/vault
    dark: "from-black/90 via-black/40 to-transparent",
  },
];

export default function TolsHero() {
  return (
    <div className="relative">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.06 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {CARDS.map((c, i) => (
        <motion.div key={c.kicker} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16,1,0.3,1] }} className="snap-start shrink-0 w-[85vw] sm:w-auto">
          <Link
          to={c.to}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#121212] h-[140px] sm:h-[180px] w-full flex flex-col justify-between p-4 hover:border-lime/30 transition"
        >
          <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-[1.03] transition duration-700" />
          <div className={`absolute inset-0 bg-gradient-to-r ${c.dark}`} />
          <div className="relative">
            <span className="inline-flex px-2 py-1 rounded bg-white/10 border border-white/10 text-[10px] sm:text-[10px] font-black tracking-widest text-white/60">{c.kicker}</span>
            <h3 className="mt-2 text-[22px] font-black leading-none tracking-tighter text-white">
              <span className="font-display uppercase">{c.title}</span> <span className="text-lime font-display uppercase" style={{ textShadow: "0 0 20px rgba(204,255,0,0.4)" }}>{c.highlight}</span>
            </h3>
            <p className="text-xs font-bold text-white/60 mt-1">{c.sub}</p>
          </div>
          <span className="relative inline-flex h-8 px-4 items-center rounded-full bg-lime text-black text-xs font-black w-fit group-hover:brightness-110 transition">{c.cta}</span>
        </Link>
        </motion.div>
      ))}
      </motion.div>
      {/* Dots like preview */}
      <div className="flex justify-center gap-1.5 mt-3">
        <span className="w-3 h-1.5 rounded-full bg-lime" />
        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
      </div>
      {/* Arrows like preview */}
      <button className="hidden lg:grid place-items-center absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white/60 hover:bg-white hover:text-black transition"><span>‹</span></button>
      <button className="hidden lg:grid place-items-center absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white/60 hover:bg-white hover:text-black transition"><span>›</span></button>
    </div>
  );
}
