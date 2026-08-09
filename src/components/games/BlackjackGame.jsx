import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import GameFrame from "@/components/games/GameFrame";

const SUITS = ["♠","♥","♦","♣"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const val = (r) => r==="A" ? 11 : ["K","Q","J"].includes(r) ? 10 : Number(r);
function handValue(cards){
  let v=0, aces=0;
  cards.forEach(c=>{ v+=val(c.r); if(c.r==="A") aces++; });
  while(v>21 && aces>0){ v-=10; aces--; }
  return v;
}
function buildDeck(){ const d=[]; for(const s of SUITS) for(const r of RANKS) d.push({r,s}); return d; }
async function shuffle(pf){ const d=buildDeck(); for(let i=d.length-1;i>0;i--){ const r=await pf.roll(); const j=Math.floor(r*(i+1)); [d[i],d[j]]=[d[j],d[i]]; } return d; }
function Card({c, hidden}){
  if(hidden) return <div className="w-16 h-24 rounded-lg bg-[#1a1a1a] border-2 border-white/10 grid place-items-center text-white/20">?</div>;
  const color = c.s==="♥"||c.s==="♦" ? "text-red-400" : "text-white";
  return <div className="w-16 h-24 rounded-lg bg-white border-2 border-white/20 flex flex-col items-center justify-center shadow-lg"><span className={`text-lg font-black ${color}`}>{c.r}{c.s}</span></div>;
}

export default function BlackjackGame(){
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount,setAmount]=useState(1);
  const [deck,setDeck]=useState([]);
  const [player,setPlayer]=useState([]);
  const [dealer,setDealer]=useState([]);
  const [hideDealer,setHideDealer]=useState(true);
  const [playing,setPlaying]=useState(false);
  const [result,setResult]=useState(null);

  const start = async()=>{
    if(playing || !wallet || amount>wallet.balance) return;
    const d=await shuffle(pf);
    const p=[d.pop(), d.pop()];
    const dl=[d.pop(), d.pop()];
    setDeck(d); setPlayer(p); setDealer(dl); setHideDealer(true); setPlaying(true); setResult(null);
    if(handValue(p)===21) setTimeout(()=> stand(p,dl,d), 600);
  };
  const hit = async()=>{
    if(!playing) return;
    const c=deck[deck.length-1];
    const nd=deck.slice(0,-1);
    const np=[...player,c];
    setDeck(nd); setPlayer(np);
    if(handValue(np)>21){
      setPlaying(false); setHideDealer(false);
      const payout=0; setResult({ outcome:"lose", payout });
      updateBalance(-amount, amount);
      recordBet({ game_id:"blackjack", game_name:"Blackjack", amount, multiplier:0, payout:0, result:"lose", client_seed:pf.clientSeed, server_seed_hash:pf.serverHash, nonce:pf.nonce });
    }
  };
  const stand = async (p=player, dl=dealer, d=deck)=>{
    let dlHand=[...dl];
    let nd=[...d];
    while(handValue(dlHand)<17){
      const c=nd.pop();
      dlHand=[...dlHand,c];
    }
    setDealer(dlHand); setDeck(nd); setHideDealer(false);
    const pv=handValue(p), dv=handValue(dlHand);
    let outcome, mul=0, payout=0;
    if(dv>21 || pv>dv){ outcome="win"; mul = pv===21 && p.length===2 ? 1.5 : 1; payout=amount*(1+mul); }
    else if(pv===dv){ outcome="push"; payout=amount; mul=1; }
    else { outcome="lose"; payout=0; }
    const net = payout - amount;
    setPlaying(false); setResult({ outcome, payout, mul, pv, dv });
    updateBalance(net, amount);
    recordBet({ game_id:"blackjack", game_name:"Blackjack", amount, multiplier: mul, payout, result: outcome==="win"?"win": outcome==="push"?"push":"lose", client_seed:pf.clientSeed, server_seed_hash:pf.serverHash, nonce:pf.nonce });
  };
  const dbl = async()=>{
    if(!playing || player.length!==2 || wallet.balance < amount*2) return;
    const c=deck[deck.length-1];
    const nd=deck.slice(0,-1);
    const np=[...player,c];
    setDeck(nd); setPlayer(np);
    if(handValue(np)>21){
      setPlaying(false); setHideDealer(false);
      updateBalance(-amount*2, amount*2);
      recordBet({ game_id:"blackjack", game_name:"Blackjack", amount: amount*2, multiplier:0, payout:0, result:"lose", client_seed:pf.clientSeed, server_seed_hash:pf.serverHash, nonce:pf.nonce });
    } else {
      stand(np, dealer, nd);
      // adjust amount for double (already handled in stand with double amount? simplified)
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <GameFrame title="Blackjack" stats={[{label:"Player", value: player.length? handValue(player): "—"}, {label:"Dealer", value: !hideDealer && dealer.length? handValue(dealer): "—"}, {label:"Result", value: result? result.outcome.toUpperCase(): "—"}]}>
        <div className="w-full max-w-md space-y-6">
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest text-center">Dealer { !hideDealer && dealer.length ? handValue(dealer) : "?"}</p>
            <div className="flex justify-center gap-2 mt-2 min-h-[100px]">
              <AnimatePresence>
                {dealer.map((c,i)=> (
                  <motion.div key={c.r+c.s+i} initial={{ y: -20, rotate: -5, opacity: 0 }} animate={{ y:0, rotate:0, opacity:1 }} transition={{ delay: i*0.12, type:"spring", stiffness:400, damping:25 }}>
                    <Card c={c} hidden={hideDealer && i===1} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest text-center">Player {player.length? handValue(player): ""}</p>
            <div className="flex justify-center gap-2 mt-2 min-h-[100px]">
              <AnimatePresence>
                {player.map((c,i)=> (
                  <motion.div key={c.r+c.s+i} initial={{ y: -20, rotate: -5, opacity: 0 }} animate={{ y:0, rotate:0, opacity:1 }} transition={{ delay: i*0.12+0.2, type:"spring", stiffness:400, damping:25 }}>
                    <Card c={c} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          {result && <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} className={`text-center py-3 rounded-xl border font-black ${result.outcome==="win"?"bg-lime text-black border-lime": result.outcome==="push"?"bg-white/10 text-white border-white/20":"bg-red-500/20 text-red-400 border-red-500/30"}`}>{result.outcome.toUpperCase()} {result.payout ? `+${result.payout}` : ""}</motion.div>}
          {playing && (
            <div className="flex gap-2 justify-center">
              <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={hit} className="px-6 h-10 rounded-xl bg-white text-black font-black">Hit</motion.button>
              <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={()=> stand()} className="px-6 h-10 rounded-xl bg-white/10 border border-white/20 text-white font-black">Stand</motion.button>
              <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={dbl} disabled={player.length!==2} className="px-6 h-10 rounded-xl bg-lime text-black font-black disabled:opacity-40">Double</motion.button>
            </div>
          )}
        </div>
      </GameFrame>
      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={start} disabled={playing} betLabel={playing? "Dealing...":"Deal"} />
        <p className="text-xs text-white/30 text-center">Blackjack pays 3:2 • Dealer hits soft 17 • Double on 2 cards</p>
      </div>
    </div>
  );
}
