import React, { useState } from "react";
import { Send, Check, User } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";
import { base44 } from "@/api/client";

export default function TipForm() {
  const { wallet, updateBalance } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("5");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    setError("");
    const amt = Number(amount) || 0;
    if (!to.trim() || amt <= 0) { setError("Enter recipient and amount"); return; }
    if (amt > wallet.balance) { setError("Insufficient balance"); return; }
    try {
      // try backend
      await base44.entities.ChatMessage.create({ message: `Tip ${amt} USDT to ${to}`, channel: "tips", username: wallet.id });
    } catch {}
    updateBalance(-amt, amt);
    setDone(true);
    setTimeout(()=> setDone(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 grid place-items-center text-white"><Send className="w-4 h-4" /></div>
          <div><p className="text-sm font-black text-white">Tip Player</p><p className="text-xs text-white/40">Send USDT to a friend</p></div>
        </div>
        <div>
          <label className="text-xs font-bold text-white/40">Recipient (username or address)</label>
          <div className="mt-1.5 flex items-center gap-2 h-12 rounded-xl bg-[#080808] border border-white/10 px-3">
            <User className="w-4 h-4 text-white/30" />
            <input value={to} onChange={(e)=> setTo(e.target.value)} placeholder="e.g. Whale_88" className="flex-1 bg-transparent outline-none text-sm font-bold text-white placeholder-white/20" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-white/40">Amount</label>
          <div className="mt-1.5 flex items-center gap-2 h-12 rounded-xl bg-[#080808] border border-white/10 px-3">
            <span className="text-lime font-bold">$</span>
            <input type="number" value={amount} onChange={(e)=> setAmount(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-bold text-white" />
            <span className="text-xs font-bold text-white/40">USDT</span>
          </div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button onClick={send} className="w-full h-12 rounded-xl bg-lime text-black font-black flex items-center justify-center gap-2">
          {done ? <><Check className="w-4 h-4" /> Sent {amount} to {to}</> : <><Send className="w-4 h-4" /> Send Tip</>}
        </button>
      </div>
    </div>
  );
}
