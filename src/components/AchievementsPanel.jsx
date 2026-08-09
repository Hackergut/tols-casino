import React, { useState } from "react";
import { Award, Lock, Trophy } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";

const CATEGORY_ORDER = ["General", "Games", "Collection", "Progression"];

export default function AchievementsPanel() {
  const { data, loading } = useAchievements();
  const [filter, setFilter] = useState("All");

  if (loading || !data) return null;

  const unlocked = data.achievements.filter((a) => a.unlocked).length;
  const pct = Math.round((unlocked / data.totalAchievements) * 100);
  const categories = ["All", ...CATEGORY_ORDER.filter((c) => data.achievements.some((a) => a.category === c))];
  const visible = data.achievements.filter((a) => filter === "All" || a.category === filter);

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#141414] to-[#0a0a0a] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-lime/10 border border-lime/30 grid place-items-center">
          <Trophy className="w-5 h-5 text-lime" />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-white">Achievements</h3>
          <p className="text-xs text-white/40">{unlocked}/{data.totalAchievements} unlocked · {pct}%</p>
        </div>
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-4">
        <div className="h-full bg-lime rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-4">
        {categories.map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 h-8 rounded-lg text-xs font-bold whitespace-nowrap transition ${filter === c ? "bg-lime text-black" : "bg-white/5 text-white/60 hover:text-white"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto scrollbar-hide pr-1">
        {visible.map((a) => (
          <div key={a.id}
            className={`flex items-center gap-3 rounded-xl border p-3 transition ${a.unlocked ? "border-lime/30 bg-lime/5" : "border-white/10 bg-[#0a0a0a] opacity-70"}`}>
            <div className={`w-10 h-10 rounded-lg grid place-items-center text-lg shrink-0 ${a.unlocked ? "bg-lime/15" : "bg-white/5 grayscale"}`}>
              {a.unlocked ? <span>{a.icon}</span> : <Lock className="w-4 h-4 text-white/40" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{a.name}</p>
              <p className="text-[11px] text-white/50 truncate">{a.desc}</p>
            </div>
            {a.unlocked && <Award className="w-4 h-4 text-lime shrink-0 ml-auto" />}
          </div>
        ))}
      </div>
    </div>
  );
}
