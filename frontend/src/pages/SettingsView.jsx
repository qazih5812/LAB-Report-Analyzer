import React, { useState } from "react";
import {
  Settings,
  User,
  Globe,
  Sun,
  Moon,
  Volume2,
  ShieldCheck,
  Trash2,
  Check,
} from "lucide-react";
import { translations } from "../locales/translations";

export default function SettingsView({
  language,
  setLanguage,
  theme,
  setTheme,
}) {
  const t = translations[language]?.settings || translations.en.settings;

  const [displayName, setDisplayName] = useState("Healthcare Professional");
  const [clinicalRole, setClinicalRole] = useState("Attending Clinician / Reviewer");
  const [voiceGender, setVoiceGender] = useState("female");
  const [voiceSpeed, setVoiceSpeed] = useState("1.0");
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to clear your local preferences and cached sessions?")) {
      localStorage.clear();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem("citylab_language", newLang);
    if (newLang === "ur" || newLang === "ar") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("citylab_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-xs">
        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold text-xs uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>Application Preferences</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure display themes, multilingual preferences, voice synthesis, and clinical privacy parameters.
        </p>
      </div>

      {clearedNotice && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Local storage cache and chat context cleared successfully.</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-teal-600" />
          <span>{t.profileSection}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.displayName}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-secondary/80 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.role}
            </label>
            <input
              type="text"
              value={clinicalRole}
              onChange={(e) => setClinicalRole(e.target.value)}
              className="w-full bg-secondary/80 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Language & Appearance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Section */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-600" />
            <span>{t.languageSection}</span>
          </h3>

          <div className="space-y-2">
            {[
              { code: "en", label: "English", desc: "Default clinical English", flag: "🇬🇧" },
              { code: "ur", label: "اردو (Urdu)", desc: "Right-to-left Nastaliq script", flag: "🇵🇰" },
              { code: "roman_ur", label: "Roman Urdu", desc: "Conversational Urdu in Latin characters", flag: "🇵🇰" },
              { code: "ar", label: "العربية (Arabic)", desc: "Right-to-left Modern Standard Arabic", flag: "🇸🇦" },
            ].map((lang) => (
              <div
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all
                  ${language === lang.code
                    ? "border-teal-500 bg-teal-500/10 text-teal-950 dark:text-teal-200"
                    : "border-border hover:bg-secondary/60 text-foreground"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <span className="text-sm font-semibold block">{lang.label}</span>
                    <span className="text-xs text-muted-foreground">{lang.desc}</span>
                  </div>
                </div>
                {language === lang.code && <Check className="w-4 h-4 text-teal-600" />}
              </div>
            ))}
          </div>
        </div>

        {/* Display & Voice Section */}
        <div className="space-y-6">
          {/* Theme Mode */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <span>{t.themeSection}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleThemeChange("light")}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs transition-all
                  ${theme === "light"
                    ? "border-teal-500 bg-teal-500/10 text-teal-800 dark:text-teal-300"
                    : "border-border text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light ClyHealth</span>
              </button>

              <button
                onClick={() => handleThemeChange("dark")}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs transition-all
                  ${theme === "dark"
                    ? "border-teal-500 bg-teal-500/10 text-teal-800 dark:text-teal-300"
                    : "border-border text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark Slate</span>
              </button>
            </div>
          </div>

          {/* Voice Preferences */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-teal-600" />
              <span>{t.voiceSection}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t.voiceGender}
                </label>
                <select
                  value={voiceGender}
                  onChange={(e) => setVoiceGender(e.target.value)}
                  className="w-full bg-secondary/80 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
                >
                  <option value="female">Natural Female Voice</option>
                  <option value="male">Natural Male Voice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t.voiceSpeed}
                </label>
                <select
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(e.target.value)}
                  className="w-full bg-secondary/80 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
                >
                  <option value="0.8">0.8x (Slower)</option>
                  <option value="1.0">1.0x (Normal)</option>
                  <option value="1.2">1.2x (Faster)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy and Data Safety */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>{t.privacySection}</span>
        </h3>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
          <p className="font-semibold mb-1">CLIA & HIPAA Clinical Compliance Directives:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Directive 1 (Context Isolation):</strong> The AI Assistant is permanently locked to one patient file per session. Queries mentioning other patient names or MRNs are blocked.</li>
            <li><strong>Directive 2 (No Diagnostic Authority):</strong> The system explains laboratory reference intervals without ever diagnosing medical conditions or prescribing treatments.</li>
            <li><strong>Directive 3 (Deterministic Engine):</strong> Numerical classifications are computed by verified mathematical rules and never delegated to LLMs.</li>
          </ul>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Local Session Storage</span>
          <button
            onClick={handleClearCache}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-semibold text-xs border border-rose-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearDataBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
