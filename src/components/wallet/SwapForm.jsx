import React, { useState } from "react";
import { ArrowDown, RefreshCw, Check } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";
import CoinSelect from "@/components/wallet/CoinSelect";
import { coinById, COINS } from "@/components/wallet/coins";

export default function SwapForm() {
  const { wallet, updateBalance } = useWallet();
  const [from, setFrom] = useState("solana");
  const [to, setTo] = useState("ethereum");
  const [amount, setAmount] = useState("10");
  const [done, setDone] = useState(false);

  const amt = Number(amount) || 0;
  const rate = 0.98; // mock 2% fee, TOLS style
  const out = (amt * rate).toFixed(4);

  const swap = () => {
    if (!wallet || amt <= 0 || amt > wallet.balance) return;
    // mock swap: deduct from, add to (same USDT balance for demo, but show conversion)
    updateBalance(0, amt); // wagered
    setDone(true);
    setTimeout(()=> setDone(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[#121212] border border-white/[0.06] p-3">
        <p className="text-xs font-bold text-white/40 uppercase">From</p>
        <div className="mt-2"><CoinSelect value={from} onChange={setFrom} balance={wallet?.balance} /></div>
        <div className="mt-3 flex items-center gap-2 h-12 rounded-xl bg-[#080808] border border-white/10 px-3">
          <input type="number" value={amount} onChange={(e)=> setAmount(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-bold text-white" placeholder="0.00" />
          <span className="text-xs font-bold text-white/40">{coinById(from).symbol}</span>
        </div>
      </div>
      <div className="flex justify-center"><div className="w-8 h-8 rounded-full bg-lime text-black grid place-items-center"><ArrowDown className="w-4 h-4" /></div></div>
      <div className="rounded-xl bg-[#121212] border border-white/[0.06] p-3">
        <p className="text-xs font-bold text-white/40 uppercase">To</p>
        <div className="mt-2"><CoinSelect value={to} onChange={setTo} balance={null} /></div>
        <div className="mt-3 h-12 rounded-xl bg-[#080808] border border-white/10 px-3 flex items-center justify-between">
          <span className="text-sm font-bold text-lime">{out}</span>
          <span className="text-xs font-bold text-white/40">{coinById(to).symbol}</span>
        </div>
        <p className="text-xs text-white/30 mt-2 text-center">Rate 1 {coinById(from).symbol} ≈ {rate} {coinById(to).symbol} • Fee 2% • TOLS</p>
      </div>
      <button onClick={swap} disabled={!amount || amt>wallet.balance} className="w-full h-12 rounded-xl bg-lime text-black font-black flex items-center justify-center gap-2 disabled:opacity-40">
        {done ? <><Check className="w-4 h-4" /> Swapped</> : <><RefreshCw className="w-4 h-4" /> Swap</>}
      </button>
    </div>
  );
}
