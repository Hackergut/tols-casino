import React, { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, ChevronDown, DollarSign, LogOut, Menu, Search, Shield, User, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWallet } from "@/components/WalletProvider";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import { VipProgressBadge, VipProgressCard } from "@/components/VipProgress";
import TolsLogo from "@/components/TolsLogo";

export default function Header({ onMenu }) {
  const { wallet } = useWallet();
  const { openWallet } = useWalletModal();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)); }, []);
  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3">
        <button onClick={onMenu} className="lg:hidden grid place-items-center w-9 h-9 rounded-lg bg-card border border-white/10 text-white/70" aria-label="Open menu"><Menu className="w-5 h-5" /></button>
        <Link to="/" className="lg:hidden"><TolsLogo size="sm" /></Link>
        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-md items-center gap-2 px-4 h-10 rounded-full bg-card border border-white/10 focus-within:border-lime/40">
          <Search className="w-4 h-4 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search games" className="bg-transparent outline-none text-sm text-white/80 placeholder-white/30 w-full" />
        </form>
        <div className="flex items-center gap-2 ml-auto">
          {!user ? <><Link to="/login" className="hidden sm:flex h-10 px-4 items-center text-sm font-semibold text-white/70">Sign in</Link><Link to="/register" className="h-10 px-5 inline-flex items-center rounded-full bg-lime text-black text-sm font-black">Sign up</Link></> : <>
            <VipProgressBadge />
            <div className="flex items-center"><button onClick={() => openWallet({ tab: "deposit" })} className="flex items-center gap-2 h-10 px-3 sm:px-4 rounded-l-full bg-card border border-white/10 border-r-0"><DollarSign className="w-4 h-4 text-lime" /><span className="text-sm font-semibold tabular-nums">{wallet ? Number(wallet.balance).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}</span></button><button onClick={() => openWallet({ tab: "withdraw" })} className="grid place-items-center h-10 px-3 rounded-r-full bg-card border border-white/10 text-white/50" aria-label="Withdraw"><ArrowDownToLine className="w-4 h-4" /></button></div>
            <div className="relative" ref={menuRef}><button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 h-10 px-3 rounded-full bg-card border border-white/10"><User className="w-4 h-4" /><span className="hidden sm:inline text-sm font-semibold max-w-24 truncate">{user.full_name || "Profile"}</span><ChevronDown className="w-3.5 h-3.5 text-white/40" /></button>{open && <div className="absolute right-0 top-12 w-60 rounded-xl border border-white/10 bg-card shadow-2xl py-2"><VipProgressCard /><div className="border-t border-white/10 my-1" /><Link to="/wallet" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/75 hover:text-lime"><Wallet className="w-4 h-4" /> My Wallet</Link>{user.role === "admin" && <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-lime"><Shield className="w-4 h-4" /> Admin Dashboard</Link>}<button onClick={() => base44.auth.logout("/")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60"><LogOut className="w-4 h-4" /> Sign out</button></div>}</div>
          </>}
        </div>
      </div>
    </header>
  );
}