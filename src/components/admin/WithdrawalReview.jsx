import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, Clock, X, RefreshCw, ExternalLink, Ban } from "lucide-react";

function statusStyle(s) {
  if (s === "completed") return "bg-lime/10 text-lime border-lime/30";
  if (s === "rejected") return "bg-red-500/10 text-red-300 border-red-500/30";
  if (s === "processing") return "bg-blue-500/10 text-blue-300 border-blue-500/30";
  if (s === "pending_review") return "bg-amber-500/10 text-amber-300 border-amber-500/30";
  return "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
}

function statusLabel(s) {
  if (s === "pending_review") return "Review";
  if (s === "processing") return "Processing";
  if (s === "completed") return "Completed";
  if (s === "rejected") return "Rejected";
  return "Pending";
}

export default function WithdrawalReview() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("open");
  const [note, setNote] = useState({});

  const load = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      if (!user || user.role !== "admin") { setItems([]); return; }
      const list = await base44.entities.Withdrawal.list("-created_date", 100);
      setItems(list || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 20000); return () => clearInterval(id); }, [load]);

  const act = async (w, status) => {
    setBusyId(w.id);
    try {
      const payload = { status };
      const text = (note[w.id] || "").trim();
      if (text) payload.description = `${w.description ? w.description + "\n" : ""}${status}: ${text}`;
      if (status === "completed") payload.processed_date = new Date().toISOString();

      await base44.entities.Withdrawal.update(w.id, payload);

      // If rejected, refund the held balance back to the player's wallet.
      if (status === "rejected") {
        const wallets = await base44.entities.UserWallet.filter({ created_by_id: w.created_by_id });
        if (wallets && wallets[0]) {
          const wlt = wallets[0];
          const refund = +(Number(wlt.balance || 0) + Number(w.amount || 0)).toFixed(2);
          await base44.entities.UserWallet.update(wlt.id, { balance: refund });
        }
      }
      setNote((p) => ({ ...p, [w.id]: "" }));
      await load();
    } catch (e) {
      alert(e.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = items.filter((w) => {
    if (filter === "open") return w.status === "pending" || w.status === "pending_review";
    if (filter === "processing") return w.status === "processing";
    if (filter === "done") return w.status === "completed" || w.status === "rejected";
    return true;
  });

  const openCount = items.filter((w) => w.status === "pending" || w.status === "pending_review").length;
  const totalPending = items.filter((w) => w.status === "pending" || w.status === "pending_review" || w.status === "processing").reduce((s, w) => s + (w.amount || 0), 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-lime" /> Withdrawal review
          </h3>
          <p className="text-xs text-white/40 mt-0.5">
            {openCount} open · {totalPending.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT queued
          </p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-lime">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-[#0a0a0a] border border-white/10 w-fit">
        {[
          { id: "open", label: "Open" },
          { id: "processing", label: "Processing" },
          { id: "done", label: "Done" },
          { id: "all", label: "All" },
        ].map((t) => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className={`px-3 h-8 rounded-lg text-xs font-bold transition ${filter === t.id ? "bg-lime text-black" : "text-white/50 hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-32 rounded-xl bg-white/5 animate-pulse" />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-white/40">
          <Ban className="w-7 h-7 mx-auto mb-2 opacity-50" /> No withdrawals in this view.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((w) => (
            <div key={w.id} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-lg font-black text-white tabular-nums">
                      {Number(w.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} {w.currency}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle(w.status)}`}>{statusLabel(w.status)}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 uppercase">{w.chain}</span>
                  </div>
                  <p className="text-xs font-mono text-white/50 mt-1 break-all">{w.wallet_address}</p>
                  {w.description && <p className="text-xs text-amber-200/80 mt-2 whitespace-pre-wrap">{w.description}</p>}
                  <p className="text-[11px] text-white/30 mt-1">
                    Requested {new Date(w.created_date).toLocaleString()}
                    {w.processed_date ? ` · processed ${new Date(w.processed_date).toLocaleString()}` : ""}
                  </p>
                </div>
              </div>

              {(w.status === "pending" || w.status === "pending_review" || w.status === "processing") && (
                <div className="mt-3 space-y-2">
                  <input
                    value={note[w.id] || ""}
                    onChange={(e) => setNote((p) => ({ ...p, [w.id]: e.target.value }))}
                    placeholder="Internal note (tx hash, KYC check, reason…)"
                    className="w-full h-10 rounded-lg bg-[#111] border border-white/10 px-3 text-xs text-white outline-none focus:border-lime/40 placeholder-white/20"
                  />
                  <div className="flex flex-wrap gap-2">
                    {w.status !== "processing" && (
                      <button onClick={() => act(w, "processing")} disabled={busyId === w.id}
                        className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-200 hover:bg-blue-500/20 disabled:opacity-50">
                        <ExternalLink className="w-3.5 h-3.5" /> Mark processing
                      </button>
                    )}
                    <button onClick={() => act(w, "completed")} disabled={busyId === w.id}
                      className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-lime text-black text-xs font-black hover:brightness-110 disabled:opacity-50">
                      {busyId === w.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Approve / paid
                    </button>
                    <button onClick={() => act(w, "rejected")} disabled={busyId === w.id}
                      className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-200 hover:bg-red-500/20 disabled:opacity-50">
                      <X className="w-3.5 h-3.5" /> Reject & refund
                    </button>
                  </div>
                  <p className="text-[11px] text-white/30">Rejecting automatically returns the held amount to the player's balance.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
