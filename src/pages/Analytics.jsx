import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BarChart3, Users, Activity, DollarSign, ArrowDownToLine, ArrowUpFromLine, TrendingUp, Ban, RefreshCw, Coins } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Line, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from "recharts";

const RANGES = {
  "24h": { ms: 24 * 3600e3, buckets: 24, unit: "hour", label: "24 hours" },
  "7d": { ms: 7 * 24 * 3600e3, buckets: 7, unit: "day", label: "7 days" },
  "30d": { ms: 30 * 24 * 3600e3, buckets: 30, unit: "day", label: "30 days" },
};
const CHAINS = ["solana", "ethereum", "polygon"];
const CHAIN_COLORS = { solana: "#9945FF", ethereum: "#627EEA", polygon: "#8247E5" };
const STATUS_COLORS = { confirmed: "#ccff00", pending: "#facc15", failed: "#ef4444" };

function bucketLabel(t, unit) {
  const d = new Date(t);
  if (unit === "hour") return d.getHours().toString().padStart(2, "0") + ":00";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });
}

function seriesFor(records, valueKey, range) {
  const { ms, buckets, unit } = range;
  const now = Date.now();
  const bms = ms / buckets;
  const arr = Array.from({ length: buckets }, (_, i) => ({ label: bucketLabel(now - (buckets - 1 - i) * bms, unit), value: 0, count: 0 }));
  records.forEach((r) => {
    const t = new Date(r.created_date).getTime();
    const idx = buckets - 1 - Math.floor((now - t) / bms);
    if (idx >= 0 && idx < buckets) { arr[idx].value += Number(r[valueKey] || 0); arr[idx].count += 1; }
  });
  return arr.map((a) => ({ ...a, value: +a.value.toFixed(2) }));
}

export default function Analytics() {
  const [authed, setAuthed] = useState(null);
  const [range, setRange] = useState("24h");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      if (!user || user.role !== "admin") { setAuthed(false); setLoading(false); return; }
      setAuthed(true);
      setRefreshing(true);
      const [bets, deposits, withdrawals, users, earnings] = await Promise.all([
        base44.entities.Bet.list("-created_date", 500),
        base44.entities.Deposit.list("-created_date", 500),
        base44.entities.Withdrawal.list("-created_date", 500),
        base44.entities.User.list(),
        base44.entities.HouseEarning.list("-created_date", 500),
      ]);
      setData({ bets: bets || [], deposits: deposits || [], withdrawals: withdrawals || [], users: users || [], earnings: earnings || [] });
      setLoading(false); setRefreshing(false);
    } catch { setAuthed(false); setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, [load]);

  const m = useMemo(() => {
    if (!data) return null;
    const r = RANGES[range];
    const now = Date.now();
    const start = now - r.ms;
    const inRange = (arr) => arr.filter((x) => new Date(x.created_date).getTime() >= start);

    const rBets = inRange(data.bets);
    const rDeposits = inRange(data.deposits);
    const rWithdrawals = inRange(data.withdrawals);
    const rUsers = inRange(data.users);
    const rEarnings = inRange(data.earnings);

    const betVolume = +rBets.reduce((s, b) => s + (b.amount || 0), 0).toFixed(2);
    const confirmedDep = rDeposits.filter((d) => d.status === "confirmed");
    const depVolume = +confirmedDep.reduce((s, d) => s + (d.amount || 0), 0).toFixed(2);
    const completedWd = rWithdrawals.filter((w) => w.status === "completed");
    const wdVolume = +completedWd.reduce((s, w) => s + (w.amount || 0), 0).toFixed(2);
    const pendingWd = rWithdrawals.filter((w) => w.status === "pending").length;
    const ggr = +rEarnings.reduce((s, e) => s + (e.house_profit || 0), 0).toFixed(2);
    const netCash = +(depVolume - wdVolume).toFixed(2);
    const avgBet = rBets.length ? +(betVolume / rBets.length).toFixed(2) : 0;

    const wagerS = seriesFor(data.bets, "amount", r);
    const payoutS = seriesFor(data.bets, "payout", r);
    const wagerSeries = wagerS.map((w, i) => ({ label: w.label, wagered: w.value, payout: payoutS[i].value, bets: w.count }));

    const depS = seriesFor(data.deposits, "amount", r);
    const wdS = seriesFor(data.withdrawals, "amount", r);
    const cashSeries = depS.map((d, i) => ({ label: d.label, deposits: d.value, withdrawals: wdS[i].value }));

    const chainMap = {}; CHAINS.forEach((c) => (chainMap[c] = 0));
    confirmedDep.forEach((d) => { if (chainMap[d.chain] !== undefined) chainMap[d.chain] += d.amount || 0; });
    const chainData = CHAINS.map((c) => ({ name: c, value: +chainMap[c].toFixed(2) })).filter((x) => x.value > 0);

    const statusMap = { confirmed: 0, pending: 0, failed: 0 };
    rDeposits.forEach((d) => { if (statusMap[d.status] !== undefined) statusMap[d.status] += 1; });
    const statusData = Object.entries(statusMap).map(([k, v]) => ({ name: k, value: v }));

    const gameMap = {};
    rBets.forEach((b) => { const n = b.game_name || b.game_id || "unknown"; if (!gameMap[n]) gameMap[n] = { name: n, wagered: 0, payout: 0, count: 0 }; gameMap[n].wagered += b.amount || 0; gameMap[n].payout += b.payout || 0; gameMap[n].count += 1; });
    const topGames = Object.values(gameMap).map((g) => ({ ...g, wagered: +g.wagered.toFixed(2), payout: +g.payout.toFixed(2), ggr: +(g.wagered - g.payout).toFixed(2) })).sort((a, b) => b.wagered - a.wagered).slice(0, 6);

    return {
      activeUsers: data.users.length, newUsers: rUsers.length,
      betCount: rBets.length, betVolume, avgBet,
      depCount: confirmedDep.length, depVolume, depTotal: rDeposits.length,
      wdCount: rWithdrawals.length, wdVolume, pendingWd,
      ggr, netCash,
      wagerSeries, cashSeries, chainData, statusData, topGames,
      recentDeposits: [...data.deposits].slice(0, 12),
    };
  }, [data, range]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-white/10 border-t-lime rounded-full animate-spin" /></div>;
  if (authed === false) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Ban className="w-8 h-8 text-red-400" /></div>
        <h1 className="text-xl font-black text-white">Access denied</h1>
        <p className="text-sm text-white/40 mt-2">Analytics is restricted to platform administrators.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-lime/10 flex items-center justify-center glow-lime"><BarChart3 className="w-6 h-6 text-lime" /></div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Real-time <span className="text-lime">Analytics</span></h1>
              <p className="text-xs text-white/40">Live metrics · auto-refresh every 30s</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex rounded-full bg-white/5 border border-white/10 p-1">
              {Object.keys(RANGES).map((k) => (
                <button key={k} onClick={() => setRange(k)} className={`px-3 h-7 rounded-full text-xs font-bold transition ${range === k ? "bg-lime text-black" : "text-white/60 hover:text-white"}`}>{RANGES[k].label}</button>
              ))}
            </div>
            <button onClick={load} className="grid place-items-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-lime" aria-label="Refresh"><RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /></button>
            <Link to="/admin" className="inline-flex items-center gap-2 px-3 h-9 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-bold hover:border-lime/40">Back to Admin</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Kpi icon={<Users />} label="Active users" value={m.activeUsers} sub={`+${m.newUsers} new`} accent />
          <Kpi icon={<Activity />} label="Bets" value={m.betCount} sub={`${m.betVolume} USDT · avg ${m.avgBet}`} />
          <Kpi icon={<DollarSign />} label="GGR (house)" value={`${m.ggr >= 0 ? "+" : ""}${m.ggr}`} sub="Net profit · USDT" accent />
          <Kpi icon={<ArrowUpFromLine />} label="Deposits" value={m.depVolume} sub={`${m.depCount} confirmed · ${m.depTotal} total`} />
          <Kpi icon={<ArrowDownToLine />} label="Withdrawals" value={m.wdVolume} sub={`${m.wdCount} total · ${m.pendingWd} pending`} warn={m.pendingWd > 0} />
          <Kpi icon={<Coins />} label="Net cash flow" value={m.netCash} sub="Deposits − withdrawals · USDT" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-lime" /> Wagering vs Payout</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={m.wagerSeries}>
                <defs><linearGradient id="gWager" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ccff00" stopOpacity={0.5} /><stop offset="100%" stopColor="#ccff00" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="#222" vertical={false} />
                <XAxis dataKey="label" stroke="#555" tick={{ fontSize: 10 }} minTickGap={16} />
                <YAxis stroke="#555" tick={{ fontSize: 10 }} width={48} />
                <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #333", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "#ccff00" }} />
                <Area type="monotone" dataKey="wagered" stroke="#ccff00" strokeWidth={2} fill="url(#gWager)" name="Wagered" />
                <Line type="monotone" dataKey="payout" stroke="#888" strokeWidth={1.5} dot={false} name="Payout" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4"><DollarSign className="w-4 h-4 text-lime" /> Deposits vs Withdrawals</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={m.cashSeries}>
                <CartesianGrid stroke="#222" vertical={false} />
                <XAxis dataKey="label" stroke="#555" tick={{ fontSize: 10 }} minTickGap={16} />
                <YAxis stroke="#555" tick={{ fontSize: 10 }} width={48} />
                <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #333", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "#ccff00" }} cursor={{ fill: "#1a1a1a" }} />
                <Bar dataKey="deposits" fill="#ccff00" radius={[4, 4, 0, 0]} name="Deposits" />
                <Bar dataKey="withdrawals" fill="#ef4444" radius={[4, 4, 0, 0]} name="Withdrawals" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <h3 className="font-bold text-white mb-4">Deposits by chain</h3>
            {m.chainData.length ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={m.chainData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                      {m.chainData.map((e) => <Cell key={e.name} fill={CHAIN_COLORS[e.name] || "#888"} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #333", borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-3 mt-2">
                  {m.chainData.map((c) => <span key={c.name} className="flex items-center gap-1 text-xs text-white/60"><span className="w-2 h-2 rounded-full" style={{ background: CHAIN_COLORS[c.name] || "#888" }} />{c.name}</span>)}
                </div>
              </>
            ) : <Empty />}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <h3 className="font-bold text-white mb-4">Deposit status</h3>
            <div className="space-y-3 mt-4">
              {m.statusData.map((s) => {
                const total = m.statusData.reduce((a, b) => a + b.value, 0) || 1;
                const pct = Math.round((s.value / total) * 100);
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-xs mb-1"><span className="capitalize text-white/70 font-semibold">{s.name}</span><span className="text-white/50">{s.value} · {pct}%</span></div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: STATUS_COLORS[s.name] || "#888" }} /></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-lime" /> Top games (volume)</h3>
            <div className="space-y-1.5 max-h-52 overflow-y-auto scrollbar-hide">
              {m.topGames.map((g) => (
                <div key={g.name} className="flex items-center justify-between rounded-lg bg-[#0d0d0d] border border-white/5 px-3 py-2">
                  <span className="text-sm font-semibold text-white truncate max-w-[120px]">{g.name}</span>
                  <div className="text-right"><span className="text-sm font-bold text-lime">{g.wagered}</span><span className={`text-xs ml-2 ${g.ggr >= 0 ? "text-lime/70" : "text-red-400"}`}>{g.ggr >= 0 ? "+" : ""}{g.ggr}</span></div>
                </div>
              ))}
              {!m.topGames.length && <Empty />}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2"><ArrowUpFromLine className="w-4 h-4 text-lime" /> Recent deposits</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-white/40 uppercase border-b border-white/5">
                <th className="py-2 px-2">Date</th><th className="py-2 px-2">Chain</th><th className="py-2 px-2 text-right">Amount</th><th className="py-2 px-2">Status</th><th className="py-2 px-2">From</th>
              </tr></thead>
              <tbody>
                {m.recentDeposits.map((d) => (
                  <tr key={d.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-2 text-white/60">{new Date(d.created_date).toLocaleString()}</td>
                    <td className="py-2 px-2"><span className="px-2 py-0.5 rounded-full bg-white/5 text-xs font-bold text-white/80 uppercase">{d.chain}</span></td>
                    <td className="py-2 px-2 text-right font-bold text-lime">{Number(d.amount).toFixed(2)}</td>
                    <td className="py-2 px-2"><span className="text-xs font-bold uppercase" style={{ color: STATUS_COLORS[d.status] || "#888" }}>{d.status}</span></td>
                    <td className="py-2 px-2 font-mono text-xs text-white/40 truncate max-w-[140px]">{d.from_address || "—"}</td>
                  </tr>
                ))}
                {!m.recentDeposits.length && <tr><td colSpan={5} className="py-6 text-center text-white/30">No deposits yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function Kpi({ icon, label, value, sub, accent, warn }) {
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${accent ? "border-lime/30 bg-gradient-to-br from-lime/10 to-[#111]" : warn ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/10 bg-[#111]"}`}>
      <div className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-wide">
        <span className={accent ? "text-lime" : "text-white/40"}>{React.cloneElement(icon, { className: "w-4 h-4" })}</span>
        {label}
      </div>
      <p className={`text-2xl sm:text-3xl font-black mt-2 ${accent ? "text-lime" : warn ? "text-yellow-300" : "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
    </div>
  );
}

function Empty() { return <p className="text-sm text-white/30 text-center py-8">No data in this range</p>; }