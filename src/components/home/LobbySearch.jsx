import React from "react";
import { Search, X } from "lucide-react";

export default function LobbySearch({ value, onChange }) {
  return (
    <div className="flex items-center gap-2.5 h-12 px-4 rounded-xl bg-[#161616] border border-white/8 focus-within:border-lime/40 transition">
      <Search className="w-4.5 h-4.5 text-white/35" style={{ width: 18, height: 18 }} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search a game..."
        className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/35"
      />
      {value && (
        <button onClick={() => onChange("")} className="text-white/40 hover:text-white transition">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}