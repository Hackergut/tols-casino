import React from "react";
import { Flame, Gift, Loader2 } from "lucide-react";
import { useDailyStreak } from "@/hooks/useDailyStreak";

const DAYS = [
  { day: 1, reward: 5 },
  { day: 2, reward: 10 },
  { day: 3, reward: 15 },
  { day: 4, reward: 20 },
  { day: 5, reward: 25 },
  { day: 6, reward: 30 },
  { day: 7, reward: 50 },
];

export default function DailyStreakWidget() {
  const { data, loading, claiming, claim, toast } = useDailyStreak();
  if (loading || !data) return null;

  const streak = Math.max(0, data.streak || 0);
  const nextDay = Math.min(7, data.nextDay || 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1608] via-[#121212] to-[#0a0a0a] p-4 sm:p-5 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="relative flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-400/30 grid place-items-center">
            <Flame className="w-5 h-5 text-orange-300" />
          </div>
          <div>
            <h3 className="font-black text-white text-base sm:text-lg leading-none">Daily streak</h3>
            <p className="text-xs text-white/50 mt-1">
              {data.claimedToday
                ? `Come back tomorrow · ${streak}-day streak`
                : `Claim day ${nextDay} reward · ${streak}-day streak`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Next reward</p>
          <p className="text-xl font-black text-lime tabular-nums">+{data.nextReward} <span className="text-xs text-white/40">USDT</span></p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mt-4">
        {DAYS.map((d) => {
          const done = d.day <= streak;
          const isNext = !data.claimedToday && d.day === nextDay;
          return (
            <div
              key={d.day}
              className={`relative rounded-xl border px-1 py-2 text-center transition ${
                done
                  ? "bg-lime/15 border-lime/40"
                  : isNext
                    ? "bg-orange-500/10 border-orange-400/50 shadow-[0_0_24px_-8px_rgba(255,160,60,0.6)]"
                    : "bg-[#0a0a0a] border-white/10"
              }`}
            >
              <p className={`text-[10px] font-bold ${done ? "text-lime" : isNext ? "text-orange-200" : "text-white/40"}`}>D{d.day}</p>
              <Gift className={`w-3.5 h-3.5 mx-auto mt-1 ${done ? "text-lime" : isNext ? "text-orange-300" : "text-white/25"}`} />
              <p className={`text-[10px] font-black mt-1 tabular-nums ${done ? "text-lime" : "text-white/55"}`}>${d.reward}</p>
              {done && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-lime text-black text-[8px] grid place-items-center font-black">✓</span>}
            </div>
          );
        })}
      </div>

      <button
        onClick={claim}
        disabled={!data.canClaim || claiming}
        className="mt-4 w-full h-12 rounded-xl bg-lime text-black font-black uppercase tracking-wide text-sm hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-lime"
      >
        {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
        {data.claimedToday ? "Claimed today" : `Claim $${data.nextReward}`}
      </button>

      {toast && (
        <p className={`text-xs text-center mt-2 ${toast.ok ? "text-lime" : "text-red-300"}`}>{toast.text}</p>
      )}
    </div>
  );
}
