"use client";

// Lobby shell footer — extracted from page.tsx (Phase 2).
export function CasinoFooter() {
  return (
    <footer className="mt-auto border-t border-lime/10 bg-background">
      <div className="flex flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row">
        <p className="text-xs text-muted-foreground/70">© 2025 GoldenX Casino — Provably Fair Gaming</p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-lime">Terms</a>
          <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-lime">Privacy</a>
          <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-lime">Responsible Gaming</a>
        </div>
      </div>
    </footer>
  );
}
