import React from "react";

export default function CommissionPlan({ affiliate, onPlanChange }) {
  if (!affiliate) return null;

  const plans = [
    { id: "revshare", label: "Revenue Share", desc: "A percentage of the house net profit", detail: `${affiliate.commission_rate}% of net loss` },
    { id: "cpa", label: "CPA", desc: "Fixed amount per depositing player", detail: `$${affiliate.cpa_amount} per deposit` },
    { id: "hybrid", label: "Hybrid", desc: "CPA + Revenue Share combined", detail: `$${affiliate.cpa_amount} + ${affiliate.commission_rate}% RS` },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
      <h3 className="font-bold text-white mb-1">Commission plan</h3>
      <p className="text-xs text-white/40 mb-4">Select your earning model</p>
      <div className="grid sm:grid-cols-3 gap-3">
        {plans.map((p) => {
          const active = affiliate.commission_plan === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onPlanChange(p.id)}
              className={`text-left rounded-xl border p-4 transition ${
                active ? "border-lime bg-lime/5" : "border-white/10 bg-[#0d0d0d] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`font-bold text-sm ${active ? "text-lime" : "text-white"}`}>{p.label}</p>
                {active && <span className="w-2 h-2 rounded-full bg-lime" />}
              </div>
              <p className="text-xs text-white/40 mt-1">{p.desc}</p>
              <p className="text-xs font-bold text-lime mt-2">{p.detail}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}