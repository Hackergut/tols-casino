import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";

const BANNERS = [
  { prize: "$50,000", title: "ORIGINALS GAUNTLET!", copy: "Hit all selected targets for prizes!", art: "https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/ebd5aec0d_IMG_1873.png" },
  { prize: "$20,000", title: "HACKSAW SHOOTOUT!", copy: "Hit all selected prizes!", art: "https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/10462a619_IMG_1872.png" },
];

export default function HeroBanners() {
  return (
    <div className="grid sm:grid-cols-2 gap-3 h-full">
      {BANNERS.map((banner) => (
        <Link key={banner.title} to="/tournaments" className="group relative min-h-[172px] sm:min-h-[220px] overflow-hidden rounded-xl border border-white/15 bg-card hover:border-lime/50 transition">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent z-10" />
          <Image src={banner.art} fittingType="fill" className="absolute inset-0 w-full h-full opacity-70 grayscale-[25%] group-hover:grayscale-0 group-hover:scale-[1.03] transition duration-500" />
          <div className="relative z-20 p-4 sm:p-5 max-w-[70%]">
            <p className="font-display text-3xl sm:text-4xl leading-none text-lime">{banner.prize}</p>
            <h2 className="font-display text-2xl sm:text-3xl leading-[0.9] uppercase text-white mt-1">{banner.title}</h2>
            <p className="text-xs text-white/70 mt-3 max-w-[160px]">{banner.copy}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}