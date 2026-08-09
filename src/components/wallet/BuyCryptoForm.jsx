import React, { useState } from "react";
import { CreditCard, ExternalLink, Check } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";

export default function BuyCryptoForm() {
  const { updateBalance } = useWallet();
  const [amount, setAmount] = useState("100");
  const [done, setDone] = useState(false);
  const buy = () => {
    const amt = Number(amount) || 0;
    if (amt <= 0) return;
    // mock: credit USDT instantly (in prod, redirect to MoonPay/Transak)
    updateBalance(amt, 0);
    setDone(true);
    setTimeout(()=> setDone(false), 2000);
  };
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lime text-black grid place-items-center"><CreditCard className="w-4 h-4" /></div>
          <div><p className="text-sm font-black text-white">Buy Crypto</p><p className="text-xs text-white/40">Via MoonPay • Card, Apple Pay</p></div>
          <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-lime/10 border border-lime/20 text-lime">TOLS</span>
        </div>
        <div>
          <label className="text-xs font-bold text-white/40">Amount (USDT)</label>
          <div className="mt-1.5 flex items-center gap-2 h-12 rounded-xl bg-[#080808] border border-white/10 px-3">
            <span className="text-lime font-bold">$</span>
            <input type="number" value={amount} onChange={(e)=> setAmount(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-bold text-white" />
            <span className="text-xs font-bold text-white/40">USDT</span>
          </div>
        </div>
        <button onClick={buy} className="w-full h-12 rounded-xl bg-lime text-black font-black flex items-center justify-center gap-2">
          {done ? <><Check className="w-4 h-4" /> Credited {amount}</> : <>Buy ${amount} <ExternalLink className="w-4 h-4" /></>}
        </button>
        <p className="text-xs text-white/30 text-center">Demo: credits instantly. Prod: redirect to MoonPay with KYC.</p>
      </div>
      <div className="rounded-xl bg-[#080808] border border-white/10 p-3 flex items-center gap-2 text-xs text-white/40">
        <span className="w-2 h-2 rounded-full bg-lime animate-pulse" /> Live price via CoinGecko + fallback rate from Admin → Payment settings
      </div>
    </div>
  );
}
