import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import WalletDrawer from "@/components/wallet/WalletDrawer";

export default function WalletModal({ open, onClose, initialTab = "deposit", initialCoin = "solana" }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md max-h-[92vh] rounded-2xl bg-[#121212] border border-white/10 overflow-hidden flex flex-col shadow-2xl"
          >
            <WalletDrawer initialTab={initialTab} initialCoin={initialCoin} onClose={onClose} />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}