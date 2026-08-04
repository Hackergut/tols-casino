import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, TrendingUp, Wallet, Users, Activity, DollarSign, ArrowDownToLine, Clock, Ban, RefreshCw } from "lucide-react";
import PaymentSettings from "@/components/admin/PaymentSettings";
import CatalogSettings from "@/components/admin/CatalogSettings";
import HouseMargin from "@/components/admin/HouseMargin";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart, BarChart, Bar } from "recharts";

export default function Admin() {
  const [authed, setAuthed] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bets, setBets] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);

  const load = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      if (!user || user.role !== "admin") {
        setAuthed(false);
        setLoading(false);
        return;
      }
      setAuthed(true);

      const [betList, walletList, withdrawalList, userList, earningList] = await Promise.all([
        base44.entities.Bet.list("-created_date", 200),
        base44.entities.UserWallet.list("-updated_date", 100),
        base44.entities.Withdrawal.list("-created_date", 50),
        base44.entities.User.list(),
        base44.entities.HouseEarning.list("-created_date", 500),
      ]);

      setBets(betList || []);
      setWallets(walletList || []);
      setWithdrawals(withdrawalList || []);
      setUsers(userList || []);
      setEarnings(earningList || []);

      // aggregate KPIs
      const totalWagered = (betList || []).reduce((s, b) => s + (b.amount || 0), 0);
      const totalPayout = (betList || []).reduce((s, b) => s + (b.payout || 0), 0);
      const houseGross = totalWagered - totalPayout;
      const totalBalance = (walletList || []).reduce((s, w) => s + (w.balance || 0), 0);
      const totalPlayerWagered = (walletList || []).reduce((s, w) => s + (w.total_wagered || 0), 0);
      const wins = (betList || []).filter((b) => b.result === "win").length;
      const losses = (betList || []).filter((b) => b.result === "lose").length;
      const winRate = betList.length ? (wins / betList.length * 100).toFixed(1) : "0.0";

      const pendingWithdrawals = (withdrawalList || []).filter((w) => w.status === "pending");
      const pendingAmount = pendingWithdrawals.reduce((s, w) => s + (w.amount || 0), 0);

      // hourly volume series (last 12 buckets)
      const now = Date.now();
      const buckets = Array.from({ length: 12 }, (_, i) => {
        const start = now - (11 - i) * 60 * 60 * 1000;
        return { hour: new Date(start).getHours() + ":00", wagered: 0, payout: 0, count: 0 };
      });
      (betList || []).forEach((b) => {
        const t = new Date(b.created_date).getTime();
        const idx = 11 - Math.floor((now - t) / (60 * 60 * 1000));
        if (idx >= 0 && idx < 12) {
          buckets[idx].wagered += b.amount || 0;
          buckets[idx].payout += b.payout || 0;
          buckets[idx].count += 1;
        }
      });
      const series = buckets.map((b) => ({ ...b, wagered: +b.wagered.toFixed(2), payout: +b.payout.toFixed(2) }));

      // top games by volume
      const gameMap = {};
      (betList || []).forEach((b) => {
        const name = b.game_name || b.game_id || "unknown";
        if (!gameMap[name]) gameMap[name] = { name, wagered: 0, count: 0, payout: 0 };
        gameMap[name].wagered += b.amount || 0;
        gameMap[name].payout += b.payout || 0;
        gameMap[name].count += 1;
      });
      const topGames = Object.values(gameMap).sort((a, b) => b.wagered - a.wagered).slice(0, 6).map((g) => ({ ...g, wagered: +g.wagered.toFixed(2), payout: +g.payout.toFixed(2) }));

      // House earnings ledger aggregation
      const ledger = earningList || [];
      const ledgerWagered = +ledger.reduce((s, e) => s + (e.wager || 0), 0).toFixed(2);
      const ledgerPaid = +ledger.reduce((s, e) => s + (e.payout || 0), 0).toFixed(2);
      const ledgerNet = +ledger.reduce((s, e) => s + (e.house_profit || 0), 0).toFixed(2);
      const gameLedger = {};
      ledger.forEach((e) => {
        const n = e.game_name || e.game_id || "unknown";
        if (!gameLedger[n]) gameLedger[n] = { name: n, wagered: 0, paid: 0, net: 0, count: 0 };
        gameLedger[n].wagered += e.wager || 0;
        gameLedger[n].paid += e.payout || 0;
        gameLedger[n].net += e.house_profit || 0;
        gameLedger[n].count += 1;
      });
      const ledgerByGame = Object.values(gameLedger)
        .sort((a, b) => b.net - a.net)
        .map((g) => ({ ...g, wagered: +g.wagered.toFixed(2), paid: +g.paid.toFixed(2), net: +g.net.toFixed(2) }));

      setStats({
        totalWagered: +totalWagered.toFixed(2),
        totalPayout: +totalPayout.toFixed(2),
        houseGross: +houseGross.toFixed(2),
        houseEdge: totalWagered ? ((houseGross / totalWagered) * 100).toFixed(2) : "0.00",
        totalBalance: +totalBalance.toFixed(2),
        totalPlayerWagered: +totalPlayerWagered.toFixed(2),
        wins, losses, winRate,
        betCount: (betList || []).length,
        activeUsers: users.length,
        walletCount: (walletList || []).length,
        pendingWithdrawals: pendingWithdrawals.length,
        pendingAmount: +pendingAmount.toFixed(2),
        series, topGames,
        ledgerWagered, ledgerPaid, ledgerNet, ledgerByGame, ledgerCount: ledger.length,
      });
      setLoading(false);
    } catch (e) {
      setAuthed(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const syncCatalog = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await base44.functions.invoke("syncSlotCatalog", {});
      const d = res.data || {};
      if (d.error) setSyncMsg({ ok: false, text: d.error });
      else setSyncMsg({ ok: true, text: `${d.created || 0} new · ${d.updated || 0} updated · ${d.total || 0} total` });
    } catch (e) {
      setSyncMsg({ ok: false, text: e?.response?.data?.error || e.message || "Sync error" });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-lime rounded-full animate-spin" />
      </div>
    );
  }

  if (authed === false) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Ban className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-black text-white">Access denied</h1>
          <p className="text-sm text-white/40 mt-2">The admin panel is restricted to platform administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-lime/10 flex items-center justify-center glow-lime">
              <Shield className="w-6 h-6 text-lime" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Admin <span className="text-lime">Dashboard</span></h1>
              <p className="text-xs text-white/40">Real-time monitoring · updates every 15s</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={syncCatalog}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-lime text-black text-xs font-black hover:opacity-90 transition disabled:opacity-50"
            >
              {syncing ? <span className="w-3 h-3 rounded-full border-2 border-black/40 border-t-black animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Sync slots
            </button>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime/10 border border-lime/30 text-xs font-bold text-lime">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" /> LIVE
            </span>
          </div>
          {syncMsg && (
            <div className="basis-full mt-2 text-xs font-semibold">
              <span className={syncMsg.ok ? "text-lime" : "text-red-400"}>{syncMsg.ok ? "✓ " : "⚠ "}{syncMsg.text}</span>
            </div>
          )}
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Kpi icon={<DollarSign />} label="Wagering volume" value={stats.totalWagered.toLocaleString()} sub="USDT total" accent />
          <Kpi icon={<TrendingUp />} label="House edge" value={`${stats.houseEdge}%`} sub={`House net: ${stats.houseGross.toLocaleString()}`} />
          <Kpi icon={<Wallet />} label="Wallet balance" value={stats.totalBalance.toLocaleString()} sub={`${stats.walletCount} wallets`} />
          <Kpi icon={<Users />} label="Active users" value={stats.activeUsers} sub={`${stats.betCount} bets`} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MiniKpi label="Total payout" value={stats.totalPayout.toLocaleString()} />
          <MiniKpi label="Win rate" value={`${stats.winRate}%`} sub={`${stats.wins}W / ${stats.losses}L`} />
          <MiniKpi label="Pending withdrawals" value={stats.pendingWithdrawals} sub={`${stats.pendingAmount} USDT`} warn={stats.pendingWithdrawals > 0} />
          <MiniKpi label="Player volume" value={stats.totalPlayerWagered.toLocaleString()} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#111] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-lime" /> Wagering volume (12h)</h3>
              <span className="text-xs text-white/40">USDT per hour</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats.series}>
                <defs>
                  <linearGradient id="gwagered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ccff00" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#ccff00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#555" tick={{ fontSize: 11 }} />
                <YAxis stroke="#555" tick={{ fontSize: 11 }} width={48} />
                <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #333", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "#ccff00" }} />
                <Area type="monotone" dataKey="wagered" stroke="#ccff00" strokeWidth={2} fill="url(#gwagered)" name="Bets" />
                <Line type="monotone" dataKey="payout" stroke="#888" strokeWidth={1.5} dot={false} name="Payout" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <h3 className="font-bold text-white mb-4">Top games by volume</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.topGames} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" stroke="#555" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" stroke="#888" tick={{ fontSize: 11 }} width={70} />
                <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #333", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "#ccff00" }} cursor={{ fill: "#1a1a1a" }} />
                <Bar dataKey="wagered" fill="#ccff00" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* House earnings ledger */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 rounded-2xl border border-lime/20 bg-gradient-to-br from-lime/10 to-[#111] p-5">
            <h3 className="font-bold text-white flex items-center gap-2"><DollarSign className="w-4 h-4 text-lime" /> House earnings</h3>
            <p className={`text-4xl font-black mt-3 ${stats.ledgerNet >= 0 ? "text-lime" : "text-red-400"}`}>
              {stats.ledgerNet >= 0 ? "+" : ""}{stats.ledgerNet.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-white/50 mt-1">Net profit · USDT</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="rounded-lg bg-black/30 p-2.5">
                <p className="text-[10px] text-white/40 uppercase">Wagered</p>
                <p className="text-sm font-bold text-white">{stats.ledgerWagered.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-black/30 p-2.5">
                <p className="text-[10px] text-white/40 uppercase">Paid out</p>
                <p className="text-sm font-bold text-white">{stats.ledgerPaid.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-white/40 mt-3">{stats.ledgerCount} settled bets in ledger</p>
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#111] p-5">
            <h3 className="font-bold text-white mb-3">Earnings by game</h3>
            <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-hide">
              {stats.ledgerByGame.map((g) => (
                <div key={g.name} className="flex items-center justify-between rounded-lg bg-[#0d0d0d] border border-white/5 px-3 py-2">
                  <span className="text-sm font-semibold text-white">{g.name}</span>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${g.net >= 0 ? "text-lime" : "text-red-400"}`}>{g.net >= 0 ? "+" : ""}{g.net}</span>
                    <span className="text-xs text-white/30 ml-2">{g.count} bets</span>
                  </div>
                </div>
              ))}
              {!stats.ledgerByGame.length && <p className="text-sm text-white/30 text-center py-6">No earnings recorded yet</p>}
            </div>
          </div>
        </div>

        {/* House margin comparison */}
        <HouseMargin earnings={earnings} />

        {/* Tables */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Recent bets */}
          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <h3 className="font-bold text-white mb-3">Recent bets</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
              {bets.slice(0, 12).map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg bg-[#0d0d0d] border border-white/5 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${b.result === "win" ? "bg-lime" : "bg-red-400"}`} />
                    <span className="text-sm font-semibold text-white">{b.game_name || b.game_id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{Number(b.amount).toFixed(2)}</span>
                    <span className={`text-xs ml-2 ${b.result === "win" ? "text-lime" : "text-red-400"}`}>
                      {b.result === "win" ? `+${(b.payout - b.amount).toFixed(2)}` : `-${b.amount}`}
                    </span>
                  </div>
                </div>
              ))}
              {!bets.length && <p className="text-sm text-white/30 text-center py-6">No bets</p>}
            </div>
          </div>

          {/* Pending withdrawals */}
          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-lime" /> Pending withdrawals
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
              {withdrawals.filter((w) => w.status === "pending").map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-lg bg-[#0d0d0d] border border-yellow-500/20 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-bold text-white">{Number(w.amount).toFixed(2)} {w.currency}</p>
                    <p className="text-xs text-white/40 font-mono truncate max-w-[160px]">{w.wallet_address}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-yellow-300 uppercase">{w.chain}</span>
                    <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(w.created_date).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {!withdrawals.filter((w) => w.status === "pending").length && <p className="text-sm text-white/30 text-center py-6">No pending withdrawals</p>}
            </div>
          </div>
        </div>

        {/* Top wallets */}
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <h3 className="font-bold text-white mb-3">Wallets by balance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-white/40 uppercase border-b border-white/5">
                  <th className="py-2 px-2">Wallet</th>
                  <th className="py-2 px-2 text-right">Balance</th>
                  <th className="py-2 px-2 text-right">Total wagered</th>
                  <th className="py-2 px-2 text-right">XP</th>
                  <th className="py-2 px-2 text-right">VIP</th>
                </tr>
              </thead>
              <tbody>
                {[...wallets].sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 10).map((w) => (
                  <tr key={w.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-2 font-mono text-white/60 text-xs">{w.id.slice(0, 8)}…</td>
                    <td className="py-2 px-2 text-right font-bold text-lime">{Number(w.balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="py-2 px-2 text-right text-white/70">{Number(w.total_wagered).toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-white/50">{w.xp || 0}</td>
                    <td className="py-2 px-2 text-right"><span className="px-2 py-0.5 rounded-full bg-white/5 text-xs font-bold text-white">L{w.vip_level || 1}</span></td>
                  </tr>
                ))}
                {!wallets.length && (
                  <tr><td colSpan={5} className="py-6 text-center text-white/30">No wallets</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <PaymentSettings />
        <div className="mt-4"><CatalogSettings /></div>
      </main>
    </div>
  );
}

function Kpi({ icon, label, value, sub, accent }) {
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${accent ? "border-lime/30 bg-gradient-to-br from-lime/10 to-[#111]" : "border-white/10 bg-[#111]"}`}>
      <div className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-wide">
        <span className={accent ? "text-lime" : "text-white/40"}>{React.cloneElement(icon, { className: "w-4 h-4" })}</span>
        {label}
      </div>
      <p className={`text-2xl sm:text-3xl font-black mt-2 ${accent ? "text-lime" : "text-white"}`}>{value}</p>
      <p className="text-xs text-white/40 mt-1">{sub}</p>
    </div>
  );
}

function MiniKpi({ label, value, sub, warn }) {
  return (
    <div className={`rounded-xl border p-3 ${warn ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/10 bg-[#111]"}`}>
      <p className="text-xs text-white/40 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-black mt-1 ${warn ? "text-yellow-300" : "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
    </div>
  );
}