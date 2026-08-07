import React, { useEffect, useMemo, useState } from "react";
import { Trophy, Gem, Layers, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { COLLECTION_NAMES, collectionCardList, rarityColor } from "@/lib/packs";

// Community collector leaderboard — ranks the top users by total card value
// (sum of insured_value) and number of completed thematic sets. Live-updates
// via the CollectibleCard subscription.
const alias = (id) => {
  const s = String(id || "");
  return s.length > 8 ? `${s.slice(0, 4)}…${s.slice(-3)}` : s || "anon";
};

export default function CollectorLeaderboard() {
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
      if (!byUser[u]) byUser[u] = { value: 0, sets: {} };
      const key = `${c.collection}::${c.card_name}`;
      const prev = byUser[u].sets[key];
      if (!prev || (c.insured_value || 0) > (prev.insured_value || 0)) {
        if (prev) byUser[u].value -= prev.insured_value || 0;
        byUser[u].sets[key] = c;
        byUser[u].value += c.insured_value || 0;
      }
    });

    return Object.entries(byUser)
      .map(([uid, d]) => {
        const perCol = {};
        Object.values(d.sets).forEach((c) => {
          if (!perCol[c.collection]) perCol[c.collection] = new Set();
          perCol[c.collection].add(c.card_name);
        });
        const completedSets = Object.entries(perCol).filter(([col, s]) => totals[col] && s.size >= totals[col]).length;
        const uniqueCards = Object.keys(d.sets).length;
        const best = Object.values(d.sets).sort((a, b) => (b.insured_value || 0) - (a.insured_value || 0))[0] || null;
        return { uid, name: users[uid] || alias(uid), totalValue: d.value, completedSets, uniqueCards, best };
      })
      .sort((a, b) => b.totalValue - a.totalValue || b.completedSets - a.completedSets)
      .slice(0, 10);
  }, [cards, users]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-lime" />
        <span className="text-sm font-black text-white">Top Collectors</span>
        <span className="ml-auto text-[11px] text-white/40">By vault value &amp; completed sets</span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-white/40 animate-pulse">Loading collectors…</div>
      ) : leaders.length === 0 ? (
        <div className="p-8 text-center text-sm text-white/40">No collectors yet — open a pack to lead the board.</div>
      ) : (
        <ol className="divide-y divide-white/5">
          {leaders.map((p, i) => {
            const rank = i + 1;
            const frame = p.best ? rarityColor(p.best.rarity) : "#ccff00";
            return (
              <li key={p.uid} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03]">
                <div className="w-7 text-center font-display text-lg">
                  {rank === 1 ? <Crown className="w-5 h-5 mx-auto text-lime" /> : <span className={rank <= 3 ? "text-white" : "text-white/40"}>{rank}</span>}
                </div>
                <div className="w-9 h-9 rounded-full grid place-items-center border-2 text-sm font-display shrink-0" style={{ borderColor: frame, color: frame, background: frame + "12" }}>
                  {String(p.name).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate">{p.name}</p>
                  <p className="text-[11px] text-white/40 truncate">{p.uniqueCards} unique{p.best ? ` · top: ${p.best.card_name}` : ""}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-black text-lime tabular-nums justify-end">
                    <Gem className="w-3.5 h-3.5" />${p.totalValue.toLocaleString()}
                  </div>
                  <div className="text-[10px] uppercase text-white/40 flex items-center gap-1 justify-end">
                    <Layers className="w-3 h-3" />{p.completedSets} sets
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}