import React from "react";
import {
  ShieldCheck,
  FileCheck2,
  FlaskConical,
} from "lucide-react";

export default function HowItWorksView({ onRunLiveAudit, onSelectTab }) {
  return (
    <div className="how-it-works-view">
      {/* Protocol Badge */}
      <div className="protocol-tag">
        <FlaskConical size={14} className="protocol-icon" />
        <span>Clinical Transparency Protocol v1.1</span>
      </div>

      {/* Main Hero Header */}
      <div className="how-it-works-hero">
        <div className="hero-text-block">
          <h1 className="hero-title">How CityLab Works</h1>
          <p className="hero-subtitle">
            Understand your laboratory reports with clinical precision, clear plain-language
            translations, and rigorous safety guardrails.
          </p>
        </div>

        <button
          onClick={onRunLiveAudit}
          className="btn-run-audit"
          title="Run deterministic verification on all 14 clinical reports"
        >
          <FileCheck2 size={18} />
          <span>Run Live 14/14 Self-Audit</span>
        </button>
      </div>

      {/* The Clinical Integrity Promise Card */}
      <div className="integrity-promise-card">
        <div className="promise-header">
          <div className="promise-icon-box">
            <ShieldCheck size={24} />
          </div>
          <div className="promise-title-group">
            <h2 className="promise-title">The Clinical Integrity Promise</h2>
            <span className="badge-hybrid">Deterministic + LLM Hybrid</span>
          </div>
        </div>

        <p className="promise-desc">
          CityLab bridges the cognitive gap between raw biochemical pathology and human comprehension.
          All numerical comparisons, unit conversions, alias lookups, and boundary rules are executed
          deterministically in Python against the certified corpus files, while the LLM writes empathetic
          Class-8 explanations strictly validated against diagnostic phrasing.
        </p>
      </div>

      {/* 4-Stage Architecture Grid */}
      <div className="stages-grid">
        {/* Stage 1 */}
        <div className="stage-card">
          <div className="stage-top-row">
            <span className="stage-number">01</span>
            <span className="stage-pill">Stage 1 of 4</span>
          </div>
          <h3 className="stage-title">Boilerplate Stripping & Parsing</h3>
          <p className="stage-desc">
            Isolates patient demographics and analytical results from 15 KB of repeated CLIA/HIPAA legal
            appendices, preserving patient privacy and eliminating token noise before clinical processing.
          </p>
          <div className="stage-footer-note">
            Regex Demographic Extractor • Zero Hallucination
          </div>
        </div>

        {/* Stage 2 */}
        <div className="stage-card">
          <div className="stage-top-row">
            <span className="stage-number">02</span>
            <span className="stage-pill">Stage 2 of 4</span>
          </div>
          <h3 className="stage-title">Glossary Alias & Unit Normalization</h3>
          <p className="stage-desc">
            Standardizes medical aliases (SGPT → ALT, SGOT → AST, FBS → Fasting Blood Sugar) via{" "}
            <code>2_medical_glossary.md</code> and converts conventional units (mg/dL → mmol/L, g/L → g/dL)
            using verified mathematical factors.
          </p>
          <div className="stage-footer-note">
            Deterministic Unit Converter • CLIA Standardized
          </div>
        </div>

        {/* Stage 3 */}
        <div className="stage-card">
          <div className="stage-top-row">
            <span className="stage-number">03</span>
            <span className="stage-pill">Stage 3 of 4</span>
          </div>
          <h3 className="stage-title">Age/Sex Reference Selection & Boundary Engine</h3>
          <p className="stage-desc">
            Cross-references certified physiological intervals from <code>3_normal_reference_ranges.md</code>{" "}
            and flags critical urgent thresholds from <code>4_urgent_thresholds.md</code>.
            Missing demographics are never guessed under Directive 3.
          </p>
          <div className="stage-footer-note">
            [min, max] Inclusive Interval Matcher • Urgent Preserved
          </div>
        </div>

        {/* Stage 4 */}
        <div className="stage-card">
          <div className="stage-top-row">
            <span className="stage-number">04</span>
            <span className="stage-pill">Stage 4 of 4</span>
          </div>
          <h3 className="stage-title">Empathetic Class-8 LLM Explanation with Guardrails</h3>
          <p className="stage-desc">
            Transforms verified numerical results into plain-language educational summaries. Guardrails
            strictly prevent diagnostic claims (Directive 2) and contextually lock conversation to the active encounter (Directive 1).
          </p>
          <div className="stage-footer-note">
            Gemini & Groq Fallback • Safe Medical Explanations
          </div>
        </div>
      </div>
    </div>
  );
}
