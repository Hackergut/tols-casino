import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useWallet } from "@/components/WalletProvider";
import { useWeb3Wallet } from "@/hooks/useWeb3Wallet";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Loader2, AlertCircle, CheckCircle2, Wallet as WalletIcon, Link2, ShieldCheck } from "lucide-react";

const CHAINS = [
  { id: "solana", label: "Solana", color: "#9945FF", symbol: "SOL" },
  { id: "ethereum", label: "Ethereum", color: "#627EEA", symbol: "ETH" },
  { id: "polygon", label: "Polygon", color: "#8247E5", symbol: "POL" },
];

export default function RealDeposit({ chain = "solana" }) {
  const { reload } = useWallet();
  const w3 = useWeb3Wallet();
  const [settings, setSettings] = useState({});
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      const list = await base44.entities.PlatformSetting.filter({ category: "payments" });
      const m = {};
      list.forEach((s) => { m[s.key] = s.value; });
      setSettings(m);
    } catch { setSettings({}); }
  }, []);
  useEffect(() => { loadSettings(); }, [loadSettings]);

  const active = CHAINS.find((c) => c.id === chain);
  const isEvm = chain === "ethereum" || chain === "polygon";
  const operator = settings[`operator_address_${chain}`] || "";
  const connectedAddress = isEvm ? w3.evmAddress : w3.solAddress;
  const connected = !!connectedAddress;

  const copy = () => {
    if (operator) { navigator.clipboard && navigator.clipboard.writeText(operator); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  };

  const connect = async () => {
    setError("");
    try {
      if (isEvm) { await w3.connectEVM(); await w3.switchEVM(chain === "ethereum" ? "0x1" : "0x89"); }
      else { await w3.connectSolana(); }
    } catch (e) { setError(w3.error || e.message || "Connection failed"); }
  };

  const verify = async () => {
    setError(""); setResult(null);
    if (!txHash.trim()) { setError("Paste the transaction hash after sending"); return; }
    if (!connected) { setError("Connect your wallet first"); return; }
    setBusy(true);
    try {
      const res = await base44.functions.invoke("verifyDeposit", { chain, tx_hash: txHash.trim(), from_address: connectedAddress });
      const d = res.data;
      if (d && d.success) { setResult(d); await reload(); setTxHash(""); }
      else setError((d && d.error) || "Verification failed");
    } catch (e) {
      setError((e && e.response && e.response.data && e.response.data.error) || (e && e.message) || "Verification error");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-4 rounded-xl bg-lime/5 border border-lime/20 text-sm text-lime/80">
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
        <p>Send <b>{active.symbol}</b> from your connected wallet to the platform deposit address below. Funds are credited to your balance in <b>USDT</b> at live market rate after 1 confirmation.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">Your wallet</p>
            {connected ? (
              <p className="text-sm font-mono text-white/80 truncate mt-1">{connectedAddress}</p>
            ) : (
              <p className="text-sm text-white/40 mt-1">Not connected</p>
            )}
          </div>
          {connected ? (
            <button onClick={w3.disconnect} className="px-4 h-10 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white/70 hover:text-white shrink-0">Disconnect</button>
          ) : (
            <button onClick={connect} disabled={w3.connecting} className="px-4 h-10 rounded-xl bg-lime text-black text-sm font-black hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2 shrink-0">
              {w3.connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <WalletIcon className="w-4 h-4" />} Connect {active.label} wallet
            </button>
          )}
        </div>
      </div>

      {operator ? (
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex flex-col items-center justify-center bg-[#0d0d0d] rounded-xl border border-white/10 p-4">
              <QRCodeSVG value={operator} size={140} bgColor="#0d0d0d" fgColor="#ccff00" level="M" />
              <span className="text-[10px] text-white/40 mt-2 uppercase tracking-wider">Scan to deposit</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">Platform {active.label} deposit address</p>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#0d0d0d] border border-white/10 p-3">
                <code className="flex-1 text-xs sm:text-sm font-mono text-white/80 break-all">{operator}</code>
                <button onClick={copy} className="shrink-0 w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-lime hover:border-lime/30 transition">
                  {copied ? <Check className="w-4 h-4 text-lime" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-white/30 mt-2">Send only <b className="text-white/60">{active.symbol}</b> on the {active.label} network. Other tokens or wrong networks will be lost.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-5 text-sm text-yellow-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>Deposit address for {active.label} not configured yet. An admin must set it under Admin → Payment settings.</p>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-[#111] p-5 space-y-3">
        <div>
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Sent? Paste your transaction hash to credit your balance</label>
          <input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="0x... or transaction signature"
            className="w-full h-12 mt-2 rounded-xl bg-[#1a1a1a] border border-white/10 px-4 text-sm font-mono text-white outline-none focus:border-lime/40 placeholder-white/20" />
        </div>
        <button onClick={verify} disabled={busy || !txHash || !connected}
          className="w-full h-12 rounded-xl bg-lime text-black font-black hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {busy ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying on-chain...</> : <Link2 className="w-5 h-5" />} Verify & credit deposit
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
    </div>
  );
}