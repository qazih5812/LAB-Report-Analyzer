import React, { useState, useEffect } from "react";
import { apiUrl } from "../api";
import {
  History,
  Search,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { translations } from "../locales/translations";

export default function HistoryView({ language = "en", onSelectPatient }) {
  const t = translations[language]?.history || translations.en.history;
  const statusT = translations[language]?.status || translations.en.status;

  const [historyItems, setHistoryItems] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(apiUrl(`/api/history${q}`));
      if (res.ok) {
        const data = await res.json();
        setHistoryItems(data);
      }
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [search]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this report from persistent history?")) return;

    try {
      const res = await fetch(apiUrl(`/api/history/${id}`), { method: "DELETE" });
      if (res.ok) {
        setHistoryItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  const filteredItems = historyItems.filter((item) => {
    if (filterType === "urgent") return item.has_urgent;
    if (filterType === "abnormal") return item.low_count > 0 || item.high_count > 0;
    if (filterType === "normal") return item.low_count === 0 && item.high_count === 0 && !item.has_urgent;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card rounded-2xl p-6 border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>SQLite Database Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary/80 border border-border/80 rounded-xl ps-9 pe-4 py-2 text-sm text-foreground outline-none focus:border-teal-500 transition-colors"
            />
          </div>
          <button
            onClick={loadHistory}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-teal-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: statusT.all },
          { id: "urgent", label: "Urgent Only 🚨" },
          { id: "abnormal", label: "Abnormal" },
          { id: "normal", label: statusT.normal },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors
              ${filterType === f.id
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table / List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-border text-muted-foreground">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-2" />
          <span className="text-sm">Querying SQLite history records...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-border text-center">
          <History className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <h4 className="text-base font-semibold text-foreground">{t.emptyHistory}</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Analyze or upload a laboratory report from the dashboard to automatically store persistent historical snapshots.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-card rounded-2xl border p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between
                ${item.has_urgent
                  ? "border-red-500/40 bg-red-500/[0.02]"
                  : "border-border hover:border-teal-500/40"
                }
              `}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <span>{item.patient_id}</span>
                      <span>•</span>
                      <span>{item.mrn}</span>
                    </div>
                    <h3 className="text-base font-bold text-foreground mt-0.5">
                      {item.patient_name}
                    </h3>
                  </div>

                  {item.has_urgent ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30">
                      <AlertTriangle className="w-3 h-3" />
                      <span>URGENT</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Checked</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>{item.report_date}</span>
                </div>

                {/* Breakdown counts */}
                <div className="grid grid-cols-4 gap-1.5 mb-4 text-center">
                  <div className="bg-emerald-500/10 rounded-xl p-2 border border-emerald-500/20">
                    <span className="block text-xs font-bold text-emerald-700 dark:text-emerald-400">{item.normal_count}</span>
                    <span className="text-[10px] text-muted-foreground">Normal</span>
                  </div>
                  <div className="bg-amber-500/10 rounded-xl p-2 border border-amber-500/20">
                    <span className="block text-xs font-bold text-amber-700 dark:text-amber-400">{item.low_count}</span>
                    <span className="text-[10px] text-muted-foreground">Low</span>
                  </div>
                  <div className="bg-purple-500/10 rounded-xl p-2 border border-purple-500/20">
                    <span className="block text-xs font-bold text-purple-700 dark:text-purple-400">{item.high_count}</span>
                    <span className="text-[10px] text-muted-foreground">High</span>
                  </div>
                  <div className="bg-rose-500/10 rounded-xl p-2 border border-rose-500/20">
                    <span className="block text-xs font-bold text-rose-700 dark:text-rose-400">{item.urgent_count}</span>
                    <span className="text-[10px] text-muted-foreground">Urgent</span>
                  </div>
                </div>

                {item.summary_excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-2 italic mb-4 bg-secondary/50 p-2.5 rounded-xl border border-border/40">
                    "{item.summary_excerpt}"
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
                <button
                  onClick={() => onSelectPatient(item.patient_id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t.viewReport}</span>
                </button>

                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors"
                  title={t.delete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
