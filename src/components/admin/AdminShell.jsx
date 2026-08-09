import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Users, Wallet, Coins, Banknote, ArrowDownToLine, Gamepad2,
  Dice5, LineChart, Trophy, Users2, Gift, CreditCard, Layers, Package,
  Sparkles, Store, Shield, MessageSquare, Bell, Settings, BarChart3,
  RefreshCw,
} from "lucide-react";
import EntityPanel from "@/components/admin/EntityPanel";
import WithdrawalReview from "@/components/admin/WithdrawalReview";
import PaymentSettings from "@/components/admin/PaymentSettings";
import CatalogSettings from "@/components/admin/CatalogSettings";
import AggregatorSettings from "@/components/admin/AggregatorSettings";
import IntegrationSettings from "@/components/admin/IntegrationSettings";
import TelegramSettings from "@/components/admin/TelegramSettings";
import HouseMargin from "@/components/admin/HouseMargin";
import DemoMonitor from "@/components/admin/DemoMonitor";

const statusCol = (key = "status") => ({
  key, label: key,
  render: (v) => {
    const map = {
      confirmed: "text-lime border-lime/30 bg-lime/10", completed: "text-lime border-lime/30 bg-lime/10",
      pending: "text-yellow-300 border-yellow-500/30 bg-yellow-500/10",
      pending_review: "text-amber-300 border-amber-500/30 bg-amber-500/10",
      processing: "text-blue-300 border-blue-500/30 bg-blue-500/10",
      failed: "text-red-300 border-red-500/30 bg-red-500/10",
      rejected: "text-red-300 border-red-500/30 bg-red-500/10",
    };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[v] || "text-white/60 border-white/10 bg-white/5"}`}>{String(v)}</span>;
  },
});

const SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { id: "withdrawals", label: "Withdrawals", icon: Banknote, group: "Overview" },
  { id: "deposits", label: "Deposits", icon: ArrowDownToLine, group: "Overview" },
  { id: "bets", label: "Bets", icon: Dice5, group: "Overview" },
  { id: "earnings", label: "House earnings", icon: LineChart, group: "Overview" },
  { id: "jackpot", label: "Jackpot", icon: Coins, group: "Overview" },

  { id: "users", label: "Users", icon: Users, group: "Players" },
  { id: "wallets", label: "Wallets", icon: Wallet, group: "Players" },
  { id: "tournaments", label: "Tournaments", icon: Trophy, group: "Players" },
  { id: "tournament-entries", label: "Tournament entries", icon: Users2, group: "Players" },

  { id: "slots", label: "Slot games", icon: Gamepad2, group: "Catalog" },
  { id: "packs", label: "Card packs", icon: Package, group: "Catalog" },
  { id: "cards", label: "Collectible cards", icon: Layers, group: "Catalog" },
  { id: "pulls", label: "Card pulls", icon: Gift, group: "Catalog" },
  { id: "listings", label: "Marketplace", icon: Store, group: "Catalog" },

  { id: "affiliates", label: "Affiliates", icon: Sparkles, group: "Growth" },
  { id: "referrals", label: "Referrals", icon: Users2, group: "Growth" },
  { id: "commissions", label: "Commissions", icon: CreditCard, group: "Growth" },

  { id: "chat", label: "Chat", icon: MessageSquare, group: "Ops" },
  { id: "telegram", label: "Telegram alerts", icon: Bell, group: "Ops" },
  { id: "demo", label: "Demo sessions", icon: BarChart3, group: "Ops" },
  { id: "limits", label: "Responsible limits", icon: Shield, group: "Ops" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "Ops" },

  { id: "settings", label: "Settings", icon: Settings, group: "System" },
];

function useDashboardData() {
  const [stats, setStats] = useState(null);
  const [bets, setBets] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [users, setUsers] = useState([]);
  const [earnings, setEarnings] = useState([]);

  const load = async () => {
    const [betList, walletList, withdrawalList, userList, earningList] = await Promise.all([
      base44.entities.Bet.list("-created_date", 200),
      base44.entities.UserWallet.list("-updated_date", 100),
      base44.entities.Withdrawal.list("-created_date", 50),
      base44.entities.User.list(),
      base44.entities.HouseEarning.list("-created_date", 500),
    ]);
    setBets(betList || []); setWallets(walletList || []); setWithdrawals(withdrawalList || []);
    setUsers(userList || []); setEarnings(earningList || []);

    const totalWagered = (betList || []).reduce((s, b) => s + (b.amount || 0), 0);
    const totalPayout = (betList || []).reduce((s, b) => s + (b.payout || 0), 0);
    const wins = (betList || []).filter((b) => b.result === "win").length;
    const losses = (betList || []).filter((b) => b.result === "lose").length;
    const pending = (withdrawalList || []).filter((w) => w.status === "pending" || w.status === "pending_review");
    const gameMap = {};
    (betList || []).forEach((b) => {
      const n = b.game_name || b.game_id || "unknown";
      if (!gameMap[n]) gameMap[n] = { name: n, wagered: 0, payout: 0, count: 0 };
      gameMap[n].wagered += b.amount || 0; gameMap[n].payout += b.payout || 0; gameMap[n].count += 1;
    });
    setStats({
      totalWagered, totalPayout, houseGross: totalWagered - totalPayout,
      totalBalance: (walletList || []).reduce((s, w) => s + (w.balance || 0), 0),
      wins, losses, winRate: betList.length ? (wins / betList.length) * 100 : 0,
      betCount: (betList || []).length, activeUsers: (userList || []).length,
      walletCount: (walletList || []).length,
      pendingCount: pending.length, pendingAmount: pending.reduce((s, w) => s + (w.amount || 0), 0),
      topGames: Object.values(gameMap).sort((a, b) => b.wagered - a.wagered).slice(0, 6),
    });
  };

  useEffect(() => { load(); const id = setInterval(load, 15000); return () => clearInterval(id); }, []);
  return { stats, bets, withdrawals, wallets, users, earnings, reload: load };
}

function Kpi({ icon: Icon, label, value, sub, accent, warn }) {
  const ring = warn ? "border-yellow-500/30 bg-yellow-500/5" : accent ? "border-lime/30 bg-gradient-to-br from-lime/10 to-[#111]" : "border-white/10 bg-[#111]";
  return (
    <div className={`rounded-2xl border p-4 ${ring}`}>
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-white/50">
        <Icon className={`w-3.5 h-3.5 ${accent ? "text-lime" : ""}`} /> {label}
      </p>
      <p className={`text-2xl font-black mt-2 ${accent ? "text-lime" : "text-white"}`}>{value}</p>
      {sub && <p className="text-[11px] text-white/40 mt-1">{sub}</p>}
    </div>
  );
}

function Dashboard({ data, onNavigate }) {
  const { stats } = data;
  if (!stats) return <div className="h-64 grid place-items-center"><div className="w-8 h-8 border-4 border-white/10 border-t-lime rounded-full animate-spin" /></div>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={Dice5} label="Wagering" value={stats.totalWagered.toLocaleString(undefined, { maximumFractionDigits: 0 })} sub="USDT total" accent />
        <Kpi icon={LineChart} label="House net" value={stats.houseGross.toFixed(0)} sub="USDT" />
        <Kpi icon={Wallet} label="Balances" value={stats.totalBalance.toFixed(0)} sub={`${stats.walletCount} wallets`} />
        <Kpi icon={Users} label="Users" value={stats.activeUsers} sub={`${stats.betCount} bets`} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={Coins} label="Payout" value={stats.totalPayout.toFixed(0)} />
        <Kpi icon={Trophy} label="Win rate" value={`${stats.winRate.toFixed(1)}%`} sub={`${stats.wins}W / ${stats.losses}L`} />
        <button onClick={() => onNavigate("withdrawals")} className="text-left">
          <Kpi icon={Banknote} label="Pending withdrawals" value={stats.pendingCount} sub={`${stats.pendingAmount.toFixed(0)} USDT`} warn={stats.pendingCount > 0} />
        </button>
        <Kpi icon={Gamepad2} label="Games played" value={stats.topGames.length} sub="active titles" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <h3 className="font-bold text-white mb-3">Top games by volume</h3>
        <div className="space-y-2">
          {stats.topGames.map((g) => (
            <div key={g.name} className="flex items-center gap-3">
              <span className="text-sm text-white/80 w-28 truncate">{g.name}</span>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-lime rounded-full" style={{ width: `${stats.topGames[0].wagered ? (g.wagered / stats.topGames[0].wagered) * 100 : 0}%` }} />
              </div>
              <span className="text-xs font-bold text-white/60 tabular-nums w-16 text-right">{g.wagered.toFixed(0)}</span>
            </div>
          ))}
          {!stats.topGames.length && <p className="text-sm text-white/30 text-center py-6">No bets yet</p>}
        </div>
      </div>

      <HouseMargin earnings={data.earnings} />
    </div>
  );
}

export default function AdminShell() {
  const data = useDashboardData();
  const [active, setActive] = useState("dashboard");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);
  const groups = useMemo(() => {
    const map = {};
    SECTIONS.forEach((s) => { (map[s.group] = map[s.group] || []).push(s); });
    return map;
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && SECTIONS.some((s) => s.id === hash)) setActive(hash);
  }, []);

  const navigate = (id) => {
    setActive(id);
    window.location.hash = id;
  };

  const syncCatalog = async () => {
    setSyncing(true); setSyncMsg(null);
    try {
      const res = await base44.functions.invoke("syncSlotCatalog", {});
      const d = res.data || {};
      setSyncMsg(d.error ? { ok: false, text: d.error } : { ok: true, text: `${d.created || 0} new · ${d.updated || 0} updated` });
    } catch (e) {
      setSyncMsg({ ok: false, text: e?.response?.data?.error || e.message });
    } finally { setSyncing(false); }
  };

  const renderBody = () => {
    switch (active) {
      case "dashboard": return <Dashboard data={data} onNavigate={navigate} />;
      case "withdrawals": return <WithdrawalReview />;
      case "deposits":
        return <EntityPanel entityName="Deposit" title="Deposits" description="Confirmed and pending on-chain deposits"
          searchFields={["chain", "tx_hash", "from_address", "to_address", "referral_code"]}
          columns={[
            { key: "amount", label: "amount" }, { key: "currency", label: "currency" },
            { key: "chain", label: "chain" }, statusCol(),
            { key: "created_date", label: "date", render: (v) => <span className="text-[11px] text-white/45">{v ? new Date(v).toLocaleString() : "—"}</span> },
          ]} icon={ArrowDownToLine} />;
      case "bets":
        return <EntityPanel entityName="Bet" title="Bets" description="Every settled wager across the platform"
          searchFields={["game_id", "game_name", "result"]}
          columns={[
            { key: "game_name", label: "game" }, { key: "amount", label: "amount" },
            { key: "multiplier", label: "mult", render: (v) => <span className="tabular-nums">{Number(v || 0).toFixed(2)}x</span> },
            { key: "payout", label: "payout" },
            { key: "result", label: "result", render: (v) => <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v === "win" ? "bg-lime/10 text-lime" : "bg-red-500/10 text-red-300"}`}>{v}</span> },
            { key: "created_date", label: "when", render: (v) => <span className="text-[11px] text-white/45">{v ? new Date(v).toLocaleString() : "—"}</span> },
          ]} icon={Dice5} />;
      case "earnings":
        return <EntityPanel entityName="HouseEarning" title="House earnings" description="Per-bet house profit ledger"
          searchFields={["game_name", "game_id"]}
          columns={[
            { key: "game_name", label: "game" }, { key: "wager", label: "wager" },
            { key: "payout", label: "payout" },
            { key: "house_profit", label: "net", render: (v) => <span className={`font-bold ${v >= 0 ? "text-lime" : "text-red-300"}`}>{Number(v || 0).toFixed(2)}</span> },
          ]} icon={LineChart} />;
      case "jackpot":
        return <EntityPanel entityName="GlobalJackpot" title="Global jackpot"
          columns={[{ key: "amount", label: "amount" }, { key: "currency", label: "currency" }, { key: "contributions_count", label: "contributions" }]}
          canEdit editFields={[
            { key: "amount", type: "number", label: "amount" },
            { key: "currency", label: "currency" },
            { key: "contributions_count", type: "number", label: "contributions" },
          ]} icon={Coins} />;
      case "users":
        return <EntityPanel entityName="User" title="Users" searchFields={["email", "full_name", "role"]}
          columns={[
            { key: "full_name", label: "name" }, { key: "email", label: "email" },
            { key: "role", label: "role", render: (v) => <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v === "admin" ? "bg-lime text-black" : "bg-white/10 text-white/70"}`}>{v}</span> },
          ]}
          canEdit editFields={[{ key: "full_name", label: "full name" }, { key: "email", label: "email" }, { key: "role", label: "role", options: ["user", "admin"] }]}
          icon={Users} />;
      case "wallets":
        return <EntityPanel entityName="UserWallet" title="Player wallets" searchFields={["currency"]}
          columns={[
            { key: "balance", label: "balance", render: (v) => <span className="font-bold text-lime tabular-nums">{Number(v || 0).toFixed(2)}</span> },
            { key: "currency", label: "currency" }, { key: "vip_level", label: "vip" },
            { key: "total_wagered", label: "wagered" }, { key: "xp", label: "xp" },
          ]}
          canEdit editFields={[
            { key: "balance", type: "number", label: "balance" }, { key: "currency", label: "currency" },
            { key: "vip_level", type: "number", label: "vip level" }, { key: "xp", type: "number", label: "xp" },
            { key: "total_wagered", type: "number", label: "total wagered" },
          ]} icon={Wallet} />;
      case "tournaments":
        return <EntityPanel entityName="Tournament" title="Tournaments" searchFields={["name", "game", "status"]}
          columns={[
            { key: "name", label: "name" }, { key: "game", label: "game" },
            { key: "prize_pool", label: "prize" }, statusCol(),
            { key: "participants_count", label: "players" },
          ]}
          canCreate createFields={[
            { key: "name", label: "name" }, { key: "game", label: "game", default: "all" },
            { key: "prize_pool", type: "number", label: "prize pool" }, { key: "entry_fee", type: "number", label: "entry fee" },
            { key: "status", label: "status", options: ["upcoming", "active", "ended"], default: "upcoming" },
            { key: "start_date", type: "datetime", label: "start" }, { key: "end_date", type: "datetime", label: "end" },
          ]}
          canEdit editFields={[
            { key: "name", label: "name" }, { key: "prize_pool", type: "number", label: "prize pool" },
            { key: "participants_count", type: "number", label: "participants" },
            { key: "status", label: "status", options: ["upcoming", "active", "ended"] },
          ]} icon={Trophy} />;
      case "tournament-entries":
        return <EntityPanel entityName="TournamentEntry" title="Tournament entries"
          searchFields={["username", "tournament_id"]}
          columns={[
            { key: "username", label: "player" }, { key: "wagered", label: "wagered" },
            { key: "wins", label: "wins" }, { key: "biggest_win", label: "biggest win" },
          ]} icon={Users2} />;
      case "slots":
        return <EntityPanel entityName="SlotGame" title="Slot games" searchFields={["name", "provider", "slug"]}
          columns={[
            { key: "name", label: "name" }, { key: "provider", label: "provider" },
            { key: "rtp", label: "rtp", render: (v) => <span className="tabular-nums">{v ? `${v}%` : "—"}</span> },
            { key: "has_real", label: "real", render: (v) => v ? <span className="text-lime">on</span> : <span className="text-white/40">off</span> },
            { key: "enabled", label: "enabled", render: (v) => v ? <span className="text-lime">on</span> : <span className="text-white/40">off</span> },
          ]}
          canCreate createFields={[
            { key: "slug", label: "slug" }, { key: "name", label: "name" }, { key: "provider", label: "provider" },
            { key: "rtp", type: "number", label: "rtp" }, { key: "image", label: "image url" },
            { key: "demo_url", label: "demo url" }, { key: "external_id", label: "external id" },
            { key: "has_demo", type: "boolean", label: "has demo", default: true },
            { key: "has_real", type: "boolean", label: "has real" },
            { key: "enabled", type: "boolean", label: "enabled", default: true },
          ]}
          canEdit editFields={[
            { key: "name", label: "name" }, { key: "provider", label: "provider" }, { key: "rtp", type: "number", label: "rtp" },
            { key: "demo_url", label: "demo url" }, { key: "has_demo", type: "boolean", label: "has demo" },
            { key: "has_real", type: "boolean", label: "has real" }, { key: "enabled", type: "boolean", label: "enabled" },
          ]} icon={Gamepad2} />;
      case "packs":
        return <EntityPanel entityName="CardPack" title="Card packs" searchFields={["name", "rarity"]}
          columns={[
            { key: "name", label: "name" }, { key: "price", label: "price" },
            { key: "rarity", label: "rarity" }, { key: "cards_count", label: "cards" },
          ]}
          canCreate createFields={[
            { key: "name", label: "name" }, { key: "price", type: "number", label: "price" },
            { key: "rarity", label: "rarity" }, { key: "cards_count", type: "number", label: "cards count" },
          ]}
          canEdit editFields={[
            { key: "name", label: "name" }, { key: "price", type: "number", label: "price" },
            { key: "rarity", label: "rarity" }, { key: "cards_count", type: "number", label: "cards count" },
          ]} icon={Package} />;
      case "cards":
        return <EntityPanel entityName="CollectibleCard" title="Collectible cards" searchFields={["name", "rarity", "set"]}
          columns={[
            { key: "name", label: "name" }, { key: "rarity", label: "rarity" },
            { key: "set", label: "set" }, { key: "mint_number", label: "mint" },
          ]} icon={Layers} />;
      case "pulls":
        return <EntityPanel entityName="CardPull" title="Card pulls"
          columns={[
            { key: "pack_id", label: "pack" }, { key: "card_id", label: "card" },
            { key: "created_date", label: "when", render: (v) => <span className="text-[11px] text-white/45">{v ? new Date(v).toLocaleString() : "—"}</span> },
          ]} icon={Gift} />;
      case "listings":
        return <EntityPanel entityName="MarketListing" title="Marketplace listings" searchFields={["status"]}
          columns={[
            { key: "card_id", label: "card" }, { key: "price", label: "price" },
            statusCol(), { key: "created_date", label: "listed", render: (v) => <span className="text-[11px] text-white/45">{v ? new Date(v).toLocaleString() : "—"}</span> },
          ]} icon={Store} />;
      case "affiliates":
        return <EntityPanel entityName="Affiliate" title="Affiliates" searchFields={["referral_code", "commission_plan"]}
          columns={[
            { key: "referral_code", label: "code" },
            { key: "commission_plan", label: "plan" },
            { key: "total_referrals", label: "referrals" },
            { key: "pending_commission", label: "pending", render: (v) => <span className="text-lime font-bold">{Number(v || 0).toFixed(2)}</span> },
            { key: "paid_commission", label: "paid" },
          ]}
          canEdit editFields={[
            { key: "commission_plan", label: "plan", options: ["revshare", "cpa", "hybrid"] },
            { key: "commission_rate", type: "number", label: "rate %" },
            { key: "cpa_amount", type: "number", label: "cpa amount" },
            { key: "paid_commission", type: "number", label: "paid commission" },
          ]} icon={Sparkles} />;
      case "referrals":
        return <EntityPanel entityName="Referral" title="Referrals" searchFields={["player_alias", "status"]}
          columns={[
            { key: "player_alias", label: "player" }, statusCol("status"),
            { key: "total_wagered", label: "wagered" }, { key: "net_loss", label: "net loss" },
          ]} icon={Users2} />;
      case "commissions":
        return <EntityPanel entityName="CommissionLog" title="Commission logs"
          columns={[
            { key: "affiliate_id", label: "affiliate" }, { key: "deposit_amount", label: "deposit" },
            { key: "commission", label: "commission", render: (v) => <span className="text-lime font-bold">{Number(v || 0).toFixed(2)}</span> },
            { key: "plan", label: "plan" },
          ]} icon={CreditCard} />;
      case "chat":
        return <EntityPanel entityName="ChatMessage" title="Chat messages" searchFields={["username", "message"]}
          columns={[
            { key: "username", label: "user" }, { key: "message", label: "message" },
            { key: "created_date", label: "when", render: (v) => <span className="text-[11px] text-white/45">{v ? new Date(v).toLocaleString() : "—"}</span> },
          ]} icon={MessageSquare} />;
      case "telegram": return <TelegramSettings />;
      case "demo": return <DemoMonitor />;
      case "limits":
        return <EntityPanel entityName="ResponsibleLimit" title="Responsible-gaming limits" searchFields={["type", "period"]}
          columns={[
            { key: "type", label: "type" }, { key: "limit_value", label: "limit" },
            { key: "period", label: "period" },
            { key: "active", label: "active", render: (v) => v ? <span className="text-lime">on</span> : <span className="text-white/40">off</span> },
          ]} icon={Shield} />;
      case "notifications":
        return <EntityPanel entityName="AppNotification" title="In-app notifications" searchFields={["title", "type"]}
          columns={[
            { key: "type", label: "type" }, { key: "title", label: "title" },
            { key: "amount", label: "amount" },
            { key: "read", label: "read", render: (v) => v ? <span className="text-white/40">read</span> : <span className="text-lime">new</span> },
          ]}
          canCreate createFields={[
            { key: "type", label: "type", options: ["win", "deposit", "withdrawal", "bonus", "system", "social", "achievement"], default: "system" },
            { key: "title", label: "title" }, { key: "message", label: "message" },
            { key: "amount", type: "number", label: "amount" }, { key: "link", label: "link" },
            { key: "read", type: "boolean", label: "read" },
          ]}
          canEdit editFields={[
            { key: "title", label: "title" }, { key: "message", label: "message" },
            { key: "read", type: "boolean", label: "read" },
          ]} icon={Bell} />;
      case "settings":
        return (
          <div className="space-y-4">
            <IntegrationSettings />
            <TelegramSettings />
            <PaymentSettings />
            <CatalogSettings />
            <AggregatorSettings />
          </div>
        );
      default: return null;
    }
  };

  const current = SECTIONS.find((s) => s.id === active) || SECTIONS[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#0d0d0d] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
        <div className="p-4">
          <button onClick={syncCatalog} disabled={syncing}
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-lime text-black text-xs font-black hover:brightness-110 disabled:opacity-50">
            {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Sync slots
          </button>
          {syncMsg && <p className={`text-[11px] mt-2 ${syncMsg.ok ? "text-lime" : "text-red-300"}`}>{syncMsg.text}</p>}
        </div>
        <nav className="px-2 pb-6 space-y-4">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <p className="px-3 mb-1 text-[10px] font-black uppercase tracking-wider text-white/30">{group}</p>
              <div className="space-y-0.5">
                {items.map((s) => (
                  <button key={s.id} onClick={() => navigate(s.id)}
                    className={`w-full flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm font-bold transition ${
                      active === s.id ? "bg-lime text-black" : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}>
                    <s.icon className="w-4 h-4" /> {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile section selector */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0d0d0d] border-t border-white/10 p-2">
        <select value={active} onChange={(e) => navigate(e.target.value)}
          className="w-full h-11 rounded-xl bg-[#1a1a1a] border border-white/10 px-3 text-sm text-white">
          {Object.entries(groups).map(([g, items]) => (
            <optgroup key={g} label={g}>
              {items.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 pb-24 lg:pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-lime/10 grid place-items-center">
            <current.icon className="w-5 h-5 text-lime" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{current.label}</h1>
            <p className="text-[11px] text-white/40">Admin control center</p>
          </div>
        </div>
        {renderBody()}
      </main>
    </div>
  );
}
