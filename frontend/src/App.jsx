import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import PatientSelector from "./components/PatientSelector";
import DemographicsCard from "./components/DemographicsCard";
import UrgentAlertBanner from "./components/UrgentAlertBanner";
import BiomarkerCard from "./components/BiomarkerCard";
import DoctorQuestions from "./components/DoctorQuestions";
import ChatAssistant from "./components/ChatAssistant";
import UploadModal from "./components/UploadModal";

import MyReportsView from "./pages/MyReportsView";
import HealthInsightsView from "./pages/HealthInsightsView";
import DoctorQuestionsView from "./pages/DoctorQuestionsView";
import HistoryView from "./pages/HistoryView";
import SettingsView from "./pages/SettingsView";

import { apiUrl } from "./api";
import { speakText, stopSpeech } from "./utils/voice";
import { translations } from "./locales/translations";
import {
  Sparkles,
  AlertCircle,
  RefreshCw,
  Layers,
  Volume2,
  VolumeX,
  Filter,
} from "lucide-react";
import "./App.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Dashboard error boundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="m-6 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-800 dark:text-red-300">
          <h3 className="font-bold text-base">⚠️ An unexpected rendering issue occurred:</h3>
          <p className="mt-2 text-xs font-mono">{this.state.error?.message || String(this.state.error)}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-xs"
            onClick={() => window.location.reload()}
          >
            Reload CityLab
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reports, setReports] = useState([]);
  const [selectedId, setSelectedId] = useState("P001");
  const [analysis, setAnalysis] = useState(null);
  const [providerStatus, setProviderStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Preference states with persistence
  const [language, setLanguage] = useState(() => localStorage.getItem("citylab_language") || "en");
  const [theme, setTheme] = useState(() => localStorage.getItem("citylab_theme") || "light");
  const [eli10, setEli10] = useState(false);

  // UI state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);
  const [biomarkerFilter, setBiomarkerFilter] = useState("all"); // 'all', 'abnormal', 'urgent'
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false);

  // Initialize theme and text direction on mount
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (language === "ur" || language === "ar") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  }, [theme, language]);

  // Fetch Analysis for Patient (with optional demographic overrides, language, and ELI10)
  const fetchAnalysis = async (patientId, overrideAge = null, overrideSex = null, currentLang = language, currentEli10 = eli10) => {
    try {
      setIsLoading(true);
      setError(null);
      stopSpeech();
      setIsSpeakingSummary(false);

      const payload = {
        patient_id: patientId,
        override_age: overrideAge,
        override_sex: overrideSex,
        language: currentLang,
        eli10: currentEli10,
      };

      const res = await fetch(apiUrl("/api/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || "Failed to analyze patient report.");
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    async function initData() {
      try {
        setIsLoading(true);
        const [provRes, repsRes] = await Promise.all([
          fetch(apiUrl("/api/providers")),
          fetch(apiUrl("/api/reports")),
        ]);

        if (provRes.ok) {
          const provData = await provRes.json();
          setProviderStatus(provData);
        }

        if (repsRes.ok) {
          const repsData = await repsRes.json();
          setReports(repsData);
          if (repsData.length > 0) {
            setSelectedId(repsData[0].patient_id);
            await fetchAnalysis(repsData[0].patient_id, null, null, language, eli10);
          }
        }
      } catch (err) {
        setError(`Failed to connect to CityLab API server: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, []);

  // When language or ELI10 changes, re-fetch active report
  useEffect(() => {
    if (selectedId && analysis) {
      fetchAnalysis(
        selectedId,
        analysis.demographics?.age_overridden ? analysis.demographics?.age : null,
        analysis.demographics?.sex_overridden ? analysis.demographics?.sex : null,
        language,
        eli10
      );
    }
  }, [language, eli10]);

  // Handle patient switch
  const handleSelectPatient = (patientId) => {
    setSelectedId(patientId);
    setActiveTab("dashboard");
    fetchAnalysis(patientId, null, null, language, eli10);
  };

  // Handle demographic overrides
  const handleApplyOverride = (age, sex) => {
    fetchAnalysis(selectedId, age, sex, language, eli10);
  };

  const handleResetOverride = () => {
    fetchAnalysis(selectedId, null, null, language, eli10);
  };

  // Handle custom upload success
  const handleUploadSuccess = (analyzedData) => {
    setReports((prev) => {
      const exists = prev.some((r) => r.patient_id === analyzedData.patient_id);
      if (!exists) {
        return [
          {
            patient_id: analyzedData.patient_id,
            patient_name: analyzedData.patient_name,
            mrn: analyzedData.mrn,
            file_name: `custom_${analyzedData.patient_id}.md`,
            recorded_age: analyzedData.demographics?.age,
            biological_sex: analyzedData.demographics?.sex,
            is_age_missing: analyzedData.demographics?.is_age_missing,
            is_sex_missing: analyzedData.demographics?.is_sex_missing,
          },
          ...prev,
        ];
      }
      return prev;
    });

    setSelectedId(analyzedData.patient_id);
    setAnalysis(analyzedData);
    setActiveTab("dashboard");
  };

  const handleToggleSummaryAudio = () => {
    if (isSpeakingSummary) {
      stopSpeech();
      setIsSpeakingSummary(false);
    } else {
      if (!analysis?.layman_summary) return;
      setIsSpeakingSummary(true);
      speakText(analysis.layman_summary, {
        language,
        onEnd: () => setIsSpeakingSummary(false),
        onError: () => setIsSpeakingSummary(false),
      });
    }
  };

  // Active patient object for chat
  const activePatientObj = reports.find((r) => r.patient_id === selectedId) || {
    patient_id: selectedId,
    patient_name: analysis?.patient_name || "Active Patient",
    mrn: analysis?.mrn || "CLD-UNKNOWN",
  };

  // Filter biomarker results
  const filteredBiomarkers = (analysis?.results || []).filter((r) => {
    if (biomarkerFilter === "urgent") return r.is_urgent;
    if (biomarkerFilter === "abnormal") return r.status !== "NORMAL";
    return true;
  });

  const tSummary = translations[language]?.summary || translations.en.summary;
  const tBiomarkers = translations[language]?.biomarkers || translations.en.biomarkers;

  return (
    <div className="app-shell">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        onOpenUpload={() => setIsUploadOpen(true)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* 2. Main Viewport */}
      <div
        className={`main-viewport ${
          isSidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"
        }`}
      >
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
          eli10={eli10}
          setEli10={setEli10}
          onOpenUpload={() => setIsUploadOpen(true)}
          setMobileOpen={setMobileOpen}
          activePatientName={analysis?.patient_name}
          providerStatus={providerStatus}
        />

        {/* View Content Stage */}
        <div className="view-content-container">
          <ErrorBoundary>
            {error && (
              <div className="error-banner mb-6">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB: DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Horizontal Quick Patient Carousel / Selector */}
                <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Select Patient Encounter ({reports.length})
                    </span>
                    <button
                      onClick={() => setActiveTab("myReports")}
                      className="text-xs font-semibold text-teal-600 hover:underline"
                    >
                      View All Reports →
                    </button>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {reports.map((r) => {
                      const isSel = r.patient_id === selectedId;
                      return (
                        <button
                          key={r.patient_id}
                          onClick={() => handleSelectPatient(r.patient_id)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border shrink-0 transition-all text-start
                            ${isSel
                              ? "bg-teal-600 text-white border-teal-600 shadow-xs font-bold"
                              : "bg-secondary/70 border-border/80 text-foreground hover:bg-secondary"
                            }
                          `}
                        >
                          <div className="text-[10px] opacity-75">{r.patient_id}</div>
                          <div className="truncate max-w-[120px]">{r.patient_name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isLoading && !analysis ? (
                  <div className="loading-state">
                    <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
                    <h3>Verifying Certified Reference Limits...</h3>
                    <p>Executing deterministic rules, boundary checks, and unit conversion.</p>
                  </div>
                ) : analysis ? (
                  <>
                    {/* Urgent Warning Banner */}
                    {analysis.has_urgent_values && (
                      <UrgentAlertBanner
                        warningText={analysis.urgent_warning}
                        onScrollToDoctorQuestions={() => setActiveTab("doctorQuestions")}
                      />
                    )}

                    {/* Demographics Resolver */}
                    <DemographicsCard
                      key={`${analysis.patient_id}-${analysis.demographics?.age}-${analysis.demographics?.sex}`}
                      analysis={analysis}
                      onApplyOverride={handleApplyOverride}
                      onResetOverride={handleResetOverride}
                    />

                    {/* Layman Summary with Voice Audio Button */}
                    <section className="summary-section">
                      <div className="summary-header">
                        <div className="summary-title-row">
                          <Sparkles className="w-5 h-5 text-teal-600" />
                          <h3>{tSummary.title}</h3>
                          {eli10 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                              ELI10
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Audio Listen Button */}
                          <button
                            onClick={handleToggleSummaryAudio}
                            className={`voice-listen-pill ${isSpeakingSummary ? "active" : ""}`}
                            title={isSpeakingSummary ? tSummary.stopVoice : tSummary.listenVoice}
                          >
                            {isSpeakingSummary ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5" />
                                <span>{tSummary.stopVoice}</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>{tSummary.listenVoice}</span>
                              </>
                            )}
                          </button>

                          <span className="summary-provider-pill">
                            {analysis.provider_used.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="summary-body">
                        <p className="summary-prose">{analysis.layman_summary}</p>
                      </div>
                    </section>

                    {/* Biomarker Cards Grid with Filter Pills */}
                    <section className="biomarkers-section">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="section-title-row">
                          <Layers className="w-5 h-5 text-teal-600" />
                          <h3>
                            {tBiomarkers.title} ({filteredBiomarkers.length}/{analysis.results.length})
                          </h3>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                          <button
                            onClick={() => setBiomarkerFilter("all")}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
                              ${biomarkerFilter === "all"
                                ? "bg-teal-600 text-white shadow-xs"
                                : "bg-secondary text-muted-foreground hover:text-foreground"
                              }
                            `}
                          >
                            {tBiomarkers.filterAll}
                          </button>
                          <button
                            onClick={() => setBiomarkerFilter("abnormal")}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
                              ${biomarkerFilter === "abnormal"
                                ? "bg-teal-600 text-white shadow-xs"
                                : "bg-secondary text-muted-foreground hover:text-foreground"
                              }
                            `}
                          >
                            {tBiomarkers.filterAbnormal}
                          </button>
                          <button
                            onClick={() => setBiomarkerFilter("urgent")}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
                              ${biomarkerFilter === "urgent"
                                ? "bg-red-600 text-white shadow-xs"
                                : "bg-secondary text-muted-foreground hover:text-foreground"
                              }
                            `}
                          >
                            {tBiomarkers.filterUrgent} 🚨
                          </button>
                        </div>
                      </div>

                      <div className="biomarkers-grid">
                        {filteredBiomarkers.map((res, idx) => (
                          <BiomarkerCard key={idx} result={res} />
                        ))}
                      </div>
                    </section>

                    {/* Doctor Questions Preview */}
                    <DoctorQuestions
                      questions={analysis.doctor_questions}
                      disclaimer={analysis.disclaimer}
                      hasUrgent={analysis.has_urgent_values}
                    />
                  </>
                ) : null}
              </div>
            )}

            {/* TAB: MY REPORTS */}
            {activeTab === "myReports" && (
              <MyReportsView
                reports={reports}
                activePatientId={selectedId}
                onSelectPatient={handleSelectPatient}
                onOpenUpload={() => setIsUploadOpen(true)}
                language={language}
              />
            )}

            {/* TAB: AI LAB ASSISTANT (FULL EMBEDDED PAGE) */}
            {activeTab === "aiAssistant" && (
              <div className="space-y-4">
                <ChatAssistant
                  key={`embedded-${activePatientObj?.patient_id}-${language}`}
                  activePatient={activePatientObj}
                  isEmbedded={true}
                  language={language}
                />
              </div>
            )}

            {/* TAB: HEALTH INSIGHTS */}
            {activeTab === "healthInsights" && (
              <HealthInsightsView
                analysisData={analysis}
                allReports={reports}
                language={language}
                onSelectPatient={handleSelectPatient}
              />
            )}

            {/* TAB: DOCTOR QUESTIONS (DEDICATED PRINT VIEW) */}
            {activeTab === "doctorQuestions" && (
              <DoctorQuestionsView
                analysisData={analysis}
                language={language}
              />
            )}

            {/* TAB: PERSISTENT HISTORY */}
            {activeTab === "history" && (
              <HistoryView
                language={language}
                onSelectPatient={handleSelectPatient}
              />
            )}

            {/* TAB: SETTINGS */}
            {activeTab === "settings" && (
              <SettingsView
                language={language}
                setLanguage={setLanguage}
                theme={theme}
                setTheme={setTheme}
                eli10={eli10}
                setEli10={setEli10}
              />
            )}
          </ErrorBoundary>
        </div>
      </div>

      {/* Floating Chat Drawer (when NOT in aiAssistant tab) */}
      {activeTab !== "aiAssistant" && (
        <ChatAssistant
          key={`float-${activePatientObj?.patient_id}-${language}`}
          activePatient={activePatientObj}
          isOpen={isFloatingChatOpen}
          onToggle={() => setIsFloatingChatOpen(!isFloatingChatOpen)}
          isEmbedded={false}
          language={language}
        />
      )}

      {/* Report Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
