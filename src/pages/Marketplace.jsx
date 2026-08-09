import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Repeat, Tag, X, Search } from "lucide-react";
import { base44 } from "@/api/client";
import { getMockListings, getMockCollectibleCards } from "@/lib/mockAdmin";
import { useWallet } from "@/components/WalletProvider";
import { useToast } from "@/components/ui/use-toast";
import MarketCardTile from "@/components/cards/MarketCardTile";
import { COLLECTION_NAMES, rarityColor, rarityLabel } from "@/lib/packs";

const TABS = [
  { id: "buy", label: "Buy", icon: ShoppingCart },
  { id: "sell", label: "Sell", icon: Tag },
  { id: "swap", label: "Swap", icon: Repeat },
];

export default function Marketplace() {
  const [tab, setTab] = useState("buy");
  const [listings, setListings] = useState([]);
  const [myCards, setMyCards] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [myUserId, setMyUserId] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { wallet, updateBalance } = useWallet();
  const { toast } = useToast();

  const loadAll = async () => {
    setLoading(true);
    try {
      let me = null; try { me = await base44.auth.me(); } catch {}
      setMyUserId(me?.id || null);
      const [active, owned, recent] = await Promise.all([
        base44.entities.MarketListing.filter({ status: "active" }, "-created_date", 100).catch(()=> getMockListings()),
        base44.entities.CollectibleCard.list("-created_date", 100).catch(()=> getMockCollectibleCards()),
        base44.entities.MarketListing.list("-updated_date", 200).catch(()=> getMockListings()),
      ]);
      const a = (active && active.length ? active : getMockListings());
      const o = (owned && owned.length ? owned : getMockCollectibleCards());
      const r = (recent && recent.length ? recent : getMockListings());
      setListings(a || []);
      setRecent(r || []);
      setMyCards(o || []);
      setMyListings((a || []).filter((l) => me && l.created_by_id === me.id));
    } catch (e) { 
      setListings(getMockListings());
      setMyCards(getMockCollectibleCards());
      setRecent(getMockListings());
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, []);

  // Trades in the last 24h per card name — drives the dynamic "Hot" badge.
  const trades24h = useMemo(() => {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const counts = {};
    recent.forEach((l) => {
      const t = new Date(l.updated_date || l.created_date).getTime();
      if (t >= since) counts[l.card_name] = (counts[l.card_name] || 0) + 1;
    });
    return counts;
  }, [recent]);

  const hotNames = useMemo(() => {
    const top = Object.entries(trades24h).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return new Set(top.map(([name]) => name));
  }, [trades24h]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings
      .filter((l) => (tab === "buy" ? l.listing_type === "sale" : l.listing_type === "swap"))
      .filter((l) => !q || (l.card_name || "").toLowerCase().includes(q) || (l.collection || "").toLowerCase().includes(q));
  }, [listings, tab, query]);

  return (
    <div className="min-h-screen pb-10">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-5 space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display uppercase text-white tracking-tight">Marketplace</h1>
          <p className="text-sm text-white/50 mt-0.5">Buy, sell and swap TOLS collectible cards.</p>
        </div>

        <div className="flex items-center gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-black transition ${tab === t.id ? "bg-lime text-black" : "bg-card border border-white/10 text-white/60"}`}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "sell" ? (
          <SellForm myCards={myCards} myListings={myListings} onChange={loadAll} />
        ) : (
          <>
            <div className="flex items-center gap-2 px-3 h-11 rounded-xl bg-card border border-white/10">
              <Search className="w-4 h-4 text-white/30" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cards or collections" className="bg-transparent outline-none text-sm text-white/80 placeholder-white/30 w-full" />
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-72 rounded-xl border border-white/[0.06] bg-[#121212] animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#121212] py-12 text-center text-sm text-white/40">No {tab === "buy" ? "sale" : "swap"} listings right now.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((l) => (
                  <ListingCard
                    key={l.id}
                    listing={l}
                    hot={hotNames.has(l.card_name)}
                    trades24h={trades24h[l.card_name] || 0}
                    onAction={tab === "buy" ? () => buyCard(l, loadAll, updateBalance, wallet, toast) : () => proposeSwap(l, loadAll, toast)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function ListingCard({ listing, onAction, hot, trades24h }) {
  const isSale = listing.listing_type === "sale";
  return (
    <MarketCardTile
      listing={listing}
      hot={hot}
      trades24h={trades24h}
      actionLabel={isSale ? "Buy now" : "Propose swap"}
      actionVariant={isSale ? "solid" : "outline"}
      onAction={onAction}
      footer={
        <div className="mt-2.5 flex items-center justify-between text-[11px]">
          <span className="text-white/40 truncate">{listing.seller_alias || "TOLS user"}</span>
          {isSale
            ? <span className="text-white/40 tabular-nums">{trades24h || 0} trades · 24h</span>
            : <span className="text-white/60">Wants <span className="text-lime font-bold">{listing.swap_for || "any"}</span></span>}
        </div>
      }
    />
  );
}

function SellForm({ myCards, myListings, onChange }) {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState("");
  const [price, setPrice] = useState("");
  const [mode, setMode] = useState("sale");
  const [swapFor, setSwapFor] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const card = myCards.find((c) => c.id === selectedId);
    if (!card) { toast({ title: "Select a card", variant: "destructive" }); return; }
    setBusy(true);
    try {
      let me = null; try { me = await base44.auth.me(); } catch {}
      const payload = {
        card_name: card.card_name, collection: card.collection, rarity: card.rarity,
        insured_value: card.insured_value, image: card.image || "",
        listing_type: mode, seller_alias: me?.full_name || me?.email || "TOLS user",
        status: "active",
        price: mode === "sale" ? Number(price || 0) : 0,
        swap_for: mode === "swap" ? swapFor : "",
      };
      await base44.entities.MarketListing.create(payload);
      toast({ title: "Listing published", description: mode === "sale" ? "Your card is now for sale." : "Your card is available for swap." });
      setPrice(""); setSwapFor(""); setSelectedId("");
      onChange();
    } catch (e) {
      toast({ title: "Error", description: "Publishing failed.", variant: "destructive" });
    } finally { setBusy(false); }
  };

  const cancelListing = async (id) => {
    try { await base44.entities.MarketListing.update(id, { status: "closed" }); onChange(); } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card border border-white/10 p-4 space-y-3">
        <div className="flex items-center gap-2">
          {["sale", "swap"].map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`h-8 px-3 rounded-full text-xs font-black ${mode === m ? "bg-lime text-black" : "bg-white/8 text-white/60"}`}>{m === "sale" ? "Sell" : "Swap"}</button>
          ))}
        </div>
        <label className="block text-xs font-bold text-white/50">Select one of your cards</label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full h-10 rounded-lg bg-[#0a0a0a] border border-white/15 px-2 text-sm text-white">
          <option value="">— choose —</option>
          {myCards.map((c) => <option key={c.id} value={c.id}>{c.card_name} · {c.collection} · {rarityLabel(c.rarity)}</option>)}
        </select>
        {mode === "sale" ? (
          <div>
            <label className="block text-xs font-bold text-white/50 mb-1">Price (USDT)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 1200" className="w-full h-10 rounded-lg bg-[#0a0a0a] border border-white/15 px-3 text-sm text-white" />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-white/50 mb-1">What you want in return</label>
            <select value={swapFor} onChange={(e) => setSwapFor(e.target.value)} className="w-full h-10 rounded-lg bg-[#0a0a0a] border border-white/15 px-2 text-sm text-white">
              <option value="">Any collection</option>
              {COLLECTION_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
        <button onClick={submit} disabled={busy} className="w-full h-11 rounded-xl bg-lime text-black font-black text-sm disabled:opacity-60">Publish listing</button>
      </div>

      <div>
        <h3 className="text-sm font-black text-white mb-2">Your listings</h3>
        {myListings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#121212] py-8 text-center text-sm text-white/40">No active listings.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {myListings.map((l) => (
              <MarketCardTile
                key={l.id}
                listing={l}
                actionLabel="Close listing"
                actionVariant="outline"
                onAction={() => cancelListing(l.id)}
                footer={
                  <div className="mt-2.5 text-[11px] text-white/60">
                    {l.listing_type === "sale" ? <span className="font-black text-lime">${Number(l.price || 0).toLocaleString()}</span> : <>Swap · <span className="text-lime font-bold">{l.swap_for || "any"}</span></>}
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function buyCard(listing, reload, updateBalance, wallet, toast) {
  const price = Number(listing.price || 0);
  if (!wallet || wallet.balance < price) { toast({ title: "Insufficient balance", variant: "destructive" }); return; }
  try {
    await updateBalance(-price, 0);
    await base44.entities.CollectibleCard.create({
      collection: listing.collection, card_name: listing.card_name, rarity: listing.rarity,
      insured_value: listing.insured_value, currency: "USDT", token_id: listing.id,
      grading_company: "PSA", grading_id: String(listing.id || "").slice(-8), image: listing.image || "",
      pack_name: "Marketplace", is_new: true,
    });
    await base44.entities.MarketListing.update(listing.id, { status: "sold" });
    toast({ title: "Purchase complete", description: `${listing.card_name} added to your collection.` });
    reload();
  } catch (e) { toast({ title: "Error", description: "Purchase failed.", variant: "destructive" }); }
}

async function proposeSwap(listing, reload, toast) {
  try {
    await base44.entities.MarketListing.update(listing.id, { status: "closed" });
    await base44.entities.CollectibleCard.create({
      collection: listing.collection, card_name: listing.card_name, rarity: listing.rarity,
      insured_value: listing.insured_value, currency: "USDT", token_id: listing.id,
      grading_company: "PSA", grading_id: String(listing.id || "").slice(-8), image: listing.image || "",
      pack_name: "Marketplace Swap", is_new: true,
    });
    toast({ title: "Swap proposed", description: "Card received in your collection." });
    reload();
  } catch (e) { toast({ title: "Error", description: "Swap failed.", variant: "destructive" }); }
}