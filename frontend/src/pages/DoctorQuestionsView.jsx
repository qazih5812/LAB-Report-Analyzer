import React, { useState } from "react";
import {
  Stethoscope,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { translations } from "../locales/translations";

export default function DoctorQuestionsView({
  analysisData,
  language = "en",
}) {
  const t = translations[language]?.doctorQuestions || translations.en.doctorQuestions;
  const [copied, setCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const questions = analysisData?.doctor_questions || [
    "What factors might have caused my out-of-range laboratory values?",
    "Do you recommend repeating these tests after a few weeks or ordering additional follow-up panels?",
    "Are there any immediate lifestyle, dietary, or medication adjustments I should make while waiting for next steps?",
  ];

  const abnormalBiomarkers = (analysisData?.results || []).filter(
    (r) => r.status !== "NORMAL"
  );

  const handleCopyAll = () => {
    const header = `CityLab Clinical Preparation Sheet\nPatient: ${analysisData?.patient_name || "Patient"} (MRN: ${analysisData?.mrn || "N/A"})\n\n`;
    const body = questions.map((q, i) => `${i + 1}. ${q}`).join("\n\n");
    const disclaimer = `\n\n${analysisData?.disclaimer || ""}`;
    navigator.clipboard.writeText(header + body + disclaimer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopySingle = (q, idx) => {
    navigator.clipboard.writeText(q);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto print:p-0 print:m-0">
      {/* Header Banner */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4" />
            <span>Clinical Appointment Preparation</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs border border-border transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t.copied : t.copyAll}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printSheet}</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Card */}
      <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Printable Top Patient Header */}
        <div className="border-b border-border pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-teal-700 dark:text-teal-400">CityLab</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 font-mono font-bold">
                Doctor Prep Sheet
              </span>
            </div>
            <h3 className="text-lg font-bold text-foreground mt-1">
              {analysisData?.patient_name || "Active Patient"}
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              MRN: {analysisData?.mrn || "CLD-9942"} • Encounter: {analysisData?.patient_id || "P001"}
            </span>
          </div>

          <div className="text-start sm:text-end text-xs text-muted-foreground space-y-0.5">
            <div>Age: <strong>{analysisData?.demographics?.age ?? "Not provided"}</strong></div>
            <div>Sex: <strong>{analysisData?.demographics?.sex ?? "Not provided"}</strong></div>
            <div>Generated: <strong>{new Date().toLocaleDateString()}</strong></div>
          </div>
        </div>

        {/* Identified Out-of-Range Biomarkers Section */}
        {abnormalBiomarkers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Out-of-Range Biomarkers Identified for Discussion</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {abnormalBiomarkers.map((b, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between
                    ${b.is_urgent
                      ? "bg-red-500/10 border-red-500/30 text-red-950 dark:text-red-200"
                      : "bg-secondary/60 border-border text-foreground"
                    }
                  `}
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold block truncate">{b.canonical_test}</span>
                    <span className="text-[11px] text-muted-foreground">
                      Reported: {b.reported_value} {b.reported_unit || ""} (Ref: {b.expected_range_display})
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0
                      ${b.is_urgent
                        ? "bg-red-600 text-white"
                        : b.status === "LOW"
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                        : "bg-purple-500/20 text-purple-700 dark:text-purple-400"
                      }
                    `}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctor Questions List */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>Formulated Questions for Physician Consultation</span>
          </h4>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="group p-4 rounded-xl bg-card border border-border hover:border-teal-500/40 transition-all flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-600/10 text-teal-700 dark:text-teal-400 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-foreground font-medium leading-relaxed">
                    {q}
                  </p>
                </div>

                <button
                  onClick={() => handleCopySingle(q, idx)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-teal-600 hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 print:hidden"
                  title="Copy question"
                >
                  {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Printable Footer Disclaimer */}
        <div className="pt-4 border-t border-border/60 text-[11px] text-muted-foreground leading-relaxed italic">
          <p>
            {analysisData?.disclaimer ||
              "NOTICE: This lab report explainer is for educational purposes only. Only a licensed physician can diagnose medical conditions or make treatment determinations."}
          </p>
        </div>
      </div>
    </div>
  );
}
