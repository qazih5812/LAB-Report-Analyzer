import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  FileText,
  RotateCw,
  ShieldCheck
} from 'lucide-react';

export default function BiomarkerCard({ result }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    reported_test,
    canonical_test,
    reported_value,
    reported_unit,
    converted_value,
    converted_unit,
    conversion_applied,
    conversion_note,
    applicable_min,
    applicable_max,
    expected_range_display,
    status,
    is_urgent,
    urgent_trigger,
    is_boundary_value,
    source_file,
    status_reason,
  } = result;

  // Render Status Badge
  const renderStatusBadge = () => {
    switch (status) {
      case 'NORMAL':
        return (
          <span className="badge-status badge-normal">
            <CheckCircle2 size={13} />
            <span>NORMAL</span>
          </span>
        );
      case 'LOW':
        return (
          <span className="badge-status badge-low">
            <ArrowDown size={13} />
            <span>LOW</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="badge-status badge-high">
            <ArrowUp size={13} />
            <span>HIGH</span>
          </span>
        );
      case 'URGENT_LOW':
        return (
          <span className="badge-status badge-urgent">
            <AlertTriangle size={13} />
            <span>URGENT LOW</span>
          </span>
        );
      case 'URGENT_HIGH':
        return (
          <span className="badge-status badge-urgent">
            <AlertTriangle size={13} />
            <span>URGENT HIGH</span>
          </span>
        );
      case 'CANNOT_BE_CLASSIFIED':
      default:
        return (
          <span className="badge-status badge-unclassified">
            <HelpCircle size={13} />
            <span>CANNOT CLASSIFY</span>
          </span>
        );
    }
  };

  // Calculate percentage position for the visual range gauge
  const computeGaugePercent = () => {
    const val = converted_value !== null && converted_value !== undefined
      ? converted_value
      : (typeof reported_value === 'number' ? reported_value : parseFloat(reported_value));

    if (isNaN(val) || applicable_min === null || applicable_max === null) {
      return null;
    }

    const span = applicable_max - applicable_min;
    if (span <= 0) return 50;

    // Give 25% padding on both ends for out-of-range values
    const lowerDisplay = applicable_min - (span * 0.25);
    const upperDisplay = applicable_max + (span * 0.25);
    const totalDisplaySpan = upperDisplay - lowerDisplay;

    const clamped = Math.max(lowerDisplay, Math.min(upperDisplay, val));
    const percent = ((clamped - lowerDisplay) / totalDisplaySpan) * 100;
    return Math.min(100, Math.max(0, percent));
  };

  const gaugePercent = computeGaugePercent();
  const hasAlias = (reported_test || '').toLowerCase() !== (canonical_test || '').toLowerCase();

  return (
    <div className={`biomarker-card ${(status || 'cannot_be_classified').toLowerCase()}`}>
      {/* Top Header */}
      <div className="biomarker-card-header">
        <div>
          <div className="biomarker-title-row">
            <h3 className="biomarker-title">{canonical_test}</h3>
            {hasAlias && (
              <span className="biomarker-alias-badge">
                Reported as: <strong>{reported_test}</strong>
              </span>
            )}
          </div>
          <div className="biomarker-target-unit">
            Standard Reference: <strong>{expected_range_display}</strong>
          </div>
        </div>
        <div className="biomarker-header-actions">
          {renderStatusBadge()}
        </div>
      </div>

      {/* Numerical Value Display & Conversion Alert */}
      <div className="biomarker-value-section">
        <div className="value-box">
          <span className="value-number">{reported_value}</span>
          <span className="value-unit">{reported_unit || ''}</span>
        </div>

        {conversion_applied && (
          <div className="conversion-callout">
            <RotateCw size={14} className="conv-icon" />
            <div className="conv-text">
              <strong>Normalized for Standard Comparison:</strong> {converted_value} {converted_unit}
              <div className="conv-sub">{conversion_note}</div>
            </div>
          </div>
        )}

        {is_boundary_value && (
          <div className="boundary-callout">
            <ShieldCheck size={14} className="boundary-icon" />
            <span>
              <strong>Edge Case Match:</strong> Value sits exactly on boundary limit ({reported_value}). Classified as NORMAL per laboratory edge-case rule.
            </span>
          </div>
        )}
      </div>

      {/* Visual Range Gauge Bar */}
      {gaugePercent !== null && (
        <div className="gauge-container">
          <div className="gauge-labels">
            <span className="gauge-bound">Min: {applicable_min}</span>
            <span className="gauge-mid">Expected Normal Range</span>
            <span className="gauge-bound">Max: {applicable_max}</span>
          </div>

          <div className="gauge-track">
            {/* Zones: Low Zone (20%), Normal Zone (60%), High Zone (20%) */}
            <div className="gauge-zone gauge-zone-low"></div>
            <div className="gauge-zone gauge-zone-normal"></div>
            <div className="gauge-zone gauge-zone-high"></div>

            {/* Marker Indicator */}
            <div
              className={`gauge-marker ${status.toLowerCase()}`}
              style={{ left: `${gaugePercent}%` }}
              title={`Reported Value: ${converted_value || reported_value}`}
            >
              <div className="marker-pin"></div>
              <div className="marker-tag">{converted_value || reported_value}</div>
            </div>
          </div>
        </div>
      )}

      {/* Reason Preview */}
      <div className="biomarker-reason-preview">
        <span className="reason-label">Laboratory Finding:</span> {status_reason}
      </div>

      {/* Expandable "How We Checked" Accordion */}
      <div className="how-we-checked-section">
        <button
          className="how-we-checked-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="toggle-left">
            <FileText size={14} />
            <span>How We Checked (Clinical Audit Details)</span>
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isExpanded && (
          <div className="how-we-checked-drawer">
            <div className="audit-detail-row">
              <span className="audit-key">Authoritative Source:</span>
              <span className="audit-val source-code">{source_file}</span>
            </div>
            <div className="audit-detail-row">
              <span className="audit-key">Nomenclature Mapping:</span>
              <span className="audit-val">
                {hasAlias ? `Mapped alias '${reported_test}' to canonical analyte '${canonical_test}' (2_medical_glossary.md)` : `Canonical match '${canonical_test}'`}
              </span>
            </div>
            {conversion_applied && (
              <div className="audit-detail-row">
                <span className="audit-key">Unit Conversion Formula:</span>
                <span className="audit-val">{conversion_note}</span>
              </div>
            )}
            <div className="audit-detail-row">
              <span className="audit-key">Reference Interval Applied:</span>
              <span className="audit-val">{expected_range_display}</span>
            </div>
            <div className="audit-detail-row">
              <span className="audit-key">Boundary & Critical Rules:</span>
              <span className="audit-val">
                {is_urgent
                  ? `Triggered urgent threshold: ${urgent_trigger}`
                  : is_boundary_value
                  ? "Analytical value lies exactly on the range boundary limit -> Evaluated as NORMAL per 4_ranges_hematology.md."
                  : "Standard demographic interval evaluation."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
