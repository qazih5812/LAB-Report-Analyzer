# CityLab Diagnostics — Medical Lab Report Explainer
**Tech Fusion '26 AI Hackathon — Problem Statement B**  
*Dual-Tier Deterministic Rules Engine & Layman Explanation Architecture*

[![Python](https://img.shields.io/badge/Python-3.10-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.3-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev)
[![Tests](https://img.shields.io/badge/Pytest-68%20Passed%20(100%25)-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

---

## Executive Overview
In clinical lab reporting, naive Retrieval-Augmented Generation (RAG) and LLM-only pipelines suffer from dangerous failure modes: mathematical hallucinations on decimal units, fabricated reference boundaries, unauthorized disease diagnoses, and patient privacy leaks.

**CityLab Explainer** solves this through a **dual-tier decoupled architecture**:
1. **Tier 1 (Deterministic Core):** 100% pure, certified algorithmic code enforces exact boundary rules (`4_ranges_hematology.md`), sex/age reference intervals, clinical unit conversions ($6.0\text{ mmol/L} \times 18.0 = 108.0\text{ mg/dL}$), and critical threshold alerts ($<7.0\text{ Hb}$, $>300\text{ Glucose}$). An LLM is never allowed to classify numerical values.
2. **Tier 2 (Grounded Explanation Layer):** Free-tier multi-provider LLM chain (Google Gemini Pro $\rightarrow$ Groq $\rightarrow$ OpenRouter $\rightarrow$ Rule-based Fallback) translates certified numbers into simple Class 8 (8th grade) everyday language.
3. **Safety & Privacy Guardrails:** Enforces the 4 Core Directives from `1_lab_safety_rules.md`:
   - **Directive 1 (Strict Context-Lock):** Refuses all queries referencing any external patient or database probing.
   - **Directive 2 (No Diagnostic Authority):** Strictly forbids claiming the patient has a disease (e.g. "you have diabetes"); attaches mandatory physician disclaimer.
   - **Directive 3 (Missing Demographics Protocol):** If age or sex is corrupted, halts classification and prompts the user rather than guessing from name or context clues.
   - **Directive 4 (Unknown Test Safety):** Unlisted tests (e.g., Serum Ferritin) return `CANNOT_BE_CLASSIFIED` with zero hallucination.

---

## Architectural Blueprint

```
                      LAB REPORT INPUT (Markdown / Ingestion)
                                        │
                                        ▼
             ┌───────────────────────────────────────────────────────┐
             │            PARSER & BOILERPLATE STRIPPER              │
             │   Strips 14KB CLIA/HIPAA noise -> Sections I & III    │
             └──────────────────────────┬────────────────────────────┘
                                        │
                                        ▼
             ┌───────────────────────────────────────────────────────┐
             │       TIER 1: DETERMINISTIC CLASSIFICATION CORE       │
             │  • Alias Normalizer (SGPT->ALT, FBS->Sugar, etc.)    │
             │  • Unit Converter (mmol/L * 18.0 -> mg/dL)            │
             │  • Boundary Validator (Limits = NORMAL)               │
             │  • Age/Sex Partitioner (18-100 yrs, Male/Female)      │
             │  • Urgent Evaluator (Hb<7.0, Sugar>300, etc.)         │
             └──────────────────────────┬────────────────────────────┘
                                        │ Certified Classifications
                                        ▼
             ┌───────────────────────────────────────────────────────┐
             │         TIER 2: GROUNDED EXPLANATION & CHAT           │
             │  Priority: Gemini Pro -> Groq -> OpenRouter -> Fallback│
             │  • Class 8 Layman Translation                         │
             │  • 3 to 5 Tailored Doctor Consultation Questions      │
             │  • Severe Warning ("see a doctor today")              │
             └──────────────────────────┬────────────────────────────┘
                                        │ Guardrail Sanitization
                                        ▼
             ┌───────────────────────────────────────────────────────┐
             │      PREMIUM HEALTHCARE DASHBOARD (React 19 + Vite)   │
             │  • 14-Patient Selector with Clinical Badges           │
             │  • Visual Biomarker Gauges & "How We Checked" Audits  │
             │  • Interactive Missing Demographic Resolver           │
             │  • Context-Locked Patient Assistant Drawer            │
             │  • Drag-and-Drop Custom Report Uploader               │
             └───────────────────────────────────────────────────────┘
```

---

## Verified 14-Patient Ground Truth Matrix

Every single simulated patient report provided in `lab_reports/` has been verified end-to-end:

| Patient ID | Patient Name | Key Clinical & Structural Anomaly | Ground Truth Status | Verification |
| :--- | :--- | :--- | :---: | :---: |
| **P001** | Alice Smith | All tests normal baseline (Hb 13.5, WBC 6,000) | `NORMAL` | Verified |
| **P002** | Bob Jones | SGPT 45 U/L (Female sex, upper limit = 45.0) | `NORMAL` (Boundary) | Verified |
| **P003** | Charlie Brown | Age & Sex corrupted (`[DATA CORRUPTED]`) | `CANNOT_BE_CLASSIFIED` | Prompts User |
| **P004** | Diana Prince | Critical Hb 6.5 g/dL ($< 7.0$), PLT 120,000 ($< 150\text{k}$) | `URGENT_LOW` + `LOW` | Alert Fired |
| **P005** | Ethan Hunt | Fasting Blood Sugar 6.0 mmol/L | `HIGH` ($108.0\text{ mg/dL}$) | Converted |
| **P006** | Fiona Gallagher | Serum Ferritin 25 ng/mL (Omitted from sheets) | `CANNOT_BE_CLASSIFIED` | No Hallucination |
| **P007** | George Costanza | TSH 2.5 mIU/L | `NORMAL` | Verified |
| **P008** | Haley Dunphy | Urine pH 5.5 (`NORMAL`), Urine Protein Negative | `NORMAL` (Qualitative) | Verified |
| **P009** | Ian Malcolm | ALT 85 U/L ($> 55$), AST 60 U/L ($> 48$) | `HIGH` (Non-urgent) | Verified |
| **P010** | Julia Child | Cholesterol 200 mg/dL (Upper boundary = 200) | `NORMAL` (Boundary) | Verified |
| **P011** | Kevin Hart | WBC 12,000 ($> 11\text{k}$), PLT 140,000 ($< 150\text{k}$) | `HIGH` + `LOW` | Verified |
| **P012** | Laura Croft | AST 44 U/L, Biological Sex `[NOT PROVIDED]` | `CANNOT_BE_CLASSIFIED` | Prompts Sex |
| **P013** | Michael Scott | Fasting Blood Sugar 350 mg/dL ($> 300\text{ mg/dL}$) | `URGENT_HIGH` | Alert Fired |
| **P014** | Nancy Drew | FBS 85 mg/dL (`NORMAL`), SGOT 22 U/L (`NORMAL`) | `NORMAL` (Multi-alias) | Verified |

---

## Quickstart & Execution

### Option 1: Native Local Run (Recommended)

#### Prerequisites
- Python 3.10+
- Node.js 18+

#### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at: `http://localhost:8000/docs`

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Dashboard will be live at: `http://localhost:5173`

---

### Option 2: Docker Containerization (1-Command Run)

In accordance with Hackathon Rulebook Section 2, the application includes a complete multi-container setup:
```bash
# Clone the repository
git clone https://github.com/qazih5812/LAB-Report-Analyzer.git
cd LAB-Report-Analyzer

# Boot full stack (Backend on :8000, Frontend on :3000)
docker-compose up --build
```
Access the application at: `http://localhost:3000`

---

### Option 3: Live Cloud Deployment

- **Frontend (Vercel / Netlify):** Pre-configured with `frontend/vercel.json` and `frontend/netlify.toml`.
  - Set Environment Variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`
- **Backend (Render / Railway):** Pre-configured with root `render.yaml`.
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Set Environment Variables: `GEMINI_API_KEY` (optional), `GROQ_API_KEY` (optional)

---

## Running the Automated Test Suite

The test suite contains 68 comprehensive unit, integration, and adversarial tests:
```bash
cd backend
python -m pytest -v
```

Execution output:
```text
============================= 68 passed in 2.38s ==============================
tests/test_adversarial.py .........................  (25 passed)
tests/test_api.py ..........                         (10 passed)
tests/test_classifier.py ..............              (14 passed)
tests/test_llm_layer.py ............                 (12 passed)
tests/test_parser.py .....                           (5 passed)
tests/test_privacy.py ....                           (4 passed)
```

---

## API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health, report count, and active provider status |
| `GET` | `/api/providers` | Real-time status of Gemini, Groq, OpenRouter, and Deterministic engine |
| `GET` | `/api/reports` | List all 14 simulated patient reports |
| `GET` | `/api/reports/{patient_id}` | Retrieve parsed demographics and raw test results for single patient |
| `POST` | `/api/analyze` | Executes deterministic classification, urgent checks, layman summary & doctor questions |
| `POST` | `/api/chat` | Context-locked patient Q&A assistant with prompt injection defense |
| `POST` | `/api/upload` | Parses uploaded markdown report and provides immediate analysis |

---

## Key Competition Documents
- [AUDIT.md](file:///c:/Users/GALLANT%20LAPTOPS/OneDrive/Desktop/TECHFUSION/City-Lab-AI-Hackathon/AUDIT.md): Comprehensive repository audit, edge-case matrix, and technical blueprint.
- [docs/KNOWN_FAILURE_CASES.md](file:///c:/Users/GALLANT%20LAPTOPS/OneDrive/Desktop/TECHFUSION/City-Lab-AI-Hackathon/docs/KNOWN_FAILURE_CASES.md): Independent QA Judge report documenting edge cases, discovered bugs, and fixes.
- [docs/DEMO.md](file:///c:/Users/GALLANT%20LAPTOPS/OneDrive/Desktop/TECHFUSION/City-Lab-AI-Hackathon/docs/DEMO.md): 2–3 minute video demonstration script and presentation guide.

---

## License
MIT License. Developed for Tech Fusion '26 Hackathon.
