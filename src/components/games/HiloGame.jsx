import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import GameFrame from "@/components/games/GameFrame";

const RTP = 0.99;
const RANKS = [
  { id: 1, label: "A" },
  { id: 2, label: "2" },
  { id: 3, label: "3" },
  { id: 4, label: "4" },
  { id: 5, label: "5" },
  { id: 6, label: "6" },
  { id: 7, label: "7" },
  { id: 8, label: "8" },
  { id: 9, label: "9" },
  { id: 10, label: "10" },
  { id: 11, label: "J" },
  { id: 12, label: "Q" },
  { id: 13, label: "K" },
];
const SUITS = [
  { symbol: "♠", color: "#F4F2FA" },
  { symbol: "♣", color: "#F4F2FA" },
  { symbol: "♥", color: "#E31B23" },
  { symbol: "♦", color: "#E31B23" },
];

function oddsFor(rank) {
  const higherOrSame = (13 - rank + 1) / 13;
  const lowerOrSame = rank / 13;
  return {
    higherP: higherOrSame,
    lowerP: lowerOrSame,
    higherMult: higherOrSame > 0 ? RTP / higherOrSame : 0,
    lowerMult: lowerOrSame > 0 ? RTP / lowerOrSame : 0,
  };
}

function fmtPct(n) {
  return (n * 100).toFixed(2) + "%";
}

export default function HiloGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState(null);
  const [nextCard, setNextCard] = useState(null);
  const [chainMult, setChainMult] = useState(1);
  const [flash, setFlash] = useState(null);
  const [history, setHistory] = useState([]);

  const odds = useMemo(() => (current ? oddsFor(current.rank) : oddsFor(3)), [current]);
  const profit = Math.max(0, amount * chainMult - amount);

  const draw = async () => {
    const r = await pf.roll();
    const rank = RANKS[Math.floor(r * RANKS.length)];
    const s = SUITS[Math.floor(((r * 1000) % 1) * SUITS.length)] || SUITS[0];
    return { rank: rank.id, label: rank.label, symbol: s.symbol, color: s.color };
  };

  const start = async () => {
    if (!wallet || amount > wallet.balance || amount <= 0 || busy) return;
    setBusy(true);
    const card = await draw();
    setCurrent(card);
    setNextCard(null);
    setHistory([card]);
    setChainMult(1);
    setFlash(null);
    setActive(true);
    setBusy(false);
  };

  const guess = async (dir) => {
    if (!active || !current || busy) return;
    setBusy(true);
    const nxt = await draw();
    const step = dir === "higher" ? odds.higherMult : odds.lowerMult;
    const won = step > 0 && (dir === "higher" ? nxt.rank >= current.rank : nxt.rank <= current.rank);
    setNextCard(nxt);
    setHistory((h) => [...h, { ...nxt, dir, won }]);
    if (!won) {
      setFlash("lose");
      setActive(false);
      setChainMult(1);
      updateBalance(-amount, amount);
      recordBet({
        game_id: "hilo",
        game_name: "Hilo",
        amount,
        multiplier: 0,
        payout: 0,
        result: "lose",
        client_seed: pf.clientSeed,
        server_seed_hash: pf.serverHash,
        nonce: pf.nonce,
      });
      setCurrent(nxt);
      setBusy(false);
      return;
    }
    setFlash("win");
    setChainMult((m) => m * step);
    setCurrent(nxt);
    setBusy(false);
  };

  const skip = async () => {
    if (!active || busy) return;
    setBusy(true);
    const nxt = await draw();
    setCurrent(nxt);
    setNextCard(null);
    setHistory((h) => [...h, { ...nxt, skipped: true }]);
    setFlash(null);
    setBusy(false);
  };

  const cashout = () => {
    if (!active || chainMult <= 1) return;
    const payout = amount * chainMult;
    setActive(false);
    updateBalance(payout - amount, amount);
    recordBet({
      game_id: "hilo",
      game_name: "Hilo",
      amount,
      multiplier: chainMult,
      payout,
      result: "win",
      client_seed: pf.clientSeed,
      server_seed_hash: pf.serverHash,
      nonce: pf.nonce,
    });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <GameFrame
        title="Hilo"
        stats={[
          { label: "Multiplier", value: `${chainMult.toFixed(2)}x` },
          { label: "Higher", value: fmtPct(odds.higherP), tone: "muted" },
          { label: "Lower", value: fmtPct(odds.lowerP), tone: "muted" },
        ]}
      >
        <div className="max-w-md mx-auto w-full space-y-4">
          <div className="rounded-2xl bg-[#16122A] p-4">
            <div className="flex gap-3 items-stretch">
              <div className="relative shrink-0">
                <CardFace card={current} flash={flash} idleIcon />
                <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 bg-[#3A1F78] text-[#C6FF00] text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded whitespace-nowrap">
                  CURRENT CARD
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <OddsBtn
                  title="HIGHER / SAME"
                  pct={odds.higherP}
                  up
                  disabled={!active || busy || odds.higherMult <= 0}
                  onClick={() => guess("higher")}
                />
                <OddsBtn
                  title="LOWER / SAME"
                  pct={odds.lowerP}
                  disabled={!active || busy || odds.lowerMult <= 0}
                  onClick={() => guess("lower")}
                />
              </div>
            </div>
            {active && (
              <div className="mt-4 flex justify-between text-[11px] text-white/40">
                <span>Next step {odds.higherMult.toFixed(2)}x / {odds.lowerMult.toFixed(2)}x</span>
                <button onClick={skip} disabled={busy} className="text-[#C6FF00] font-bold">
                  Skip card
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-[#1A1433] to-[#0C0A18] p-4 min-h-[160px] flex items-center gap-4">
            <CardFace card={nextCard} mystery={!nextCard} flash={flash} />
            <p className="text-sm text-white/45">
              {!active && chainMult <= 1 && "Press Bet to draw the first card."}
              {active && "Will the next card be higher or lower?"}
              {!active && flash === "lose" && "Wrong call. Bet again."}
              {!active && flash === "win" && `Cashed ${(amount * chainMult).toFixed(2)} USD.`}
            </p>
          </div>

          {history.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {history.slice(-12).map((c, i) => (
                <div
                  key={i}
                  className={`w-8 h-10 rounded-md border flex flex-col items-center justify-center text-[10px] font-black ${
                    c.won === false
                      ? "border-red-500/50 bg-red-500/10"
                      : c.won
                      ? "border-lime/40 bg-lime/10"
                      : "border-white/10 bg-white/5"
                  }`}
                  style={{ color: c.color }}
                >
                  <span>{c.label}</span>
                  <span className="text-[9px] leading-none">{c.symbol}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </GameFrame>

      <div className="space-y-4">
        <BetPanel
          amount={amount}
          setAmount={setAmount}
          onBet={active && chainMult > 1 ? cashout : start}
          disabled={busy || (active && chainMult <= 1)}
          betLabel={
            !active
              ? "Bet"
              : chainMult > 1
              ? `Cashout ${(amount * chainMult).toFixed(2)}`
              : "Pick higher or lower"
          }
          profit={profit}
        />
        <p className="text-xs text-white/40 text-center">
          Ace is low, King is high. Same rank wins on both sides. Multiplier compounds. RTP 99%.
        </p>
      </div>
    </div>
  );
}

function CardFace({ card, mystery, idleIcon, flash }) {
  const border =
    flash === "win" ? "#C6FF00" : flash === "lose" ? "#E31B23" : "#C6FF00";
  return (
    <motion.div
      key={card ? card.label + card.symbol : mystery ? "?" : "idle"}
      initial={{ scale: 0.92, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-[86px] h-[118px] rounded-[14px] bg-[#05040A] flex items-center justify-center shrink-0"
      style={{
        border: `2px solid ${border}`,
        boxShadow: flash === "win" ? "0 0 18px rgba(198,255,0,0.35)" : "none",
      }}
    >
      {card && !mystery ? (
        <div className="text-center" style={{ color: card.color }}>
          <div className="text-2xl font-black leading-none">{card.label}</div>
          <div className="text-2xl leading-tight">{card.symbol}</div>
        </div>
      ) : idleIcon && !card ? (
        <ArrowUpDown className="w-7 h-7 text-[#C6FF00]" />
      ) : (
        <span className="text-4xl font-black text-[#C6FF00] font-mono">?</span>
      )}
    </motion.div>
  );
}

function OddsBtn({ title, pct, up, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 text-left rounded-xl bg-[#1C1733] px-3 py-2.5 flex items-center justify-between disabled:opacity-50"
    >
      <div>
        <div className="text-[11px] font-black tracking-wide text-white">{title}</div>
        <div className="text-xs font-bold text-[#C6FF00] mt-0.5">
          {up ? "↑" : "↓"} {fmtPct(pct)}
        </div>
      </div>
      {up ? (
        <ArrowUp className="w-5 h-5 text-[#C6FF00]" />
      ) : (
        <ArrowDown className="w-5 h-5 text-[#E31B23]" />
      )}
    </button>
  );
}
