import React from "react";
import { Image } from "@/components/ui/image";
import { Sparkles, Zap, ArrowRight } from "lucide-react";

export default function HeroBanners() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      <Banner
        badge="$50,000"
        title="ORIGINALS GAUNTLET"
        subtitle="Hit all selected targets for prizes!"
        icon={<Sparkles className="w-5 h-5" />}
        accent="#ccff00"
        art="https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/ebd5aec0d_IMG_1873.png"
      />
      <Banner
        badge="$20,000"
        title="HACKSAW SHOOTOUT"
        subtitle="Hit all selected prizes!"
        icon={<Zap className="w-5 h-5" />}
        accent="#ff4f6a"
        art="https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/10462a619_IMG_1872.png"
      />
    </div>
  );
}

function Banner({ badge, title, subtitle, icon, art, accent }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#161616] to-[#0d0d0d] min-h-[180px] sm:min-h-[220px] hover:border-lime/30 transition"
    >
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div
        className="absolute -left-10 -top-10 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: accent }}
      />
      <div className="relative h-full flex items-center justify-between p-5 sm:p-8">
        <div className="space-y-3 max-w-[55%] z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime text-black font-black text-sm shadow-lg glow-lime">
            {icon} {badge}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-none">
            <span className="text-white">{title.split(" ")[0]} </span>
            <span className="text-lime">{title.split(" ").slice(1).join(" ")}</span>
          </h2>
          <p className="text-white/60 text-sm sm:text-base font-medium">{subtitle}</p>
          <button className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-lime hover:text-black hover:border-lime transition group/btn">
            Join now <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition" />
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-[45%] opacity-60 group-hover:opacity-95 transition duration-500">
          <Image src={art} fittingType="fit" className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-500" />
        </div>
      </div>
    </div>
  );
}