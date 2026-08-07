import React from "react";
import HeroBanners from "@/components/HeroBanners";

export default function RollyHero() {
  return (
    <section className="grid lg:grid-cols-[280px_1fr] xl:grid-cols-[340px_1fr] gap-5 items-stretch pt-2">
      <div className="hidden lg:flex items-center justify-start overflow-hidden">
        <span className="font-display text-[132px] xl:text-[164px] leading-[0.72] tracking-[-0.09em] text-lime uppercase [writing-mode:vertical-rl] rotate-180">
          TOLS
        </span>
      </div>
      <div className="min-w-0">
        <div className="lg:hidden mb-5 font-display text-7xl sm:text-8xl leading-none tracking-[-0.08em] text-lime">TOLS</div>
        <HeroBanners />
      </div>
    </section>
  );
}