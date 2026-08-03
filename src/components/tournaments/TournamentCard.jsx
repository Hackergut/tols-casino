import React, { useEffect, useState } from "react";
import { Trophy, Users, Clock, Coins, Play, Check } from "lucide-react";

function useCountdown(target) {
  const [left, setLeft] = useState(() => target ? Math.max(0, new Date(target).getTime() - Date.now()) : 0);
  useEffect(() => {
    if (!target) return;
    const t = setInterval(() => setLeft(Math.max(0, new Date(target).getTime() - Date.now())), 1000);
    return () => clearInterval(t);
  }, [target]);
  return left;
}

function fmtDuration(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function TournamentCard({ tournament, joined, onJoin }) {
  const isActive = tournament.status === "active";
  const isUpcoming = tournament.status === "upcoming";
  const target = isActive ? tournament.end_date : tournament.start_date;
  const left = useCountdown(target);
  const pct = tournament.max_participants
    ? Math.min(100, (tournament.participants_count / tournament.max_participants) * 100)
    : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#161616] to-[#0f0f0f] p-5 flex flex-col">
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-lime/5 blur-3xl pointer-events-none" />
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-lime" />
          <h3 className="text-lg font-black text-white tracking-tight">{tournament.name}</h3>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            isActive ? "bg-lime/15 text-lime" : isUpcoming ? "bg-blue-500/15 text-blue-400" : "bg-white/5 text-white/40"
          }`}
        >
          {isActive ? "Live" : isUpcoming ? "Upcoming" : "Ended"}
        </span>
      </div>

      <p className="text-xs text-white/50 leading-relaxed mb-4 min-h-[32px]">{tournament.description}</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-xl bg-black/30 border border-white/5 p-3">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-white/40 mb-1">
            <Coins className="w-3 h-3" /> Prize pool
          </div>
          <div className="text-xl font-black text-lime tabular-nums">
            {tournament.prize_pool.toLocaleString()}
            <span className="text-xs text-white/40 ml-1">{tournament.currency}</span>
          </div>
        </div>
        <div className="rounded-xl bg-black/30 border border-white/5 p-3">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-white/40 mb-1">
            {tournament.entry_fee > 0 ? <Coins className="w-3 h-3" /> : <Trophy className="w-3 h-3" />} Entry
          </div>
          <div className="text-xl font-black text-white tabular-nums">
            {tournament.entry_fee > 0 ? `${tournament.entry_fee}` : "FREE"}
            {tournament.entry_fee > 0 && <span className="text-xs text-white/40 ml-1">{tournament.currency}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-white/50 mb-2">
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {tournament.participants_count.toLocaleString()} joined</span>
        <span className="flex items-center gap-1 text-white/70">
          <Clock className="w-3.5 h-3.5" />
          {isActive ? `Ends in ${fmtDuration(left)}` : isUpcoming ? `Starts in ${fmtDuration(left)}` : "Finished"}
        </span>
      </div>
      {tournament.max_participants > 0 && (
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
          <div className="h-full bg-lime/70 rounded-full" style={{ width: `${pct}%` }} />
        </div>
      )}

      <button
        disabled={tournament.status === "ended"}
        onClick={() => onJoin(tournament)}
        className={`mt-auto flex items-center justify-center gap-2 h-11 rounded-xl font-black text-sm transition ${
          joined.has(tournament.id)
            ? "bg-white/5 text-white/40 cursor-default"
            : tournament.status === "ended"
            ? "bg-white/5 text-white/30 cursor-not-allowed"
            : "bg-lime text-black hover:opacity-90"
        }`}
      >
        {joined.has(tournament.id) ? (
          <><Check className="w-4 h-4" /> Joined</>
        ) : tournament.status === "ended" ? (
          "Ended"
        ) : (
          <><Play className="w-4 h-4" /> Join {tournament.entry_fee > 0 ? `· ${tournament.entry_fee} ${tournament.currency}` : "free"}</>
        )}
      </button>
    </div>
  );
}