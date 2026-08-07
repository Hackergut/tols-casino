import React from "react";
import { Link } from "react-router-dom";
import GameArt from "@/components/GameArt";

const BANNERS = [
  { eyebrow: "INSTANT", title: "VIP MATCH", copy: "Bring your VIP status and unlock TOLS rewards.", cta: "MATCH STATUS", to: "/vip", slug: "dice" },
  { eyebrow: "TOLS", title: "ORIGINALS", copy: "Provably fair games built for transparent play.", cta: "PLAY NOW", to: "/games/category/originals", slug: "crash" },
  { eyebrow: "EARN", title: "MORE REWARDS", copy: "Invite players and grow your affiliate rewards.", cta: "REFER & EARN", to: "/affiliate", slug: "plinko" },
];

export default function HeroBanners() {
  return (
    <div className="grid md:grid-cols-3 gap-3">
      {BANNERS.map((banner) => <Link key={banner.title} to={banner.to} className="group relative min-h-[190px] overflow-hidden rounded-xl border border-white/15 bg-card hover:border-lime/50">
        <GameArt slug={banner.slug} className="absolute inset-0 opacity-65 group-hover:scale-[1.03] transition duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/5" />
        <div className="relative z-10 flex h-full min-h-[190px] flex-col items-start p-5 max-w-[72%]">
          <p className="font-display text-xl leading-none text-white">{banner.eyebrow}</p>
          <h2 className="font-display text-3xl leading-[0.9] text-lime uppercase">{banner.title}</h2>
          <p className="mt-3 text-xs leading-relaxed text-white/65">{banner.copy}</p>
          <span className="mt-auto pt-4 text-[10px] font-black tracking-wide text-white">{banner.cta}</span>
        </div>
      </Link>)}
    </div>
  );
}