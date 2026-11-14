import React, { useState } from 'react';
import { User, Search, AlertTriangle, AlertCircle } from 'lucide-react';

const PATIENT_HINTS = {
  P001: { tag: 'CBC (All Normal)', status: 'normal' },
  P002: { tag: 'SGPT / 45 Boundary', status: 'boundary' },
  P003: { tag: 'Corrupted Demographics', status: 'missing' },
  P004: { tag: 'Urgent Hb 6.5 g/dL', status: 'urgent' },
  P005: { tag: 'mmol/L Unit Conversion', status: 'conversion' },
  P006: { tag: 'Unknown Ferritin Test', status: 'unclassified' },
  P007: { tag: 'Endocrinology / TSH', status: 'normal' },
  P008: { tag: 'Urine pH & Protein', status: 'normal' },
  P009: { tag: 'High ALT & AST', status: 'high' },
  P010: { tag: 'Cholesterol 200 Boundary', status: 'boundary' },
  P011: { tag: 'High WBC / Low PLT', status: 'high' },
  P012: { tag: 'Missing Biological Sex', status: 'missing' },
  P013: { tag: 'Urgent Sugar 350 mg/dL', status: 'urgent' },
  P014: { tag: 'FBS & SGOT Aliases', status: 'normal' },
};

export default function PatientSelector({ reports, selectedId, onSelectPatient }) {
  const [filter, setFilter] = useState('');

  const filteredReports = reports.filter(r => {
    const text = `${r.patient_id} ${r.patient_name} ${r.mrn} ${PATIENT_HINTS[r.patient_id]?.tag || ''}`.toLowerCase();
    return text.includes(filter.toLowerCase());
  });

  return (
    <aside className="patient-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <User size={18} className="sidebar-title-icon" />
          <h3>Simulated Patients ({reports.length})</h3>
        </div>
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search patient, ID, or test..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="patient-list">
        {filteredReports.map((report) => {
          const isSelected = report.patient_id === selectedId;
          const hint = PATIENT_HINTS[report.patient_id] || { tag: 'Standard Report', status: 'normal' };

          return (
            <div
              key={report.patient_id}
              className={`patient-card ${isSelected ? 'selected' : ''} ${hint.status}`}
              onClick={() => onSelectPatient(report.patient_id)}
            >
              <div className="patient-card-header">
                <span className="patient-id-badge">{report.patient_id}</span>
                {hint.status === 'urgent' && (
                  <span className="badge-urgent-mini">
                    <AlertTriangle size={12} /> Urgent
                  </span>
                )}
                {hint.status === 'missing' && (
                  <span className="badge-missing-mini">
                    <AlertCircle size={12} /> Prompt Req
                  </span>
                )}
                {hint.status === 'boundary' && (
                  <span className="badge-boundary-mini">Boundary</span>
                )}
                {hint.status === 'conversion' && (
                  <span className="badge-conv-mini">Unit Conv</span>
                )}
              </div>

              <div className="patient-name">{report.patient_name}</div>
              <div className="patient-mrn">{report.mrn}</div>
              <div className="patient-hint-tag">{hint.tag}</div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
