import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, ChevronDown, ChevronUp, ExternalLink, Pencil, Save, X, Ban, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Generic entity browser for the admin panel. Lists records from any Base44
// entity with search, pagination, a details drawer, and (opt-in) inline editing
// or creation for simple text/number/boolean fields.

const HIDDEN_FIELDS = new Set(["id", "created_date", "updated_date", "created_by_id"]);
const LONG_THRESHOLD = 46;

function fieldType(key, value) {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string" && /date|time/i.test(key) && !Number.isNaN(Date.parse(value))) return "datetime";
  return "string";
}

function formatCell(key, value) {
  if (value === null || value === undefined || value === "") return <span className="text-white/25">—</span>;
  if (typeof value === "boolean") return value ? <span className="text-lime">yes</span> : <span className="text-white/40">no</span>;
  if (typeof value === "number") return <span className="tabular-nums">{Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>;
  if (typeof value === "object") return <code className="text-[11px] text-white/60 break-all">{JSON.stringify(value).slice(0, 80)}</code>;
  if (/hash|address|tx|signature/i.test(key) && String(value).length > 18) {
    return <span className="font-mono text-[11px] text-white/55">{String(value).slice(0, 10)}…{String(value).slice(-8)}</span>;
  }
  const str = String(value);
  return <span className="break-words">{str.length > LONG_THRESHOLD ? str.slice(0, LONG_THRESHOLD) + "…" : str}</span>;
}

export default function EntityPanel({
  entityName,
  title,
  description,
  columns,
  searchFields,
  orderBy = "-created_date",
  pageSize = 25,
  canCreate = false,
  createFields,
  canEdit = false,
  editFields,
  renderActions,
  detailExclude,
  icon: Icon,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const entity = base44.entities[entityName];

  const load = useCallback(async () => {
    if (!entity) return;
    setLoading(true); setError("");
    try {
      const list = await entity.list(orderBy, 200);
      setItems(list || []);
    } catch (e) {
      setError(e?.message || "Load failed");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [entity, orderBy]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchFields?.length) return items;
    return items.filter((it) =>
      searchFields.some((f) => String(it[f] ?? "").toLowerCase().includes(q))
    );
  }, [items, query, searchFields]);

  const page = filtered.slice(offset, offset + pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const startCreate = () => {
    const init = {};
    (createFields || []).forEach((f) => { init[f.key] = f.default ?? (f.type === "number" ? 0 : f.type === "boolean" ? false : ""); });
    setForm(init); setCreating(true); setError("");
  };

  const submitCreate = async () => {
    setBusy(true); setError("");
    try {
      await entity.create(form);
      setCreating(false); setForm({}); await load();
    } catch (e) { setError(e?.message || "Create failed"); }
    finally { setBusy(false); }
  };

  const startEdit = (row) => {
    const init = {};
    (editFields || []).forEach((f) => { init[f.key] = row[f.key] ?? ""; });
    setForm(init); setEditing(row.id); setError("");
  };

  const submitEdit = async (id) => {
    setBusy(true); setError("");
    try {
      await entity.update(id, form);
      setEditing(null); setForm({}); await load();
    } catch (e) { setError(e?.message || "Save failed"); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    setBusy(true);
    try { await entity.delete(id); await load(); }
    catch (e) { setError(e?.message || "Delete failed"); }
    finally { setBusy(false); }
  };

  const cols = columns?.length
    ? columns
    : items[0]
      ? Object.keys(items[0]).filter((k) => !HIDDEN_FIELDS.has(k)).slice(0, 6).map((k) => ({ key: k, label: k.replace(/_/g, " ") }))
      : [];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-lime/10 grid place-items-center shrink-0">
              <Icon className="w-5 h-5 text-lime" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-black text-white flex items-center gap-2">
              {title || entityName}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">{items.length}</span>
            </h3>
            {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <button onClick={startCreate} className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-lime text-black text-xs font-black hover:brightness-110">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          )}
          <button onClick={load} className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-lime">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {searchFields?.length > 0 && (
        <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[#0a0a0a] border border-white/10 focus-within:border-lime/40">
          <Search className="w-4 h-4 text-white/30" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOffset(0); }}
            placeholder={`Search ${(searchFields || []).join(", ")}…`}
            className="bg-transparent outline-none text-sm text-white w-full placeholder-white/25"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}

      {creating && (
        <div className="rounded-xl border border-lime/30 bg-lime/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-white">New {title || entityName}</p>
            <button onClick={() => setCreating(false)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {(createFields || []).map((f) => (
              <FieldInput key={f.key} field={f} value={form[f.key]} onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={submitCreate} disabled={busy} className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-lime text-black text-sm font-black disabled:opacity-50">
              {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create
            </button>
            <button onClick={() => setCreating(false)} className="px-4 h-10 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[0,1,2,3,4].map((i) => <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />)}</div>
      ) : page.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-white/40">No records</div>
      ) : (
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-white/40 border-b border-white/10">
                {cols.map((c) => <th key={c.key} className="py-2 px-2 font-bold">{c.label || c.key}</th>)}
                <th className="py-2 px-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {page.map((row) => {
                const isOpen = expanded === row.id;
                const isEditing = editing === row.id;
                return (
                  <React.Fragment key={row.id}>
                    <tr className="border-b border-white/5 hover:bg-white/[0.03]">
                      {cols.map((c) => (
                        <td key={c.key} className="py-2.5 px-2 align-middle">
                          {c.render ? c.render(row[c.key], row) : formatCell(c.key, row[c.key])}
                        </td>
                      ))}
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1 justify-end">
                          {renderActions ? renderActions(row, load) : null}
                          <button onClick={() => { setExpanded(isOpen ? null : row.id); setEditing(null); }}
                            className="w-8 h-8 grid place-items-center rounded-lg text-white/40 hover:text-lime hover:bg-white/5" title="Details">
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={cols.length + 1} className="bg-[#0a0a0a]">
                          <div className="p-4 space-y-3">
                            {isEditing ? (
                              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                                  {(editFields || []).map((f) => (
                                    <FieldInput key={f.key} field={f} value={form[f.key]} onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))} />
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => submitEdit(row.id)} disabled={busy} className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-lime text-black text-sm font-black disabled:opacity-50">
                                    <Save className="w-4 h-4" /> Save
                                  </button>
                                  <button onClick={() => setEditing(null)} className="px-4 h-10 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                                  {Object.entries(row).filter(([k]) => !HIDDEN_FIELDS.has(k) && !(detailExclude || []).includes(k)).map(([k, v]) => (
                                    <div key={k} className="flex flex-col gap-0.5 border-b border-white/5 pb-1.5">
                                      <span className="text-[10px] uppercase tracking-wide text-white/35">{k.replace(/_/g, " ")}</span>
                                      <span className="text-xs text-white/80 break-all">
                                        {v === null || v === undefined || v === "" ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                  {canEdit && (
                                    <button onClick={() => startEdit(row)} className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-lime">
                                      <Pencil className="w-3.5 h-3.5" /> Edit
                                    </button>
                                  )}
                                  {entity?.delete && (
                                    <button onClick={() => remove(row.id)} disabled={busy} className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-300 hover:bg-red-500/20">
                                      <Ban className="w-3.5 h-3.5" /> Delete
                                    </button>
                                  )}
                                  {row.created_by_id && (
                                    <a
                                      href={`#user-${row.created_by_id}`}
                                      onClick={(e) => { e.preventDefault(); }}
                                      className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/50"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" /> owner
                                    </a>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>{offset + 1}–{Math.min(offset + pageSize, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-1">
            <button disabled={offset === 0} onClick={() => setOffset((o) => Math.max(0, o - pageSize))} className="px-3 h-8 rounded-lg bg-white/5 border border-white/10 disabled:opacity-40">Prev</button>
            <button disabled={offset + pageSize >= filtered.length} onClick={() => setOffset((o) => o + pageSize)} className="px-3 h-8 rounded-lg bg-white/5 border border-white/10 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange }) {
  const label = field.label || field.key.replace(/_/g, " ");
  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-2 h-10 px-3 rounded-lg bg-[#0a0a0a] border border-white/10 cursor-pointer">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="accent-lime" />
        <span className="text-sm text-white/80">{label}</span>
      </label>
    );
  }
  if (field.options) {
    return (
      <div>
        <label className="text-[11px] font-semibold text-white/45 uppercase">{label}</label>
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full h-10 mt-1 rounded-lg bg-[#0a0a0a] border border-white/10 px-3 text-sm text-white outline-none focus:border-lime/40">
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  const type = field.type === "number" ? "number" : field.type === "datetime" ? "datetime-local" : "text";
  return (
    <div>
      <label className="text-[11px] font-semibold text-white/45 uppercase">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        step={field.type === "number" ? "any" : undefined}
        onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
        className="w-full h-10 mt-1 rounded-lg bg-[#0a0a0a] border border-white/10 px-3 text-sm text-white outline-none focus:border-lime/40"
      />
    </div>
  );
}

export { fieldType };
