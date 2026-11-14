import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DemographicsCard from "./components/DemographicsCard";
import UrgentAlertBanner from "./components/UrgentAlertBanner";
import BiomarkerCard from "./components/BiomarkerCard";
import DoctorQuestions from "./components/DoctorQuestions";
import ChatAssistant from "./components/ChatAssistant";
import UploadModal from "./components/UploadModal";

import HowItWorksView from "./pages/HowItWorksView";
import LiveAuditView from "./pages/LiveAuditView";
import MyReportsView from "./pages/MyReportsView";

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
  Plus,
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
  const [activeTab, setActiveTab] = useState("howItWorks"); // Initial tab matching user screenshot
  const [reports, setReports] = useState([]);
  const [selectedId, setSelectedId] = useState("P004"); // Default to Diana Prince (P004) from screenshot
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Preference states
  const [language, setLanguage] = useState(() => localStorage.getItem("citylab_language") || "en");
  const [theme, setTheme] = useState(() => localStorage.getItem("citylab_theme") || "light");

  // UI state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);
  const [biomarkerFilter, setBiomarkerFilter] = useState("all");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Apply theme & RTL direction
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

  // Fetch Analysis for Patient
  const fetchAnalysis = async (patientId, overrideAge = null, overrideSex = null, currentLang = language) => {
    try {
      setIsLoading(true);
      setError(null);
      stopSpeech();
      setIsSpeaking(false);

      const payload = {
        patient_id: patientId,
        override_age: overrideAge,
        override_sex: overrideSex,
        language: currentLang,
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
        const repsRes = await fetch(apiUrl("/api/reports"));
        if (repsRes.ok) {
          const repsData = await repsRes.json();
          setReports(repsData);
          // Select P004 Diana Prince if available, else first report
          const defaultPid = repsData.find((r) => r.patient_id === "P004")?.patient_id || repsData[0]?.patient_id || "P001";
          setSelectedId(defaultPid);
          await fetchAnalysis(defaultPid, null, null, language);
        }
      } catch (err) {
        setError(`Failed to connect to CityLab API server: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, []);

  // When language changes, re-fetch active report
  useEffect(() => {
    if (selectedId && analysis) {
      fetchAnalysis(
        selectedId,
        analysis.demographics?.age_overridden ? analysis.demographics?.age : null,
        analysis.demographics?.sex_overridden ? analysis.demographics?.sex : null,
        language
      );
    }
  }, [language]);

  // Handle patient switch
  const handleSelectPatient = (patientId) => {
    setSelectedId(patientId);
    setActiveTab("dashboard");
    fetchAnalysis(patientId, null, null, language);
  };

  // Handle demographic overrides
  const handleApplyOverride = (age, sex) => {
    fetchAnalysis(selectedId, age, sex, language);
  };

  const handleResetOverride = () => {
    fetchAnalysis(selectedId, null, null, language);
  };

  // Handle upload success
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

  // Toggle voice speech reading
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      const textToRead =
        activeTab === "howItWorks"
          ? "How CityLab Works. CityLab bridges the cognitive gap between raw biochemical pathology and human comprehension. All numerical comparisons, unit conversions, alias lookups, and boundary rules are executed deterministically in Python against the corpus files, while the LLM writes empathetic Class-8 explanations validated against diagnostic phrasing."
          : analysis?.layman_summary || "CityLab Diagnostic Explainer online.";

      setIsSpeaking(true);
      speakText(textToRead, {
        language,
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  // Active patient object for chat and header
  const activePatientObj = reports.find((r) => r.patient_id === selectedId) || {
    patient_id: selectedId,
    patient_name: analysis?.patient_name || "Diana Prince",
    mrn: analysis?.mrn || "CLD-P004-9942",
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
      {/* 1. Sidebar Navigation matching screenshot */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        totalPatients={reports.length || 14}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* 2. Main Viewport */}
      <div className="main-viewport sidebar-expanded">
        {/* Top Header matching screenshot */}
        <Header
          activeTab={activeTab}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
          activePatientName={analysis?.patient_name || "Diana Prince"}
          activePatientId={selectedId || "P004"}
          isSpeaking={isSpeaking}
          onToggleSpeech={handleToggleSpeech}
          setMobileOpen={setMobileOpen}
          onSelectPatientsTab={() => setActiveTab("patients")}
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

            {/* TAB: HOW IT WORKS (SCREENSHOT EXACT MATCH) */}
            {activeTab === "howItWorks" && (
              <HowItWorksView
                onRunLiveAudit={() => setActiveTab("liveAudit")}
                onSelectTab={setActiveTab}
              />
            )}

            {/* TAB: LIVE 14/14 AUDIT */}
            {activeTab === "liveAudit" && (
              <LiveAuditView onSelectPatient={handleSelectPatient} />
            )}

            {/* TAB: PATIENTS (14) */}
            {activeTab === "patients" && (
              <MyReportsView
                reports={reports}
                activePatientId={selectedId}
                onSelectPatient={handleSelectPatient}
                onOpenUpload={() => setIsUploadOpen(true)}
                language={language}
              />
            )}

            {/* TAB: DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {isLoading && !analysis ? (
                  <div className="loading-state">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#00594C]" />
                    <h3>Verifying Certified Reference Limits...</h3>
                    <p>Executing deterministic rules, boundary checks, and unit conversion.</p>
                  </div>
                ) : analysis ? (
                  <>
                    {/* Urgent Warning Banner */}
                    {analysis.has_urgent_values && (
                      <UrgentAlertBanner
                        warningText={analysis.urgent_warning}
                        onScrollToDoctorQuestions={() => {
                          document.getElementById("doctor-questions-section")?.scrollIntoView({ behavior: "smooth" });
                        }}
                      />
                    )}

                    {/* Demographics Resolver */}
                    <DemographicsCard
                      key={`${analysis.patient_id}-${analysis.demographics?.age}-${analysis.demographics?.sex}`}
                      analysis={analysis}
                      onApplyOverride={handleApplyOverride}
                      onResetOverride={handleResetOverride}
                    />

                    {/* Layman Summary */}
                    <section className="summary-section">
                      <div className="summary-header">
                        <div className="summary-title-row">
                          <Sparkles className="w-5 h-5 text-[#00594C]" />
                          <h3>{tSummary.title}</h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleToggleSpeech}
                            className={`voice-listen-pill ${isSpeaking ? "active" : ""}`}
                          >
                            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            <span>{isSpeaking ? "Stop Audio" : "Listen"}</span>
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
                          <Layers className="w-5 h-5 text-[#00594C]" />
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
                                ? "bg-[#00594C] text-white shadow-xs"
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
                                ? "bg-[#00594C] text-white shadow-xs"
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

            {/* TAB: ANALYSIS RESULTS */}
            {activeTab === "analysisResults" && analysis && (
              <div className="space-y-6">
                <div className="bg-card rounded-2xl p-6 border border-border shadow-xs">
                  <h2 className="text-xl font-bold text-foreground">
                    Biomarker Analysis Results for {analysis.patient_name} ({analysis.patient_id})
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Certified reference ranges and clinical classifications computed by deterministic Python rules engine.
                  </p>
                </div>

                <div className="biomarkers-grid">
                  {analysis.results.map((res, idx) => (
                    <BiomarkerCard key={idx} result={res} />
                  ))}
                </div>
              </div>
            )}

            {/* TAB: AI ASSISTANT (FULL SCREEN EMBEDDED) */}
            {activeTab === "aiAssistant" && (
              <div className="space-y-4">
                <ChatAssistant
                  key={`assistant-${activePatientObj?.patient_id}-${language}`}
                  activePatient={activePatientObj}
                  isEmbedded={true}
                  language={language}
                />
              </div>
            )}
          </ErrorBoundary>
        </div>
      </div>

      {/* Floating Chat Drawer (when NOT in aiAssistant tab) */}
      {activeTab !== "aiAssistant" && (
        <ChatAssistant
          key={`floating-${activePatientObj?.patient_id}-${language}`}
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
