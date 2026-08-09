import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { FlaskConical, AlertTriangle } from "lucide-react";
import { RTP_ORIGINALS } from "@/lib/gameEngine";
import { DEMO_MAX_DAILY_WAGER, DEMO_MAX_REFILLS_PER_DAY } from "@/lib/demoLimits";

// Monitors fun-money (demo) activity: volume, refills consumed, players who hit
// the daily cap, and realized demo RTP per game vs the calibrated theoretical RTP.
export default function DemoMonitor() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setSessions((await base44.entities.DemoSession.list("-created_date", 300)) || []);
      } catch (e) { /* ignore */ }
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const { totals, games, capped } = useMemo(() => {
    const map = {};
    let wagered = 0, payout = 0, bets = 0, refills = 0, capped = 0;
    sessions.forEach((s) => {
      wagered += s.wagered || 0;
      payout += s.payout || 0;
      bets += s.bets || 0;
      refills += s.refills || 0;
      if (s.exhausted) capped += 1;
      let gs = {};
      try { gs = JSON.parse(s.game_stats || "{}"); } catch {}
      Object.entries(gs).forEach(([gid, g]) => {
        if (!map[gid]) map[gid] = { gid, name: g.name || gid, n: 0, w: 0, p: 0 };
        map[gid].n += g.n || 0;
        map[gid].w += g.w || 0;
        map[gid].p += g.p || 0;
      });
    });
    const games = Object.values(map)
      .map((g) => {
        const actual = g.w > 0 ? (g.p / g.w) * 100 : null;
        const theo = RTP_ORIGINALS[g.gid] != null ? RTP_ORIGINALS[g.gid] * 100 : null;
        return { ...g, w: +g.w.toFixed(2), p: +g.p.toFixed(2), actual, theo, delta: actual != null && theo != null ? actual - theo : null };
      })
      .sort((a, b) => b.w - a.w);
    return {
      totals: {
        wagered: +wagered.toFixed(2), payout: +payout.toFixed(2), bets, refills,
        rtp: wagered > 0 ? (payout / wagered) * 100 : null,
        players: sessions.length,
      },
      games,
      capped,
    };
  }, [sessions]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h3 className="font-bold text-white flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-lime" /> Demo (fun-money) monitoring
        </h3>
        <span className="text-xs text-white/40">
          Cap: {DEMO_MAX_DAILY_WAGER.toLocaleString()} FUN & {DEMO_MAX_REFILLS_PER_DAY} top-ups per player/day
        </span>
      </div>
      <p className="text-xs text-white/40 mb-4">
        Demo play never touches the real ledger, but is fully tracked so the RTP model can be validated against live sample data.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <Box label="Demo sessions" value={totals.players} />
        <Box label="Demo wagered" value={totals.wagered.toLocaleString()} />
        <Box label="Demo payout" value={totals.payout.toLocaleString()} />
        <Box label="Realized demo RTP" value={totals.rtp != null ? `${totals.rtp.toFixed(2)}%` : "—"} accent />
        <Box label="Players capped" value={capped} warn={capped > 0} sub={`${totals.refills} top-ups used`} />
      </div>

      {games.length === 0 ? (
        <p className="text-sm text-white/30 text-center py-8">No demo activity recorded yet.</p>
      ) : (
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-sm min-w-[620px]">
            <thead>
              <tr className="text-left text-[11px] text-white/40 uppercase border-b border-white/5">
                <th className="py-2 px-2">Game</th>
                <th className="py-2 px-2 text-right">Rounds</th>
                <th className="py-2 px-2 text-right">Wagered</th>
                <th className="py-2 px-2 text-right">Paid</th>
                <th className="py-2 px-2 text-right">Theo. RTP</th>
                <th className="py-2 px-2 text-right">Demo RTP</th>
                <th className="py-2 px-2 text-right">Δ</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.gid} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2.5 px-2 font-semibold text-white">{g.name}</td>
                  <td className="py-2.5 px-2 text-right text-white/50 tabular-nums">{g.n}</td>
                  <td className="py-2.5 px-2 text-right text-white/70 tabular-nums">{g.w.toLocaleString()}</td>
                  <td className="py-2.5 px-2 text-right text-white/70 tabular-nums">{g.p.toLocaleString()}</td>
                  <td className="py-2.5 px-2 text-right text-white/60 tabular-nums">{g.theo != null ? `${g.theo.toFixed(2)}%` : "—"}</td>
                  <td className="py-2.5 px-2 text-right font-bold text-white tabular-nums">{g.actual != null ? `${g.actual.toFixed(2)}%` : "—"}</td>
                  <td className={`py-2.5 px-2 text-right tabular-nums ${g.delta == null ? "text-white/30" : Math.abs(g.delta) > 5 ? "text-yellow-300" : "text-lime"}`}>
                    {g.delta == null ? "—" : `${g.delta >= 0 ? "+" : ""}${g.delta.toFixed(2)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="flex items-center gap-1.5 mt-4 text-[11px] text-white/40">
        <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" /> Δ beyond ±5% usually means a small sample, not a broken paytable.
      </p>
    </div>
  );
}

function Box({ label, value, sub = "", accent = false, warn = false }) {
  return (
    <div className={`rounded-xl border p-3 ${warn ? "border-yellow-500/30 bg-yellow-500/5" : accent ? "border-lime/30 bg-lime/5" : "border-white/10 bg-[#0d0d0d]"}`}>
      <p className="text-[10px] text-white/40 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-black mt-1 ${warn ? "text-yellow-300" : accent ? "text-lime" : "text-white"}`}>{value}</p>
      {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
    </div>
  );
}