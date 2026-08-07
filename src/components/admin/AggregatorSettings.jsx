import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Server, Save, Loader2, Check, AlertCircle, Eye, EyeOff } from "lucide-react";

const FIELDS = [
  { key: "aggregator_api_base", label: "API Base URL", placeholder: "https://aggregator.example.com", type: "text", required: true },
  { key: "aggregator_api_key", label: "API Key", placeholder: "Bearer token", type: "password", required: true },
  { key: "aggregator_operator_id", label: "Operator / Merchant ID", placeholder: "optional", type: "text", required: false },
  { key: "aggregator_api_secret", label: "API Secret (used to sign real-money callbacks)", placeholder: "optional but required for real play", type: "password", required: false },
  { key: "aggregator_callback_url", label: "Callback URL (real-money outcomes)", placeholder: "https://<your-app>/api/functions/slotTransactionCallback", type: "text", required: false },
];

export default function AggregatorSettings() {
  const [values, setValues] = useState({});
  const [ids, setIds] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.PlatformSetting.filter({ category: "aggregator" });
      const v = {};
      const idm = {};
      (list || []).forEach((s) => { v[s.key] = s.value || ""; idm[s.key] = s.id; });
      setValues(v);
      setIds(idm);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      for (const f of FIELDS) {
        const val = (values[f.key] || "").trim();
        if (ids[f.key]) {
          await base44.entities.PlatformSetting.update(ids[f.key], { value: val });
        } else if (val) {
          const r = await base44.entities.PlatformSetting.create({ key: f.key, value: val, category: "aggregator" });
          setIds((p) => ({ ...p, [f.key]: r.id }));
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const configured = Boolean((values.aggregator_api_base || "").trim() && (values.aggregator_api_key || "").trim());

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2"><Server className="w-4 h-4 text-lime" /> Slot aggregator</h3>
          <p className="text-xs text-white/40 mt-0.5">Credentials used by the backend to launch real-money and demo slot sessions.</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${configured ? "text-lime border-lime/30 bg-lime/10" : "text-amber-300 border-amber-500/30 bg-amber-500/10"}`}>
          {configured ? "Configured" : "Not configured"}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
              {f.label}{f.required ? <span className="text-lime"> *</span> : null}
            </label>
            <div className="flex items-center mt-1.5 h-11 rounded-xl bg-[#1a1a1a] border border-white/10 px-3 focus-within:border-lime/40 transition">
              <input
                value={values[f.key] || ""}
                onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                type={f.type === "password" && !show ? "password" : "text"}
                placeholder={f.placeholder}
                className="bg-transparent outline-none text-sm font-mono text-white w-full placeholder-white/20"
              />
              {f.type === "password" && (
                <button type="button" onClick={() => setShow((s) => !s)} className="text-white/30 hover:text-white/60 ml-2 shrink-0">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-lime text-black text-sm font-black hover:opacity-90 disabled:opacity-50 transition">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />} Save credentials
        </button>
        <p className="text-xs text-white/30">Required: API Base URL + API Key. The launch backend reads these server-side.</p>
      </div>

      {error && <p className="flex items-center gap-1.5 text-xs text-red-300"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}</p>}
    </div>
  );
}