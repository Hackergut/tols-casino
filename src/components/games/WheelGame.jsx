import React, { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";

const SEGMENTS = [
  { label: "1.5x", mul: 1.5, color: "#ccff00" },
  { label: "1.2x", mul: 1.2, color: "#2a2a2a" },
  { label: "3x", mul: 3, color: "#ccff00" },
  { label: "0", mul: 0, color: "#1a1a1a" },
  { label: "2x", mul: 2, color: "#ccff00" },
  { label: "1.2x", mul: 1.2, color: "#2a2a2a" },
  { label: "5x", mul: 5, color: "#ccff00" },
  { label: "0", mul: 0, color: "#1a1a1a" },
  { label: "1.5x", mul: 1.5, color: "#ccff00" },
  { label: "10x", mul: 10, color: "#ccff00" },
  { label: "0", mul: 0, color: "#1a1a1a" },
  { label: "2x", mul: 2, color: "#ccff00" },
];

export default function WheelGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [risk, setRisk] = useState("medium");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [last, setLast] = useState(null);

  const play = async () => {
    if (spinning || !wallet || amount > wallet.balance || amount <= 0) return;
    setSpinning(true);
    const r = await pf.roll();
    const idx = Math.floor(r * SEGMENTS.length);
    const seg = SEGMENTS[idx];
    const spins = 5;
    const finalAngle = 360 * spins + (360 / SEGMENTS.length) * idx;
    setRotation((prev) => prev + finalAngle - (prev % 360));
    setTimeout(() => {
      const payout = amount * seg.mul;
      setLast(seg);
      setSpinning(false);
      updateBalance(payout - amount, amount);
      recordBet({ game_id: "wheel", game_name: "Wheel Tols", amount, multiplier: seg.mul, payout, result: seg.mul >= 1 ? "win" : "lose", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
    }, 3200);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="rounded-2xl border border-white/10 bg-[#111] p-8 flex flex-col items-center justify-center min-h-[360px]">
        <div className="relative" style={{ width: 260, height: 260 }}>
          {/* pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0 border-l-8 border-r-8 border-t-[14px] border-l-transparent border-r-transparent border-t-lime" />
          <div
            className="w-full h-full rounded-full border-4 border-white/10 transition-transform"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: spinning ? "3s" : "0s",
              transitionTimingFunction: "cubic-bezier(0.2,0.8,0.1,1)",
              background: `conic-gradient(${SEGMENTS.map((s, i) => `${s.color} ${(i / SEGMENTS.length) * 360}deg ${((i + 1) / SEGMENTS.length) * 360}deg`).join(",")})`,
            }}
          >
            {SEGMENTS.map((s, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 origin-left text-xs font-black"
                style={{
                  transform: `rotate(${(i + 0.5) * (360 / SEGMENTS.length)}deg) translateX(80px)`,
                  color: s.color === "#ccff00" ? "#000" : "#fff",
                }}
              >
                {s.label}
              </div>
            ))}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#1a1a1a] border-2 border-lime" />
        </div>
        {last && !spinning && (
          <p className="mt-6 text-lg font-bold">
            Result: <span className={last.mul >= 1 ? "text-lime" : "text-red-400"}>{last.label}</span>
          </p>
        )}
      </div>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} disabled={spinning} betLabel={spinning ? "Spinning..." : "Spin"} />
      </div>
    </div>
  );
}