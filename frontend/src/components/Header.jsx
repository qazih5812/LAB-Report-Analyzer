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
        return "Patients";
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
    <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 transition-colors">
      {/* Left: Breadcrumbs and Mobile Hamburger */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground truncate">
          <span className="text-foreground font-bold">CityLab</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
          <span className="text-[#00594C] dark:text-teal-400 font-bold truncate">
            {getTabLabel()}
          </span>
        </div>
      </div>

      {/* Right Controls Matching Screenshot */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Pill with Ctrl+J shortcut */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 border border-border/80 text-xs text-muted-foreground cursor-pointer hover:border-teal-500/50 transition-colors">
          <Search className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono bg-card px-1.5 py-0.2 rounded border border-border/60">
            J
          </span>
        </div>

        {/* Segmented Language Pills [ EN | اردو | Roman Urdu | العربية ] */}
        <div className="flex items-center bg-secondary/90 rounded-full p-0.5 border border-border/80 text-xs font-semibold">
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
                className={`px-2.5 py-1 rounded-full text-xs transition-all
                  ${isSel
                    ? "bg-[#00594C] text-white font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {l.label}
              </button>
            );
          })}
        </div>

        {/* Listen Pill Button */}
        <button
          onClick={onToggleSpeech}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
            ${isSpeaking
              ? "bg-teal-600 text-white border-teal-600 shadow-xs animate-pulse"
              : "bg-secondary/80 hover:bg-secondary text-foreground border-border/80"
            }
          `}
          title="Read current clinical overview aloud"
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-teal-600" />}
          <span>Listen</span>
        </button>

        {/* Backend Status Pill */}
        <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Backend: Connected</span>
        </div>

        {/* Active Patient Pill */}
        <button
          onClick={onSelectPatientsTab}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground border border-border/80 text-xs font-semibold transition-colors"
          title="Switch Active Patient"
        >
          <User className="w-3.5 h-3.5 text-teal-600" />
          <span className="truncate max-w-[130px] sm:max-w-[180px]">
            Patient: {activePatientName || "Diana Prince"} ({activePatientId || "P004"})
          </span>
        </button>

        {/* Theme Toggle (Sun/Moon) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60 transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
}
