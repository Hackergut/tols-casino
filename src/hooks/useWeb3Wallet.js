import { useState, useCallback, useEffect } from "react";

// WalletConnect (Reown) Project ID is wired in a follow-up step once configured.
// This hook connects via injected providers (MetaMask/Rabby/Coinbase for EVM,
// Phantom for Solana) which cover the majority of desktop wallets.

export function useWeb3Wallet() {
  const [evmAddress, setEvmAddress] = useState(null);
  const [evmChain, setEvmChain] = useState(null);
  const [solAddress, setSolAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const getEvm = () => (typeof window !== "undefined" ? window.ethereum : undefined);
  const getSol = () => {
    if (typeof window === "undefined") return undefined;
    return window.solana || (window.phantom && window.phantom.solana) || undefined;
  };

  const connectEVM = useCallback(async () => {
    const evm = getEvm();
    if (!evm) throw new Error("No EVM wallet found. Install MetaMask or another browser wallet.");
    setConnecting(true); setError("");
    try {
      const accts = await evm.request({ method: "eth_requestAccounts" });
      setEvmAddress(accts && accts[0] ? accts[0] : null);
      setEvmChain(await evm.request({ method: "eth_chainId" }));
    } catch (e) {
      setError(e.message || "Connection rejected"); throw e;
    } finally { setConnecting(false); }
  }, []);

  const switchEVM = useCallback(async (chainIdHex) => {
    const evm = getEvm();
    if (!evm) return;
    try {
      await evm.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chainIdHex }] });
    } catch (e) {
      if (e && e.code === 4902) {
        await evm.request({ method: "wallet_addEthereumChain", params: [{ chainId: chainIdHex }] });
      } else throw e;
    }
    setEvmChain(chainIdHex);
  }, []);

  const connectSolana = useCallback(async () => {
    const sol = getSol();
    if (!sol) throw new Error("No Solana wallet found. Install Phantom.");
    setConnecting(true); setError("");
    try {
      const res = await sol.connect();
      setSolAddress(res && res.publicKey ? res.publicKey.toString() : null);
    } catch (e) {
      setError(e.message || "Connection rejected"); throw e;
    } finally { setConnecting(false); }
  }, []);

  const disconnect = useCallback(() => {
    setEvmAddress(null); setSolAddress(null);
    try { const sol = getSol(); sol && sol.disconnect && sol.disconnect(); } catch {}
  }, []);

  useEffect(() => {
    const evm = getEvm();
    if (!evm || !evm.on) return;
    const onChange = () => {
      evm.request({ method: "eth_accounts" }).then((a) => setEvmAddress(a && a[0] ? a[0] : null)).catch(() => {});
      evm.request({ method: "eth_chainId" }).then(setEvmChain).catch(() => {});
    };
    evm.on("accountsChanged", onChange);
    evm.on("chainChanged", onChange);
    return () => {
      try { evm.removeListener && evm.removeListener("accountsChanged", onChange); evm.removeListener && evm.removeListener("chainChanged", onChange); } catch {}
    };
  }, []);

  return { evmAddress, evmChain, solAddress, connecting, error, connectEVM, switchEVM, connectSolana, disconnect };
}