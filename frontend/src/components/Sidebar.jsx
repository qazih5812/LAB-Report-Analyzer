import React from "react";
import {
  LayoutDashboard,
  Users,
  FileUp,
  Microscope,
  Bot,
  HelpCircle,
  FileCheck2,
  Code2,
  Plus,
  ExternalLink,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenUpload,
  totalPatients = 14,
  mobileOpen,
  setMobileOpen,
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "patients", label: `Patients (${totalPatients})`, icon: Users },
    { id: "analyzeReport", label: "Analyze Report", icon: FileUp, action: onOpenUpload },
    { id: "analysisResults", label: "Analysis Results", icon: Microscope },
    { id: "aiAssistant", label: "AI Assistant", icon: Bot },
    { id: "howItWorks", label: "How It Works", icon: HelpCircle },
    { id: "liveAudit", label: "Live 14/14 Audit", icon: FileCheck2 },
    { id: "openapiDocs", label: "OpenAPI Docs", icon: Code2, isExternal: true },
  ];

  const handleNavClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.isExternal) {
      window.open("http://localhost:8000/docs", "_blank");
    } else {
      setActiveTab(item.id);
    }
    if (mobileOpen && setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 start-0 z-50 w-64 flex flex-col bg-card border-e border-border select-none transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand Header with Stethoscope + Flask Logo */}
        <div className="p-5 border-b border-border/80">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab("dashboard")}
          >
            {/* Custom SVG Logo matching screenshot */}
            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center shrink-0 shadow-xs relative">
              <svg viewBox="0 0 40 40" className="w-8 h-8">
                {/* Flask Body */}
                <path
                  d="M16 6 L24 6 M20 6 L20 14 L12 28 C10 31.5 12.5 35 16.5 35 L23.5 35 C27.5 35 30 31.5 28 28 L20 14"
                  fill="none"
                  stroke="#008060"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Stethoscope wrapping neck */}
                <path
                  d="M15 15 C13 18 13 22 17 24 C20 25.5 24 24 25 21"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Bubbles / Reactive dots */}
                <circle cx="17" cy="28" r="1.5" fill="#f43f5e" />
                <circle cx="23" cy="27" r="1.8" fill="#008060" />
                <circle cx="19" cy="31" r="1.2" fill="#0284c7" />
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-[#0f172a] dark:text-white tracking-tight leading-none">
                City<span className="text-[#00594C] dark:text-teal-400">Lab</span>
              </span>
              <span className="text-[9px] font-bold text-[#f43f5e] tracking-wider uppercase mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
                Diagnostic AI Suite
              </span>
            </div>
          </div>

          {/* "+ New Analysis" Action Button */}
          <button
            onClick={onOpenUpload}
            className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#00594C] hover:bg-[#00473c] text-white font-bold text-xs shadow-md shadow-[#00594C]/20 transition-all hover:scale-[1.01]"
          >
            <div className="w-4 h-4 rounded-full border-1.5 border-white flex items-center justify-center">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
            <span>New Analysis</span>
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-start
                  ${isActive
                    ? "bg-[#eef2ff] dark:bg-indigo-950/40 text-[#4f46e5] dark:text-indigo-400 font-bold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors
                      ${isActive ? "text-[#4f46e5] dark:text-indigo-400" : "text-muted-foreground"}
                    `}
                  />
                  <span>{item.label}</span>
                </div>

                {item.isExternal && (
                  <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Version Indicator */}
        <div className="p-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[11px]">CityLab AI v1.1</span>
          </div>
          <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-md font-mono">CLIA-Safe</span>
        </div>
      </aside>
    </>
  );
}
