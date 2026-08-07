import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Placeholder rails shown while the slot catalog is still loading from the
// database, so the lobby never flashes empty.
export default function LobbySkeleton() {
  return (
    <div className="space-y-7">
      {[0, 1, 2].map((i) => (
        <section key={i} className="space-y-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-36 h-5 rounded" />
          </div>
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton key={j} className="shrink-0 w-[132px] sm:w-[160px] aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}