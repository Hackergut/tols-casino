import React, { useState } from "react";
import { Headphones, X, MessageCircle, Mail } from "lucide-react";

export default function SupportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-72 rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 h-12 bg-lime/10 border-b border-lime/20">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-lime" />
              <span className="text-sm font-black text-white">TOLS Support</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            <a href="mailto:support@tols.casino" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
              <Mail className="w-4 h-4 text-lime" />
              <div>
                <p className="text-sm font-bold text-white">Email us</p>
                <p className="text-xs text-white/40">support@tols.casino</p>
              </div>
            </a>
            <a href="/affiliate" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
              <MessageCircle className="w-4 h-4 text-lime" />
              <div>
                <p className="text-sm font-bold text-white">Live Chat</p>
                <p className="text-xs text-white/40">Available 24/7</p>
              </div>
            </a>
            <p className="text-[11px] text-white/30 pt-1 text-center">Average reply &lt; 2 min</p>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-lime text-black shadow-2xl glow-lime hover:scale-105 transition"
        title="Support"
      >
        <Headphones className="w-6 h-6" />
      </button>
    </>
  );
}