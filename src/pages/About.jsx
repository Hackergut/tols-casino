import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Zap, Coins, Trophy, Users, Layers } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-lime transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Lobby
        </Link>

        <article className="prose-invert max-w-none">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime/10 border border-lime/30 text-xs font-bold text-lime mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Provably Fair · On-Chain
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            About <span className="text-lime">TOLS</span> Crypto Casino
          </h1>

          <p className="mt-5 text-white/70 leading-relaxed">
            TOLS is a next-generation cryptocurrency casino engine built for players who want speed,
            transparency, and verifiably fair gameplay. Our platform combines original in-house games —
            Dice, Crash, Plinko, Mines, Limbo, Wheel, Coinflip and Keno — with a curated catalog of slot
            titles from leading iGaming providers, all playable in both demo and real-money mode. Every bet
            is backed by a provably fair seed system, so players can independently verify that outcomes were
            never tampered with.
          </p>

          <p className="mt-4 text-white/70 leading-relaxed">
            Deposits and withdrawals settle on-chain across Solana, Ethereum and Polygon, with balances
            credited in USDT at live market rates after confirmation. A built-in VIP program rewards wagering
            volume with tiered rakeback and level-up bonuses, while tournaments, a live community chat and a
            full affiliate dashboard keep the ecosystem active and rewarding for everyone involved.
          </p>

          <p className="mt-4 text-white/70 leading-relaxed">
            TOLS is built for crypto-native players, affiliates and community-first gamblers who value
            verifiable fairness, instant settlement and a polished neon-tech experience. Whether you are
            here to grind the original games, explore provider slots, climb the leaderboard in a tournament,
            or earn commission through referrals, the platform is designed to be transparent, fast and fun.
          </p>

          <p className="mt-4 text-white/70 leading-relaxed">
            The platform is developed and maintained by the TOLS team, an independent group of engineers and
            designers focused on building a transparent, white-label crypto casino engine that any operator
            can deploy and customize. We are committed to responsible gaming, open fairness, and a
            community-driven roadmap.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <Feature icon={<Zap className="w-5 h-5" />} title="Instant" sub="On-chain settlements" />
            <Feature icon={<Coins className="w-5 h-5" />} title="Multi-chain" sub="SOL · ETH · POL" />
            <Feature icon={<Trophy className="w-5 h-5" />} title="Tournaments" sub="Daily & weekly" />
            <Feature icon={<Users className="w-5 h-5" />} title="Affiliate" sub="Revshare & CPA" />
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-[#111] p-5 flex items-center gap-3">
            <Layers className="w-6 h-6 text-lime shrink-0" />
            <p className="text-sm text-white/60">
              Questions or feedback? Visit our <Link to="/contact" className="text-lime font-bold hover:underline">Contact page</Link>.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

function Feature({ icon, title, sub }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111] p-4">
      <div className="w-9 h-9 rounded-lg bg-lime/10 flex items-center justify-center text-lime mb-2">{icon}</div>
      <p className="text-sm font-black text-white">{title}</p>
      <p className="text-xs text-white/40 mt-0.5">{sub}</p>
    </div>
  );
}