import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Check, Gift, Trophy, Wallet, AlertCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

function iconFor(type) {
  if (type === "win" || type === "achievement") return Trophy;
  if (type === "deposit" || type === "withdrawal") return Wallet;
  if (type === "bonus") return Gift;
  return AlertCircle;
}

function accentFor(type) {
  if (type === "win" || type === "bonus" || type === "achievement") return "text-lime border-lime/30 bg-lime/10";
  if (type === "withdrawal") return "text-blue-200 border-blue-400/30 bg-blue-500/10";
  if (type === "deposit") return "text-emerald-200 border-emerald-400/30 bg-emerald-500/10";
  return "text-white/70 border-white/10 bg-white/5";
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.AppNotification.filter({}, "-created_date", 20);
      setItems(list || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, [load]);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    try { await base44.entities.AppNotification.update(id, { read: true }); } catch { /* ignore */ }
  };
  const markAll = async () => {
    const unreadItems = items.filter((n) => !n.read);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await Promise.all(unreadItems.map((n) => base44.entities.AppNotification.update(n.id, { read: true }).catch(() => {})));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid place-items-center w-10 h-10 rounded-full bg-card border border-white/10 text-white/70 hover:text-lime hover:border-lime/40 transition"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-lime text-black text-[9px] font-black grid place-items-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-[340px] max-w-[calc(100vw-2rem)] z-50 rounded-2xl border border-white/10 bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-sm font-black text-white">Notifications</p>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button onClick={markAll} className="text-[11px] font-bold text-lime hover:underline flex items-center gap-1">
                    <Check className="w-3 h-3" /> Mark all
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="ml-2 text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[420px] overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="p-6 text-center text-xs text-white/40">Loading…</div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-7 h-7 text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-white/50">No notifications yet</p>
                </div>
              ) : items.map((n) => {
                const Icon = iconFor(n.type);
                const inner = (
                  <>
                    <div className={`w-9 h-9 rounded-lg border grid place-items-center shrink-0 ${accentFor(n.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white truncate">{n.title}</p>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0" />}
                      </div>
                      <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{n.message}</p>
                      {n.amount > 0 && (
                        <p className="text-xs font-black text-lime mt-1 tabular-nums">+{Number(n.amount).toLocaleString()} USDT</p>
                      )}
                      <p className="text-[10px] text-white/30 mt-0.5">{new Date(n.created_date).toLocaleString()}</p>
                    </div>
                  </>
                );
                const cls = `w-full text-left flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition ${!n.read ? "bg-lime/[0.03]" : ""}`;
                return n.link ? (
                  <Link key={n.id} to={n.link} onClick={() => { !n.read && markRead(n.id); setOpen(false); }} className={cls}>{inner}</Link>
                ) : (
                  <div key={n.id} onClick={() => !n.read && markRead(n.id)} className={`${cls} cursor-pointer`}>{inner}</div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
