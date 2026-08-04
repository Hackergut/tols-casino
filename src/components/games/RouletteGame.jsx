import React, { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import { RotateCw, Coins } from "lucide-react";

const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
// European single-zero wheel order
const WHEEL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const SEG = 360 / 37;

const colorOf = (n) => (n === 0 ? "green" : RED.has(n) ? "red" : "black");
const cellColor = (n) => (n === 0 ? "bg-green-600" : RED.has(n) ? "bg-red-600" : "bg-[#1a1a1a]");

// outside bet definitions
const OUTSIDE = [
  { id: "red", label: "Red", mul: 2, test: (n) => n !== 0 && RED.has(n) },
  { id: "black", label: "Black", mul: 2, test: (n) => n !== 0 && !RED.has(n) },
  { id: "even", label: "Even", mul: 2, test: (n) => n !== 0 && n % 2 === 0 },
  { id: "odd", label: "Odd", mul: 2, test: (n) => n !== 0 && n % 2 === 1 },
  { id: "low", label: "1-18", mul: 2, test: (n) => n >= 1 && n <= 18 },
  { id: "high", label: "19-36", mul: 2, test: (n) => n >= 19 && n <= 36 },
  { id: "d1", label: "1st 12", mul: 3, test: (n) => n >= 1 && n <= 12 },
  { id: "d2", label: "2nd 12", mul: 3, test: (n) => n >= 13 && n <= 24 },
  { id: "d3", label: "3rd 12", mul: 3, test: (n) => n >= 25 && n <= 36 },
];

const colOf = (n) => (n === 0 ? 0 : n % 3 === 0 ? 3 : n % 3);

export default function RouletteGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [bets, setBets] = useState({}); // id -> stake
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const [lastWin, setLastWin] = useState(null);

  const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);

  const toggleBet = (id) => {
    if (spinning) return;
    setBets((b) => {
      if (b[id]) {
        const { [id]: _omit, ...rest } = b;
        return rest;
      }
      return { ...b, [id]: amount };
    });
  };

  const toggleNumber = (n) => toggleBet(`n${n}`);

  const clearBets = () => !spinning && setBets({});

  const play = async () => {
    if (spinning || !wallet || totalStake <= 0 || totalStake > wallet.balance) return;
    setSpinning(true);
    setLastWin(null);
    const r = await pf.roll();
    const num = Math.floor(r * 37);
    const idx = WHEEL_ORDER.indexOf(num);
    const spins = 5;
    const jitter = (Math.random() - 0.5) * SEG * 0.6;
    const target = 360 * spins - idx * SEG - SEG / 2 + jitter;
    setRotation((prev) => prev + target - (((prev % 360) + 360) % 360));
    setTimeout(() => {
      setWinner(num);
      // compute winnings
      let win = 0;
      Object.entries(bets).forEach(([id, stake]) => {
        if (id.startsWith("n")) {
          const n = +id.slice(1);
          if (n === num) win += stake * 36;
        } else {
          const bet = OUTSIDE.find((o) => o.id === id) || COLS.find((c) => c.id === id);
          if (bet && bet.test(num)) win += stake * bet.mul;
        }
      });
      const net = win - totalStake;
      setLastWin({ num, win, net });
      setSpinning(false);
      updateBalance(net, totalStake);
      recordBet({
        game_id: "roulette", game_name: "Roulette Tols",
        amount: totalStake, multiplier: win > 0 ? win / totalStake : 0,
        payout: win, result: net >= 0 ? "win" : "lose",
        client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce,
      });
    }, 4200);
  };

  const COLS = [
    { id: "c1", label: "Col 1", mul: 3, test: (n) => colOf(n) === 1 },
    { id: "c2", label: "Col 2", mul: 3, test: (n) => colOf(n) === 2 },
    { id: "c3", label: "Col 3", mul: 3, test: (n) => colOf(n) === 3 },
  ];

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        {/* Wheel */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141414] to-[#0a0a0a] p-3 sm:p-6 flex flex-col items-center">
          <div className="relative" style={{ width: 280, height: 280 }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20 w-0 h-0 border-l-8 border-r-8 border-t-[16px] border-l-transparent border-r-transparent border-t-lime drop-shadow" />
            <div
              className="absolute inset-0 rounded-full border-4 border-white/10"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? "transform 4s cubic-bezier(0.15,0.85,0.1,1)" : "none",
                background: `conic-gradient(${WHEEL_ORDER.map((n, i) => {
                  const c = colorOf(n) === "green" ? "#16a34a" : colorOf(n) === "red" ? "#dc2626" : "#0d0d0d";
                  return `${c} ${i * SEG}deg ${(i + 1) * SEG}deg`;
                }).join(",")})`,
              }}
            >
              {WHEEL_ORDER.map((n, i) => (
                <span
                  key={i}
                  className="absolute left-1/2 top-1/2 text-[8px] font-bold text-white/90 origin-top"
                  style={{ transform: `rotate(${i * SEG + SEG / 2}deg) translateY(-128px)` }}
                >
                  {n}
                </span>
              ))}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#1a1a1a] border-2 border-lime flex items-center justify-center">
              {winner !== null && !spinning ? (
                <span className={`text-xl font-black ${colorOf(winner) === "red" ? "text-red-400" : colorOf(winner) === "green" ? "text-green-400" : "text-white"}`}>{winner}</span>
              ) : <RotateCw className={`w-6 h-6 text-lime ${spinning ? "animate-spin" : ""}`} />}
            </div>
          </div>
          {lastWin && (
            <div className={`mt-4 px-5 py-2 rounded-xl border text-center ${lastWin.net >= 0 ? "border-lime/40 bg-lime/10" : "border-red-500/30 bg-red-500/5"}`}>
              <p className="text-sm font-bold text-white/70">Result <span className={colorOf(lastWin.num) === "red" ? "text-red-400" : colorOf(lastWin.num) === "green" ? "text-green-400" : "text-white"}>{lastWin.num}</span> ({colorOf(lastWin.num) === "red" ? "red" : lastWin.num === 0 ? "zero" : "black"})</p>
              <p className={`text-xl font-black ${lastWin.net >= 0 ? "text-lime" : "text-red-400"}`}>
                {lastWin.net >= 0 ? `+${lastWin.net.toFixed(2)}` : lastWin.net.toFixed(2)} USDT
              </p>
            </div>
          )}
        </div>

        {/* Bet board */}
        <div className="rounded-2xl border border-white/10 bg-[#111] p-4 overflow-x-auto">
          <div className="flex gap-1 min-w-[520px]">
            {/* Zero */}
            <button
              onClick={() => toggleNumber(0)}
              className={`w-10 rounded-l-lg ${cellColor(0)} border border-white/10 font-bold text-white text-sm flex items-center justify-center relative ${bets["n0"] ? "ring-2 ring-lime" : ""}`}
            >0{bets["n0"] && <ChipMark stake={bets["n0"]} />}</button>
            {/* Numbers grid 3 rows x 12 cols, top row = 3,6,9..36 */}
            <div className="grid grid-rows-3 grid-cols-12 gap-1 flex-1">
              {Array.from({ length: 12 }).map((_, col) => (
                [3, 2, 1].map((row) => {
                  const n = col * 3 + row;
                  return (
                    <button
                      key={n}
                      onClick={() => toggleNumber(n)}
                      className={`relative ${cellColor(n)} border border-white/10 rounded font-bold text-white text-xs flex items-center justify-center hover:brightness-125 transition ${bets[`n${n}`] ? "ring-2 ring-lime" : ""}`}
                    >
                      {n}{bets[`n${n}`] && <ChipMark stake={bets[`n${n}`]} />}
                    </button>
                  );
                })
              ))}
            </div>
          </div>

          {/* Dozens */}
          <div className="grid grid-cols-3 gap-1 mt-1">
            {OUTSIDE.filter((o) => o.id.startsWith("d")).map((o) => (
              <OutsideBtn key={o.id} o={o} active={!!bets[o.id]} stake={bets[o.id]} onClick={() => toggleBet(o.id)} />
            ))}
          </div>
          {/* Outside even-money */}
          <div className="grid grid-cols-6 gap-1 mt-1">
            {OUTSIDE.filter((o) => ["red","black","even","odd","low","high"].includes(o.id)).map((o) => (
              <OutsideBtn key={o.id} o={o} active={!!bets[o.id]} stake={bets[o.id]} onClick={() => toggleBet(o.id)} />
            ))}
          </div>
          {/* Columns */}
          <div className="grid grid-cols-3 gap-1 mt-1">
            {COLS.map((o) => (
              <OutsideBtn key={o.id} o={o} active={!!bets[o.id]} stake={bets[o.id]} onClick={() => toggleBet(o.id)} />
            ))}
          </div>

          <div className="flex items-center justify-between mt-3 text-sm">
            <span className="text-white/50">Staked: <b className="text-white tabular-nums">{totalStake.toFixed(2)} USDT</b></span>
            <button onClick={clearBets} disabled={spinning} className="text-xs font-bold text-white/50 hover:text-red-400 transition disabled:opacity-30">Clear</button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} disabled={spinning || totalStake <= 0} betLabel={spinning ? "Spinning..." : "Spin"} />
        <p className="text-xs text-white/40 leading-relaxed">
          Click numbers or outside zones to add bets equal to the selected amount. Payouts: single number 35:1, dozens/columns 2:1, even/odd/red/black 1:1.
        </p>
      </div>
    </div>
  );
}

function OutsideBtn({ o, active, stake, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-11 rounded-lg text-sm font-bold border transition ${
        active ? "bg-lime/20 border-lime text-lime" : "bg-[#1a1a1a] border-white/10 text-white/60 hover:border-lime/30"
      }`}
    >
      {o.label}
      {active && <ChipMark stake={stake} />}
    </button>
  );
}

function ChipMark({ stake }) {
  return (
    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-lime text-black text-[9px] font-black border-2 border-black shadow">
      {stake >= 1000 ? `${(stake / 1000).toFixed(1)}k` : stake}
    </span>
  );
}