"use client";

// Originals view — extracted from page.tsx (Phase 2).
import { OriginalGameCard } from "./GameCards";
import { ORIGINAL_GAMES } from "./lobby-types";

export function OriginalsView({ onGameSelect }: { onGameSelect: (gameId: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Original Games</h2>
        <p className="mt-1 text-sm text-muted-foreground">Provably fair games with verifiable outcomes</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ORIGINAL_GAMES.map((game) => (
          <OriginalGameCard key={game.id} game={game} onClick={() => onGameSelect(game.id)} />
        ))}
      </div>
    </div>
  );
}
