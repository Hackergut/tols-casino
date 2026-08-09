import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Vault, Coins, Users, Bell, Receipt, Ticket, Settings, Lightbulb, Headphones, LogOut, Shield, Wallet, X, ChevronRight } from "lucide-react";
import { VipProgressCard } from "@/components/VipProgress";

const ITEMS = [
  { id: "vip", label: "VIP", sub: "Rewards & levels", icon: Crown, to: "/vip", color: "#ccff00" },
  { id: "vault", label: "Cassaforte", sub: "Vault & balance", icon: Vault, to: "/wallet", color: "#a855f7" },
  { id: "token", label: "Token", sub: "SHFL $0.2979", icon: Coins, to: "/vip", color: "#f59e0b" },
  { id: "affiliate", label: "Programma di affiliazione", sub: "Refer & earn", icon: Users, to: "/affiliate", color: "#4f8aff" },
  { id: "notifications", label: "Notifiche", sub: "3 nuove", icon: Bell, to: "/community", color: "#ec4899", badge: 3 },
  { id: "transactions", label: "Transazioni", sub: "Cronologia", icon: Receipt, to: "/wallet", color: "#22c55e" },
  { id: "redeem", label: "Riscatta codice bonus", sub: "Promo code", icon: Ticket, to: "/affiliate?tab=redeem", color: "#ccff00" },
  { id: "settings", label: "Impostazioni", sub: "Account & prefs", icon: Settings, to: "/responsible-gaming", color: "#888" },
  { id: "wise", label: "Mescola con saggezza", sub: "Shuffle Wise", icon: Lightbulb, to: "/responsible-gaming", color: "#f97316" },
  { id: "support", label: "Assistenza live", sub: "24/7 chat", icon: Headphones, to: "/contact", color: "#06b6d4" },
];

export default function ProfileMenu({ open, onClose, user, onLogout, onDelete }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-[71] w-[86vw] max-w-[360px] bg-[#0a0a0a] border-l border-white/[0.06] flex flex-col overflow-hidden"
          >
            <div className="h-[56px] flex items-center justify-between px-4 border-b border-white/[0.06] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-lime text-black grid place-items-center font-black text-sm">{(user?.full_name||user?.email||"P")[0].toUpperCase()}</div>
                <div>
                  <p className="text-sm font-black text-white leading-none">{user?.full_name || user?.email || "Player"}</p>
                  <p className="text-xs text-white/40 leading-none">{user?.email || "Guest"}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 grid place-items-center text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="px-3 py-3">
              <VipProgressCard />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide px-2 py-2 space-y-1">
              {ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    onClick={onClose}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06] transition"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 grid place-items-center group-hover:border-lime/20 transition" style={{ color: item.color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white leading-none group-hover:text-lime transition">{item.label}</p>
                      <p className="text-xs text-white/40 leading-none mt-0.5">{item.sub}</p>
                    </div>
                    {item.badge && <span className="px-1.5 py-0.5 rounded-full bg-lime text-black text-[10px] font-black">{item.badge}</span>}
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                  </Link>
                );
              })}

              <div className="my-2 border-t border-white/[0.06]" />

              <Link to="/wallet" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06] transition">
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 grid place-items-center text-white/60"><Wallet className="w-4 h-4" /></div>
                <span className="text-sm font-bold text-white">Wallet</span>
              </Link>
              {user?.role === "admin" && (
                <Link to="/admin" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-lime/10 border border-lime/20 hover:bg-lime/15 transition">
                  <div className="w-9 h-9 rounded-xl bg-lime text-black grid place-items-center"><Shield className="w-4 h-4" /></div>
                  <span className="text-sm font-black text-lime">Admin Dashboard</span>
                </Link>
              )}
            </div>

            <div className="p-3 border-t border-white/[0.06] space-y-2 shrink-0">
              <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white text-black font-black hover:bg-white/90 transition">
                <LogOut className="w-4 h-4" /> Esci
              </button>
              <button onClick={() => { onClose(); onDelete(); }} className="w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/15 transition">
                Elimina account
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
