import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import WalletDrawer from "@/components/wallet/WalletDrawer";

export default function WalletModal({ open, onClose, initialTab = "deposit", initialCoin = "solana" }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-[#0d0d0d] border-l border-white/10 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-white/5 shrink-0">
              <h3 className="font-black text-white text-lg">
                <span className="text-lime">Wallet</span>
              </h3>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <WalletDrawer initialTab={initialTab} initialCoin={initialCoin} />
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}