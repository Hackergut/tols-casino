import React from "react";
import { ShieldCheck, ExternalLink } from "lucide-react";

export default function DemoSlotPlayer({ slot }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <h1 className="text-2xl font-black tracking-tight text-white">
          <span className="text-lime">{slot.name}</span>
        </h1>
        <span className="text-xs text-white/40 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-lime" /> Demo mode · {slot.provider}
        </span>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black overflow-hidden">
        <div className="aspect-video w-full relative">
          <iframe
            src={slot.demo_url}
            title={slot.name}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      </div>
      <p className="text-xs text-white/30 mt-3 flex items-center gap-1.5">
        <ExternalLink className="w-3.5 h-3.5" /> Demo fornita da iGaming.tools · gioco con saldo fittizio
      </p>
    </div>
  );
}