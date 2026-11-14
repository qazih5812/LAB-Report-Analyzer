import React, { useState } from "react";
import {
  LayoutDashboard,
  UploadCloud,
  FileSpreadsheet,
  BotMessageSquare,
  Activity,
  Stethoscope,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  HeartPulse,
} from "lucide-react";
import { translations } from "../locales/translations";

export default function Sidebar({
  activeTab,
  setActiveTab,
  language = "en",
  onOpenUpload,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const t = translations[language]?.nav || translations.en.nav;

  const navItems = [
    { id: "dashboard", label: t.dashboard, icon: LayoutDashboard },
    { id: "upload", label: t.upload, icon: UploadCloud, isAction: true },
    { id: "myReports", label: t.myReports, icon: FileSpreadsheet },
    { id: "aiAssistant", label: t.aiAssistant, icon: BotMessageSquare },
    { id: "healthInsights", label: t.healthInsights, icon: Activity },
    { id: "doctorQuestions", label: t.doctorQuestions, icon: Stethoscope },
    { id: "history", label: t.history, icon: History },
    { id: "settings", label: t.settings, icon: Settings },
  ];

  const handleNavClick = (item) => {
    if (item.isAction) {
      onOpenUpload();
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
        className={`fixed top-0 bottom-0 start-0 z-50 flex flex-col bg-sidebar border-e border-sidebar-border transition-all duration-300 ease-in-out select-none
          ${isCollapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg text-sidebar-foreground tracking-tight leading-none">
                  City<span className="text-teal-600 dark:text-teal-400">Lab</span>
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mt-1">
                  Diagnostics AI
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-hover transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isUploadAction = item.isAction;

            if (isUploadAction) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl font-medium text-sm transition-all shadow-sm
                    bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white my-3
                    ${isCollapsed ? "justify-center px-0" : "justify-start"}
                  `}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="truncate font-semibold">{item.label}</span>}
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative
                  ${isActive
                    ? "bg-teal-500/10 text-teal-700 dark:text-teal-400 font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-hover"
                  }
                  ${isCollapsed ? "justify-center px-0" : "justify-start"}
                `}
                title={item.label}
              >
                {isActive && (
                  <span className="absolute start-0 top-2 bottom-2 w-1 bg-teal-600 rounded-e-full" />
                )}
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105
                    ${isActive ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground group-hover:text-sidebar-foreground"}
                  `}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Bottom Profile & Privacy Section */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {/* Privacy Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium
              ${isCollapsed ? "justify-center px-0" : ""}
            `}
            title="Directive 1 Active: Context Locked to single active patient"
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            {!isCollapsed && <span className="truncate text-[11px]">Context Protected</span>}
          </div>

          {/* User Profile Card */}
          <div
            className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-sidebar-hover transition-colors cursor-pointer
              ${isCollapsed ? "justify-center px-0" : ""}
            `}
            onClick={() => setActiveTab("settings")}
          >
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 font-bold text-xs border border-slate-300 dark:border-slate-600">
              <User className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-sidebar-foreground truncate">
                  Clinical User
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  Doctor / Caregiver
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
