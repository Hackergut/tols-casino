import React, { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/client";

export default function DeleteAccountDialog({ open, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      await base44.functions.invoke("deleteUserAccount", {});
      await base44.auth.logout("/");
    } catch (e) {
      setError(e?.message || "Failed to delete account. Please try again.");
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400"><AlertTriangle className="w-5 h-5" /> Delete Account</DialogTitle>
          <DialogDescription className="text-white/60">
            This will permanently erase your wallet, balance, bets, withdrawals, deposits, tournament entries and chat messages. This action cannot be undone, and you will be signed out immediately.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy} className="text-white/70">Cancel</Button>
          <Button variant="destructive" onClick={confirm} disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Delete forever
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}