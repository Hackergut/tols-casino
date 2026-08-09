"use client";

// Lobby shell header — extracted from page.tsx (Phase 2). Balance uses the
// PostedAmount signature (digit roll + posted tick on change).
import { useEffect, useRef, useState } from "react";
import { Search, Wallet, Menu, X, ChevronDown } from "lucide-react";
import { PostedAmount } from "@/casino/components/casino/PostedAmount";

export function CasinoHeader({ balance, onMenuToggle, menuOpen, searchQuery, onSearchChange }: {
  balance: number;
  onMenuToggle: () => void;
  menuOpen: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchField = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search games..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-lg border border-border/60 bg-secondary/40 py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-lime/40"
      />
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-lime/10 bg-background/95 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle} className="btn-press rounded-lg p-1.5 text-foreground/70 lg:hidden" aria-label="Toggle menu">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h1 className="cursor-pointer text-xl font-black tracking-tight text-lime">
            GOLDEN<span className="text-foreground">X</span>
          </h1>
        </div>

        {/* Search — desktop */}
        <div className="mx-6 hidden max-w-md flex-1 items-center md:flex">{searchField}</div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-lime/15 bg-lime/10 px-3 py-1.5">
            <Wallet className="h-4 w-4 text-lime" />
            <PostedAmount
              value={balance}
              format={(n) => `$${n.toFixed(2)}`}
              className="text-sm font-semibold text-lime"
            />
          </div>
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserOpen(!userOpen)}
              className="btn-press flex items-center gap-2 rounded-lg bg-secondary/50 px-2 py-1.5 text-foreground/70 transition-colors hover:bg-secondary sm:px-3"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-lime text-[10px] font-bold text-bg">T</div>
              <span className="hidden text-sm font-medium sm:inline">Player</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {userOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border/60 bg-surface shadow-xl">
                <div className="border-b border-border/40 p-3">
                  <p className="text-sm font-medium text-foreground">TOLSPlayer</p>
                  <p className="text-xs text-vip">VIP Level 3</p>
                </div>
                <div className="p-2">
                  <a href="/control/admin" className="block rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground">
                    Admin Panel
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search — mobile */}
      <div className="px-4 pb-3 md:hidden">{searchField}</div>
    </header>
  );
}
