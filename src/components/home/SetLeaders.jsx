import React, { useEffect, useMemo, useState } from "react";
import { Trophy, Crown, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { COLLECTION_NAMES, collectionCardList, RARITY_ORDER, rarityColor, rarityVisual } from "@/lib/packs";

// "Set Completion Leaders" — live leaderboard of the top collectors across the
// platform. Ranks players by completed thematic sets, with a rarity score
// (weighted by rarity tier) as the tie-breaker. Subscribes to CollectibleCard
// so new pulls update the standings in real time.

const RARITY_POINTS = { common: 1, rare: 3, epic: 9, legendary: 27, mythic: 81 };
const tierPts = (r) => RARITY_POINTS[r] || 1;

const alias = (id) => {
  const s = String(id || "");
  return s.length > 8 ? `${s.slice(0, 4)}…${s.slice(-3)}` : s || "anon";
};

export default function SetLeaders() {
  const [cards, setCards] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    base44.entities.CollectibleCard
      .list("-created_date", 500)
      .then((l) => active && setCards(l || []))
      .catch(() => {})
      .finally(() => active && setLoading(false));

    // Best-effort name resolution (admin-gated list — falls back to alias).
    base44.entities.User
      .list()
      .then((l) => {
        if (!active) return;
        const map = {};
        (l || []).forEach((u) => { map[u.id] = u.full_name || u.email || alias(u.id); });
        setUsers(map);
      })
      .catch(() => {});

    const unsub = base44.entities.CollectibleCard.subscribe((event) => {
      if (event.type === "create" && event.data) setCards((p) => [event.data, ...p]);
      if (event.type === "delete" && event.data) setCards((p) => p.filter((c) => c.id !== event.data.id));
    });
    return () => { active = false; if (typeof unsub === "function") unsub(); };
  }, []);

  const leaders = useMemo(() => {
    const totals = COLLECTION_NAMES.reduce((m, n) => ((m[n] = collectionCardList(n).length), m), {});
    const byUser = {};
    cards.forEach((c) => {
      const u = c.created_by_id || "guest";
      if (!byUser[u]) byUser[u] = {};
      const key = `${c.collection}::${c.card_name}`;
      const prev = byUser[u][key];
      if (!prev || (c.insured_value || 0) > (prev.insured_value || 0)) byUser[u][key] = c;
    });

    return Object.entries(byUser)
      .map(([uid, owned]) => {
        const perCollection = {};
        let rarityScore = 0;
        Object.values(owned).forEach((c) => {
          rarityScore += tierPts(c.rarity);
          if (!perCollection[c.collection]) perCollection[c.collection] = new Set();
          perCollection[c.collection].add(c.card_name);
        });
        const completedSets = Object.entries(perCollection).filter(
          ([col, set]) => totals[col] && set.size >= totals[col]
        ).length;
        const uniqueCards = Object.keys(owned).length;
        return { uid, name: users[uid] || alias(uid), completedSets, rarityScore, uniqueCards, best: topCard(Object.values(owned)) };
      })
      .sort((a, b) => b.completedSets - a.completedSets || b.rarityScore - a.rarityScore)
      .slice(0, 10);
  }, [cards, users]);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-lime" />
        <h2 className="text-lg font-display uppercase tracking-tight text-white">Set Leaders</h2>
        <span className="ml-2 text-xs text-white/40">Top collectors by completed sets</span>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111] overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-sm text-white/40 animate-pulse">Loading leaderboard…</div>
        ) : leaders.length === 0 ? (
          <div className="p-8 text-center text-sm text-white/40">
            No collectors yet — open a pack to claim the top spot.
          </div>
        ) : (
          <ol className="divide-y divide-white/5">
            {leaders.map((p, i) => {
              const rank = i + 1;
              const podium = rank <= 3;
              const frame = p.best ? rarityColor(p.best.rarity) : "#ccff00";
              return (
                <li key={p.uid} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03]">
                  <div className={`w-7 text-center font-display text-lg ${rank === 1 ? "text-lime" : rank === 2 ? "text-white" : rank === 3 ? "text-orange-400" : "text-white/40"}`}>
                    {podium ? <Crown className="w-5 h-5 mx-auto" style={{ color: rank === 1 ? "#ccff00" : rank === 2 ? "#cbd5e1" : "#fb923c" }} /> : rank}
                  </div>
                  <div className="w-9 h-9 rounded-full grid place-items-center border-2 text-sm font-display shrink-0" style={{ borderColor: frame, color: frame, background: frame + "12" }}>
                    {String(p.name).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate">{p.name}</p>
                    <p className="text-[11px] text-white/40">{p.uniqueCards} unique cards{p.best ? ` · top: ${p.best.card_name}` : ""}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-white tabular-nums">{p.completedSets}</div>
                    <div className="text-[10px] uppercase text-white/40">sets</div>
                  </div>
                  <div className="flex items-center gap-1 pl-3 ml-1 border-l border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-lime" />
                    <span className="text-sm font-black text-lime tabular-nums">{p.rarityScore.toLocaleString()}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}

function topCard(list) {
  const order = RARITY_ORDER.slice().reverse();
  return list.slice().sort((a, b) => order.indexOf(b.rarity) - order.indexOf(a.rarity))[0] || null;
}