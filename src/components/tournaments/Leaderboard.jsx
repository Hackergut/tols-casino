import React from "react";
import { Crown, Medal } from "lucide-react";

const MEDAL = ["#ccff00", "#c4c4c4", "#cd7f32"];

export default function Leaderboard({ board }) {
  if (!board.length) {
    return <div className="text-center text-white/40 py-12">No data yet — start playing to appear here.</div>;
  }
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#121212] overflow-hidden">
      <div className="grid grid-cols-[60px_1fr_120px_90px_120px] gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/5">
        <span>Rank</span>
        <span>Player</span>
        <span className="text-right">Wagered</span>
        <span className="text-right">Wins</span>
        <span className="text-right">Biggest win</span>
      </div>
      <div className="max-h-[560px] overflow-y-auto scrollbar-hide">
        {board.map((row) => {
          const top3 = row.rank <= 3;
          return (
            <div
              key={row.username + row.rank}
              className={`grid grid-cols-[60px_1fr_120px_90px_120px] gap-2 px-4 py-3 items-center text-sm border-b border-white/5 last:border-0 transition ${
                row.isCurrentUser ? "bg-lime/10" : "hover:bg-white/[0.03]"
              }`}
            >
              <span className="flex items-center justify-center">
                {top3 ? (
                  row.rank === 1
                    ? <Crown className="w-4 h-4" style={{ color: MEDAL[0] }} />
                    : <Medal className="w-4 h-4" style={{ color: MEDAL[row.rank - 1] }} />
                ) : (
                  <span className="text-white/40 font-bold tabular-nums">{row.rank}</span>
                )}
              </span>
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-black"
                  style={{ backgroundColor: row.avatar_color }}
                >
                  {row.username.slice(0, 2).toUpperCase()}
                </span>
                <span className={`font-bold truncate ${row.isCurrentUser ? "text-lime" : "text-white/85"}`}>
                  {row.username}
                  {row.isCurrentUser && <span className="ml-2 text-[10px] font-black text-lime/70">YOU</span>}
                </span>
              </div>
              <span className="text-right font-bold text-white tabular-nums">{row.wagered.toLocaleString()}</span>
              <span className="text-right text-white/60 tabular-nums">{row.wins.toLocaleString()}</span>
              <span className="text-right text-lime/80 font-semibold tabular-nums">{row.biggest_win.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}