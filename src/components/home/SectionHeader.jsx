import React from "react";

// Unified section title row used across the lobby rails and grids so every
// section shares the same icon-badge + title + count + actions anatomy.
export default function SectionHeader({ icon: Icon, title, count, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-lime/10 border border-lime/20 shrink-0">
            <Icon className="text-lime w-[18px] h-[18px]" />
          </span>
        )}
        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white truncate">{title}</h2>
        {typeof count === "number" && count > 0 && (
          <span className="text-xs font-bold text-white/25 shrink-0">{count}</span>
        )}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}