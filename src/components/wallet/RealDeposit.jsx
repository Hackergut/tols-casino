import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWallet } from "@/components/WalletProvider";
import { useWeb3Wallet } from "@/hooks/useWeb3Wallet";
import { QRCodeSVG } from "qrcode.react";
import {
  Copy, Check, Loader2, AlertCircle, CheckCircle2,
  Wallet as WalletIcon, Link2, Info, History,
} from "lucide-react";
import CoinSelect from "@/components/wallet/CoinSelect";
import { coinById } from "@/components/wallet/coins";

export default function RealDeposit({ coin = "solana", setCoin, onClose }) {
  const { wallet, reload } = useWallet();
  const w3 = useWeb3Wallet();
  const [settings, setSettings] = useState({});
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const balance = wallet ? wallet.balance : 0;
  const chain = coin;
  const active = coinById(coin);
  const isEvm = chain === "ethereum" || chain === "polygon";

  const loadSettings = useCallback(async () => {
    try {
      const list = await base44.entities.PlatformSetting.filter({ category: "payments" });
      const m = {};
      list.forEach((s) => { m[s.key] = s.value; });
      setSettings(m);
    } catch { setSettings({}); }
  }, []);
  useEffect(() => { loadSettings(); }, [loadSettings]);

  const operator = settings[`operator_address_${chain}`] || "";
  const connectedAddress = isEvm ? w3.evmAddress : w3.solAddress;
  const connected = !!connectedAddress;

  const copy = () => {
    if (operator) {
      navigator.clipboard && navigator.clipboard.writeText(operator);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const connect = async () => {
    setError("");
    try {
      if (isEvm) {
        await w3.connectEVM();
        await w3.switchEVM(chain === "ethereum" ? "0x1" : "0x89");
      } else {
        await w3.connectSolana();
      }
    } catch (e) { setError(w3.error || e.message || "Connection failed"); }
  };

  const verify = async () => {
    setError(""); setResult(null);
    if (!txHash.trim()) { setError("Paste the transaction hash after sending"); return; }
    if (!connected) { setError("Connect your wallet first"); return; }
    setBusy(true);
    try {
      const referralCode = (typeof localStorage !== "undefined" && localStorage.getItem("tols_referral_code")) || "";
      const res = await base44.functions.invoke("verifyDeposit", { chain, tx_hash: txHash.trim(), from_address: connectedAddress, referral_code: referralCode });
      const d = res.data;
      if (d && d.success) { setResult(d); await reload(); setTxHash(""); }
      else setError((d && d.error) || "Verification failed");
    } catch (e) {
      setError((e && e.response && e.response.data && e.response.data.error) || (e && e.message) || "Verification error");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      {/* Connect wallet */}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-[#1a1a1a] border border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-white/45 uppercase tracking-wide">Your wallet</p>
          {connected ? (
            <p className="text-sm font-mono text-white/80 truncate mt-0.5">{connectedAddress}</p>
          ) : (
            <p className="text-sm text-white/40 mt-0.5">Not connected</p>
          )}
        </div>
        {connected ? (
          <button onClick={w3.disconnect} className="px-4 h-10 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white/70 hover:text-white shrink-0">Disconnect</button>
        ) : (
          <button onClick={connect} disabled={w3.connecting} className="px-4 h-10 rounded-xl bg-lime text-black text-sm font-black hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2 shrink-0">
            {w3.connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <WalletIcon className="w-4 h-4" />} Connect
          </button>
        )}
      </div>

      {/* Currency */}
      <div>
        <label className="text-[11px] font-semibold text-white/45">Currency</label>
        <div className="mt-1.5"><CoinSelect value={coin} onChange={setCoin} balance={balance} /></div>
      </div>

      {/* Network */}
      <div>
        <label className="text-[11px] font-semibold text-white/45">Network</label>
        <div className="mt-1.5 h-14 flex items-center gap-3 px-3.5 rounded-xl bg-[#1a1a1a] border border-white/10">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-black" style={{ background: active.color }}>{active.symbol}</span>
          <span className="text-sm font-bold text-white">{active.network}</span>
        </div>
      </div>

      {/* Address + QR */}
      {operator ? (
        <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-4 space-y-3">
          <p className="text-[11px] font-semibold text-white/45 uppercase tracking-wide">{active.name} ({active.network}) deposit address</p>
          <div className="flex flex-col items-center">
            <div className="rounded-xl bg-white p-3">
              <QRCodeSVG value={operator} size={150} bgColor="#ffffff" fgColor="#0a0a0a" level="M" />
            </div>
            <span className="text-[10px] text-white/40 mt-2 uppercase tracking-wider">Scan to deposit</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-[#0e0e0e] border border-white/10 p-3">
            <code className="flex-1 text-xs sm:text-sm font-mono text-white/80 break-all">{operator}</code>
            <button onClick={copy} className="shrink-0 w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-lime hover:border-lime/30 transition">
              {copied ? <Check className="w-4 h-4 text-lime" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-start gap-2 text-xs text-lime/80">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p>Your deposit must be sent on the {active.name} ({active.network}) network to be processed.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>Deposit address for {active.name} not configured yet. An admin must set it under Admin → Payment settings.</p>
        </div>
      )}

      {/* Verify */}
      <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-4 space-y-3">
        <div>
          <label className="text-[11px] font-semibold text-white/45 uppercase tracking-wide">Sent? Paste your transaction hash to credit your balance</label>
          <input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="0x... or transaction signature"
            className="w-full h-12 mt-2 rounded-xl bg-[#0e0e0e] border border-white/10 px-4 text-sm font-mono text-white outline-none focus:border-lime/40 placeholder-white/20" />
        </div>
        <button onClick={verify} disabled={busy || !txHash || !connected}
          className="w-full h-12 rounded-xl bg-lime text-black font-black hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {busy ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying on-chain...</> : <Link2 className="w-5 h-5" />} Verify &amp; credit deposit
        </button>
        {error && <p className="flex items-center gap-1.5 text-xs text-red-300"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}</p>}
        {result && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-lime/10 border border-lime/30 text-sm text-lime">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p>Deposit credited: <b>{result.credited} USDT</b> ({result.nativeAmount} {active.symbol} @ ${result.price}).</p>
              <p className="text-white/50 text-xs mt-0.5">New balance: {result.newBalance} USDT</p>
            </div>
          </div>
        )}
      </div>

      <Link to="/wallet" onClick={onClose} className="flex items-center justify-center gap-1.5 text-sm font-bold text-white/70 hover:text-lime transition">
        <History className="w-4 h-4" /> Deposit history
      </Link>
    </div>
  );
}