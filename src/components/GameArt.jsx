import React from "react";
import { Dices, Bomb, Coins, Rocket, ArrowUp, Spade, Gem } from "lucide-react";

const ART = {
  dice: { Icon: Dices, accent: "#ccff00", label: "DICE" },
  mines: { Icon: Bomb, accent: "#ccff00", label: "MINES" },
  keno: { Icon: null, accent: "#ccff00", label: "KENO" },
  plinko: { Icon: null, accent: "#ccff00", label: "PLINKO" },
  coinflip: { Icon: Coins, accent: "#ccff00", label: "COINFLIP" },
  crash: { Icon: Rocket, accent: "#ccff00", label: "CRASH" },
  limbo: { Icon: ArrowUp, accent: "#ccff00", label: "LIMBO" },
  wheel: { Icon: null, accent: "#ccff00", label: "WHEEL" },
  roulette: { Icon: null, accent: "#ccff00", label: "ROULETTE" },
  baccarat: { Icon: Spade, accent: "#ccff00", label: "BACCARAT" },
  "neon-vault": { Icon: null, accent: "#ccff00", label: "NEON VAULT" },
};

export default function GameArt({ slug, className = "" }) {
  const a = ART[slug] || { Icon: Gem, accent: "#ccff00", label: "TOLS" };
  const { Icon, accent, label } = a;
  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: `radial-gradient(ellipse at 50% 78%, ${accent}20, transparent 48%), radial-gradient(circle at 50% 35%, ${accent}12, transparent 60%), linear-gradient(160deg, #171717, #080808)` }}
    >
      <div className="absolute inset-0 bg-grid opacity-10" />
      <span className="absolute -bottom-3 left-1 text-5xl font-black italic opacity-10" style={{ color: accent }}>{label[0]}</span>
      <div className="absolute inset-0 flex items-center justify-center">
        {slug === "neon-vault" ? (
          <SlotArt accent={accent} />
        ) : slug === "keno" ? (
          <KenoArt accent={accent} />
        ) : slug === "plinko" ? (
          <PlinkoArt accent={accent} />
        ) : slug === "wheel" || slug === "roulette" ? (
          <WheelArt accent={accent} />
        ) : Icon ? (
          <Icon style={{ color: accent }} strokeWidth={1.25} className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_0_18px_currentColor]" />
        ) : (
          <Gem style={{ color: accent }} className="w-12 h-12" />
        )}
      </div>
    </div>
  );
}

function KenoArt({ accent }) {
  const cells = [0, 0, 1, 1, 0, 0, 1, 0, 1];
  return (
    <div className="grid grid-cols-3 gap-1">
      {cells.map((c, i) => (
        <span
          key={i}
          className="w-3 h-3 rounded-[3px]"
          style={{ background: c ? accent : "#ffffff14", border: `1px solid ${c ? accent : "#ffffff22"}` }}
        />
      ))}
    </div>
  );
}

function PlinkoArt({ accent }) {
  const rows = 5;
  return (
    <div className="flex flex-col items-center gap-1.5">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-1.5">
          {Array.from({ length: r + 1 }).map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: accent, opacity: 0.4 + r / rows }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function WheelArt({ accent }) {
  return (
    <div
      className="w-14 h-14 rounded-full border-2"
      style={{
        borderColor: accent,
        background: `conic-gradient(${accent} 0 45deg, #ffffff14 45deg 90deg, ${accent} 90deg 135deg, #ffffff14 135deg 180deg, ${accent} 180deg 225deg, #ffffff14 225deg 270deg, ${accent} 270deg 315deg, #ffffff14 315deg 360deg)`,
      }}
    />
  );
}

function SlotArt({ accent }) {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((reel) => (
        <div key={reel} className="flex flex-col gap-1">
          {[0, 1].map((row) => (
            <span
              key={row}
              className="w-3.5 h-3.5 rounded-[3px] border"
              style={{ borderColor: accent, background: reel === 1 && row === 0 ? `${accent}30` : "#ffffff10" }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}