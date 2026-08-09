"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDownToLine, ArrowUpFromLine, Copy, Check, Loader2, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUIStore, useSessionStore } from "@/lib/store";
import { formatCurrency, shortAddress } from "@/lib/types";
import { toast } from "sonner";

// Chains offered for deposit. Addresses/QRs come from the server (set by an
// admin from Trust Wallet) — none are hardcoded here.
const CHAINS = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", color: "#f7931a" },
  { id: "eth", name: "Ethereum", symbol: "ETH", color: "#627eea" },
  { id: "usdt_erc20", name: "USDT", symbol: "USDT", color: "#26a17b" },
  { id: "solana", name: "Solana", symbol: "SOL", color: "#9945ff" },
  { id: "polygon", name: "Polygon", symbol: "MATIC", color: "#8247e5" },
];

interface AddressData {
  chain: string;
  name: string;
  symbol: string;
  color: string;
  address: string;
  memo: string | null;
  minConfirmations: number;
  uri: string;
  qr: string | null;
  userRef: string;
}

export function DepositModal() {
  const { depositOpen, setDepositOpen, setAuthOpen } = useUIStore();
  const { balance, user } = useSessionStore();
  const qc = useQueryClient();

  const [chain, setChain] = useState("btc");
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawChain, setWithdrawChain] = useState("btc");

  const signedIn = Boolean(user);

  const { data: addr, isLoading: addrLoading, error: addrError } = useQuery<AddressData>({
    queryKey: ["deposit-address", chain],
    queryFn: async () => {
      const r = await fetch(`/api/deposits/address?chain=${chain}`);
      const j = await r.json();
      if (!j.success) throw new Error(j.error);
      return j.data;
    },
    enabled: depositOpen && signedIn,
    retry: false,
  });

  const registerDeposit = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chain, amount: Number(amount), currency: "USDT", txHash }),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.error);
      return j.data;
    },
    onSuccess: (data) => {
      toast.success(data.message ?? "Deposit registered");
      setAmount("");
      setTxHash("");
      qc.invalidateQueries({ queryKey: ["deposits"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const withdraw = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(withdrawAmount), walletAddress: withdrawAddress, chain: withdrawChain }),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.error);
      return j.data;
    },
    onSuccess: (data) => {
      toast.success(`Withdrawal of ${formatCurrency(data.amount)} requested — pending approval`);
      qc.invalidateQueries({ queryKey: ["session"] });
      setWithdrawAmount("");
      setWithdrawAddress("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (depositOpen && !signedIn) {
    return (
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="max-w-sm border-border/60" style={{ background: "var(--color-surface)" }}>
          <DialogHeader>
            <DialogTitle>Sign in to deposit</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create an account or sign in to get your deposit address.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              setDepositOpen(false);
              setAuthOpen(true);
            }}
            className="btn-press w-full font-semibold"
            style={{ background: "var(--color-lime)", color: "var(--color-bg)" }}
          >
            Sign in / Register
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
      <DialogContent className="max-w-md border-border/60" style={{ background: "var(--color-surface)" }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Wallet</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Balance:{" "}
            <span className="font-mono font-bold" style={{ color: "var(--color-lime)" }}>
              {formatCurrency(balance)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2" style={{ background: "var(--color-bg)" }}>
            <TabsTrigger value="deposit" className="gap-1.5 data-[state=active]:text-lime">
              <ArrowDownToLine className="h-3.5 w-3.5" /> Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="gap-1.5">
              <ArrowUpFromLine className="h-3.5 w-3.5" /> Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4 pt-3">
            <div className="grid grid-cols-5 gap-1.5">
              {CHAINS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChain(c.id)}
                  className={`flex flex-col items-center gap-1 rounded-md border py-2 text-[10px] font-semibold transition-colors ${
                    chain === c.id ? "border-lime/50" : "border-border/50 hover:border-border"
                  }`}
                  style={chain === c.id ? { background: "color-mix(in oklab, var(--color-lime) 8%, transparent)" } : undefined}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  {c.symbol}
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-border/50 p-4" style={{ background: "var(--color-bg)" }}>
              {addrLoading ? (
                <div className="flex h-56 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : addrError || !addr?.address ? (
                <div className="flex h-56 flex-col items-center justify-center gap-2 text-center">
                  <p className="text-sm text-muted-foreground">Deposits for this coin aren&apos;t available yet.</p>
                  <p className="text-xs text-muted-foreground/70">An admin needs to set the receive address.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  {addr.qr && (
                    <div className="rounded-lg bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={addr.qr} alt={`${addr.name} deposit QR`} className="h-40 w-40" />
                    </div>
                  )}
                  <div className="w-full space-y-1">
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{addr.name} address</Label>
                    <button
                      onClick={() => copy(addr.address)}
                      className="flex w-full items-center justify-between gap-2 rounded-md border border-border/50 px-3 py-2 text-left transition-colors hover:border-lime/40"
                    >
                      <span className="truncate font-mono text-xs">{shortAddress(addr.address)}</span>
                      {copied ? <Check className="h-3.5 w-3.5 text-lime" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>
                    {addr.memo && (
                      <p className="text-[11px] text-pending">
                        Include memo/tag: <span className="font-mono">{addr.memo}</span>
                      </p>
                    )}
                    <p className="pt-1 text-[11px] text-muted-foreground">
                      Send only {addr.symbol} to this address. Credited after {addr.minConfirmations} confirmation
                      {addr.minConfirmations === 1 ? "" : "s"}.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {addr?.address && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Amount (USDT)</Label>
                    <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100" inputMode="decimal" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Tx hash (optional)</Label>
                    <Input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="0x…" />
                  </div>
                </div>
                <Button
                  onClick={() => registerDeposit.mutate()}
                  disabled={registerDeposit.isPending || !amount}
                  className="btn-press w-full font-semibold"
                  style={{ background: "var(--color-lime)", color: "var(--color-bg)" }}
                >
                  {registerDeposit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "I've sent the deposit"}
                </Button>
                <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" /> Funds are credited only after on-chain confirmation.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-3 pt-3">
            <div className="grid grid-cols-5 gap-1.5">
              {CHAINS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setWithdrawChain(c.id)}
                  className={`flex flex-col items-center gap-1 rounded-md border py-2 text-[10px] font-semibold transition-colors ${
                    withdrawChain === c.id ? "border-lime/50" : "border-border/50 hover:border-border"
                  }`}
                  style={withdrawChain === c.id ? { background: "color-mix(in oklab, var(--color-lime) 8%, transparent)" } : undefined}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  {c.symbol}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Amount (min 20 USDT)</Label>
              <Input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="50" inputMode="decimal" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Destination address</Label>
              <Input value={withdrawAddress} onChange={(e) => setWithdrawAddress(e.target.value)} placeholder="Your wallet address" />
            </div>
            <Button
              onClick={() => withdraw.mutate()}
              disabled={withdraw.isPending || !withdrawAmount || !withdrawAddress}
              className="btn-press w-full font-semibold"
              variant="secondary"
            >
              {withdraw.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request withdrawal"}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Withdrawals are reviewed and paid manually, usually within a few hours.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
