import React from "react";
import {
  Menu,
  Sun,
  Moon,
  Sparkles,
  Globe,
  UploadCloud,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { translations } from "../locales/translations";

export default function Header({
  activeTab,
  language,
  setLanguage,
  theme,
  setTheme,
  eli10,
  setEli10,
  onOpenUpload,
  setMobileOpen,
  activePatientName,
  providerStatus,
}) {
  const t = translations[language]?.header || translations.en.header;
  const navT = translations[language]?.nav || translations.en.nav;

  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ur", label: "اردو (Urdu)", flag: "🇵🇰", dir: "rtl" },
    { code: "roman_ur", label: "Roman Urdu", flag: "🇵🇰" },
    { code: "ar", label: "العربية (Arabic)", flag: "🇸🇦", dir: "rtl" },
  ];

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem("citylab_language", newLang);
    if (newLang === "ur" || newLang === "ar") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("citylab_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return navT.dashboard;
      case "myReports":
        return navT.myReports;
      case "aiAssistant":
        return navT.aiAssistant;
      case "healthInsights":
        return navT.healthInsights;
      case "doctorQuestions":
        return navT.doctorQuestions;
      case "history":
        return navT.history;
      case "settings":
        return navT.settings;
      default:
        return navT.dashboard;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-18 bg-card/85 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 transition-colors">
      {/* Left Title & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {getPageTitle()}
            </h1>
            {activePatientName && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                {activePatientName}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            {translations[language]?.appSubtitle || translations.en.appSubtitle}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* ELI10 Toggle Pill */}
        <button
          onClick={() => setEli10(!eli10)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
            ${eli10
              ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 shadow-xs"
              : "bg-secondary text-muted-foreground border-transparent hover:text-foreground"
            }
          `}
          title={t.eli10Tooltip}
        >
          <Sparkles className={`w-3.5 h-3.5 ${eli10 ? "text-amber-700 dark:text-amber-400" : ""}`} />
          <span className="hidden md:inline">{t.eli10}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${eli10 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground"}`}>
            {eli10 ? "ON" : "OFF"}
          </span>
        </button>

        {/* Language Selector Dropdown */}
        <div className="relative flex items-center">
          <div className="flex items-center gap-1 bg-secondary rounded-lg px-2.5 py-1.5 border border-border/60 text-xs font-medium">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-foreground outline-none cursor-pointer text-xs font-medium pr-1"
              aria-label="Select Application Language"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-card text-foreground">
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/50 transition-colors"
          title={theme === "dark" ? t.themeLight : t.themeDark}
          aria-label="Toggle display theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Quick Upload Action Button */}
        <button
          onClick={onOpenUpload}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs transition-colors"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{t.uploadBtn}</span>
        </button>
      </div>
    </header>
  );
}
