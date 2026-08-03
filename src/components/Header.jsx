import React, { useState, useRef, useEffect } from "react";
import { Search, DollarSign, User, ChevronDown, Plus, Users, Wallet, ArrowDownToLine, Shield, Crown, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWallet } from "@/components/WalletProvider";
import WithdrawalPanel from "@/components/WithdrawalPanel";

export default function Header({ onMenu }) {
  const { wallet, vipTier } = useWallet();
  const [open, setOpen] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then((u) => u && u.role === "admin" && setIsAdmin(true)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-4">
        <button onClick={onMenu} className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-[#1a1a1a] border border-white/5 text-white/70 hover:text-lime transition">
          <Menu className="w-5 h-5" />
        </button>
        {/* Logo */}
        <a href="/" className="flex items-center shrink-0">
          <span className="text-2xl sm:text-3xl font-black tracking-tighter italic" style={{ color: "#ccff00", textShadow: "0 0 18px rgba(204,255,0,0.5)" }}>
            TOLS
          </span>
        </a>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-auto items-center gap-2 px-4 h-10 rounded-full bg-[#1a1a1a] border border-white/5">
          <Search className="w-4 h-4 text-white/30" />
          <input
            placeholder="Search"
            className="bg-transparent outline-none text-sm text-white/80 placeholder-white/30 w-full"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <Link
            to="/vip"
            title={`Livello VIP: ${vipTier?.name}`}
            className="hidden sm:flex items-center gap-1.5 h-10 px-3 rounded-full border transition hover:opacity-90"
            style={{ borderColor: `${vipTier?.color || "#ccff00"}55`, color: vipTier?.color || "#ccff00" }}
          >
            <Crown className="w-4 h-4" />
            <span className="text-sm font-bold">{vipTier?.name}</span>
          </Link>
          <button className="hidden sm:flex items-center gap-1.5 h-10 px-5 rounded-full font-bold text-sm bg-lime text-black hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Sign up
          </button>
          <div className="flex items-center gap-0">
            <div className="flex items-center gap-2 h-10 px-3 sm:px-4 rounded-l-full bg-[#1a1a1a] border border-white/5 border-r-0">
              <DollarSign className="w-4 h-4 text-lime" />
              <span className="text-sm font-semibold text-white tabular-nums">
                {wallet ? Number(wallet.balance).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
              </span>
            </div>
            <button
              onClick={() => setShowWithdraw(true)}
              title="Preleva vincite"
              className="flex items-center justify-center h-10 px-3 rounded-r-full bg-[#1a1a1a] border border-white/5 hover:border-lime/40 hover:text-lime text-white/50 transition"
            >
              <ArrowDownToLine className="w-4 h-4" />
            </button>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 h-10 px-3 sm:px-4 rounded-full bg-[#1a1a1a] border border-white/5 hover:border-white/20 transition"
            >
              <User className="w-4 h-4 text-white/80" />
              <span className="hidden sm:inline text-sm font-semibold text-white/80">Profile</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/50" />
            </button>
            {open && (
              <div className="absolute right-0 top-12 w-56 rounded-xl border border-white/10 bg-[#1a1a1a] shadow-2xl py-2 z-50">
                <Link to="/vip" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-lime transition">
                  <Crown className="w-4 h-4" /> Livello VIP
                </Link>
                <Link to="/affiliate" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-lime transition">
                  <Users className="w-4 h-4" /> Pannello Affiliati
                </Link>
                <button onClick={() => { setOpen(false); setShowWithdraw(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-lime transition">
                  <ArrowDownToLine className="w-4 h-4" /> Preleva vincite
                </button>
                <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-lime transition">
                  <Wallet className="w-4 h-4" /> Il mio Wallet
                </Link>
                {isAdmin && (
                  <>
                    <div className="border-t border-white/5 my-1" />
                    <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-lime hover:bg-lime/10 transition">
                      <Shield className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  </>
                )}
                <div className="border-t border-white/5 my-1" />
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 transition">
                  <User className="w-4 h-4" /> Impostazioni
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showWithdraw && <WithdrawalPanel onClose={() => setShowWithdraw(false)} />}
    </header>
  );
}