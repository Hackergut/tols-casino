import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-lime transition mb-6"><ArrowLeft className="w-4 h-4" /> Lobby</Link>
        <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4"><Lock className="w-5 h-5 text-lime" /><span className="text-xs font-black tracking-widest uppercase text-lime">Privacy</span></div>
          <h1 className="text-2xl font-black text-white">Privacy Policy</h1>
          <p className="text-xs text-white/30 mt-1">GDPR compliant · Data controller: TOLS</p>
          <div className="mt-6 space-y-4 text-sm text-white/70 leading-relaxed">
            <p><b className="text-white">Data collected:</b> email, wallet addresses, bet history, device, IP. No private keys — we store only public deposit addresses (HD-derived per user).</p>
            <p><b className="text-white">Purpose:</b> account, payments, anti-fraud, affiliate commissions, support. Legal basis: contract + legitimate interest.</p>
            <p><b className="text-white">Retention:</b> 5 years post-account closure (AML). You may request export/deletion (unless AML retention applies) at <Link to="/contact" className="text-lime underline">/contact</Link>.</p>
            <p><b className="text-white">Cookies:</b> Essential only (auth, wallet). No tracking without consent — see CookieNotice.</p>
            <p><b className="text-white">Subprocessors:</b> Base44 (hosting), CoinGecko (price), RPC providers (LlamaRPC, Solana). No data sold.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
