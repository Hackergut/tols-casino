import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { X, ChevronRight, ChevronLeft, Wallet, ShieldCheck, Crown, Sparkles, ArrowDownToLine } from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    color: "#ccff00",
    title: "Welcome to TOLS",
    body: "Your provably fair crypto casino. We've credited 1,000 USDT in demo balance so you can explore the platform risk-free. Play, win and level up!",
    cta: null,
  },
  {
    icon: Wallet,
    color: "#4f8aff",
    title: "Deposit and manage balance",
    body: "Your balance is shown top-right. In real mode you connect your crypto wallet (Solana, Polygon, Ethereum). Use the withdrawal icon to cash out your winnings on-chain anytime.",
    cta: { label: "Go to Wallet", to: "/wallet" },
  },
  {
    icon: ShieldCheck,
    color: "#ccff00",
    title: "Provably Fair Games",
    body: "TOLS Originals (Dice, Crash, Plinko, Mines…) use verifiable server seed + client nonce: every result is checkable and impossible to tamper with. Bet with full transparency.",
    cta: { label: "Try the Originals", to: "/?cat=originals" },
  },
  {
    icon: Crown,
    color: "#d4a01a",
    title: "Unlock VIP benefits",
    body: "The more you bet, the higher you climb: from Bronze to Diamond. Get cashback, XP multipliers, level-up bonuses and a dedicated host. Track your progress in the VIP section.",
    cta: { label: "Explore VIP", to: "/vip" },
  },
];

export default function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // mostra a utenti autenticati che non hanno ancora visto il tour
    if (localStorage.getItem("tols_onboarding_done")) return;
    base44.auth.me().then(() => setOpen(true)).catch(() => {});
  }, []);

  const close = () => {
    localStorage.setItem("tols_onboarding_done", "1");
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else close();
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  if (!open) return null;
  const s = STEPS[step];
  const Icon = s.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={close} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#111] shadow-2xl overflow-hidden">
        {/* glow header */}
        <div className="h-1.5 w-full" style={{ backgroundColor: s.color, boxShadow: `0 0 24px ${s.color}` }} />
        <button onClick={close} className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition">
          <X className="w-4 h-4" />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${s.color}1a`, border: `1px solid ${s.color}40` }}>
              <Icon className="w-8 h-8" style={{ color: s.color }} />
            </div>
          </div>

          <div className="text-center mb-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Step {step + 1} of {STEPS.length}</span>
            <h2 className="text-xl font-black text-white mt-1">{s.title}</h2>
          </div>

          <p className="text-sm text-white/60 leading-relaxed text-center mb-6">{s.body}</p>

          {/* progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === step ? 24 : 6,
                  backgroundColor: i === step ? s.color : "#ffffff20",
                }}
              />
            ))}
          </div>

          {/* CTA link */}
          {s.cta && (
            <div className="mb-4">
              <Link
                to={s.cta.to}
                onClick={close}
                className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-lime text-black text-sm font-black hover:opacity-90 transition"
              >
                {s.cta.label} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* nav buttons */}
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <button onClick={prev} className="flex items-center gap-1 px-4 h-10 rounded-xl border border-white/10 text-sm font-bold text-white/70 hover:text-white hover:bg-white/5 transition">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button onClick={close} className="px-4 h-10 rounded-xl text-sm font-bold text-white/40 hover:text-white/70 transition">
                Skip
              </button>
            )}
            <button
              onClick={next}
              className="flex items-center justify-center gap-1 px-5 h-10 rounded-xl bg-[#1a1a1a] border border-white/10 text-sm font-bold text-white hover:border-lime/40 hover:text-lime transition ml-auto"
            >
              {isLast ? "Start playing" : "Next"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}