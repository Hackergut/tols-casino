import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const cardValue = (r) => (["10", "J", "Q", "K"].includes(r) ? 0 : r === "A" ? 1 : +r);

function buildDeck() {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ r, s });
  return d;
}

function suitColor(s) {
  return s === "♥" || s === "♦" ? "#e8556b" : "#ffffff";
}

function handValue(cards) {
  let v = 0;
  cards.forEach((c) => (v += cardValue(c.r)));
  return v % 10;
}

async function shuffleDeck(pf) {
  const deck = buildDeck();
  // Fisher-Yates using provably fair rolls
  for (let i = deck.length - 1; i > 0; i--) {
    const r = await pf.roll();
    const j = Math.floor(r * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Baccarat third-card rules
function bankerDrawsThird(playerThird, bankerTotal) {
  if (playerThird === null) return bankerTotal <= 5;
  const t = cardValue(playerThird.r);
  if (bankerTotal <= 2) return true;
  if (bankerTotal === 3) return t !== 8;
  if (bankerTotal === 4) return t >= 2 && t <= 7;
  if (bankerTotal === 5) return t >= 4 && t <= 7;
  if (bankerTotal === 6) return t === 6 || t === 7;
  return false; // 7 stands
}

export default function BaccaratGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [bet, setBet] = useState("player"); // player | banker | tie
  const [player, setPlayer] = useState([]);
  const [banker, setBanker] = useState([]);
  const [dealing, setDealing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const play = async () => {
    if (dealing || !wallet || amount > wallet.balance || amount <= 0) return;
    setDealing(true);
    setResult(null);
    setPlayer([]);
    setBanker([]);

    const deck = await shuffleDeck(pf);
    const p = [deck.pop(), deck.pop()];
    const b = [deck.pop(), deck.pop()];
    let pVal = handValue(p);
    let bVal = handValue(b);

    // initial deal animation
    await dealStep(setPlayer, p[0], 1);
    await dealStep(setBanker, b[0], 1);
    await dealStep(setPlayer, p[1], 2);
    await dealStep(setBanker, b[1], 2);

    let pThird = null, bThird = null;

    // Natural?
    if (pVal < 8 && bVal < 8) {
      if (pVal <= 5) {
        pThird = deck.pop();
        await dealStep(setPlayer, pThird, 3);
        pVal = handValue([...p, pThird]);
      }
      if (bankerDrawsThird(pThird, bVal)) {
        bThird = deck.pop();
        await dealStep(setBanker, bThird, 3);
        bVal = handValue([...b, bThird]);
      }
    }

    let outcome, payout, net;
    if (pVal > bVal) {
      outcome = "player";
      payout = bet === "player" ? amount * 2 : 0;
    } else if (bVal > pVal) {
      outcome = "banker";
      // 5% commission on banker
      payout = bet === "banker" ? amount * 1.95 : 0;
    } else {
      outcome = "tie";
      payout = bet === "tie" ? amount * 9 : 0;
    }
    net = payout - amount;

    setResult({ outcome, pVal, bVal, payout, net });
    setHistory((h) => [{ outcome, pVal, bVal }, ...h].slice(0, 14));
    setDealing(false);
    updateBalance(net, amount);
    recordBet({
      game_id: "baccarat", game_name: "Baccarat Tols",
      amount, multiplier: payout > 0 ? payout / amount : 0,
      payout, result: net >= 0 ? "win" : "lose",
      client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce,
    });
  };

  const dealStep = (setter, card, pos) =>
    new Promise((res) =>
      setTimeout(() => {
        setter((prev) => [...prev, card]);
        res();
      }, 320)
    );

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        {/* Table */}
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#0f3d2e] to-[#082319] p-4 sm:p-8 min-h-[340px] sm:min-h-[380px] overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Banker */}
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Banker · {result ? result.bVal : "—"}</div>
              <div className="flex justify-center gap-2 min-h-[120px]">
                <AnimatePresence>
                {banker.map((c, i) => <motion.div key={c.r+c.s+i} initial={{ y: -20, opacity: 0, rotate: -5 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ delay: i*0.1, type: "spring", stiffness: 400, damping: 25 }}><Card card={c} delay={i * 0.1} /></motion.div>)}
                </AnimatePresence>
              </div>
            </div>
            {/* Player */}
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Player · {result ? result.pVal : "—"}</div>
              <div className="flex justify-center gap-2 min-h-[120px]">
                <AnimatePresence>
                {player.map((c, i) => <motion.div key={c.r+c.s+i} initial={{ y: -20, opacity: 0, rotate: -5 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ delay: i*0.1+0.2, type: "spring", stiffness: 400, damping: 25 }}><Card card={c} delay={i * 0.1} /></motion.div>)}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Outcome banner */}
          {result && (
            <div className="relative mt-6 text-center">
              <div className={`inline-block px-8 py-3 rounded-xl border font-black text-xl ${
                result.outcome === "tie" ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-300" :
                (bet === result.outcome) ? "border-lime/40 bg-lime/10 text-lime" : "border-red-500/30 bg-red-500/5 text-red-400"
              }`}>
                {result.outcome === "tie" ? "TIE" : result.outcome === "player" ? "PLAYER WINS" : "BANKER WINS"}
                <span className="block text-sm font-bold mt-0.5 opacity-80">
                  {result.net >= 0 ? `+${result.net.toFixed(2)}` : result.net.toFixed(2)} USDT
                </span>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-4">
          <div className="text-xs font-semibold text-white/50 mb-2">Hand history</div>
          <div className="flex gap-1.5 flex-wrap">
            {history.length === 0 && <span className="text-xs text-white/30">No hands played</span>}
            {history.map((h, i) => (
              <span key={i} className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                h.outcome === "player" ? "bg-blue-500/20 text-blue-300" :
                h.outcome === "banker" ? "bg-red-500/20 text-red-300" : "bg-yellow-500/20 text-yellow-300"
              }`}>
                {h.outcome === "player" ? "P" : h.outcome === "banker" ? "B" : "T"} {h.pVal}-{h.bVal}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} disabled={dealing} betLabel={dealing ? "Dealing..." : "Deal"} />
        <div>
          <label className="text-xs font-semibold text-white/50 mb-1.5 block">Bet on</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "player", label: "Player", mul: "1:1" },
              { id: "tie", label: "Tie", mul: "8:1" },
              { id: "banker", label: "Banker", mul: "0.95:1" },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => !dealing && setBet(o.id)}
                className={`h-16 rounded-xl border flex flex-col items-center justify-center transition ${
                  bet === o.id ? "bg-lime text-black border-lime" : "bg-[#1a1a1a] text-white/70 border-white/10 hover:border-lime/30"
                }`}
              >
                <span className="text-sm font-black">{o.label}</span>
                <span className={`text-[10px] font-bold ${bet === o.id ? "text-black/60" : "text-white/40"}`}>{o.mul}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-2 leading-relaxed">
            Baccarat with standard third-card rules. 5% commission on Banker wins.
          </p>
        </div>
      </div>
    </div>
  );
}

function Card({ card, delay }) {
  // Framer motion for fluid deal
  return (
    <div className="w-16 h-24 rounded-lg shadow-xl" style={{ perspective: 600 }}>
      <div
        className="relative w-full h-full rounded-lg"
        style={{
          transformStyle: "preserve-3d",
          animation: `dealIn 0.4s ${delay}s both, cardFlip 0.5s ${delay + 0.15}s both`,
        }}
      >
        {/* back */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#1a3a1a] to-[#0a1a0a] border border-lime/30 flex items-center justify-center" style={{ backfaceVisibility: "hidden" }}>
          <span className="text-lg font-black italic text-lime/80">T</span>
        </div>
        {/* front */}
        <div className="absolute inset-0 rounded-lg bg-white flex flex-col items-center justify-center" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <span className="text-2xl font-black leading-none" style={{ color: suitColor(card.s) }}>{card.r}</span>
          <span className="text-2xl leading-none" style={{ color: suitColor(card.s) }}>{card.s}</span>
        </div>
      </div>
    </div>
  );
}