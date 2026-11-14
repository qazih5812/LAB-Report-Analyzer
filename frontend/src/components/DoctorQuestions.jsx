import React, { useState } from 'react';
import { Copy, Check, Stethoscope } from 'lucide-react';

export default function DoctorQuestions({ questions, disclaimer, hasUrgent }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!questions || questions.length === 0) return;
    const textToCopy = `Questions for My Doctor (CityLab Diagnostics):\n\n` +
      questions.map((q, idx) => `${idx + 1}. ${q}`).join('\n') +
      `\n\n${disclaimer}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`doctor-questions-card ${hasUrgent ? 'urgent-border' : ''}`} id="doctor-questions-section">
      <div className="doctor-questions-header">
        <div className="doctor-title-row">
          <div className="doctor-icon-box">
            <Stethoscope size={20} />
          </div>
          <div>
            <h3 className="doctor-title">Recommended Questions for Your Doctor</h3>
            <div className="doctor-subtitle">
              Take these tailored questions to your physician to discuss abnormal or borderline results.
            </div>
          </div>
        </div>

        <button className="copy-btn" onClick={handleCopy}>
          {copied ? (
            <>
              <Check size={14} className="copied-icon" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Questions</span>
            </>
          )}
        </button>
      </div>

      <div className="questions-list">
        {questions && questions.length > 0 ? (
          questions.map((q, idx) => (
            <div key={idx} className="question-item">
              <span className="question-number">{idx + 1}</span>
              <p className="question-text">{q}</p>
            </div>
          ))
        ) : (
          <p className="no-questions">No immediate physician questions generated. Results are completely normal.</p>
        )}
      </div>

      <div className="disclaimer-footer">
        <span className="disclaimer-badge">Medical Disclaimer:</span>
        <p className="disclaimer-text">{disclaimer}</p>
      </div>
    </div>
  );
}
