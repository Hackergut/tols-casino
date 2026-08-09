import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/client";
import { loadJackpot } from "@/lib/jackpot";

function useJackpot() {
  const [amount, setAmount] = useState(null);
  useEffect(() => {
    let active = true;
    loadJackpot()
      .then((p) => active && setAmount(p.amount))
      .catch(() => {});
    const unsub = base44.entities.GlobalJackpot.subscribe((e) => {
      if (e && e.data && typeof e.data.amount === "number") setAmount(e.data.amount);
    });
    return () => { active = false; unsub && unsub(); };
  }, []);
  return amount;
}

// Digit-roll ticker like jackpot.bet's GLOBAL POT counter
function Digits({ value }) {
  const str = value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <span className="flex items-center justify-center tabular-nums">
      <span className="text-lime/70 mr-0.5">$</span>
      {str.split("").map((c, i) => (
        <span
          key={i}
          className={c === "," || c === "." ? "text-lime/50 px-[1px]" : "text-lime"}
          style={c === "," || c === "." ? undefined : { animation: "popIn 0.35s both", animationDelay: `${i * 25}ms` }}
        >
          {c}
        </span>
      ))}
    </span>
  );
}

export default function JackpotTicker({ variant = "sidebar" }) {
  const amount = useJackpot();

  if (variant === "card") {
    return (
      <Link
        to="/tournaments"
        className="relative flex flex-col items-center justify-center h-40 sm:h-44 rounded-2xl border border-lime/25 overflow-hidden shrink-0 w-[280px] sm:w-[340px] group"
        style={{ background: "radial-gradient(120% 100% at 50% 0%, #23290a 0%, #121208 55%, #0a0a06 100%)" }}
      >
        <div className="absolute inset-0 bg-grid opacity-10" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime/60">Global Pot</p>
        <div className="text-3xl sm:text-4xl font-black mt-1">
          {amount === null ? <span className="text-lime/40">—</span> : <Digits value={amount} />}
        </div>
        <p className="text-[11px] text-white/45 mt-2 px-6 text-center">Play any game for a chance to win the Global Pot</p>
        <span className="text-[10px] font-bold text-lime/70 mt-1 group-hover:underline">Click to learn more</span>
      </Link>
    );
  }

  return (
    <Link
      to="/tournaments"
      className="block rounded-xl border border-lime/20 bg-lime/[0.06] px-3 py-2.5 text-center hover:border-lime/40 transition"
    >
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Global Pot</p>
      <div className="text-lg font-black mt-0.5">
        {amount === null ? <span className="text-lime/40">—</span> : <Digits value={amount} />}
      </div>
    </Link>
  );
}