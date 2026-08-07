import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Crosshair, Target, Gift, Trophy } from "lucide-react";

const IMGS = {
  mega: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/a4f6af45f_IMG_1973.png",
  gauntlet: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/bdced99c6_IMG_1971.png",
  live: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/c02228216_IMG_1976.jpg",
  king: "https://media.base44.com/images/public/6a70afdaacf94647fa24a4a4/bf77160cc_IMG_1974.jpg",
};

function Brand({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-black tracking-widest uppercase ${className}`}>
      <span className="text-white">TOLS</span>
      <span className="text-lime">GAMING</span>
    </span>
  );
}

function PillCta({ label = "PLAY. HIT. WIN.", sub = "ONLY ON TOLS" }) {
  return (
    <span className="inline-flex items-center gap-2 h-9 pl-3 pr-3.5 rounded-full border border-lime bg-black/55 backdrop-blur-sm">
      <Crosshair className="w-4 h-4 text-lime" />
      <span className="text-[13px] font-black tracking-wide">
        <span className="text-white">{label.replace("WIN.", "")}</span><span className="text-lime">WIN.</span>
      </span>
      <span className="text-[9px] text-white/65 font-bold tracking-widest">{sub}</span>
    </span>
  );
}

export default function MegaPromoCards() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      {/* Card 1 — $100,000 TOLS MEGA DROP */}
      <Link to="/tournaments" className="group relative block h-[260px] sm:h-[300px] overflow-hidden rounded-2xl border border-white/15 hover:border-lime/50 transition">
        <Image src={IMGS.mega} fittingType="fill" className="absolute inset-0 w-full h-full transition duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
        <div className="relative z-10 h-full flex flex-col justify-between p-5 sm:p-6">
          <div className="flex justify-end"><Brand /></div>
          <div>
            <h2 className="font-display uppercase leading-[0.92] text-3xl sm:text-5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <span className="text-lime">$100,000</span> <span className="text-white">TOLS</span> <span className="text-lime">MEGA DROP!</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/90 max-w-[80%] drop-shadow">Hit all selected targets for legendary prizes!</p>
          </div>
          <PillCta />
        </div>
      </Link>

      {/* Card 2 — $50,000 ORIGINALS GAUNTLET */}
      <Link to="/games/category/originals" className="group relative block h-[260px] sm:h-[300px] overflow-hidden rounded-2xl border border-white/15 hover:border-lime/50 transition">
        <Image src={IMGS.gauntlet} fittingType="fill" className="absolute inset-0 w-full h-full transition duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/10" />
        <div className="relative z-10 h-full flex flex-col justify-between p-5 sm:p-6">
          <div className="flex justify-end"><Brand /></div>
          <div>
            <h2 className="font-display uppercase leading-[0.92] text-3xl sm:text-5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <span className="text-lime">$50,000</span> <span className="text-white">ORIGINALS</span> <span className="text-lime">GAUNTLET!</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/90 max-w-[80%] drop-shadow">
              Hit all selected targets for <span className="text-lime font-bold">prizes!</span>
            </p>
            <div className="mt-4 flex gap-2.5">
              {[
                { icon: Target, t: "HIT TARGETS", b: "Complete missions" },
                { icon: Gift, t: "EARN REWARDS", b: "Big prizes every day" },
                { icon: Trophy, t: "BE THE LEGEND", b: "Top players. Biggest wins." },
              ].map((f) => (
                <div key={f.t} className="flex-1 rounded-xl border border-lime/40 bg-black/40 backdrop-blur-sm p-2.5 flex flex-col items-center text-center">
                  <f.icon className="w-4 h-4 text-lime mb-1" />
                  <p className="text-[10px] font-black text-white leading-tight">{f.t}</p>
                  <p className="text-[9px] text-white/55 leading-tight mt-0.5">{f.b}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="-mx-5 sm:-mx-6 -mb-5 sm:-mb-6 flex h-10 mt-3">
            <span className="flex items-center gap-1.5 px-4 bg-lime text-black font-black text-xs tracking-wide"><span>&gt;</span> PLAY. HIT. WIN.</span>
            <span className="flex-1 flex items-center px-4 bg-black text-white text-[10px] font-bold tracking-widest">ONLY ON TOLS</span>
          </div>
        </div>
      </Link>

      {/* Card 3 — TOLS LIVE DROP */}
      <Link to="/games/category/live" className="group relative block h-[260px] sm:h-[300px] overflow-hidden rounded-2xl border border-white/15 hover:border-lime/50 transition">
        <Image src={IMGS.live} fittingType="fill" className="absolute inset-0 w-full h-full transition duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
        <div className="relative z-10 h-full flex flex-col justify-between p-5 sm:p-6">
          <div className="flex justify-end"><Brand /></div>
          <div>
            <h2 className="font-display uppercase leading-[0.92] text-3xl sm:text-5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <span className="text-lime">$25,000</span> <span className="text-white">TOLS</span> <span className="text-lime">LIVE DROP!</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/90 max-w-[80%] drop-shadow">Roulette, slots &amp; dice — provably fair, onchain.</p>
          </div>
          <PillCta label="SPIN. WIN. WIN." sub="ONLY ON TOLS" />
        </div>
      </Link>

      {/* Card 4 — KING OF THE TABLE */}
      <Link to="/games/category/table" className="group relative block h-[260px] sm:h-[300px] overflow-hidden rounded-2xl border border-white/15 hover:border-lime/50 transition">
        <Image src={IMGS.king} fittingType="fill" className="absolute inset-0 w-full h-full transition duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
        <div className="relative z-10 h-full flex flex-col justify-between p-5 sm:p-6">
          <div className="flex justify-end"><Brand /></div>
          <div>
            <h2 className="font-display uppercase leading-[0.92] text-3xl sm:text-5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <span className="text-lime">KING</span> <span className="text-white">OF THE</span> <span className="text-lime">TABLE!</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/90 max-w-[80%] drop-shadow">Outplay the house. Rule the tables.</p>
          </div>
          <PillCta label="CLAIM. YOUR. WIN." sub="ONLY ON TOLS" />
        </div>
      </Link>
    </section>
  );
}