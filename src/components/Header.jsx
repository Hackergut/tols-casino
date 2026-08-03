import React, { useState } from "react";
import { Search, DollarSign, User, ChevronDown, Plus } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";

export default function Header() {
  const { wallet } = useWallet();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-4">
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
          <button className="hidden sm:flex items-center gap-1.5 h-10 px-5 rounded-full font-bold text-sm bg-lime text-black hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Sign up
          </button>
          <div className="flex items-center gap-2 h-10 px-3 sm:px-4 rounded-full bg-[#1a1a1a] border border-white/5">
            <DollarSign className="w-4 h-4 text-lime" />
            <span className="text-sm font-semibold text-white tabular-nums">
              {wallet ? Number(wallet.balance).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
            </span>
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 h-10 px-3 sm:px-4 rounded-full bg-[#1a1a1a] border border-white/5 hover:border-white/20 transition"
          >
            <User className="w-4 h-4 text-white/80" />
            <span className="hidden sm:inline text-sm font-semibold text-white/80">Profile</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/50" />
          </button>
        </div>
      </div>
    </header>
  );
}