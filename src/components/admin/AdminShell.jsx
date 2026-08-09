import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Users, Wallet, Coins, Banknote, ArrowDownToLine, Gamepad2,
  Dice5, LineChart, Trophy, Users2, Gift, CreditCard, Layers, Package,
  Sparkles, Store, Shield, MessageSquare, Bell, Settings, BarChart3,
  RefreshCw,
  UserCog, ListChecks, Mail, Activity,
  UserSearch, MonitorPlay, SlidersHorizontal, Receipt,
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

  { id: "team", label: "Team", icon: UserCog, group: "CRM" },
  { id: "crm-tasks", label: "Tasks", icon: ListChecks, group: "CRM" },
  { id: "crm-chat", label: "CRM chat", icon: MessageSquare, group: "CRM" },
  { id: "crm-email", label: "Email", icon: Mail, group: "CRM" },
  { id: "crm-activity", label: "Activity log", icon: Activity, group: "CRM" },

  { id: "player-profiles", label: "Player profiles", icon: UserSearch, group: "Ops" },
  { id: "player-sessions", label: "Player sessions", icon: MonitorPlay, group: "Ops" },
  { id: "operation-controls", label: "Operation controls", icon: SlidersHorizontal, group: "Ops" },
  { id: "deposit-events", label: "Deposit events", icon: Receipt, group: "Ops" },
  { id: "telegram-rules", label: "Telegram rules", icon: Bell, group: "Ops" },
  { id: "chat", label: "Community chat", icon: MessageSquare, group: "Ops" },
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

function SyncButton({ label, description, fn, onDone }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const run = async () => {
    setBusy(true); setMsg(null);
    try {
      const res = await base44.functions.invoke(fn, {});
      const d = res.data || {};
      setMsg({ ok: !d.error, text: d.error || (d.created != null ? `${d.created} created · ${d.updated} updated` : "Done") });
      onDone && onDone(d);
    } catch (e) {
      setMsg({ ok: false, text: e?.response?.data?.error || e.message || "Failed" });
    } finally { setBusy(false); }
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-4 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">{label}</p>
        {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
        {msg && <p className={`text-xs mt-1 ${msg.ok ? "text-lime" : "text-red-300"}`}>{msg.text}</p>}
      </div>
      <button onClick={run} disabled={busy}
        className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-lime text-black text-sm font-black hover:brightness-110 disabled:opacity-50">
        {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Sync now
      </button>
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

      case "team":
        return <EntityPanel entityName="TeamMember" title="CRM team" searchFields={["name", "email", "role", "department"]}
          columns={[
            { key: "name", label: "name" }, { key: "email", label: "email" },
            { key: "role", label: "role" }, { key: "department", label: "dept" },
            { key: "status", label: "status", render: (v) => <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v === "active" ? "bg-lime/10 text-lime" : "bg-white/10 text-white/60"}`}>{v}</span> },
          ]}
          canCreate createFields={[
            { key: "name", label: "name" }, { key: "email", label: "email" },
            { key: "role", label: "role", default: "agent" },
            { key: "department", label: "department", default: "general" },
            { key: "phone", label: "phone" }, { key: "status", label: "status", options: ["active", "away", "offline"], default: "active" },
          ]}
          canEdit editFields={[
            { key: "name", label: "name" }, { key: "email", label: "email" },
            { key: "role", label: "role" }, { key: "department", label: "department" },
            { key: "phone", label: "phone" }, { key: "status", label: "status", options: ["active", "away", "offline"] },
            { key: "bio", label: "bio" },
          ]} icon={UserCog} />;

      case "crm-tasks":
        return <EntityPanel entityName="CrmTask" title="CRM tasks" searchFields={["title", "status", "priority", "assignee_id"]}
          columns={[
            { key: "title", label: "title" },
            { key: "status", label: "status", render: (v) => {
              const colors = { todo: "bg-white/10 text-white/70", in_progress: "bg-blue-500/10 text-blue-300", blocked: "bg-red-500/10 text-red-300", done: "bg-lime/10 text-lime", cancelled: "bg-white/5 text-white/40" };
              return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[v] || colors.todo}`}>{v?.replace("_", " ")}</span>;
            } },
            { key: "priority", label: "priority", render: (v) => {
              const colors = { low: "text-white/50", medium: "text-blue-300", high: "text-amber-300", urgent: "text-red-300" };
              return <span className={`text-xs font-bold ${colors[v] || ""}`}>{v}</span>;
            } },
            { key: "due_date", label: "due", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
          ]}
          canCreate createFields={[
            { key: "title", label: "title" }, { key: "description", label: "description" },
            { key: "status", label: "status", options: ["todo", "in_progress", "blocked", "done", "cancelled"], default: "todo" },
            { key: "priority", label: "priority", options: ["low", "medium", "high", "urgent"], default: "medium" },
            { key: "assignee_id", label: "assignee id" }, { key: "due_date", type: "datetime", label: "due date" },
            { key: "tags", label: "tags" }, { key: "order", type: "number", label: "order" },
          ]}
          canEdit editFields={[
            { key: "title", label: "title" }, { key: "description", label: "description" },
            { key: "status", label: "status", options: ["todo", "in_progress", "blocked", "done", "cancelled"] },
            { key: "priority", label: "priority", options: ["low", "medium", "high", "urgent"] },
            { key: "assignee_id", label: "assignee id" }, { key: "due_date", type: "datetime", label: "due date" },
            { key: "tags", label: "tags" }, { key: "order", type: "number", label: "order" },
          ]} icon={ListChecks} />;

      case "crm-chat":
        return <EntityPanel entityName="CrmChannel" title="CRM chat channels" searchFields={["name", "type", "members"]}
          columns={[
            { key: "name", label: "name" }, { key: "type", label: "type" },
            { key: "members", label: "members", render: (v) => <span className="font-mono text-[11px] text-white/55">{String(v || "").split(",").filter(Boolean).length} member(s)</span> },
          ]}
          canCreate createFields={[
            { key: "name", label: "name" },
            { key: "type", label: "type", options: ["channel", "direct", "group"], default: "channel" },
            { key: "members", label: "members (comma-separated ids)" },
            { key: "description", label: "description" }, { key: "created_by", label: "created by" },
          ]}
          canEdit editFields={[
            { key: "name", label: "name" }, { key: "type", label: "type", options: ["channel", "direct", "group"] },
            { key: "members", label: "members" }, { key: "description", label: "description" },
          ]} icon={MessageSquare} />;

      case "crm-email":
        return <EntityPanel entityName="CrmEmail" title="CRM email" searchFields={["subject", "from_address", "to_addresses", "status"]}
          columns={[
            { key: "from_address", label: "from", render: (v) => <span className="font-mono text-[11px]">{v}</span> },
            { key: "to_addresses", label: "to", render: (v) => <span className="font-mono text-[11px] text-white/60">{v}</span> },
            { key: "subject", label: "subject" },
            statusCol("status"),
            { key: "starred", label: "★", render: (v) => v ? <span className="text-amber-300">★</span> : <span className="text-white/20">☆</span> },
          ]}
          canCreate createFields={[
            { key: "from_address", label: "from" }, { key: "to_addresses", label: "to" },
            { key: "cc_addresses", label: "cc" }, { key: "bcc_addresses", label: "bcc" },
            { key: "subject", label: "subject" }, { key: "plain_body", label: "body" },
            { key: "status", label: "status", options: ["inbox", "sent", "draft", "archived", "scheduled", "sending"], default: "draft" },
            { key: "folder", label: "folder", default: "inbox" },
            { key: "starred", type: "boolean", label: "starred" },
            { key: "important", type: "boolean", label: "important" },
          ]}
          canEdit editFields={[
            { key: "subject", label: "subject" }, { key: "plain_body", label: "body" },
            { key: "status", label: "status", options: ["inbox", "sent", "draft", "archived", "scheduled", "sending"] },
            { key: "folder", label: "folder" }, { key: "starred", type: "boolean", label: "starred" },
            { key: "important", type: "boolean", label: "important" },
          ]} icon={Mail} />;

      case "crm-activity":
        return <EntityPanel entityName="CrmActivity" title="CRM activity log" searchFields={["action", "entity_type", "member_id", "details"]}
          columns={[
            { key: "member_id", label: "member", render: (v) => <span className="font-mono text-[11px] text-white/55">{v ? String(v).slice(0, 8) : "—"}</span> },
            { key: "action", label: "action" }, { key: "entity_type", label: "entity" },
            { key: "entity_id", label: "entity id", render: (v) => <span className="font-mono text-[11px] text-white/45">{v ? String(v).slice(0, 8) : "—"}</span> },
            { key: "created_date", label: "when", render: (v) => v ? new Date(v).toLocaleString() : "—" },
          ]} icon={Activity} />;

      case "player-profiles":
        return (
          <div className="space-y-4">
            <SyncButton
              label="Sync profiles from ledger"
              description="Recomputes risk level, segment, deposits and net profit from users, bets, deposits and withdrawals."
              fn="syncPlayerProfiles"
              onDone={data.reload}
            />
            <EntityPanel entityName="PlayerProfile" title="Player profiles" searchFields={["username", "email", "external_id", "segment", "risk_level"]}
          columns={[
            { key: "username", label: "player" }, { key: "email", label: "email" },
            { key: "risk_level", label: "risk", render: (v) => {
              const colors = { low: "text-lime", normal: "text-white/70", high: "text-amber-300", vip: "text-purple-300", problem: "text-red-300" };
              return <span className={`text-xs font-bold ${colors[v] || ""}`}>{v}</span>;
            } },
            { key: "segment", label: "segment" },
            { key: "net_profit", label: "net", render: (v) => <span className={`font-bold tabular-nums ${v >= 0 ? "text-lime" : "text-red-300"}`}>{Number(v || 0).toFixed(2)}</span> },
            { key: "total_bets", label: "bets" },
          ]}
          canCreate createFields={[
            { key: "external_id", label: "external id" }, { key: "username", label: "username" },
            { key: "email", label: "email" }, { key: "avatar", label: "avatar url" },
            { key: "risk_level", label: "risk", options: ["low", "normal", "high", "vip", "problem"], default: "normal" },
            { key: "segment", label: "segment", options: ["standard", "new", "active", "dormant", "vip", "whale", "at_risk"], default: "standard" },
            { key: "notes", label: "notes" },
          ]}
          canEdit editFields={[
            { key: "username", label: "username" }, { key: "email", label: "email" },
            { key: "risk_level", label: "risk", options: ["low", "normal", "high", "vip", "problem"] },
            { key: "segment", label: "segment", options: ["standard", "new", "active", "dormant", "vip", "whale", "at_risk"] },
            { key: "total_deposits", type: "number", label: "total deposits" },
            { key: "total_withdrawals", type: "number", label: "total withdrawals" },
            { key: "notes", label: "notes" },
          ]} icon={UserSearch} />
          </div>
        );

      case "player-sessions":
        return <EntityPanel entityName="PlayerSession" title="Player sessions" searchFields={["player_id", "game_name", "game_type", "outcome", "ip_address"]}
          columns={[
            { key: "player_id", label: "player", render: (v) => <span className="font-mono text-[11px]">{v ? String(v).slice(0, 10) : "—"}</span> },
            { key: "game_name", label: "game" },
            { key: "bet_amount", label: "bet", render: (v) => Number(v || 0).toFixed(2) },
            { key: "win_amount", label: "win", render: (v) => <span className="text-lime tabular-nums">{Number(v || 0).toFixed(2)}</span> },
            { key: "outcome", label: "outcome", render: (v) => <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v === "win" ? "bg-lime/10 text-lime" : v === "push" ? "bg-white/10 text-white/70" : "bg-red-500/10 text-red-300"}`}>{v}</span> },
            { key: "duration", label: "dur (s)" },
          ]}
          canCreate createFields={[
            { key: "player_id", label: "player id" }, { key: "session_id", label: "session id" },
            { key: "game_type", label: "game type" }, { key: "game_id", label: "game id" },
            { key: "game_name", label: "game name" },
            { key: "bet_amount", type: "number", label: "bet amount" },
            { key: "win_amount", type: "number", label: "win amount" },
            { key: "outcome", label: "outcome", options: ["win", "loss", "push", "pending"], default: "loss" },
            { key: "spins", type: "number", label: "spins" }, { key: "duration", type: "number", label: "duration seconds" },
            { key: "ip_address", label: "ip address" }, { key: "user_agent", label: "user agent" },
            { key: "controlled", type: "boolean", label: "controlled" },
            { key: "control_type", label: "control type" },
          ]}
          canEdit editFields={[
            { key: "game_name", label: "game name" },
            { key: "bet_amount", type: "number", label: "bet" },
            { key: "win_amount", type: "number", label: "win" },
            { key: "outcome", label: "outcome", options: ["win", "loss", "push", "pending"] },
            { key: "controlled", type: "boolean", label: "controlled" },
            { key: "control_type", label: "control type" },
          ]} icon={MonitorPlay} />;

      case "operation-controls":
        return <EntityPanel entityName="OperationControl" title="Operation controls" searchFields={["name", "target_scope", "control_mode", "enabled"]}
          columns={[
            { key: "name", label: "control" },
            { key: "target_scope", label: "scope" },
            { key: "control_mode", label: "mode" },
            { key: "priority", label: "priority" },
            { key: "enabled", label: "on", render: (v) => v ? <span className="text-lime">● on</span> : <span className="text-white/30">○ off</span> },
            { key: "expires_at", label: "expires", render: (v) => v ? new Date(v).toLocaleString() : "—" },
          ]}
          canCreate createFields={[
            { key: "name", label: "name" }, { key: "description", label: "description" },
            { key: "target_scope", label: "scope", options: ["all", "player", "game", "segment", "provider"], default: "all" },
            { key: "target_value", label: "target value" },
            { key: "control_mode", label: "mode", options: ["normal", "limit", "block", "boost", "freeze"], default: "normal" },
            { key: "rtp_target", type: "number", label: "rtp target" },
            { key: "max_win_amount", type: "number", label: "max win" },
            { key: "max_loss_amount", type: "number", label: "max loss" },
            { key: "streak_threshold", type: "number", label: "streak threshold" },
            { key: "priority", type: "number", label: "priority" },
            { key: "enabled", type: "boolean", label: "enabled" },
            { key: "expires_at", type: "datetime", label: "expires at" },
          ]}
          canEdit editFields={[
            { key: "name", label: "name" }, { key: "description", label: "description" },
            { key: "target_scope", label: "scope", options: ["all", "player", "game", "segment", "provider"] },
            { key: "target_value", label: "target value" },
            { key: "control_mode", label: "mode", options: ["normal", "limit", "block", "boost", "freeze"] },
            { key: "rtp_target", type: "number", label: "rtp target" },
            { key: "max_win_amount", type: "number", label: "max win" },
            { key: "max_loss_amount", type: "number", label: "max loss" },
            { key: "priority", type: "number", label: "priority" },
            { key: "enabled", type: "boolean", label: "enabled" },
            { key: "expires_at", type: "datetime", label: "expires at" },
          ]} icon={SlidersHorizontal} />;

      case "deposit-events":
        return <EntityPanel entityName="DepositEvent" title="Deposit events" searchFields={["player_id", "tx_hash", "method", "status"]}
          columns={[
            { key: "player_id", label: "player", render: (v) => <span className="font-mono text-[11px]">{v ? String(v).slice(0, 10) : "—"}</span> },
            { key: "amount", label: "amount", render: (v) => <span className="font-bold text-lime tabular-nums">{Number(v || 0).toFixed(2)}</span> },
            { key: "currency", label: "currency" }, { key: "method", label: "method" },
            statusCol("status"),
            { key: "is_first_deposit", label: "1st", render: (v) => v ? <span className="text-lime">●</span> : "" },
            { key: "created_date", label: "when", render: (v) => v ? new Date(v).toLocaleString() : "—" },
          ]}
          canCreate createFields={[
            { key: "player_id", label: "player id" },
            { key: "amount", type: "number", label: "amount" },
            { key: "currency", label: "currency", default: "USDT" },
            { key: "method", label: "method" }, { key: "tx_hash", label: "tx hash" },
            { key: "status", label: "status", options: ["pending", "completed", "failed"], default: "completed" },
            { key: "is_first_deposit", type: "boolean", label: "first deposit" },
            { key: "is_recurring", type: "boolean", label: "recurring" },
            { key: "deposit_number", type: "number", label: "deposit number" },
            { key: "notes", label: "notes" },
          ]}
          canEdit editFields={[
            { key: "amount", type: "number", label: "amount" },
            { key: "status", label: "status", options: ["pending", "completed", "failed"] },
            { key: "is_first_deposit", type: "boolean", label: "first deposit" },
            { key: "notes", label: "notes" },
          ]} icon={Receipt} />;

      case "telegram-rules":
        return <EntityPanel entityName="TelegramAlertRule" title="Telegram alert rules" searchFields={["name", "event_type", "telegram_chat_id"]}
          columns={[
            { key: "name", label: "rule" }, { key: "event_type", label: "event" },
            { key: "telegram_chat_id", label: "chat", render: (v) => <span className="font-mono text-[11px] text-white/55">{v}</span> },
            { key: "cooldown_minutes", label: "cooldown" },
            { key: "enabled", label: "on", render: (v) => v ? <span className="text-lime">● on</span> : <span className="text-white/30">○ off</span> },
          ]}
          canCreate createFields={[
            { key: "name", label: "name" },
            { key: "event_type", label: "event type", options: ["registration", "login", "deposit", "withdrawal", "deposit_pending", "big_win", "system"] },
            { key: "condition", label: "condition" },
            { key: "telegram_chat_id", label: "telegram chat id" },
            { key: "telegram_thread_id", label: "thread id" },
            { key: "message_template", label: "message template" },
            { key: "cooldown_minutes", type: "number", label: "cooldown minutes", default: 5 },
            { key: "enabled", type: "boolean", label: "enabled", default: true },
          ]}
          canEdit editFields={[
            { key: "name", label: "name" }, { key: "event_type", label: "event type", options: ["registration", "login", "deposit", "withdrawal", "deposit_pending", "big_win", "system"] },
            { key: "condition", label: "condition" },
            { key: "telegram_chat_id", label: "telegram chat id" },
            { key: "telegram_thread_id", label: "thread id" },
            { key: "message_template", label: "message template" },
            { key: "cooldown_minutes", type: "number", label: "cooldown minutes" },
            { key: "enabled", type: "boolean", label: "enabled" },
          ]} icon={Bell} />;
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
