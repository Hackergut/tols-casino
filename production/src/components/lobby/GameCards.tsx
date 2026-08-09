"use client";

// Game cards + loading skeleton for the lobby shell — extracted from page.tsx (Phase 2).
import { Gamepad2 } from "lucide-react";
import type { LobbyGame, OriginalGameDef } from "./lobby-types";

export function GameLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-lime/20 border-t-lime" />
    </div>
  );
}

export function LobbyGameCard({ game, onClick }: { game: LobbyGame; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-surface transition-transform duration-200 hover:scale-[1.03]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-surface-raised to-surface">
        {game.imageUrl ? (
          <img src={game.imageUrl} alt={game.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Gamepad2 className="h-10 w-10 text-lime/30" />
          </div>
        )}
        {game.isNew && (
          <div className="absolute left-2 top-2 rounded bg-lime px-2 py-0.5 text-[10px] font-bold uppercase text-bg">
            New
          </div>
        )}
        {game.isLive && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-loss/90 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Live
          </div>
        )}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button className="btn-press w-full rounded-lg bg-lime py-2 text-xs font-bold uppercase tracking-wide text-bg">
            {game.gameType === "original" ? "Play Now" : "View Game"}
          </button>
        </div>
      </div>
      <div className="p-2.5">
        <p className="truncate text-sm font-medium text-foreground/90">{game.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{game.provider}</p>
      </div>
    </div>
  );
}

export function OriginalGameCard({ game, onClick }: { game: OriginalGameDef; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-surface transition-transform duration-200 hover:scale-[1.03]"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={`/games/originals/${game.id}.svg`}
          alt={game.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* shimmer sweep on hover */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-700 group-hover:left-full" />
        </div>
        {/* play overlay */}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            className="btn-press w-full rounded-lg bg-lime py-2 text-xs font-bold uppercase tracking-wide text-bg"
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            Play Now
          </button>
        </div>
      </div>
      <div className="p-2.5">
        <p className="truncate text-sm font-semibold text-foreground/90">{game.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{game.desc}</p>
      </div>
    </div>
  );
}
