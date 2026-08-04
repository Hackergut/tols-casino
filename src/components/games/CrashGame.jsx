import React, { useState, useEffect, useRef } from "react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import { crashPointFromFloat } from "@/lib/gameEngine";
import { TrendingUp } from "lucide-react";

export default function CrashGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [autoCashout, setAutoCashout] = useState(2.0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(null);
  const [running, setRunning] = useState(false);
  const [cashed, setCashed] = useState(false);
  const [history, setHistory] = useState([]);

  const rafRef = useRef(null);
  const cashedRef = useRef(false);
  const multRef = useRef(1.0);
  const autoRef = useRef(2.0);
  useEffect(() => { autoRef.current = autoCashout; }, [autoCashout]);

  const recordWin = (mul) => {
    const payout = amount * mul;
    updateBalance(payout - amount, amount);
    recordBet({
      game_id: "crash", game_name: "Crash Tols", amount,
      multiplier: mul, payout, result: "win",
      client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce,
    });
  };

  const doCashout = (m = multRef.current) => {
    if (cashedRef.current) return;
    cashedRef.current = true;
    setCashed(true);
    recordWin(m);
  };

  const play = async () => {
    if (running || !wallet || amount > wallet.balance || amount <= 0) return;
    setRunning(true);
    setCashed(false);
    cashedRef.current = false;
    setMultiplier(1.0);
    multRef.current = 1.0;
    setCrashPoint(null);
    const cp = crashPointFromFloat(await pf.roll());
    setCrashPoint(cp);
    const start = performance.now();
    const tick = (now) => {
      const elapsed = (now - start) / 1000;
      const m = Math.floor(Math.pow(1.07, elapsed * 8) * 100) / 100;
      multRef.current = m;
      setMultiplier(m);
      if (m >= cp) {
        setMultiplier(cp);
        setRunning(false);
        setHistory((h) => [cp, ...h].slice(0, 12));
        if (!cashedRef.current) {
          cashedRef.current = true;
          updateBalance(-amount, amount);
          recordBet({
            game_id: "crash", game_name: "Crash Tols", amount,
            multiplier: 0, payout: 0, result: "lose",
            client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce,
          });
        }
        return;
      }
      if (!cashedRef.current && autoRef.current && m >= autoRef.current) {
        doCashout(m);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#141414] to-[#0a0a0a] p-4 sm:p-8 min-h-[320px] sm:min-h-[360px] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-3 left-3 right-3 flex gap-1.5 flex-wrap">
            {history.map((h, i) => (
              <span
                key={i}
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${h >= 2 ? "text-lime bg-lime/10" : "text-red-400 bg-red-500/10"}`}
              >
                {h.toFixed(2)}x
              </span>
            ))}
          </div>
          <div
            className={`text-6xl sm:text-7xl font-black tabular-nums transition-colors ${
              running ? (cashed ? "text-lime" : "text-white") : crashPoint ? "text-red-500" : "text-white/20"
            }`}
          >
            {multiplier.toFixed(2)}x
          </div>
          <div className="mt-3 text-sm font-semibold text-white/40">
            {!running && !crashPoint && "Place a bet to start"}
            {running && !cashed && "RISING 🚀"}
            {running && cashed && "CASHED OUT!"}
            {!running && crashPoint && "CRASHED"}
          </div>
          <TrendingUp className={`absolute bottom-8 ${running ? "text-lime/30" : "text-white/5"}`} style={{ width: 120, height: 120 }} />
        </div>
        {running && (
          <button
            onClick={() => doCashout()}
            disabled={cashed}
            className="w-full h-14 rounded-xl bg-white/5 border border-lime/40 text-lime font-black text-lg hover:bg-lime/10 transition disabled:opacity-40"
          >
            {cashed ? "Cashed out ✓" : "CASH OUT"}
          </button>
        )}
      </div>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} disabled={running} betLabel={running ? "IN PROGRESS..." : "Bet"} />
        <div>
          <label className="text-xs font-semibold text-white/50 mb-1.5 block">Auto Cashout (x)</label>
          <input
            type="number"
            min="1.01"
            step="0.01"
            value={autoCashout}
            onChange={(e) => setAutoCashout(Math.max(1.01, +e.target.value))}
            className="w-full h-12 rounded-xl bg-[#1a1a1a] border border-white/10 px-4 text-lg font-bold text-white outline-none focus:border-lime/40"
          />
        </div>
      </div>
    </div>
  );
}