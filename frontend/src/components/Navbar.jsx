import React from 'react';
import { Activity, Upload, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar({ providerStatus, onOpenUpload }) {
  const primaryProvider = providerStatus?.active_primary_provider || 'deterministic';
  const isDeterministic = primaryProvider === 'deterministic';

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="brand-logo">
            <Activity className="brand-icon" size={26} />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              CityLab <span className="brand-accent">Diagnostics</span>
            </div>
            <div className="brand-subtitle">
              Medical Lab Report Explainer • Tech Fusion '26
            </div>
          </div>
        </div>

        <div className="navbar-right">
          {/* Real-time System Status Pill */}
          <div className="system-pill" title="Certified Deterministic Classification Core Active">
            <span className="status-dot"></span>
            <span className="pill-text">14 Reports Loaded</span>
          </div>

          {/* AI Engine Provider Badge */}
          <div className="provider-pill" title={`Active Provider: ${primaryProvider}`}>
            {isDeterministic ? (
              <>
                <ShieldCheck size={16} className="provider-icon-shield" />
                <span className="pill-text">Deterministic Core (Offline Safe)</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="provider-icon-ai" />
                <span className="pill-text">{primaryProvider.toUpperCase()} AI Active</span>
              </>
            )}
          </div>

          {/* Upload Button */}
          <button className="upload-btn" onClick={onOpenUpload}>
            <Upload size={16} />
            <span>Upload Report</span>
          </button>
        </div>
      </div>
    </header>
  );
}
