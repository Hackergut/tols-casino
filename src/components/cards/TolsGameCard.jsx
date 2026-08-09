import React from "react";
import { Link } from "react-router-dom";
import { Lock, ExternalLink } from "lucide-react";

const VISUALS = {
  limbo: { bg: "radial-gradient(80% 60% at 50% 0%, #1a1a1a 0%, #080808 80%)", accent: "#fff", decor: "limbo" },
  plinko: { bg: "radial-gradient(60% 50% at 50% 30%, #1a2a1a 0%, #080808 80%)", accent: "#fff", decor: "plinko" },
  mines: { bg: "radial-gradient(60% 50% at 50% 30%, #0f1a0f 0%, #080808 80%)", accent: "#ccff00", decor: "mines" },
  dice: { bg: "radial-gradient(60% 50% at 50% 30%, #1a1a1a 0%, #080808 80%)", accent: "#fff", decor: "dice" },
  keno: { bg: "radial-gradient(60% 50% at 50% 30%, #0f0f0f 0%, #080808 80%)", accent: "#fff", decor: "keno" },
  wheel: { bg: "radial-gradient(60% 50% at 50% 30%, #1a1a0a 0%, #080808 80%)", accent: "#fff", decor: "wheel" },
  crash: { bg: "radial-gradient(60% 50% at 50% 0%, #1a0f0f 0%, #080808 80%)", accent: "#ff4f2a", decor: "crash" },
  coinflip: { bg: "radial-gradient(60% 50% at 50% 30%, #1a1a1a 0%, #080808 80%)", accent: "#ccff00", decor: "coinflip" },
  slide: { bg: "#080808", accent: "#fff", decor: "slide" },
  blitz: { bg: "#080808", accent: "#fff", decor: "blitz" },
  hilo: { bg: "#080808", accent: "#fff", decor: "hilo" },
  tower: { bg: "#080808", accent: "#fff", decor: "tower" },
  chicken: { bg: "#080808", accent: "#fff", decor: "chicken" },
};

function Decor({ type }) {
  if (type === "limbo") return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="w-20 h-28 rounded-t-full border-2 border-white/10 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
        <div className="absolute bottom-0 inset-x-0 h-8 bg-[#0a0a0a] flex items-end justify-center pb-1">
          <div className="w-3 h-6 bg-black rounded-full" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-lime/20 blur-xl" />
      </div>
      <div className="mt-2 flex gap-1">
        {Array.from({length: 8}).map((_,i)=> <div key={i} className="w-2 h-2 rounded-full bg-lime/80" />)}
      </div>
    </div>
  );
  if (type === "plinko") return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pt-4">
      {Array.from({length: 6}).map((_,r)=> (
        <div key={r} className="flex gap-2">
          {Array.from({length: 6 - r}).map((_,c)=> <div key={c} className="w-1.5 h-1.5 rounded-full bg-lime/70" />)}
        </div>
      ))}
      <div className="w-16 h-6 rounded bg-gradient-to-b from-white/10 to-transparent mt-1 border border-white/5" />
    </div>
  );
  if (type === "mines") return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-16 h-16 rotate-45 bg-gradient-to-br from-lime via-green-400 to-green-600 rounded-lg shadow-[0_0_20px_rgba(204,255,0,0.5)] border border-white/20 flex items-center justify-center">
        <div className="w-8 h-8 bg-white/20 rounded rotate-12" />
      </div>
    </div>
  );
  if (type === "dice") return (
    <div className="absolute inset-0 flex items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-white border-2 border-white/20 grid grid-cols-2 gap-1 p-2 rotate-3 shadow-lg">
        <div className="w-2 h-2 rounded-full bg-black" /><div className="w-2 h-2 rounded-full bg-black" /><div className="w-2 h-2 rounded-full bg-black" /><div className="w-2 h-2 rounded-full bg-black" /><div className="w-2 h-2 rounded-full bg-black col-span-2 mx-auto" />
      </div>
      <div className="w-10 h-10 rounded-lg bg-white border-2 border-white/20 grid place-items-center -rotate-6 shadow-lg">
        <div className="w-3 h-3 rounded-full bg-black" /><div className="w-3 h-3 rounded-full bg-black" />
      </div>
    </div>
  );
  if (type === "keno") return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-black border-2 border-white/10 flex items-center justify-center relative">
        <span className="text-2xl font-black text-white">7</span>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-lime flex items-center justify-center text-[10px] font-black text-black">K</div>
      </div>
    </div>
  );
  if (type === "wheel") return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-20 h-20 rounded-full border-4 border-white/10 bg-conic from-lime via-yellow-400 to-lime relative overflow-hidden">
        <div className="absolute inset-2 rounded-full bg-[#121212] flex items-center justify-center">
          <span className="w-8 h-8 rounded-full bg-lime text-black grid place-items-center font-black text-sm">T</span>
        </div>
      </div>
    </div>
  );
  return <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />;
}

export default function TolsGameCard({ game }) {
  const soon = game.playable === false;
  const v = VISUALS[game.slug] || { bg: "#080808", accent: "#fff", decor: "generic" };
  const isLimeTitle = game.slug === "mines";
  return (
    <Link
      to={`/game/${game.slug}`}
      className="group relative block aspect-[3/4] rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/[0.06] hover:border-white/15 hover:-translate-y-0.5 transition duration-200"
      style={{ background: v.bg }}
    >
      <Decor type={v.decor} />
      <div className="absolute top-2 right-2 w-7 h-7 grid place-items-center rounded-full bg-black/60 border border-white/10 text-white/60 opacity-0 group-hover:opacity-100 transition">
        <ExternalLink className="w-3.5 h-3.5" />
      </div>
      {soon && (
        <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 text-[9px] font-bold text-white/60 border border-white/10">
          <Lock className="w-2.5 h-2.5" /> SOON
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <h3 className="text-[18px] font-black tracking-tighter leading-none" style={{ color: isLimeTitle ? v.accent : "#fff", fontFamily: "Archivo Black, Inter, sans-serif", textShadow: "0 1px 0 rgba(0,0,0,0.8)" }}>
          {game.name.toUpperCase()}
        </h3>
        <p className="text-[10px] font-bold tracking-widest text-lime/80 mt-1 flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-lime text-black grid place-items-center text-[8px] font-black">T</span> TOLS Originals
        </p>
      </div>
    </Link>
  );
}
