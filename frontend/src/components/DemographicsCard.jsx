import React, { useState } from 'react';
import { User, AlertCircle, RefreshCw, Check } from 'lucide-react';

export default function DemographicsCard({ analysis, onApplyOverride, onResetOverride }) {
  const { patient_name, mrn, demographics, demographics_missing, demographics_prompt } = analysis;

  const [inputAge, setInputAge] = useState(
    demographics?.age !== null && demographics?.age !== undefined ? demographics.age : ''
  );
  const [inputSex, setInputSex] = useState(demographics?.sex || '');

  const isOverridden = demographics?.age_overridden || demographics?.sex_overridden;

  const handleSave = (e) => {
    e.preventDefault();
    const ageNum = inputAge !== '' ? parseInt(inputAge, 10) : null;
    const sexVal = inputSex !== '' ? inputSex : null;
    onApplyOverride(ageNum, sexVal);
  };

  return (
    <div className="demographics-card">
      <div className="demographics-header">
        <div className="patient-hero">
          <div className="patient-avatar">
            <User size={24} />
          </div>
          <div>
            <h2 className="patient-hero-name">{patient_name}</h2>
            <div className="patient-hero-meta">
              <span><strong>MRN:</strong> {mrn}</span>
              <span className="dot-divider">•</span>
              <span><strong>Encounter ID:</strong> {patient_id}</span>
              <span className="dot-divider">•</span>
              <span><strong>Issued:</strong> 2026-11-13</span>
            </div>
          </div>
        </div>

        <div className="demographics-status-tags">
          <div className="demo-tag">
            <span className="demo-label">Age:</span>
            <span className={`demo-value ${demographics?.is_age_missing ? 'missing' : ''}`}>
              {demographics?.age !== null && demographics?.age !== undefined ? `${demographics.age} yrs` : 'Missing / Corrupted'}
            </span>
          </div>
          <div className="demo-tag">
            <span className="demo-label">Biological Sex:</span>
            <span className={`demo-value ${demographics?.is_sex_missing ? 'missing' : ''}`}>
              {demographics?.sex || 'Not Provided'}
            </span>
          </div>
          {isOverridden && (
            <span className="override-badge" title="User manually supplied missing demographics">
              <Check size={12} /> Overridden
            </span>
          )}
        </div>
      </div>

      {/* Missing Demographics Interactive Resolver (Safety Directive 3) */}
      {demographics_missing && (
        <div className="demographics-resolver-box">
          <div className="resolver-icon-col">
            <AlertCircle size={22} className="resolver-icon" />
          </div>
          <div className="resolver-content">
            <div className="resolver-title">
              Action Required: Missing Demographics Protocol (Safety Directive 3)
            </div>
            <p className="resolver-desc">
              {demographics_prompt || "Reference ranges depend strictly on age and biological sex. The lab cannot guess without demographic info."}
            </p>

            <form className="resolver-form" onSubmit={handleSave}>
              <div className="resolver-field">
                <label>Patient Age (18-100 yrs):</label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  placeholder="e.g. 35"
                  value={inputAge}
                  onChange={(e) => setInputAge(e.target.value)}
                  required
                />
              </div>

              <div className="resolver-field">
                <label>Biological Sex:</label>
                <select
                  value={inputSex}
                  onChange={(e) => setInputSex(e.target.value)}
                  required
                >
                  <option value="">Select Sex...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <button type="submit" className="resolver-btn">
                Apply & Re-classify
              </button>
            </form>
          </div>
        </div>
      )}

      {/* If already overridden, show reset option */}
      {isOverridden && !demographics_missing && (
        <div className="override-info-strip">
          <span>
            Using manual demographic override: Age={demographics.age}, Sex={demographics.sex}.
          </span>
          <button className="reset-override-btn" onClick={onResetOverride}>
            <RefreshCw size={12} /> Reset to Report Raw Demographics
          </button>
        </div>
      )}
    </div>
  );
}
