import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-lime transition mb-6"><ArrowLeft className="w-4 h-4" /> Lobby</Link>
        <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-lime" /><span className="text-xs font-black tracking-widest uppercase text-lime">Legal</span></div>
          <h1 className="text-2xl font-black text-white">Terms of Service</h1>
          <p className="text-xs text-white/30 mt-1">Last updated: August 9, 2026 · TOLS Crypto Casino</p>
          <div className="mt-6 space-y-4 text-sm text-white/70 leading-relaxed">
            <p><b className="text-white">1. Eligibility.</b> You must be 18+ and legally permitted to gamble in your jurisdiction. It is your responsibility to ensure compliance.</p>
            <p><b className="text-white">2. Accounts.</b> One account per person. We may require KYC (ID, proof of address) before withdrawals. Providing false information may result in forfeiture.</p>
            <p><b className="text-white">3. Deposits & Withdrawals.</b> Deposits are credited in USDT after on-chain confirmation (1-12 blocks depending on chain). Withdrawals are processed within 24h, subject to AML checks. Minimum withdrawal $20 USDT equivalent.</p>
            <p><b className="text-white">4. Provably Fair.</b> All Originals use serverSeed + clientSeed + nonce SHA256. Server hash is revealed before play; verify at <code className="text-lime">/provably-fair</code>.</p>
            <p><b className="text-white">5. House Edge.</b> Originals 1% edge (99% RTP). Slots RTP varies by provider and is displayed in game info.</p>
            <p><b className="text-white">6. Responsible Gaming.</b> Set limits at <Link to="/responsible-gaming" className="text-lime underline">/responsible-gaming</Link>. Self-exclusion is irreversible for the chosen period.</p>
            <p><b className="text-white">7. Prohibited Use.</b> No bots, no bonus abuse, no multi-accounting to exploit affiliates. Violations → confiscation + ban.</p>
            <p><b className="text-white">8. License.</b> Operated under Curaçao Gaming Control Board license (to be displayed after issuance). See <Link to="/license" className="text-lime underline">/license</Link>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
