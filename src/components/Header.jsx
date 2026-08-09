import React, { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, ArrowLeft, ChevronDown, DollarSign, LogOut, Menu, Search, Shield, Trash2, User, Wallet } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";
import { base44 } from "@/api/client";
import { useWallet } from "@/components/WalletProvider";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import { VipProgressBadge, VipProgressCard } from "@/components/VipProgress";
import TolsLogo from "@/components/TolsLogo";

export default function Header({ onMenu }) {
  const { wallet } = useWallet();
  const { openWallet } = useWalletModal();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const menuRef = useRef(null);
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [delOpen, setDelOpen] = useState(false);
  const onChild = pathname !== "/";

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)); }, []);
  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(`/?q=${encodeURIComponent(q)}`);
    // exact backend sync: save last search
    try {
      localStorage.setItem("tols_last_search", q);
      base44.auth.me().then((u)=>{
        if (!u) return;
        base44.entities.PlatformSetting.create({ key: `last_search_${u.id}`, value: q, category: "nav_sync" }).catch(()=>{});
      }).catch(()=>{});
    } catch {}
  };

  return (
    <motion.header initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25, ease: [0.16,1,0.3,1] }} className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.06]" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto max-w-[1600px] px-3 sm:px-4 h-[56px] flex items-center gap-2 sm:gap-3">
        {onChild ? (
          <button onClick={() => navigate(-1)} className="lg:hidden grid place-items-center w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-white/70" aria-label="Go back"><ArrowLeft className="w-5 h-5" /></button>
        ) : (
          <button onClick={onMenu} className="lg:hidden grid place-items-center w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-white/70" aria-label="Open menu"><Menu className="w-5 h-5" /></button>
        )}
        <Link to="/" className="flex items-center gap-2">
          <span className="hidden lg:grid place-items-center w-8 h-8 rounded-lg bg-white text-black font-black text-[14px]">◈</span>
          <span className="font-black italic tracking-tighter text-white text-[18px]">TOLS<span className="text-white/40 font-normal">.com</span></span>
          <span className="hidden sm:inline-flex ml-2 h-6 px-2 items-center rounded-full bg-white/10 border border-white/10 text-white/60 text-[10px] font-bold">CRYPTO CASINO</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-6">
          <Link to="/" className={`h-8 px-4 rounded-full text-sm font-bold ${pathname==="/"?"bg-white text-black":"bg-white/[0.06] text-white/70 hover:bg-white/10"}`}>Casino</Link>
          <Link to="/tournaments" className={`h-8 px-4 rounded-full text-sm font-bold ${pathname.startsWith("/tournaments")?"bg-white text-black":"bg-white/[0.06] text-white/70 hover:bg-white/10"}`}>Sports</Link>
        </nav>
        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-[320px] lg:max-w-[420px] mx-6 items-center gap-2 px-3 h-9 rounded-full bg-white/[0.06] border border-white/[0.06] focus-within:border-white/20 focus-within:bg-white/[0.08]">
          <Search className="w-4 h-4 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search games" className="bg-transparent outline-none text-sm text-white placeholder-white/30 w-full" />
          <span className="hidden xl:inline text-xs text-white/20 border border-white/10 rounded px-1.5 py-0.5">/</span>
        </form>
        <button onClick={()=> navigate('/?q=')} className="lg:hidden ml-auto grid place-items-center w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-white/60"><Search className="w-4 h-4" /></button>
        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          {!user ? <><Link to="/login" className="hidden sm:flex h-9 px-4 items-center rounded-full bg-white/[0.08] border border-white/10 text-sm font-bold text-white">Log in</Link><Link to="/register" className="h-9 px-5 inline-flex items-center rounded-full bg-lime text-black text-sm font-black">Sign up</Link></> : <>
            <VipProgressBadge />
            <div className="flex items-center"><button onClick={() => openWallet({ tab: "deposit" })} className="flex items-center gap-1.5 h-9 px-2 sm:px-3 rounded-full sm:rounded-l-full bg-[#1a1a1a] border border-white/10 sm:border-r-0"><DollarSign className="w-4 h-4 text-lime" /><span className="text-sm font-bold tabular-nums text-white hidden xs:inline sm:inline">{wallet ? Number(wallet.balance).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}</span><span className="text-xs text-white/40 hidden sm:inline">USDT</span></button><button onClick={() => openWallet({ tab: "withdraw" })} className="hidden sm:grid place-items-center h-9 px-3 rounded-r-full bg-[#1a1a1a] border border-white/10 text-white/50" aria-label="Withdraw"><ArrowDownToLine className="w-4 h-4" /></button></div>
            <div className="relative" ref={menuRef}><button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 h-9 px-2 sm:px-3 rounded-full bg-white/[0.06] border border-white/10"><span className="grid place-items-center w-7 h-7 rounded-full bg-lime text-black font-black text-xs">{(user.full_name||user.email||"P")[0].toUpperCase()}</span><ChevronDown className="hidden sm:block w-3.5 h-3.5 text-white/40" /></button>{open && <div className="absolute right-0 top-11 w-64 rounded-2xl border border-white/10 bg-[#141414] shadow-2xl py-2"><VipProgressCard /><div className="border-t border-white/10 my-1" /><Link to="/wallet" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/75 hover:text-lime"><Wallet className="w-4 h-4" /> Wallet</Link>{user.role === "admin" && <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-lime"><Shield className="w-4 h-4" /> Admin</Link>}<button onClick={() => base44.auth.logout("/")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60"><LogOut className="w-4 h-4" /> Sign out</button><div className="border-t border-white/10 my-1" /><button onClick={() => { setOpen(false); setDelOpen(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400"><Trash2 className="w-4 h-4" /> Delete Account</button></div>}</div>
          </>}
        </div>
      </div>
      <DeleteAccountDialog open={delOpen} onClose={() => setDelOpen(false)} />
    </motion.header>
  );
}
