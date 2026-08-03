import React, { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

export default function CookieNotice() {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    setAccepted(localStorage.getItem("tols_cookie_accepted") === "1");
  }, []);

  if (accepted) return null;

  const accept = () => {
    localStorage.setItem("tols_cookie_accepted", "1");
    setAccepted(true);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-2xl">
        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-lime/10 shrink-0">
          <Cookie className="w-5 h-5 text-lime" />
        </div>
        <p className="flex-1 text-xs text-white/60 leading-relaxed">
          Utilizziamo i cookie per offrirti la migliore esperienza possibile sulla piattaforma TOLS.
        </p>
        <div className="flex flex-col gap-1.5 shrink-0">
          <button onClick={accept} className="px-4 h-9 rounded-lg bg-lime text-black text-xs font-black hover:opacity-90 transition">
            Accetta
          </button>
          <button onClick={accept} className="px-4 h-7 rounded-lg text-white/50 text-[11px] font-semibold hover:text-white transition">
            Maggiori info
          </button>
        </div>
      </div>
    </div>
  );
}