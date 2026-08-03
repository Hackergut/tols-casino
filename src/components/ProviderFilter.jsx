import React from "react";

export default function ProviderFilter({ providers, active, onChange }) {
  if (!providers || !providers.length) return null;
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
      <button
        onClick={() => onChange("all")}
        className={`px-3.5 h-9 rounded-full text-xs font-bold whitespace-nowrap transition ${
          active === "all" ? "bg-lime text-black" : "bg-white/5 text-white/60 hover:text-white border border-white/5"
        }`}
      >
        All providers
      </button>
      {providers.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3.5 h-9 rounded-full text-xs font-bold whitespace-nowrap transition ${
            active === p ? "bg-lime text-black" : "bg-white/5 text-white/60 hover:text-white border border-white/5"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}