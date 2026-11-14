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
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`citylab-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Top Brand Header */}
        <div className="sidebar-header">
          <div
            className="sidebar-brand"
            onClick={() => setActiveTab("dashboard")}
            title="CityLab Diagnostics"
          >
            {/* Logo Emblem: Stethoscope wrapping chemical flask */}
            <div className="sidebar-logo-box">
              <svg
                viewBox="0 0 40 40"
                style={{ width: 28, height: 28, display: "block" }}
              >
                {/* Chemistry Flask */}
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
                {/* Reactive particles */}
                <circle cx="17" cy="28" r="1.5" fill="#f43f5e" />
                <circle cx="23" cy="27" r="1.8" fill="#008060" />
                <circle cx="19" cy="31" r="1.2" fill="#0284c7" />
              </svg>
            </div>

            <div className="sidebar-brand-text">
              <span className="sidebar-title">
                City<span className="brand-teal">Lab</span>
              </span>
              <span className="sidebar-suite-badge">
                <span className="badge-bullet" />
                DIAGNOSTIC AI SUITE
              </span>
            </div>
          </div>

          {/* "+ New Analysis" Button */}
          <button
            onClick={onOpenUpload}
            className="btn-new-analysis"
            title="Upload and analyze a new laboratory report"
          >
            <div className="new-analysis-icon-circle">
              <Plus size={14} strokeWidth={3} />
            </div>
            <span>New Analysis</span>
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <div className="nav-item-left">
                  <Icon size={18} className="nav-icon" />
                  <span>{item.label}</span>
                </div>
                {item.isExternal && (
                  <ExternalLink size={14} className="nav-ext-icon" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Version Tag */}
        <div className="sidebar-footer">
          <div className="footer-status">
            <span className="footer-status-dot" />
            <span className="footer-version">CityLab AI v1.1</span>
          </div>
          <span className="footer-badge">CLIA-Safe</span>
        </div>
      </aside>
    </>
  );
}
