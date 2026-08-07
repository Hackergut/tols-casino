import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Trophy, Crown, Sparkles, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useWallet } from "@/components/WalletProvider";
import TournamentCard from "@/components/tournaments/TournamentCard";
import Leaderboard from "@/components/tournaments/Leaderboard";
import { buildLeaderboard } from "@/lib/tournaments";

export default function Tournaments() {
  const { wallet } = useWallet();
  const [tab, setTab] = useState("tournaments");
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(() => new Set(JSON.parse(localStorage.getItem("tols_joined_tourneys") || "[]")));
  const [board, setBoard] = useState([]);

  const loadTournaments = useCallback(async () => {
    try {
      const list = await base44.entities.Tournament.list("-created_date", 50);
      const order = { active: 0, upcoming: 1, ended: 2 };
      list.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9) || (b.prize_pool || 0) - (a.prize_pool || 0));
      setTournaments(list);
    } catch {
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const computeBoard = useCallback(async () => {
    let currentUser = null;
    try {
      const user = await base44.auth.me();
      if (user) {
        const bets = await base44.entities.Bet.filter({ created_by_id: user.id }, "-created_date", 300);
        currentUser = {
          username: user.full_name || (user.email ? user.email.split("@")[0] : "Player"),
          wagered: wallet?.total_wagered || 0,
          wins: bets.filter((b) => b.result === "win").length,
          biggest_win: bets.reduce((m, b) => Math.max(m, b.payout || 0), 0),
        };
      }
    } catch {
      /* guest */
    }
    let entries = [];
    try {
      entries = (await base44.entities.TournamentEntry.list("-wagered", 200)) || [];
    } catch {
      entries = [];
    }
    setBoard(buildLeaderboard(entries, currentUser));
  }, [wallet]);

  useEffect(() => {
    loadTournaments();
    computeBoard();
  }, [loadTournaments, computeBoard]);

  const join = useCallback(
    async (t) => {
      if (joined.has(t.id) || t.status === "ended") return;
      const next = new Set([...joined, t.id]);
      setJoined(next);
      localStorage.setItem("tols_joined_tourneys", JSON.stringify([...next]));
      try {
        let username = "Guest";
        try {
          const user = await base44.auth.me();
          if (user) username = user.full_name || (user.email ? user.email.split("@")[0] : "Player");
        } catch {}
        await base44.entities.TournamentEntry.create({ tournament_id: t.id, username });
        await base44.entities.Tournament.update(t.id, { participants_count: (t.participants_count || 0) + 1 });
      } catch {
        /* ignore — participation recorded locally */
      }
      loadTournaments();
    },
    [joined, loadTournaments]
  );

  const totalPrize = useMemo(() => tournaments.reduce((s, t) => s + (t.prize_pool || 0), 0), [tournaments]);
  const activeCount = useMemo(() => tournaments.filter((t) => t.status === "active").length, [tournaments]);

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-2 sm:gap-3">
              <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-lime shrink-0" /> <span className="text-lime">TOLS</span> Tournaments
            </h1>
            <p className="text-sm text-white/50 mt-1.5">Compete with players worldwide. Wager to climb the leaderboard and win a share of the prize pool.</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl border border-white/10 bg-[#111] px-4 py-2.5">
              <div className="text-[10px] font-bold uppercase text-white/40">Active</div>
              <div className="text-xl font-black text-lime tabular-nums">{activeCount}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111] px-4 py-2.5">
              <div className="text-[10px] font-bold uppercase text-white/40">Total prizes</div>
              <div className="text-xl font-black text-white tabular-nums">{totalPrize.toLocaleString()}<span className="text-xs text-white/40 ml-1">USDT</span></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1a1a1a] border border-white/10 w-fit mb-6">
          <button
            onClick={() => setTab("tournaments")}
            className={`flex items-center gap-1.5 px-4 h-10 rounded-lg text-sm font-black transition ${tab === "tournaments" ? "bg-lime text-black" : "text-white/60 hover:text-white"}`}
          >
            <Trophy className="w-4 h-4" /> Tournaments
          </button>
          <button
            onClick={() => setTab("leaderboard")}
            className={`flex items-center gap-1.5 px-4 h-10 rounded-lg text-sm font-black transition ${tab === "leaderboard" ? "bg-lime text-black" : "text-white/60 hover:text-white"}`}
          >
            <Crown className="w-4 h-4" /> Leaderboard
          </button>
        </div>

        {tab === "tournaments" ? (
          loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-72 rounded-2xl border border-white/10 bg-[#111] animate-pulse" />
              ))}
            </div>
          ) : tournaments.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#111] p-16 text-center">
              <Trophy className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">No tournaments available right now. Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournaments.map((t) => (
                <TournamentCard key={t.id} tournament={t} joined={joined} onJoin={join} />
              ))}
            </div>
          )
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4 text-sm text-white/50">
              <TrendingUp className="w-4 h-4 text-lime" /> Ranked by total wagered volume (USDT) across all games.
            </div>
            <Leaderboard board={board} />
          </div>
        )}

        <div className="mt-10 flex items-center gap-2 text-xs text-white/40">
          <Sparkles className="w-3.5 h-3.5 text-lime" /> Tournament scores update in real time as you play. Entry is free for most events — your wallet balance is never charged.
        </div>
      </div>
    </div>
  );
}