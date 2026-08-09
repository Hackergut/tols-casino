import React, { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { FlaskConical, Lock, Save, Check, Loader2, AlertCircle } from "lucide-react";

const FIELDS = [
  {
    key: "payments_mode",
    label: "Payments mode",
    description: "Sandbox keeps deposits and withdrawals as disabled stubs. Live requires legal, compliance, KYC/AML, custody, and production payment review.",
    options: [
      { value: "sandbox", label: "Sandbox" },
      { value: "live", label: "Live" },
    ],
  },
  {
    key: "slots_mode",
    label: "Slot provider mode",
    description: "Sandbox uses demos or a provider-not-configured state. Live launches authenticated real-money sessions through the aggregator backend.",
    options: [
      { value: "sandbox", label: "Sandbox" },
      { value: "live", label: "Live" },
    ],
  },
  {
    key: "support_email",
    label: "Support email",
    description: "Shown in compliance and transaction notices.",
    type: "email",
    placeholder: "support@tols.example",
  },
];

export default function IntegrationSettings() {
  const queryClient = useQueryClient();
  const [values, setValues] = useState(/** @type {Record<string, string>} */({}));
  const [ids, setIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.PlatformSetting.filter({ category: "integrations" });
      const v = {};
      const idm = {};
      (list || []).forEach((s) => { v[s.key] = s.value || ""; idm[s.key] = s.id; });
      setValues({ payments_mode: "sandbox", slots_mode: "sandbox", ...v });
      setIds(idm);
    } catch (e) {
      setError(e.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      for (const f of FIELDS) {
        const val = String(values[f.key] || "").trim();
        if (ids[f.key]) await base44.entities.PlatformSetting.update(ids[f.key], { value: val });
        else {
          const r = await base44.entities.PlatformSetting.create({ key: f.key, value: val, category: "integrations" });
          setIds((p) => ({ ...p, [f.key]: r.id }));
        }
      }
      setSaved(true);
      await queryClient.invalidateQueries({ queryKey: ["integration-mode"] });
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const livePayments = values.payments_mode === "live";
  const liveSlots = values.slots_mode === "live";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-5 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-lime/10 flex items-center justify-center shrink-0">
          <FlaskConical className="w-5 h-5 text-lime" />
        </div>
        <div>
          <h3 className="font-bold text-white">Integration readiness</h3>
          <p className="text-xs text-white/40 mt-0.5">
            Control whether production money movement and game provider sessions are enabled.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {FIELDS.filter((f) => f.options).map((f) => {
            const active = values[f.key] || "sandbox";
            return (
              <div key={f.key} className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
                <p className="text-sm font-bold text-white">{f.label}</p>
                <p className="text-xs text-white/40 mt-1 min-h-8">{f.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {f.options.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setValues((p) => ({ ...p, [f.key]: o.value }))}
                      className={`h-10 rounded-lg text-sm font-black transition ${active === o.value ? "bg-lime text-black" : "bg-white/5 border border-white/10 text-white/60 hover:text-white"}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4 lg:col-span-2">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Support email</label>
            <input
              type="email"
              value={values.support_email || ""}
              onChange={(e) => setValues((p) => ({ ...p, support_email: e.target.value }))}
              placeholder="support@tols.example"
              className="w-full h-11 mt-2 rounded-xl bg-[#1a1a1a] border border-white/10 px-3 text-sm text-white outline-none focus:border-lime/40 placeholder-white/20"
            />
          </div>
        </div>
      )}

      {(livePayments || liveSlots) && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3 text-sm text-amber-100">
          <Lock className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            Live mode is an integration switch only. Before enabling it in production, complete licensing, responsible-gaming controls,
            KYC/AML, fraud controls, payment-provider approval, custody/security review, callback signature verification, and terms disclosures.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button onClick={save} disabled={saving || loading} className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-xl bg-lime text-black text-sm font-black hover:opacity-90 transition disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved" : "Save integration mode"}
        </button>
        <p className="text-xs text-white/30">Recommended default: <span className="text-white/60 font-bold">Sandbox</span></p>
      </div>
      {error && <p className="flex items-center gap-1.5 text-xs text-red-300"><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
    </div>
  );
}
