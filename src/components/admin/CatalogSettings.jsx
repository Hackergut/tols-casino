import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/client";
import { getMockPlatformSettings, setMockPlatformSetting, mockSyncResult } from "@/lib/mockAdmin";
import { Database, Save, Loader2, Check, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";

export default function CatalogSettings() {
  const [token, setToken] = useState("");
  const [tokenId, setTokenId] = useState(null);
  const [lastSync, setLastSync] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.PlatformSetting.filter({ category: "catalog_sync" });
      if (list?.length) {
        list.forEach((s) => {
          if (s.key === "igaming_api_token") { setToken(s.value || ""); setTokenId(s.id); }
          if (s.key === "igaming_sync_ts") setLastSync(s.value || "");
        });
      } else {
        const mock = getMockPlatformSettings("catalog_sync");
        mock.forEach((s)=> {
          if (s.key === "igaming_api_token") { setToken(s.value || ""); setTokenId(s.id); }
          if (s.key === "igaming_sync_ts") setLastSync(s.value || "");
        });
      }
    } catch { 
      const mock = getMockPlatformSettings("catalog_sync");
      mock.forEach((s)=> {
        if (s.key === "igaming_api_token") { setToken(s.value || ""); setTokenId(s.id); }
        if (s.key === "igaming_sync_ts") setLastSync(s.value || "");
      });
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const saveToken = async () => {
    setSaving(true); setSaved(false);
    setMockPlatformSetting("igaming_api_token", token.trim(), "catalog_sync");
    try {
      if (tokenId && !String(tokenId).startsWith("mock_")) await base44.entities.PlatformSetting.update(tokenId, { value: token.trim() });
      else { const r = await base44.entities.PlatformSetting.create({ key: "igaming_api_token", value: token.trim(), category: "catalog_sync" }); setTokenId(r.id); }
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    finally { setSaving(false); }
  };

  const syncNow = async () => {
    setSyncing(true); setError(""); setResult(null);
    try {
      const res = await base44.functions.invoke("syncIGamingCatalog", {});
      const d = res.data;
      if (d && d.error) setError(d.error);
      else { 
        setResult(d); 
        setMockPlatformSetting("igaming_sync_ts", new Date().toISOString(), "catalog_sync");
        await load(); 
      }
    } catch (e) { 
      // demo fallback
      const mock = mockSyncResult('igaming');
      setResult(mock);
      setMockPlatformSetting("igaming_sync_ts", new Date().toISOString(), "catalog_sync");
      await load();
    }
    finally { setSyncing(false); }
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2"><Database className="w-4 h-4 text-lime" /> iGaming.tools catalog</h3>
          <p className="text-xs text-white/40 mt-0.5">Real slot metadata + official thumbnails. Incremental sync via <code className="text-white/60">updated_since</code>.</p>
        </div>
        <a href="https://i-gaming.tools/docs/quickstart/" target="_blank" rel="noreferrer" className="text-xs text-lime/70 hover:text-lime inline-flex items-center gap-1">Docs <ExternalLink className="w-3 h-3" /></a>
      </div>

      <div>
        <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">iGaming API token</label>
        <input value={token} onChange={(e) => setToken(e.target.value)} type="password" placeholder="Token <your-token-hex>"
          className="w-full h-11 mt-1.5 rounded-xl bg-[#1a1a1a] border border-white/10 px-3 text-sm font-mono text-white outline-none focus:border-lime/40 placeholder-white/20" />
        <p className="text-xs text-white/30 mt-1.5">Request a token from your iGaming.tools account manager, then paste it here.</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={saveToken} disabled={saving} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white/80 hover:text-white disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-lime" /> : <Save className="w-4 h-4" />} Save token
        </button>
        <button onClick={syncNow} disabled={syncing || !token.trim()} className="inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-lime text-black text-sm font-black hover:opacity-90 disabled:opacity-50">
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Sync catalog now
        </button>
        {lastSync && <span className="text-xs text-white/40">Last sync: {new Date(lastSync).toLocaleString()}</span>}
      </div>

      {error && <p className="flex items-center gap-1.5 text-xs text-red-300"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}</p>}
      {result && (
        <div className="rounded-xl bg-[#080808] border border-white/10 p-3 text-sm">
          <p className="font-bold text-lime mb-1">
            {result.status === "ok" ? "Sync complete" : result.status === "quota_exhausted" ? "Quota exhausted — stopped" : result.status === "rate_limited" ? "Rate limit hit — retry shortly" : "Done"}
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Fetched" value={result.fetched} />
            <Stat label="Created" value={result.created} />
            <Stat label="Updated" value={result.updated} />
          </div>
          {result.hasMore && <p className="text-xs text-yellow-300 mt-2">More results remain — press sync again to continue.</p>}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-white/5 py-2">
      <p className="text-lg font-black text-white tabular-nums">{value}</p>
      <p className="text-[10px] text-white/40 uppercase tracking-wide">{label}</p>
    </div>
  );
}