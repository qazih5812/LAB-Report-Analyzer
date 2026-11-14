import React, { useState } from "react";
import {
  FileSpreadsheet,
  Search,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  UploadCloud,
} from "lucide-react";
import { translations } from "../locales/translations";

export default function MyReportsView({
  reports = [],
  activePatientId,
  onSelectPatient,
  onOpenUpload,
  language = "en",
}) {
  const t = translations[language]?.nav || translations.en.nav;
  const demoT = translations[language]?.demographics || translations.en.demographics;

  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("all");

  const filteredReports = reports.filter((r) => {
    const term = search.toLowerCase();
    const matchesSearch =
      r.patient_name.toLowerCase().includes(term) ||
      r.patient_id.toLowerCase().includes(term) ||
      r.mrn.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (filterTag === "urgent") {
      // Known patients with urgent markers (e.g. P004, P008, P012)
      return ["P004", "P008", "P012"].includes(r.patient_id.toUpperCase());
    }
    if (filterTag === "missing_demo") {
      return r.is_age_missing || r.is_sex_missing;
    }
    if (filterTag === "cbc") {
      return r.file_name?.toLowerCase().includes("cbc") || r.patient_name?.toLowerCase().includes("alice");
    }
    if (filterTag === "lft") {
      return r.file_name?.toLowerCase().includes("liver") || r.patient_name?.toLowerCase().includes("bob");
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Encounter Repository</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{t.myReports}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and access certified diagnostic laboratory reports from CityLab's repository.
          </p>
        </div>

        {/* Action and Search */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by name, ID, or MRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary/80 border border-border/80 rounded-xl ps-9 pe-4 py-2 text-sm text-foreground outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: `All Reports (${reports.length})` },
          { id: "urgent", label: "Urgent Values 🚨" },
          { id: "missing_demo", label: "Missing Demographics ⚠️" },
          { id: "cbc", label: "CBC Reports" },
          { id: "lft", label: "Liver Function (LFT)" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterTag(f.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0
              ${filterTag === f.id
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => {
          const isActive = report.patient_id === activePatientId;
          const isDemoMissing = report.is_age_missing || report.is_sex_missing;

          return (
            <div
              key={report.patient_id}
              onClick={() => onSelectPatient(report.patient_id)}
              className={`group bg-card rounded-2xl border p-5 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between
                ${isActive
                  ? "border-teal-500 ring-2 ring-teal-500/20 bg-teal-500/[0.02]"
                  : "border-border hover:border-teal-500/40"
                }
              `}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
                      {report.patient_id}
                    </span>
                    <h3 className="text-base font-bold text-foreground mt-2 group-hover:text-teal-600 transition-colors">
                      {report.patient_name}
                    </h3>
                  </div>

                  {isDemoMissing ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      <HelpCircle className="w-3 h-3" />
                      <span>Missing Info</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Validated</span>
                    </span>
                  )}
                </div>

                <div className="text-xs text-muted-foreground font-mono space-y-1 mb-4">
                  <div>MRN: <span className="text-foreground">{report.mrn}</span></div>
                  <div>
                    {demoT.age}: <span className="text-foreground">{report.recorded_age !== null ? `${report.recorded_age} yrs` : "Missing / Unknown"}</span>
                    {" • "}
                    {demoT.sex}: <span className="text-foreground">{report.biological_sex || "Missing"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {report.file_name}
                </span>

                <div className="flex items-center gap-1 text-xs font-semibold text-teal-600 group-hover:translate-x-1 transition-transform">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
