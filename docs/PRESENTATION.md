# CityLab Diagnostics — Medical Lab Report Explainer
## Tech Fusion '26 Hackathon Presentation Deck (Problem Statement B)

---

### Slide 1: Title & Executive Overview

**Title:** CityLab Diagnostics — Clinical AI Suite  
**Subtitle:** Bridging the Cognitive Gap Between Biochemical Pathology and Human Comprehension  
**Track:** Tech Fusion '26 Hackathon — Problem Statement B  
**Author:** Qazi Huzaifa  
**Live Stack:** React 19 (Vite) + FastAPI (Python 3.10) + Gemini / Groq Vision Hybrid  
**Core Motto:** *“Deterministic Mathematics for Clinical Safety, Generative AI for Human Empathy.”*

#### Key Highlights:
- **Two-Tier Hybrid Architecture:** Zero-hallucination numerical classification in Python; empathetic Class-8 reading level explanations in LLM.
- **Multimodal Ingestion:** Instant parsing of PDF reports, camera images/scans (PNG/JPG), and structured markdown.
- **Multilingual & Voice Accessibility:** English, Urdu (اردو), Roman Urdu, and Arabic (العربية) with in-browser Speech-to-Text and Text-to-Speech.
- **Audited Precision:** 14/14 automated self-audit verification suite + 73/73 unit & adversarial tests passing.

---

### Slide 2: The Problem: The Danger of Pure LLMs in Healthcare

**Headline:** Why Pure Generative AI Fails in Diagnostic Pathology

#### The Clinical Gap:
- **Patient Anxiety & Incomprehension:** Over 80% of patients cannot interpret lab units (`mmol/L`, `cells/mcL`, `U/L`) or age/sex-specific reference intervals.
- **The LLM Hallucination Trap:** Pure generative models frequently:
  1. Hallucinate numerical boundaries (e.g., claiming 45.0 U/L is HIGH when normal range is 0–45).
  2. Confuse biological sex (e.g., evaluating a female named "Bob" against male reference ranges).
  3. Silently drop urgent red flags or invent medical diagnoses without clinical disclaimers.
  4. Leak confidential patient encounters when prompted adversarially.

#### The CityLab Solution:
- Decouple **clinical math** from **natural language generation**.
- Never permit an LLM to classify numbers or reference ranges.

---

### Slide 3: System Architecture: 4-Stage Clinical Pipeline

**Headline:** The Clinical Transparency Protocol v1.1

```
Raw Report (PDF / Image / Text)
               │
               ▼
   [Stage 1: Demographic Extractor & Appendix Stripper]
   • Strips 15KB CLIA/HIPAA boilerplate legal noise
   • Extracts Name, MRN, Age, Biological Sex, Date
               │
               ▼
   [Stage 2: Medical Glossary & Unit Normalizer]
   • Alias resolution (SGPT → ALT, SGOT → AST, FBS → Glucose)
   • Mathematical conversion (6.0 mmol/L × 18.0 = 108.0 mg/dL)
               │
               ▼
   [Stage 3: Age/Sex Reference & Deterministic Rules Engine]
   • Exact boundary evaluation (<= high limit is NORMAL)
   • Missing demographic safety (flagged as Unclassified)
   • Urgent critical threshold detection (Panic Alerts)
               │
               ▼
   [Stage 4: Guardrailed LLM Translation & Multimodal Voice]
   • Class-8 reading level layman summaries
   • Multilingual translation (EN, Urdu, Roman Urdu, Arabic)
   • Proactive doctor questions & context-isolated assistant
```

---

### Slide 4: Deterministic Rules Engine & Boundary Precision

**Headline:** Mathematical Rigor Where Hallucination Means Harm

#### Core Rules Enforced in Python:
1. **Exact Boundary Inclusivity:**
   - Standard clinical pathology states range limits are **inclusive**.
   - *Example (Patient P002 - Bob Jones):* ALT is `45.0 U/L`. Female upper limit is `45.0 U/L`. Status is deterministically locked to `NORMAL (Boundary)`.
2. **Biological Sex vs Name Resolution:**
   - Evaluates physiological ranges strictly by recorded biological sex, never social naming conventions.
3. **Unit Normalization with Formula Display:**
   - *Example (Patient P005 - Ethan Hunt):* Reported `6.0 mmol/L` Fasting Blood Sugar. Multiplied by certified factor `18.0` $\rightarrow$ `108.0 mg/dL` $\rightarrow$ Classified as `HIGH`. Formula and factor displayed transparently.
4. **Missing Demographics Safety:**
   - If age or sex is missing from the report, age/sex-dependent tests (e.g., Creatinine, Hemoglobin) are safely held as `UNCLASSIFIED` until confirmed by user.

---

### Slide 5: Multimodal Ingestion Engine (PDF, Image, Text)

**Headline:** Zero-Friction Lab Report Ingestion

#### Supported Document Formats:
- **PDF Documents:** Processed via `pypdf` streams, isolating analytical tables and legal notices.
- **Photos & Mobile Scans:** PNG, JPG, JPEG, WebP processed via Gemini Vision / Groq Vision OCR to reconstruct structured lab encounters.
- **Plain Text & Markdown:** Direct drag-and-drop parsing with live regex extraction.

#### Live Ingestion Features:
- Drag-and-drop modern upload modal with image preview.
- Real-time demographic isolation and verification against repository.
- Automatic creation of fresh patient encounters without server restart.

---

### Slide 6: Multilingual AI Assistant with In-Browser Voice

**Headline:** Breaking Language & Literacy Barriers in Healthcare

#### 4-Language Healthcare Intelligence:
- **English:** Clean, professional Class-8 plain-language summaries.
- **Urdu (اردو):** Native Nastaliq typography with right-to-left layout (`dir="rtl"`).
- **Roman Urdu:** Colloquial phonetic phrasing familiar to millions across South Asia (*"Aapke reports me ALT thora high hai..."*).
- **Arabic (العربية):** Full right-to-left support with certified medical vocabulary.

#### In-Browser Voice Engine:
- **Voice Input (STT):** In-browser speech recognition allowing patients to ask questions hands-free.
- **Voice Output (TTS):** Language-aware Text-to-Speech reading clinical summaries aloud with pause/stop controls.
- **Trusted Medical Citations:** Proactively provides educational links to WHO, MedlinePlus, and NHS.

---

### Slide 7: Clinical Safety Guardrails & Patient Privacy

**Headline:** Directives 1 to 4: Ethical, Legal, and Safe AI

#### 1. Patient Context Lock (Directive 1):
- The assistant is cryptographically scoped to the **currently active patient**.
- *Adversarial Test:* If a user asks *"What did Bob Jones score on his test?"* while viewing Diana Prince, the AI strictly refuses:
  > *"Privacy Refusal: Under Directive 1, I cannot disclose information regarding other patients."*

#### 2. Strict Non-Diagnostic Mandate:
- Explains what elevated biomarkers mean physiologically.
- Never diagnoses disease (e.g., *"You have diabetes"* $\rightarrow$ Forbidden).
- Never prescribes medications or dosages.

#### 3. Urgent Alert & Triage Guidance:
- Critical thresholds (e.g., Potassium < 2.5 or > 6.5, Glucose > 300) trigger a prominent red banner with urgent instructions: *"Please contact your healthcare provider or visit urgent care today."*

#### 4. Pre-Generated Doctor Questions:
- Automatically arms the patient with 3–5 targeted questions for their physician appointment.

---

### Slide 8: Automated Self-Audit & Quality Assurance

**Headline:** 100% Deterministic Pass Rate Across All 14 Benchmark Reports

| Encounter ID | Patient Name | Demographics | Tests | Normal / Abnormal | Urgent Status | Audit Pass |
|:---|:---|:---|:---:|:---:|:---:|:---:|
| **P001** | Alice Smith | 34 F | 8 | 8N / 0Ab | Normal Bounds | **PASS (100%)** |
| **P002** | Bob Jones | 45 F | 6 | 6N / 0Ab | Boundary Handled | **PASS (100%)** |
| **P003** | Charlie Brown | 28 M | 7 | 5N / 2Ab | Normal Bounds | **PASS (100%)** |
| **P004** | Diana Prince | 52 F | 8 | 4N / 4Ab | **URGENT (K+ Panic)** | **PASS (100%)** |
| **P005** | Ethan Hunt | 39 M | 6 | 4N / 2Ab | Unit Converted | **PASS (100%)** |
| **P008** | Hannah Abbott | 19 F | 7 | 3N / 4Ab | **URGENT (Plt Panic)** | **PASS (100%)** |
| **P009** | Ian Malcolm | Missing Sex | 6 | Unclassified | Demographics Held | **PASS (100%)** |

- **Audit Suite:** Real-time `/api/audit` endpoint and frontend Live Audit View.
- **Backend Test Coverage:** 73/73 tests passing in 5.08s (adversarial, boundary, unit, privacy, parser, LLM fallback).

---

### Slide 9: Production Engineering & Render Deployment

**Headline:** Enterprise-Grade Architecture Ready for Production

#### Multi-Stage Dockerfile:
- **Stage 1 (Node.js 20):** Builds optimized React SPA with Vite (`dist/index.html` + chunked bundles).
- **Stage 2 (Python 3.10 Slim):** Lightweight container hosting FastAPI + Uvicorn with static asset mounting.
- **Environment Driven:** Respects dynamic `$PORT` for Render, Heroku, AWS ECS, or Fly.io.

#### Security & Compliance:
- Zero hardcoded API keys; `.env` excluded via `.dockerignore` and `.gitignore`.
- Fallback deterministic mock mode ensures 100% offline uptime even if LLM quotas expire.
- CORS restricted to authenticated origins.

---

### Slide 10: Summary & Hackathon Evaluation Checklist

**Headline:** CityLab Diagnostics — Delivering on Every Problem Requirement

| Hackathon Requirement | CityLab Implementation | Verification Status |
|:---|:---|:---:|
| **1. Report Ingestion** | Markdown, Text, PDF streams, Image Vision OCR | **VERIFIED (Live)** |
| **2. Patient Selection** | Dedicated 15-patient sidebar repository | **VERIFIED (Live)** |
| **3. Report Summary** | Class-8 empathetic layman summary | **VERIFIED (Live)** |
| **4. Biomarker Cards** | Filterable grid with range bars & status pills | **VERIFIED (Live)** |
| **5. Indicators** | Normal / Low / High / Urgent badges | **VERIFIED (Live)** |
| **6. "How We Checked"** | Expandable mathematical conversion & rule source | **VERIFIED (Live)** |
| **7. AI Lab Assistant** | Multilingual chat + voice input/output | **VERIFIED (Live)** |
| **8. Doctor Questions** | Proactive appointment guidance | **VERIFIED (Live)** |
| **9. Safety & Privacy** | Strict context isolation & refusal under Directive 1 | **VERIFIED (Live)** |
| **10. Responsive Design** | Mobile drawer + desktop sidebar layout | **VERIFIED (Live)** |

**Live GitHub Repository:** `https://github.com/qazih5812/LAB-Report-Analyzer.git`  
**Ready for Judging & Live Demonstration.**
