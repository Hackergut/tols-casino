import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, ShieldCheck } from "lucide-react";

/**
 * Rolly-style hero: centered uppercase headline with the lime accent on the
 * last line, ZK/no-KYC subtext, a single "Join beta" CTA, faint orbital glow
 * and two floating "poker chip" discs. Sits on the global navy radial bg.
 */
export default function RollyHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0e22]/40 px-6 py-14 sm:py-20 text-center">
      {/* orbital glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[460px] h-[460px] max-w-[90vw] max-h-[90vw] rounded-full border border-lime/10" />
        <div className="absolute w-[280px] h-[280px] rounded-full bg-lime/5 blur-3xl" />
      </div>

      {/* floating chips (desktop only) */}
      <motion.div
        className="hidden sm:block absolute left-[7%] top-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-lime/20"
        style={{ background: "radial-gradient(circle at 35% 30%, #2a3a7a 0%, #0a0e22 70%)" }}
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/15" />
      </motion.div>
      <motion.div
        className="hidden sm:block absolute right-[7%] top-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-lime/20"
        style={{ background: "radial-gradient(circle at 35% 30%, #2a3a7a 0%, #0a0e22 70%)" }}
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/15" />
      </motion.div>

      <div className="relative z-10 max-w-3xl mx-auto space-y-5">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05] uppercase">
          <span className="block text-white">First casino that</span>
          <span className="block text-white">can prove it has</span>
          <span className="block text-lime glow-lime">nothing to hide</span>
        </h1>
        <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto">
          TOLS is a ZK-powered crypto casino offering non-custodial, no-KYC access to Tier-1 providers, live games and TOLS Originals.
        </p>
        <div className="flex items-center justify-center gap-3 pt-1">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-lime text-black font-black uppercase tracking-wide hover:opacity-90 transition glow-lime"
          >
            <Wallet className="w-4 h-4" /> Join beta
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-white/40">
            <ShieldCheck className="w-4 h-4 text-lime/70" /> Provably fair
          </span>
        </div>
      </div>
    </section>
  );
}