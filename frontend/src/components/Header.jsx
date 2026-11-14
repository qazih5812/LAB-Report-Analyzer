import React from "react";
import {
  Menu,
  Search,
  Volume2,
  VolumeX,
  User,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";

export default function Header({
  activeTab,
  language,
  setLanguage,
  theme,
  setTheme,
  activePatientName,
  activePatientId,
  isSpeaking,
  onToggleSpeech,
  setMobileOpen,
  onSelectPatientsTab,
}) {
  const getTabLabel = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "patients":
        return "Patients (14)";
      case "analyzeReport":
        return "Analyze Report";
      case "analysisResults":
        return "Analysis Results";
      case "aiAssistant":
        return "AI Assistant";
      case "howItWorks":
        return "How It Works";
      case "liveAudit":
        return "Live 14/14 Audit";
      default:
        return "Dashboard";
    }
  };

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem("citylab_language", langCode);
    if (langCode === "ur" || langCode === "ar") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("citylab_theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="citylab-header">
      {/* Left: Breadcrumbs & Mobile Menu */}
      <div className="header-left">
        <button
          onClick={() => setMobileOpen(true)}
          className="header-mobile-toggle"
          aria-label="Open Navigation"
        >
          <Menu size={20} />
        </button>

        <div className="header-breadcrumbs">
          <span className="breadcrumb-root">CityLab</span>
          <ChevronRight size={14} className="breadcrumb-sep" />
          <span className="breadcrumb-current">{getTabLabel()}</span>
        </div>
      </div>

      {/* Right: Controls matching screenshot */}
      <div className="header-controls">
        {/* Search Pill with Ctrl+J */}
        <div className="search-pill" title="Search medical reports (Ctrl+J)">
          <Search size={14} className="search-icon" />
          <span className="search-shortcut">J</span>
        </div>

        {/* Segmented Language Selector [ EN | اردو | Roman Urdu | العربية ] */}
        <div className="lang-segmented">
          {[
            { code: "en", label: "EN" },
            { code: "ur", label: "اردو" },
            { code: "roman_ur", label: "Roman Urdu" },
            { code: "ar", label: "العربية" },
          ].map((l) => {
            const isSel = language === l.code;
            return (
              <button
                key={l.code}
                onClick={() => handleLanguageChange(l.code)}
                className={`lang-btn ${isSel ? "active" : ""}`}
              >
                {l.label}
              </button>
            );
          })}
        </div>

        {/* Listen Audio Button */}
        <button
          onClick={onToggleSpeech}
          className={`listen-btn ${isSpeaking ? "speaking" : ""}`}
          title="Listen to clinical summary"
        >
          {isSpeaking ? (
            <VolumeX size={14} />
          ) : (
            <Volume2 size={14} className="listen-icon" />
          )}
          <span>Listen</span>
        </button>

        {/* Backend Status Pill */}
        <div className="backend-status-pill">
          <span className="status-dot-green" />
          <span>Backend: Connected</span>
        </div>

        {/* Active Patient Pill */}
        <button
          onClick={onSelectPatientsTab}
          className="patient-pill"
          title="Switch Active Patient"
        >
          <User size={14} className="patient-pill-icon" />
          <span className="patient-pill-text">
            Patient: {activePatientName || "Diana Prince"} ({activePatientId || "P004"})
          </span>
        </button>

        {/* Theme Toggle (Sun/Moon) */}
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={theme === "dark" ? "Light theme" : "Dark theme"}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
