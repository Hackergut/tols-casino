import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Award } from "lucide-react";

export default function License() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-lime transition mb-6"><ArrowLeft className="w-4 h-4" /> Lobby</Link>
        <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-6 sm:p-8 text-center">
          <Award className="w-12 h-12 text-lime mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white">Curaçao Gaming License</h1>
          <p className="text-sm text-white/60 mt-2">TOLS operates under application to the Curaçao Gaming Control Board.</p>
          <div className="mt-6 rounded-xl bg-[#080808] border border-white/10 p-4 text-left">
            <p className="text-xs font-bold text-white/40 uppercase">License placeholder</p>
            <p className="text-sm font-mono text-white mt-1">GCB-2026-TOLS-001 (pending issuance)</p>
            <p className="text-xs text-white/30 mt-2">Display the official seal here once issued. Until then, operate in demo/test mode only in restricted jurisdictions.</p>
          </div>
          <p className="text-xs text-white/30 mt-6">18+ · Gamble responsibly · <Link to="/responsible-gaming" className="text-lime underline">Limits & self-exclusion</Link></p>
        </div>
      </div>
    </div>
  );
}
