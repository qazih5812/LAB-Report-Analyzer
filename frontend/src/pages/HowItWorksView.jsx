import React from "react";
import {
  ShieldCheck,
  FileCheck2,
  FileText,
  RotateCw,
  Cpu,
  Bot,
  FlaskConical,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function HowItWorksView({ onRunLiveAudit, onSelectTab }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Protocol Tag */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
        <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Clinical Transparency Protocol v1.1</span>
      </div>

      {/* Main Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            How CityLab Works
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Understand your laboratory reports with clinical precision, clear plain-language
            translations, and rigorous safety guardrails.
          </p>
        </div>

        <button
          onClick={onRunLiveAudit}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#00594C] hover:bg-[#00473c] text-white font-bold text-sm shadow-md shadow-[#00594C]/20 transition-all hover:scale-[1.02] shrink-0"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Run Live 14/14 Self-Audit</span>
        </button>
      </div>

      {/* Clinical Integrity Promise Card */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-700 dark:text-teal-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-bold text-foreground">
              The Clinical Integrity Promise
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
              Deterministic + LLM Hybrid
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          CityLab bridges the cognitive gap between raw biochemical pathology and human comprehension.
          All numerical comparisons, unit conversions, alias lookups, and boundary rules are executed
          deterministically in Python against the certified corpus files, while the LLM writes empathetic
          Class-8 explanations strictly validated against diagnostic phrasing.
        </p>
      </div>

      {/* 4-Stage Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stage 1 */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-3 hover:border-teal-500/40 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-black text-teal-700 dark:text-teal-400 font-mono">01</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                Stage 1 of 4
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">
              Boilerplate Stripping & Parsing
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Isolates patient demographics and analytical results from 15 KB of repeated CLIA/HIPAA legal
              appendices, preserving patient privacy and eliminating token noise before clinical processing.
            </p>
          </div>
          <div className="text-[11px] text-teal-600 font-mono font-medium pt-2 border-t border-border/50">
            Regex Demographic Extractor • Zero Hallucination
          </div>
        </div>

        {/* Stage 2 */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-3 hover:border-teal-500/40 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-black text-teal-700 dark:text-teal-400 font-mono">02</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                Stage 2 of 4
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">
              Glossary Alias & Unit Normalization
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Standardizes medical aliases (SGPT → ALT, SGOT → AST, FBS → Fasting Blood Sugar) via
              <code className="mx-1 px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono">2_medical_glossary.md</code>
              and converts conventional units (mg/dL → mmol/L, g/L → g/dL) using verified mathematical factors.
            </p>
          </div>
          <div className="text-[11px] text-teal-600 font-mono font-medium pt-2 border-t border-border/50">
            Deterministic Unit Converter • CLIA Standardized
          </div>
        </div>

        {/* Stage 3 */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-3 hover:border-teal-500/40 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-black text-teal-700 dark:text-teal-400 font-mono">03</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                Stage 3 of 4
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">
              Age/Sex Reference Selection & Boundary Engine
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Cross-references certified physiological intervals from <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono">3_normal_reference_ranges.md</code>
              and flags critical urgent thresholds from <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono">4_urgent_thresholds.md</code>.
              Missing demographics are never guessed under Directive 3.
            </p>
          </div>
          <div className="text-[11px] text-teal-600 font-mono font-medium pt-2 border-t border-border/50">
            [min, max] Inclusive Interval Matcher • Urgent Preserved
          </div>
        </div>

        {/* Stage 4 */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-3 hover:border-teal-500/40 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-black text-teal-700 dark:text-teal-400 font-mono">04</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                Stage 4 of 4
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">
              Empathetic Class-8 LLM Explanation with Guardrails
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Transforms verified numerical results into plain-language educational summaries. Guardrails strictly
              prevent diagnostic claims (Directive 2) and contextually lock conversation to the active encounter (Directive 1).
            </p>
          </div>
          <div className="text-[11px] text-teal-600 font-mono font-medium pt-2 border-t border-border/50">
            Gemini & Groq Fallback • Safe Medical Explanations
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900/10 to-emerald-900/10 border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-foreground text-sm">Ready to explore patient reports?</h4>
          <p className="text-xs text-muted-foreground">Access all 14 clinical encounters or test your own custom lab file.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab("dashboard")}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            Open Dashboard
          </button>
          <button
            onClick={onRunLiveAudit}
            className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border transition-colors"
          >
            Run 14/14 Audit
          </button>
        </div>
      </div>
    </div>
  );
}
