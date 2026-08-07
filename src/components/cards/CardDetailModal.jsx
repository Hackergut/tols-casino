import React, { useState } from "react";
import { ArrowLeft, X, ShieldCheck, Copy, ChevronDown, Check } from "lucide-react";
import CardVisual from "@/components/cards/CardVisual";
import { rarityColor, rarityLabel } from "@/lib/packs";

// Full-screen card detail view — matches the graded-card reference design:
// black bg, slabbed card carousel, authenticity + New badge, insured value /
// rarity metric boxes, collapsible grading section.
export default function CardDetailModal({ card, onClose }) {
  const [side, setSide] = useState("front");
  const [openGrading, setOpenGrading] = useState(true);
  const [copied, setCopied] = useState(false);
  if (!card) return null;
  const color = rarityColor(card.rarity);

  const copyToken = () => {
    try { navigator.clipboard.writeText(card.token_id || ""); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}>
        <button onClick={onClose} className="flex items-center gap-2 h-9 px-4 rounded-full border border-white/20 text-sm font-semibold text-white hover:bg-white/5"><ArrowLeft className="w-4 h-4" /> Back</button>
        <button onClick={onClose} className="grid place-items-center w-9 h-9 rounded-full border border-white/20 text-white/70 hover:bg-white/5"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 max-w-md w-full mx-auto">
        {/* Carousel */}
        <div className="flex flex-col items-center pt-2 pb-3">
          <div className="w-60"><CardVisual card={card} side={side} className="mx-auto" /></div>
          <div className="flex items-center gap-2 mt-4">
            <button onClick={() => setSide("front")} className={`h-1.5 rounded-full transition ${side === "front" ? "w-8 bg-white" : "w-5 bg-white/25"}`} />
            <button onClick={() => setSide("back")} className={`h-1.5 rounded-full transition ${side === "back" ? "w-8 bg-white" : "w-5 bg-white/25"}`} />
          </div>
        </div>

        {/* Authenticity + New badge */}
        <div className="flex items-center gap-2 mt-2">
          <ShieldCheck className="w-4 h-4 text-white/40" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Guaranteed Authenticity</span>
          {card.is_new && <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded bg-lime text-black">New</span>}
        </div>

        <h2 className="text-2xl font-black text-white leading-tight mt-2">{card.card_name}</h2>
        <p className="text-xs text-white/40 mt-0.5">{card.collection} · {card.pack_name}</p>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl bg-[#1a1a1a] p-4">
            <div className="text-[10px] font-bold uppercase text-white/40 mb-1">Insured Value</div>
            <div className="text-2xl font-black text-white tabular-nums">${Number(card.insured_value || 0).toLocaleString()}</div>
            <button onClick={copyToken} className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-white/40 hover:text-white/70">
              <span className="truncate max-w-[120px]">Token ID: {card.token_id?.slice(0, 6)}…{card.token_id?.slice(-4)}</span>
              {copied ? <Check className="w-3 h-3 text-lime" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="rounded-2xl bg-[#1a1a1a] p-4 flex flex-col">
            <div className="text-[10px] font-bold uppercase text-white/40 mb-1">Rarity</div>
            <div className="flex items-center">
              <span className="px-3 py-1 rounded-full text-sm font-black text-white" style={{ background: color }}>{rarityLabel(card.rarity)}</span>
            </div>
            <div className="mt-auto text-[10px] text-white/40">Pull #{card.grading_id}</div>
          </div>
        </div>

        {/* Grading accordion */}
        <button onClick={() => setOpenGrading((v) => !v)} className="w-full mt-4 flex items-center justify-between py-3">
          <span className="text-base font-black text-white">Grading</span>
          <ChevronDown className={`w-5 h-5 text-white/50 transition ${openGrading ? "rotate-180" : ""}`} />
        </button>
        {openGrading && (
          <div className="rounded-2xl bg-[#1a1a1a] divide-y divide-white/5">
            <Row label="Grading company" value={card.grading_company || "PSA"} />
            <Row label="Grading ID" value={card.grading_id} />
            <Row label="Token ID" value={card.token_id} mono />
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-white/45">{label}</span>
      <span className={`text-sm font-semibold text-white ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}