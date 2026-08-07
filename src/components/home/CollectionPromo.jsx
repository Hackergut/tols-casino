import React from "react";
import { Link } from "react-router-dom";
import { Album, ChevronRight } from "lucide-react";

// Homepage feature highlight for "La mia collezione" — set completion vault.
export default function CollectionPromo() {
  return (
    <Link to="/collection" className="group block relative overflow-hidden rounded-2xl border border-lime/30 bg-gradient-to-r from-[#14160c] to-[#0c0c0c] p-4 sm:p-5">
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-lime/10 blur-3xl pointer-events-none" />
      <div className="relative flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl grid place-items-center bg-lime text-black">
          <Album className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest uppercase text-lime">Nuova feature</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white leading-tight">La mia collezione</h3>
          <p className="text-xs text-white/50 mt-0.5">Completa i set tematici, scopri le carte mancanti e monitora il tuo vault.</p>
        </div>
        <div className="shrink-0 flex items-center gap-1 h-9 px-4 rounded-xl bg-lime text-black text-sm font-black group-hover:opacity-90">
          Apri <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}