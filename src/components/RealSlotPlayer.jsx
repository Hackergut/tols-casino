import React, { useEffect, useState } from "react";
import { base44 } from "@/api/client";
import { useWallet } from "@/components/WalletProvider";
import { Loader2, AlertTriangle } from "lucide-react";

export default function RealSlotPlayer({ game, mode }) {
  const [launchUrl, setLaunchUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { wallet } = useWallet();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setLaunchUrl(null);
    base44.functions
      .invoke("launchSlotGame", { slug: game.slug, mode })
      .then((res) => {
        if (!active) return;
        const data = res.data || {};
        if (data.launch_url) setLaunchUrl(data.launch_url);
        else setError(data.error || "URL di lancio non disponibile.");
      })
      .catch((e) => {
        if (!active) return;
        setError(e?.response?.data?.error || e.message || "Errore di lancio.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [game.slug, mode]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black overflow-hidden">
      <div className="aspect-video w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-lime" />
            <p className="text-sm">Caricamento {game.name}…</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <p className="text-sm font-bold text-white">Slot reale non disponibile</p>
            <p className="text-xs text-white/50 max-w-md">{error}</p>
            <p className="text-[11px] text-white/30 max-w-md mt-2">
              Ask an admin to configure the slot aggregator credentials in the Admin panel, then retry.
            </p>
          </div>
        ) : (
          <iframe
            src={launchUrl}
            title={game.name}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
        )}
      </div>
      <div className="px-4 py-2 text-xs text-white/40 border-t border-white/5 flex items-center justify-between">
        <span>
          {mode === "real"
            ? `Soldi veri · saldo ${wallet ? Number(wallet.balance).toLocaleString() : "—"} ${wallet?.currency || ""}`
            : "Modalità demo"}
        </span>
        <span className="text-lime">{game.provider}</span>
      </div>
    </div>
  );
}