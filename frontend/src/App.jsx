import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PatientSelector from './components/PatientSelector';
import DemographicsCard from './components/DemographicsCard';
import UrgentAlertBanner from './components/UrgentAlertBanner';
import BiomarkerCard from './components/BiomarkerCard';
import DoctorQuestions from './components/DoctorQuestions';
import ChatAssistant from './components/ChatAssistant';
import UploadModal from './components/UploadModal';
import { apiUrl } from './api';
import {
  Sparkles,
  AlertCircle,
  RefreshCw,
  Layers
} from 'lucide-react';
import './App.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Dashboard error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ margin: '2rem', padding: '1.5rem', background: '#fee2e2', color: '#991b1b', borderRadius: '12px', border: '1px solid #f87171' }}>
          <h3>⚠️ A rendering issue occurred:</h3>
          <p style={{ marginTop: '0.5rem', fontFamily: 'monospace' }}>{this.state.error?.message || String(this.state.error)}</p>
          <button
            style={{ marginTop: '1rem', padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => window.location.reload()}
          >
            Reload Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [reports, setReports] = useState([]);
  const [selectedId, setSelectedId] = useState('P001');
  const [analysis, setAnalysis] = useState(null);
  const [providerStatus, setProviderStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 1. Fetch Analysis for Patient (with optional demographic overrides)
  const fetchAnalysis = async (patientId, overrideAge = null, overrideSex = null) => {
    try {
      setIsLoading(true);
      setError(null);

      const payload = {
        patient_id: patientId,
        override_age: overrideAge,
        override_sex: overrideSex,
      };

      const res = await fetch(apiUrl('/api/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Failed to analyze patient report.');
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Initial Data Fetch: Health, Providers, and Reports List
  useEffect(() => {
    async function initData() {
      try {
        setIsLoading(true);
        // Fetch health & providers
        const [provRes, repsRes] = await Promise.all([
          fetch(apiUrl('/api/providers')),
          fetch(apiUrl('/api/reports'))
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
            await fetchAnalysis(repsData[0].patient_id);
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

  // Handle patient switch
  const handleSelectPatient = (patientId) => {
    setSelectedId(patientId);
    fetchAnalysis(patientId);
  };

  // Handle demographic overrides for Charlie P003 or Laura P012
  const handleApplyOverride = (age, sex) => {
    fetchAnalysis(selectedId, age, sex);
  };

  const handleResetOverride = () => {
    fetchAnalysis(selectedId, null, null);
  };

  // Handle custom upload success
  const handleUploadSuccess = (analyzedData) => {
    // Add to reports list if not present
    setReports(prev => {
      const exists = prev.some(r => r.patient_id === analyzedData.patient_id);
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
  };

  const handleScrollToQuestions = () => {
    document.getElementById('doctor-questions-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Active patient object for chat
  const activePatientObj = reports.find(r => r.patient_id === selectedId) || {
    patient_id: selectedId,
    patient_name: analysis?.patient_name || 'Active Patient',
    mrn: analysis?.mrn || 'CLD-UNKNOWN'
  };

  return (
    <div className="app-root">
      {/* Top Navigation */}
      <Navbar
        providerStatus={providerStatus}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <div className="app-main-layout">
        {/* Left Column: 14 Patient Selector */}
        <PatientSelector
          reports={reports}
          selectedId={selectedId}
          onSelectPatient={handleSelectPatient}
        />

        {/* Center Main Stage: Analysis Dashboard */}
        <main className="dashboard-content">
          <ErrorBoundary>
            {error && (
              <div className="error-banner">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {isLoading && !analysis ? (
              <div className="loading-state">
                <RefreshCw size={36} className="spinning text-primary" />
                <h3>Analyzing Clinical Report...</h3>
                <p>Executing deterministic classifications, boundary tests, and unit normalization.</p>
              </div>
            ) : analysis ? (
              <>
                {/* Priority 5: Urgent Threshold Warning Banner */}
                {analysis.has_urgent_values && (
                  <UrgentAlertBanner
                    warningText={analysis.urgent_warning}
                    onScrollToDoctorQuestions={handleScrollToQuestions}
                  />
                )}

                {/* Priority 3: Demographics & Missing Demographics Interactive Resolver */}
                <DemographicsCard
                  key={`${analysis.patient_id}-${analysis.demographics?.age}-${analysis.demographics?.sex}`}
                  analysis={analysis}
                  onApplyOverride={handleApplyOverride}
                  onResetOverride={handleResetOverride}
                />

                {/* Priority 3: Executive Summary (Class 8 Layman's Terms) */}
                <section className="summary-section">
                  <div className="summary-header">
                    <div className="summary-title-row">
                      <Sparkles size={20} className="summary-icon" />
                      <h3>Layman Summary (Class 8 Reading Level)</h3>
                    </div>
                    <span className="summary-provider-pill">
                      Verified by: {analysis.provider_used.toUpperCase()}
                    </span>
                  </div>
                  <div className="summary-body">
                    <p className="summary-prose">{analysis.layman_summary}</p>
                  </div>
                </section>

                {/* Priority 4, 5, 6: Biomarker Result Cards Grid */}
                <section className="biomarkers-section">
                  <div className="section-title-row">
                    <Layers size={20} className="section-icon" />
                    <h3>Biomarker Results ({analysis.results.length})</h3>
                  </div>

                  <div className="biomarkers-grid">
                    {analysis.results.map((res, idx) => (
                      <BiomarkerCard key={idx} result={res} />
                    ))}
                  </div>
                </section>

                {/* Priority 8: Doctor Consultation Questions */}
                <DoctorQuestions
                  questions={analysis.doctor_questions}
                  disclaimer={analysis.disclaimer}
                  hasUrgent={analysis.has_urgent_values}
                />
              </>
            ) : null}
          </ErrorBoundary>
        </main>
      </div>

      {/* Priority 7: Interactive AI Lab Assistant */}
      <ChatAssistant
        key={activePatientObj?.patient_id}
        activePatient={activePatientObj}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Priority 1: Report Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
