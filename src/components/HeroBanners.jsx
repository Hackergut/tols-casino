import React from "react";
import { Image } from "@/components/ui/image";
import { Sparkles, Zap } from "lucide-react";

export default function HeroBanners() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      <Banner
        badge="$50,000"
        title="ORIGINALS GAUNTLET"
        subtitle="Hit all selected targets for prizes!"
        icon={<Sparkles className="w-5 h-5" />}
        art="https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/ebd5aec0d_IMG_1873.png"
      />
      <Banner
        badge="$20,000"
        title="HACKSAW SHOOTOUT"
        subtitle="Hit all selected prizes!"
        icon={<Zap className="w-5 h-5" />}
        art="https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/10462a619_IMG_1872.png"
      />
    </div>
  );
}

function Banner({ badge, title, subtitle, icon, art }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#161616] to-[#0d0d0d] min-h-[180px] sm:min-h-[220px] hover:border-lime/30 transition">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="relative h-full flex items-center justify-between p-5 sm:p-8">
        <div className="space-y-3 max-w-[55%]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime text-black font-black text-sm">
            {icon} {badge}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-none">
            <span className="text-white">{title.split(" ")[0]} </span>
            <span className="text-lime">{title.split(" ").slice(1).join(" ")}</span>
          </h2>
          <p className="text-white/60 text-sm sm:text-base font-medium">{subtitle}</p>
          <button className="mt-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-lime hover:text-black hover:border-lime transition">
            Join now →
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-[45%] opacity-60 group-hover:opacity-90 transition">
          <Image src={art} fittingType="fit" className="w-full h-full object-contain p-2" />
        </div>
      </div>
    </div>
  );
}