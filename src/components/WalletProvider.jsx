import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadWallet = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      if (!user) return;
      const list = await base44.entities.UserWallet.filter({ created_by_id: user.id });
      if (list && list.length) {
        setWallet(list[0]);
      } else {
        const created = await base44.entities.UserWallet.create({ balance: 1000, currency: "USDT", vip_level: 1, xp: 0, total_wagered: 0 });
        setWallet(created);
      }
    } catch (e) {
      // user not authenticated — run in guest/local mode
      const local = JSON.parse(localStorage.getItem("tols_wallet") || "null");
      if (!local) {
        const w = { id: "guest", balance: 1000, currency: "USDT", vip_level: 1, xp: 0, total_wagered: 0 };
        localStorage.setItem("tols_wallet", JSON.stringify(w));
        setWallet(w);
      } else {
        setWallet(local);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const updateBalance = useCallback(async (delta, wagered = 0) => {
    setWallet((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        balance: Math.max(0, +(prev.balance + delta).toFixed(2)),
        xp: Math.round(prev.xp + Math.abs(wagered)),
        total_wagered: +(prev.total_wagered + Math.abs(wagered)).toFixed(2),
      };
      if (prev.id === "guest") {
        localStorage.setItem("tols_wallet", JSON.stringify(next));
      }
      return next;
    });
    if (wallet && wallet.id !== "guest") {
      try {
        await base44.entities.UserWallet.update(wallet.id, {
          balance: +(wallet.balance + delta).toFixed(2),
          xp: Math.round(wallet.xp + Math.abs(wagered)),
          total_wagered: +(wallet.total_wagered + Math.abs(wagered)).toFixed(2),
        });
      } catch (e) { /* ignore */ }
    }
  }, [wallet]);

  const recordBet = useCallback(async (bet) => {
    try {
      if (wallet && wallet.id !== "guest") {
        await base44.entities.Bet.create(bet);
      }
    } catch (e) { /* ignore */ }
  }, [wallet]);

  const requestWithdrawal = useCallback(async ({ amount, wallet_address, chain }) => {
    if (!wallet) throw new Error("Wallet non disponibile");
    const amt = +Number(amount).toFixed(2);
    if (!amt || amt <= 0) throw new Error("Importo non valido");
    if (!wallet_address || wallet_address.length < 8) throw new Error("Indirizzo wallet non valido");
    if (amt > wallet.balance) throw new Error(`Saldo insufficiente. Disponibile: ${wallet.balance} ${wallet.currency}`);

    const balanceBefore = +wallet.balance.toFixed(2);
    const balanceAfter = +(balanceBefore - amt).toFixed(2);

    // create withdrawal record (auth users) or local stub (guest)
    let record;
    if (wallet.id !== "guest") {
      record = await base44.entities.Withdrawal.create({
        amount: amt,
        currency: wallet.currency,
        wallet_address,
        chain,
        status: "pending",
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      });
    } else {
      record = { id: "local_" + Date.now(), amount: amt, currency: wallet.currency, wallet_address, chain, status: "pending", balance_before: balanceBefore, balance_after: balanceAfter, created_date: new Date().toISOString() };
      const hist = JSON.parse(localStorage.getItem("tols_withdrawals") || "[]");
      hist.unshift(record);
      localStorage.setItem("tols_withdrawals", JSON.stringify(hist));
    }

    // deduct balance immediately (held until processed)
    await updateBalance(-amt, 0);

    return record;
  }, [wallet, updateBalance]);

  const value = { wallet, loading, updateBalance, recordBet, requestWithdrawal, reload: loadWallet };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}