import React from "react";
import { FlaskConical, ShieldBan } from "lucide-react";
import { useIntegrationMode } from "@/hooks/useIntegrationMode";

export default function SandboxNotice({ compact = false }) {
  const { mode } = useIntegrationMode();
  const paymentsLive = mode.livePaymentsEnabled;
  const slotsLive = mode.liveSlotsEnabled;
  const allLive = paymentsLive && slotsLive;

  if (allLive) return null;

  const label = !paymentsLive && !slotsLive
    ? "Sandbox mode: demo play and integration stubs only."
    : !paymentsLive
      ? "Payments sandboxed: deposits and withdrawals are disabled."
      : "Slots sandboxed: real provider sessions are disabled.";

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-[11px] font-bold text-blue-100">
        <FlaskConical className="w-3.5 h-3.5 text-blue-300" />
        {label}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4 flex gap-3 text-sm text-blue-50">
      <ShieldBan className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
      <div>
        <p className="font-black text-blue-100">{label}</p>
        <p className="text-blue-100/70 text-xs mt-1">
          No live money movement or real-money provider sessions are enabled by default. Administrators can review and switch integrations from Admin → Integration readiness.
        </p>
      </div>
    </div>
  );
}
