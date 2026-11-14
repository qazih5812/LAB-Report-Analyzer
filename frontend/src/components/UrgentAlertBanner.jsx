import React from 'react';
import { ShieldAlert, ArrowDown } from 'lucide-react';

export default function UrgentAlertBanner({ warningText, onScrollToDoctorQuestions }) {
  if (!warningText) return null;

  return (
    <div className="urgent-banner">
      <div className="urgent-banner-icon-col">
        <ShieldAlert size={28} className="urgent-pulsing-icon" />
      </div>
      <div className="urgent-banner-content">
        <div className="urgent-banner-title">
          CRITICAL DANGEROUS VALUE DETECTED — URGENT MEDICAL ALERT
        </div>
        <p className="urgent-banner-text">
          {warningText}
        </p>
      </div>
      {onScrollToDoctorQuestions && (
        <button className="urgent-action-btn" onClick={onScrollToDoctorQuestions}>
          <span>View Doctor Questions</span>
          <ArrowDown size={14} />
        </button>
      )}
    </div>
  );
}
