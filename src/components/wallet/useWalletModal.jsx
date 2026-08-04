import React, { createContext, useContext, useState, useCallback } from "react";
import WalletModal from "@/components/wallet/WalletModal";

const WalletModalContext = createContext(null);

export function WalletModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("deposit");
  const [coin, setCoin] = useState("solana");

  const openWallet = useCallback((opts = {}) => {
    setTab(opts.tab || "deposit");
    setCoin(opts.coin || "solana");
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <WalletModalContext.Provider value={{ openWallet, close }}>
      {children}
      <WalletModal open={open} onClose={close} initialTab={tab} initialCoin={coin} />
    </WalletModalContext.Provider>
  );
}

export const useWalletModal = () => {
  const ctx = useContext(WalletModalContext);
  if (!ctx) throw new Error("useWalletModal must be used within WalletModalProvider");
  return ctx;
};