import React from "react";
import { Link } from "react-router-dom";
import GameCard from "@/components/GameCard";
import SectionHeader from "@/components/home/SectionHeader";

// Full responsive grid of official game cards. Renders a capped preview for
// performance (a 700-card grid is heavy), with a "Browse all" CTA to the
// category page that shows the entire catalog.
export default function AllGamesGrid({ title, games, limit = 48, viewAllTo }) {
  const shown = games.slice(0, limit);
  const hasMore = games.length > limit;

  return (
    <section className="space-y-3">
      <SectionHeader title={title} count={games.length}>
        {viewAllTo && hasMore && (
          <Link
            to={viewAllTo}
            className="h-8 px-3 flex items-center rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-lime hover:border-lime/30 transition"
          >
            View All
          </Link>
        )}
      </SectionHeader>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {shown.map((g) => (
          <GameCard key={g.id || g.slug} game={g} />
        ))}
      </div>

      {viewAllTo && hasMore && (
        <div className="flex justify-center pt-2">
          <Link
            to={viewAllTo}
            className="h-10 px-6 flex items-center rounded-xl bg-lime/10 border border-lime/20 text-sm font-bold text-lime hover:bg-lime/20 transition"
          >
            Browse all {games.length} games
          </Link>
        </div>
      )}
    </section>
  );
}