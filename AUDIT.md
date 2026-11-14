# AUDIT.md — Comprehensive Repository Audit & Architectural Blueprint
**Project:** Tech Fusion '26 — Problem B: Medical Lab Report Explainer  
**Organization:** CityLab Diagnostics  
**Author:** Senior AI Engineer, Data Scientist, Backend Architect, QA Engineer & Hackathon Technical Lead  
**Timestamp:** 2026-11-14T11:55:00+05:00  

---

## Executive Summary
This document delivers an exhaustive technical audit of the CityLab Diagnostics repository provided for Tech Fusion '26 (Problem Statement B: Medical Lab Report Explainer). It provides a full catalog of repository assets, clinical parameters, edge case evaluations for all 14 simulated patient reports, disambiguation of implicit vs. explicit rules, and a complete engineering development plan for implementation.

---

## 1. Complete Repository Structure

The workspace consists of a root project repository containing hackathon competition documentation and a cloned organizer repository (`City-Lab-AI-Hackathon`):

```text
c:\Users\GALLANT LAPTOPS\OneDrive\Desktop\TECHFUSION\
├── AI Hackathon-final.docx                       # Official competition handbook & challenge statements
├── Tech Fusion '26 AI Hackathon - Final Rulebook.pdf # Scoring criteria, submission instructions & rules
├── AUDIT.md                                     # This authoritative audit & design document
└── City-Lab-AI-Hackathon/                       # Cloned organizer repository (origin: techfusionmanagement-svg)
    ├── README.md                                # Problem B overview, RAG warnings & hackathon checkpoints
    ├── package.json                             # Root Node package config (lucide-react, react-router-dom)
    ├── package-lock.json                        # Root lockfile
    ├── lab_reports/                             # 20 markdown files containing corpus & boilerplate
    │   ├── 1_lab_safety_rules.md                # 4 Core Operational Directives + CLIA/HIPAA boilerplate
    │   ├── 2_medical_glossary.md                # Nomenclature & alias mappings + boilerplate
    │   ├── 3_dangerous_urgent_values.md         # Critical threshold table + boilerplate
    │   ├── 4_ranges_hematology.md               # Hematology reference intervals & boundary rules + boilerplate
    │   ├── 5_ranges_biochemistry.md             # Biochemistry reference table + boilerplate
    │   ├── 6_ranges_thyroid_urine.md            # Endocrinology & urinalysis reference ranges + boilerplate
    │   ├── report_P001_Alice_Smith_CBC.md       # Baseline normal CBC
    │   ├── report_P002_Bob_Jones_Liver.md       # SGPT alias, boundary edge case, sex vs name trap
    │   ├── report_P003_Charlie_Brown_Sugar_NoDemo.md # Corrupted demographics ([DATA CORRUPTED])
    │   ├── report_P004_Diana_Prince_Hem_Urgent.md    # Critical urgent low Hb (< 7.0 g/dL) + low PLT
    │   ├── report_P005_Ethan_Hunt_Sugar_UnitConv.md  # Unit mismatch: Fasting Blood Sugar in mmol/L
    │   ├── report_P006_Fiona_UnknownTest.md     # Unclassified test: Serum Ferritin
    │   ├── report_P007_George_Thyroid.md        # Normal TSH
    │   ├── report_P008_Haley_Urine.md           # Qualitative Urine Protein (Negative) + Urine pH
    │   ├── report_P009_Ian_Liver_High.md        # Elevated ALT & AST (non-urgent high)
    │   ├── report_P010_Julia_Cholesterol.md     # Cholesterol exactly at boundary (200 mg/dL -> Normal)
    │   ├── report_P011_Kevin_CBC.md             # High WBC + Low PLT (mild abnormalities)
    │   ├── report_P012_Laura_AST_MissingSex.md  # Missing biological sex ([NOT PROVIDED]), AST 44 U/L
    │   ├── report_P013_Michael_Sugar_Urgent.md  # Critical urgent high glucose (350 mg/dL > 300)
    │   └── report_P014_Nancy_Multiple.md        # Multiple aliases: FBS & SGOT
    └── frontend/                                # Starter React frontend
        ├── index.html                           # Single page entry HTML
        ├── package.json                         # Frontend dependencies (React 19.3.1, Vite 8.3.6, Oxlint)
        ├── package-lock.json                    # Lockfile
        ├── vite.config.js                       # Vite React config
        ├── .oxlintrc.json                       # Oxlint configuration
        ├── README.md                            # Vite starter documentation
        ├── public/
        │   ├── favicon.svg
        │   └── icons.svg
        └── src/
            ├── App.jsx                          # Default Vite boilerplate counter
            ├── App.css                          # Boilerplate styling
            ├── main.jsx                         # React entrypoint
            ├── index.css                        # Global typography
            └── assets/
                ├── hero.png
                ├── react.svg
                └── vite.svg
```

### Key Observation on Corpus Files:
Every `.md` file in `lab_reports/` contains between 12,000 and 15,140 bytes. The genuine clinical payload occupies only the first 250 to 1,350 bytes. The remainder of every single file consists of 3 to 4 identical appended sections titled `### APPENDIX X: EXTENDED DOCUMENTATION`, reproducing identical CLIA 1988 regulatory text, Beer-Lambert spectrophotometry equations, Westgard multi-rules (1_2s, 1_3s, 2_2s), and HIPAA compliance boilerplate. This noise was deliberately added by the organizers to simulate messy real-world electronic health record (EHR) environments and challenge naive RAG implementations.

---

## 2. Existing Frontend and Backend Technology

| Component | Current Technology Stack | Version / Details | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.3.1` (via `@vitejs/plugin-react` `^6.1.2`) | Scaffold only (Vite starter) |
| **Build Tool & Dev Server**| Vite | `^8.3.6` | Functional dev server |
| **Routing** | React Router DOM | `^7.18.5` (installed, not yet wired in `App.jsx`) | Installed dependency |
| **Icons** | Lucide React | `^1.73.0` | Installed dependency |
| **Linter** | Oxlint | `^1.90.0` | Installed devDependency |
| **Styling** | Vanilla CSS (`App.css`, `index.css`) | Custom styling, no CSS framework installed | Boilerplate only |
| **Backend Framework** | **None** | **0 backend files present** | **Missing** |
| **API Server** | **None** | No server process configured | **Missing** |
| **Database / Vector Store**| **None** | No persistence configured | **Missing** |
| **Runtime Environment** | Node.js (v20+) & Python 3.10.11 | Available on host machine | Host verified |

---

## 3. Existing API Endpoints and Schemas

- **Existing Endpoints:** `0`
- **Existing Schemas:** `0`
- **Status:** The organizer repository provides only a client-side starter and markdown files. No backend or REST/GraphQL endpoints exist. All API contracts must be designed and implemented from scratch.

---

## 4. Patient Reports and Patient ID Registry

All 14 patient reports were issued on `2026-11-13` by CityLab Diagnostics.

| Patient ID | MRN | Full Name | Age | Sex | File Name | Tests Reported & Raw Values | Clinical / Structural Anomaly |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **P001** | `CLD-P001-9942` | Alice Smith | 28 | Female | `report_P001_Alice_Smith_CBC.md` | Hemoglobin: 13.5 g/dL<br>WBC: 6000 cells/mcL | All tests completely normal baseline |
| **P002** | `CLD-P002-9942` | Bob Jones | 35 | Female | `report_P002_Bob_Jones_Liver.md` | SGPT: 45 U/L | **Sex vs Name Trap**: Male name, female biological sex. **Alias**: SGPT = ALT. **Boundary edge case**: 45 U/L is exactly upper normal limit for females. |
| **P003** | `CLD-P003-9942` | Charlie Brown | Corrupted | Corrupted | `report_P003_Charlie_Brown_Sugar_NoDemo.md` | Fasting Blood Sugar: 110 mg/dL | **Missing Demographics**: `[DATA CORRUPTED]` for age & sex. Must refuse classification and ask user. |
| **P004** | `CLD-P004-9942` | Diana Prince | 42 | Female | `report_P004_Diana_Prince_Hem_Urgent.md` | Hemoglobin: 6.5 g/dL<br>Platelet Count: 120000 cells/mcL | **Critical Urgent Alert**: Hb < 7.0 g/dL (6.5) triggers urgent doctor warning. Platelets low (120k < 150k). |
| **P005** | `CLD-P005-9942` | Ethan Hunt | 50 | Male | `report_P005_Ethan_Hunt_Sugar_UnitConv.md` | Fasting Blood Sugar: 6.0 mmol/L | **Unit Mismatch**: Reported in mmol/L; standard range is mg/dL. Converted: ~108 mg/dL (High). |
| **P006** | `CLD-P006-9942` | Fiona Gallagher | 22 | Female | `report_P006_Fiona_UnknownTest.md` | Serum Ferritin: 25 ng/mL | **Unknown Test**: Serum Ferritin is absent from all range sheets. Must state cannot be classified from files. |
| **P007** | `CLD-P007-9942` | George Costanza | 65 | Male | `report_P007_George_Thyroid.md` | TSH: 2.5 mIU/L | Normal thyroid function |
| **P008** | `CLD-P008-9942` | Haley Dunphy | 19 | Female | `report_P008_Haley_Urine.md` | pH Level: 5.5<br>Protein: Negative | **Qualitative Urine Result**: Protein is Negative. pH Level maps to Urine pH. |
| **P009** | `CLD-P009-9942` | Ian Malcolm | 48 | Male | `report_P009_Ian_Liver_High.md` | ALT: 85 U/L<br>AST: 60 U/L | **Elevated Liver Enzymes**: Both ALT (85 > 55) and AST (60 > 48) elevated, but below urgent limits. |
| **P010** | `CLD-P010-9942` | Julia Child | 55 | Female | `report_P010_Julia_Cholesterol.md` | Cholesterol: 200 mg/dL | **Boundary Edge Case**: Exactly 200 mg/dL (upper limit is 200). Must be classified as NORMAL. |
| **P011** | `CLD-P011-9942` | Kevin Hart | 40 | Male | `report_P011_Kevin_CBC.md` | WBC: 12000 cells/mcL<br>PLT: 140000 cells/mcL | **Multi-abnormality CBC**: WBC high (12k > 11k), PLT low (140k < 150k, but above urgent 50k). |
| **P012** | `CLD-P012-9942` | Laura Croft | 32 | Not Provided | `report_P012_Laura_AST_MissingSex.md` | AST: 44 U/L | **Sex Boundary Dependency**: Biological Sex is `[NOT PROVIDED]`. 44 U/L is Normal for males (<=48) but High for females (>43). Must ask user for sex. |
| **P013** | `CLD-P013-9942` | Michael Scott | 45 | Male | `report_P013_Michael_Sugar_Urgent.md` | Fasting Blood Sugar: 350 mg/dL | **Critical Urgent Alert**: Glucose > 300 mg/dL (350) triggers immediate "see doctor today" warning. |
| **P014** | `CLD-P014-9942` | Nancy Drew | 29 | Female | `report_P014_Nancy_Multiple.md` | FBS: 85 mg/dL<br>SGOT: 22 U/L | **Multi-alias normalization**: FBS -> Fasting Blood Sugar (Normal), SGOT -> AST (Normal). |

---

## 5. All Test Names and Aliases

From `2_medical_glossary.md` and report headers:

| Reported Name / Alias | Authoritative Standard Name | Formal Medical Description | Target Reference Module |
| :--- | :--- | :--- | :--- |
| **SGPT** | **ALT** | Alanine Aminotransferase | General Biochemistry |
| **SGOT** | **AST** | Aspartate Aminotransferase | General Biochemistry |
| **FBS** | **Fasting Blood Sugar** | Blood Glucose (Fasting) | General Biochemistry |
| **Hb** | **Hemoglobin** | Oxygen-carrying protein in red blood cells | Hematology |
| **PLT** | **Platelet Count** | Thrombocytes involved in blood clotting | Hematology |
| **RBC** | **Red Blood Cell Count** | Erythrocytes transporting oxygen | Hematology (*Note: No range in sheets*) |
| **WBC** | **White Blood Cell Count** | Leukocytes of the immune system | Hematology |
| **pH Level** | **Urine pH** | Acidity / alkalinity of urine | Urinalysis |
| **Protein** | **Urine Protein** | Detection of protein in urine | Urinalysis |
| **TSH** | **TSH** | Thyroid Stimulating Hormone | Endocrinology |
| **Cholesterol** | **Cholesterol** | Total serum cholesterol | General Biochemistry |
| **Serum Ferritin** | **Serum Ferritin** | Iron storage glycoprotein | *Unknown Test (Unclassified)* |

---

## 6. Authoritative Reference Ranges

Synthesized from `4_ranges_hematology.md`, `5_ranges_biochemistry.md`, and `6_ranges_thyroid_urine.md`:

### A. Hematology Module (`4_ranges_hematology.md`)
*Edge Case Rule:* Exact boundary values are **NORMAL**. Age bounds are inclusive.
- **Hemoglobin (Hb)**:
  - **Male** (18-100 yrs): **13.8 – 17.2 g/dL**
  - **Female** (18-100 yrs): **12.1 – 15.1 g/dL**
- **White Blood Cell Count (WBC)**:
  - **All Sexes** (18-100 yrs): **4,500 – 11,000 cells/mcL**
- **Platelet Count (PLT)**:
  - **All Sexes** (18-100 yrs): **150,000 – 450,000 cells/mcL**

### B. General Biochemistry Module (`5_ranges_biochemistry.md`)
- **Fasting Blood Sugar**:
  - **All Sexes** (18-100 yrs): **70 – 99 mg/dL**
- **ALT (Alanine Aminotransferase / SGPT)**:
  - **Male** (18-100 yrs): **7 – 55 U/L**
  - **Female** (18-100 yrs): **7 – 45 U/L**
- **AST (Aspartate Aminotransferase / SGOT)**:
  - **Male** (18-100 yrs): **8 – 48 U/L**
  - **Female** (18-100 yrs): **8 – 43 U/L**
- **Cholesterol**:
  - **All Sexes** (18-100 yrs): **125 – 200 mg/dL**

### C. Endocrinology & Urinalysis Module (`6_ranges_thyroid_urine.md`)
- **TSH (Thyroid Stimulating Hormone)**:
  - **All Sexes** (18-100 yrs): **0.4 – 4.0 mIU/L**
- **Urine pH**:
  - **All Sexes** (18-100 yrs): **4.5 – 8.0**
- **Urine Protein**:
  - **All Sexes** (18-100 yrs): **Negative**

---

## 7. Age Boundaries

- **Stated Adult Demographic:** 18 to 100 years.
- **Rule in `4_ranges_hematology.md`:** "Age boundaries are inclusive of the upper bound."
- **Lower Bound Interpretation:** Standard clinical inclusive bound: $18 \le \text{Age} \le 100$.
- **Corpus Coverage:** All test subjects with valid ages fall between 19 (Haley Dunphy) and 65 (George Costanza).
- **Out-of-Bounds Protocol:** If a patient is $< 18$ or $> 100$ years old, the reference sheets contain no validated pediatric or extreme-geriatric intervals. Under Core Directive #4, the system must mark such tests as *"cannot be classified from the files"* or request medical review.

---

## 8. Sex-Specific Ranges

Reference intervals partitioned strictly by biological sex:
1. **Hemoglobin (Hb)**:
   - Male: $13.8 - 17.2\text{ g/dL}$
   - Female: $12.1 - 15.1\text{ g/dL}$
2. **ALT (SGPT)**:
   - Male: $7 - 55\text{ U/L}$
   - Female: $7 - 45\text{ U/L}$
3. **AST (SGOT)**:
   - Male: $8 - 48\text{ U/L}$
   - Female: $8 - 43\text{ U/L}$

All other analytes (WBC, Platelets, Fasting Blood Sugar, Cholesterol, TSH, Urine pH, Urine Protein) apply uniformly across All Biological Sexes.

---

## 9. Unit Conversion Factors and Their Sources

### The Glucose Conversion Rule (P005 Ethan Hunt)
- **Reported Test & Value:** Fasting Blood Sugar: `6.0 mmol/L`.
- **Target Standard Unit:** `mg/dL`.
- **Biochemical Formulation:**
  $$\text{Molecular Weight of D-Glucose } (C_6H_{12}O_6) = 180.156\text{ g/mol}$$
  $$1\text{ mmol/L} = 18.0156\text{ mg/dL} \approx 18.0\text{ or }18.0182\text{ mg/dL}$$
  $$\text{Value in mg/dL} = 6.0 \times 18.0 = 108.0\text{ mg/dL} \quad (\text{or } 6.0 \times 18.0182 = 108.11\text{ mg/dL})$$
- **Classification:** Both $108.0$ and $108.11\text{ mg/dL}$ strictly exceed the upper normal limit of $99\text{ mg/dL}$ $\rightarrow$ **HIGH**.
- **Transparency Mandate:** The organizer rules state: *"convert before comparing, and show the conversion"*. The UI and API must explicitly present the mathematical formula:
  $$\text{Converted: } 6.0\text{ mmol/L} \times 18.0 = 108.0\text{ mg/dL}$$
- **Audit Source Finding:** The exact constant ($18.0$) is **NOT defined in any file** in `City-Lab-AI-Hackathon/lab_reports/`. It is referenced conceptually in `README.md` ("e.g., mmol/L instead of mg/dL") and `AI Hackathon-final.docx`, but constitutes **Missing Information** in the corpus. We must document this standard constant explicitly.

---

## 10. Urgent / Dangerous Thresholds

From `3_dangerous_urgent_values.md`:

| Analyte / Test Name | Critical Condition Trigger | Threshold Value | Standard Unit | Required Action |
| :--- | :--- | :---: | :--- | :--- |
| **Hemoglobin** | **Less than** | **7.0** | g/dL | Severe warning (`"see a doctor today"`) + Urgent physician questions |
| **Fasting Blood Sugar**| **Greater than** | **300** | mg/dL | Severe warning (`"see a doctor today"`) + Urgent physician questions |
| **Platelet Count** | **Less than** | **50,000** | cells/mcL | Severe warning (`"see a doctor today"`) + Urgent physician questions |
| **ALT** | **Greater than** | **1,000** | U/L | Severe warning (`"see a doctor today"`) + Urgent physician questions |

### In-Corpus Critical Activations:
1. **P004 (Diana Prince):** Hemoglobin = `6.5 g/dL` ($< 7.0\text{ g/dL}$) $\rightarrow$ **URGENT CRITICAL LOW**.
2. **P013 (Michael Scott):** Fasting Blood Sugar = `350 mg/dL` ($> 300\text{ mg/dL}$) $\rightarrow$ **URGENT CRITICAL HIGH**.

---

## 11. Non-Numeric Result Rules

- **Urine Protein:** Standard normal status is explicitly defined as string literal **`Negative`** (`6_ranges_thyroid_urine.md`).
- **P008 (Haley Dunphy):** Value is `Negative` $\rightarrow$ Evaluated as **NORMAL**.
- **Abnormal Criteria:** Any non-negative categorical result (e.g., `Trace`, `+1`, `+2`, `Positive`) must be classified as **ABNORMAL / HIGH**.

---

## 12. Missing and Invalid Data Cases

The corpus contains deliberate real-world data corruptions:

1. **P003 (Charlie Brown):**
   - `Recorded Age`: `[DATA CORRUPTED]`
   - `Biological Sex`: `[DATA CORRUPTED]`
   - Value: Fasting Blood Sugar `110 mg/dL`.
   - **Enforcement:** Core Directive #3 prohibits guessing based on patient name. Because age is missing, the system cannot verify if the patient falls within the $18-100$ age window. Result: Must state normal range cannot be chosen and ask the user to provide age and sex.
2. **P012 (Laura Croft):**
   - `Recorded Age`: `32`
   - `Biological Sex`: `[NOT PROVIDED]`
   - Value: AST `44 U/L`.
   - **Enforcement:** AST reference ranges are sex-dependent ($8-48\text{ U/L}$ for Male, $8-43\text{ U/L}$ for Female). At $44\text{ U/L}$, if male the result is NORMAL; if female the result is HIGH. Guessing sex from the name "Laura" would violate Core Directive #3 and could misclassify a high liver enzyme as normal. Result: Must halt classification and ask user for biological sex.
3. **P006 (Fiona Gallagher):**
   - Value: Serum Ferritin `25 ng/mL`.
   - **Enforcement:** Serum Ferritin is absent from all 3 reference modules. Under Core Directive #4, the system must not hallucinate an external clinical range. Result: Marked as *"cannot be classified from the files"*.

---

## 13. Patient Privacy Rules

From `1_lab_safety_rules.md` (Directive 1) and the Hackathon Rulebook:
1. **Strict Context-Lock:** The assistant must only answer queries regarding the patient report currently active in the session.
2. **Cross-Patient Refusal:** If a user asks about another patient (e.g., *"What were Alice's results?"* while viewing Bob's report), the assistant must definitively refuse:
   > *"I cannot discuss another patient's medical records under CityLab Diagnostics privacy protocols. I can only provide information regarding the active patient report."*
3. **No Cross-Contamination in Prompts:** Patient data must never be shared across session boundaries or co-mingled in LLM context windows.

---

## 14. Safety Rules & Layman Explanation Rules

From `1_lab_safety_rules.md` (Directive 2) and `AI Hackathon-final.docx`:
1. **No Diagnostic Authority:** The assistant must NEVER claim or suggest that a patient has a specific medical disease (e.g., forbidden: *"You have diabetes"*, *"You suffer from anemia"*, *"You have hepatitis"*).
2. **Layman Language:** All medical test explanations must be written in simple, clear language understandable by a Class 8 (8th grade) student.
3. **Mandatory Physician Disclaimer:** Output must explicitly remind the user:
   > *"Notice: This tool explains laboratory values for educational purposes only. It does not provide medical diagnoses. Only a licensed physician can diagnose medical conditions."*
4. **Physician Questions (3 to 5):** For any report exhibiting abnormal or urgent values, the system must formulate 3 to 5 clear, actionable questions for the patient to ask their doctor.
5. **Urgent Warning Placement:** Whenever an urgent threshold is breached, a prominent high-priority warning must be presented at the top:
   > *"URGENT WARNING: One or more test values are at critical levels that require immediate medical attention. Please contact a doctor or visit an urgent care facility today."*

---

## 15. Existing Functionality

- Node environment configured with Vite, React 19, Lucide React, and React Router DOM.
- 20 Markdown files representing clinical rules, reference ranges, and patient test encounters.
- Bare Vite boilerplate code rendering a counter and documentation links.

---

## 16. Missing Functionality

1. **Markdown Corpus Ingestion & Boilerplate Stripping Engine:** High-performance parser to isolate Section I (Demographics) and Section III (Analytical Results) from the 14KB repeated CLIA/HIPAA appendices.
2. **Demographic & Anomaly Parser:** Structured extractor detecting `[DATA CORRUPTED]` and `[NOT PROVIDED]`.
3. **Medical Alias Normalizer:** Fast dictionary mapping aliases (`SGPT`, `SGOT`, `FBS`, `Hb`, `PLT`, `WBC`, `pH Level`, `Protein`) to canonical entities.
4. **Unit Conversion Calculator:** Multiplier for `mmol/L` $\rightarrow$ `mg/dL` ($18.0$).
5. **Algorithmic Classification Engine:** Deterministic rule engine handling inclusive boundaries, sex partitioning, age validation, and exact-limit normal rules.
6. **Critical Limit Evaluator:** Instant detection of urgent values (Hb $< 7.0$, Glucose $> 300$, PLT $< 50,000$, ALT $> 1,000$).
7. **8th-Grade Layman Explainer:** Educational summaries explaining what each test measures without diagnosing.
8. **Physician Question Generator:** 3-5 tailored doctor questions based on out-of-range findings.
9. **Privacy Context-Lock Guard:** Rule-based filter rejecting cross-patient queries before LLM invocation.
10. **Backend REST API:** Python FastAPI or Node/Express server exposing endpoints for reports, analysis, demographic submission, and privacy-locked Q&A.
11. **Clinical Frontend Dashboard:** Modern responsive UI featuring patient selector, test result tables with color-coded badges, visual range bars, conversion callouts, urgent alert banners, doctor questions cards, and interactive privacy-guarded chat assistant.
12. **Automated Validation Test Suite:** Pytest / Vitest suite verifying all 14 patient reports against expected outputs.
13. **Containerization & Deployment Configuration:** `Dockerfile` and `docker-compose.yml` for zero-configuration execution.

---

## 17. Exact Organizer Requirements & Competition Constraints

| Constraint / Rule | Organizer Source | Exact Specification |
| :--- | :--- | :--- |
| **Existing Repository** | User Prompt & Rulebook | Must build upon the organizer's starter structure without unnecessary rewrites. |
| **No Old Projects / Templates**| Rulebook Section 5 & 11 | Prohibited from bringing pre-existing full templates or fine-tuned proprietary models. |
| **AI Tool Constraints** | Rulebook Page 2 & Appendix 1 | Free-tier models only: Google Gemini Pro, Groq, OpenRouter free models, or local open-source. |
| **Core Functions** | Problem Statement B (Word doc) | 1. Read results & classify (Normal, Low, High, Urgent).<br>2. Explain in simple words (Class 8). Never diagnose.<br>3. Handle messy data (Aliases, conversions, edge cases, missing data, unknown tests).<br>4. Protect privacy (Strict context-lock).<br>5. Generate 3-5 doctor questions + urgent warning. |
| **Leaderboard & Scoring** | Rulebook Page 3 | 20% Problem Understanding, 20% Innovation, 25% Technical Implementation, 20% Automated Leaderboard Score, 10% Practicality & Impact, 10% Presentation. |
| **Submission Requirements** | Rulebook Page 2 | 1. GitHub repo link.<br>2. Live link (Vercel/Netlify) or Docker containerization (`docker-compose.yml`).<br>3. Demo video. |

---

## 18. All Ambiguities and Conflicting Rules

### Category A: Explicit Organizer Rules
1. **Exact Range Boundaries:** In `4_ranges_hematology.md`, the edge case rule explicitly specifies: *"If a patient's analytical value sits exactly on a lower or upper range limit, the algorithmic classification MUST mark it as NORMAL."*
2. **Missing Demographic Protocol:** In `1_lab_safety_rules.md`, Directive 3 explicitly mandates: *"If age or sex is missing from a report, DO NOT GUESS based on the patient's name or other context clues. You must state that the right normal range cannot be chosen and explicitly ask the user to provide the missing demographic information before proceeding."*
3. **Unknown Tests:** In `1_lab_safety_rules.md`, Directive 4 explicitly commands marking unlisted tests as *"cannot be classified from the files"*.
4. **Privacy Refusal:** In `1_lab_safety_rules.md`, Directive 1 strictly requires refusing cross-patient queries.

### Category B: Missing Information
1. **Glucose Unit Conversion Multiplier:** The exact numerical conversion factor ($18.0$ or $18.0182$) between `mmol/L` and `mg/dL` is not documented in any markdown file in `lab_reports/`. It is mentioned only conceptually. We supply standard clinical $18.0\text{ mg/dL per mmol/L}$.
2. **Pediatric & Geriatric Ranges:** No reference range exists for ages $< 18$ or $> 100$.
3. **RBC Reference Range:** Red Blood Cell Count (RBC) is listed in the glossary (`2_medical_glossary.md`), but omitted from `4_ranges_hematology.md`. If an RBC value appears, it must be handled as unclassifiable.
4. **Backend Architecture:** The organizer repository provides zero backend files, leaving architecture and contract design entirely to the participant.

### Category C: Ambiguous Information
1. **Urgent Value Trigger Boundary:** `3_dangerous_urgent_values.md` states in prose *"When a patient's results hit or pass these specific thresholds"*, while the table column reads *"Critical Condition Trigger: Less than"*. For example, if Hemoglobin is exactly `7.0 g/dL`, is it Urgent or Normal? In the corpus, Diana Prince is `6.5 g/dL` ($< 7.0$), so test cases do not land on $7.0$ exactly. Our deterministic engine interprets "Less than" strictly ($< 7.0$), respecting the boundary rule that exact limits default to Normal unless strictly passed.
2. **Urinalysis Test Names:** Report P008 uses `"pH Level"` and `"Protein"`. While `"Urine pH"` and `"Urine Protein"` are in `6_ranges_thyroid_urine.md`, `"pH Level"` is not explicitly defined in `2_medical_glossary.md`. A fuzzy/alias matcher must safely bridge this naming gap.

---

## 19. Task 3 — Comprehensive Edge Case Matrix

This matrix provides the exact verification ground truth for every test across all 14 simulated patient reports in the corpus:

| Patient ID & Name | Test Name (Reported) | Reported Value | Reported Unit | Patient Age | Patient Sex | Canonical Test | Target Unit | Applicable Range | Expected Status | Source File | Reason & Technical Justification |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- | :---: | :---: | :---: | :--- | :--- |
| **P001 Alice Smith** | Hemoglobin | 13.5 | g/dL | 28 | Female | Hemoglobin | g/dL | 12.1 – 15.1 | **NORMAL** | `4_ranges_hematology.md` | $12.1 \le 13.5 \le 15.1$. Within female reference interval. |
| **P001 Alice Smith** | WBC | 6000 | cells/mcL | 28 | Female | WBC | cells/mcL | 4500 – 11000 | **NORMAL** | `4_ranges_hematology.md` | $4500 \le 6000 \le 11000$. Within general reference interval. |
| **P002 Bob Jones** | SGPT | 45 | U/L | 35 | Female | ALT | U/L | 7 – 45 | **NORMAL** | `2_medical_glossary.md`, `5_ranges_biochemistry.md` | **Boundary Edge Case**: Value 45 is exactly equal to female max normal limit. Marked NORMAL per explicit boundary rule. Biological sex (Female) takes precedence over male name. |
| **P003 Charlie Brown**| Fasting Blood Sugar | 110 | mg/dL | Corrupted | Corrupted | Fasting Blood Sugar | mg/dL | 70 – 99 | **CANNOT BE CLASSIFIED** | `1_lab_safety_rules.md` (Directive 3) | **Missing Demographics**: Age and Sex corrupted. Rule mandates refusing range selection and asking user for demographics. |
| **P004 Diana Prince** | Hemoglobin | 6.5 | g/dL | 42 | Female | Hemoglobin | g/dL | 12.1 – 15.1 | **URGENT LOW** | `3_dangerous_urgent_values.md`, `4_ranges_hematology.md` | **Critical Value**: $6.5 < 7.0\text{ g/dL}$ urgent threshold. Triggers severe alert (`"see a doctor today"`) and doctor questions. |
| **P004 Diana Prince** | Platelet Count | 120000 | cells/mcL | 42 | Female | Platelet Count | cells/mcL | 150000 – 450000 | **LOW** | `4_ranges_hematology.md` | $120000 < 150000$ (Low), but $\ge 50000$ (above urgent cutoff). |
| **P005 Ethan Hunt** | Fasting Blood Sugar | 6.0 | mmol/L | 50 | Male | Fasting Blood Sugar | mg/dL | 70 – 99 | **HIGH** | `5_ranges_biochemistry.md`, Clinical conversion | **Unit Conversion**: Converted $6.0 \times 18.0 = 108.0\text{ mg/dL}$ (or $108.11$). $108 > 99$ upper limit $\rightarrow$ HIGH. Conversion must be displayed. |
| **P006 Fiona Gallagher**| Serum Ferritin | 25 | ng/mL | 22 | Female | Serum Ferritin | ng/mL | *None* | **CANNOT BE CLASSIFIED FROM THE FILES** | `1_lab_safety_rules.md` (Directive 4) | **Unknown Test**: Not listed in any reference range file or glossary. Hallucination strictly forbidden. |
| **P007 George Costanza**| TSH | 2.5 | mIU/L | 65 | Male | TSH | mIU/L | 0.4 – 4.0 | **NORMAL** | `6_ranges_thyroid_urine.md` | $0.4 \le 2.5 \le 4.0$. Within normal adult thyroid range. |
| **P008 Haley Dunphy** | pH Level | 5.5 | *None* | 19 | Female | Urine pH | *None* | 4.5 – 8.0 | **NORMAL** | `6_ranges_thyroid_urine.md` | $4.5 \le 5.5 \le 8.0$. Within normal urine pH interval. |
| **P008 Haley Dunphy** | Protein | Negative | *None* | 19 | Female | Urine Protein | *None* | Negative | **NORMAL** | `6_ranges_thyroid_urine.md` | **Qualitative Test**: Result matches normal string literal `Negative`. |
| **P009 Ian Malcolm** | ALT | 85 | U/L | 48 | Male | ALT | U/L | 7 – 55 | **HIGH** | `5_ranges_biochemistry.md` | $85 > 55$ upper male limit. Below urgent 1000 limit $\rightarrow$ Non-urgent High. |
| **P009 Ian Malcolm** | AST | 60 | U/L | 48 | Male | AST | U/L | 8 – 48 | **HIGH** | `5_ranges_biochemistry.md` | $60 > 48$ upper male limit $\rightarrow$ Non-urgent High. |
| **P010 Julia Child** | Cholesterol | 200 | mg/dL | 55 | Female | Cholesterol | mg/dL | 125 – 200 | **NORMAL** | `4_ranges_hematology.md` edge rule, `5_ranges_biochemistry.md` | **Boundary Edge Case**: Value 200 sits exactly on the upper limit. Edge rule dictates exact boundary is NORMAL. |
| **P011 Kevin Hart** | WBC | 12000 | cells/mcL | 40 | Male | WBC | cells/mcL | 4500 – 11000 | **HIGH** | `4_ranges_hematology.md` | $12000 > 11000$ upper limit $\rightarrow$ Elevated leukocytosis (High). |
| **P011 Kevin Hart** | PLT | 140000 | cells/mcL | 40 | Male | Platelet Count | cells/mcL | 150000 – 450000 | **LOW** | `2_medical_glossary.md`, `4_ranges_hematology.md` | **Alias**: PLT maps to Platelet Count. $140000 < 150000$ (Low), but $\ge 50000$ (Non-urgent). |
| **P012 Laura Croft** | AST | 44 | U/L | 32 | Not Provided | AST | U/L | Male: 8–48<br>Female: 8–43 | **CANNOT BE CLASSIFIED** | `1_lab_safety_rules.md` (Directive 3) | **Missing Demographics Trap**: Sex missing. If Male, 44 is Normal; if Female, 44 is High. System must prompt user for biological sex. |
| **P013 Michael Scott** | Fasting Blood Sugar | 350 | mg/dL | 45 | Male | Fasting Blood Sugar | mg/dL | 70 – 99 | **URGENT HIGH** | `3_dangerous_urgent_values.md`, `5_ranges_biochemistry.md` | **Critical Value**: $350 > 300\text{ mg/dL}$ urgent threshold. Triggers severe alert (`"see a doctor today"`) and doctor questions. |
| **P014 Nancy Drew** | FBS | 85 | mg/dL | 29 | Female | Fasting Blood Sugar | mg/dL | 70 – 99 | **NORMAL** | `2_medical_glossary.md`, `5_ranges_biochemistry.md` | **Multi-alias**: FBS maps to Fasting Blood Sugar. $70 \le 85 \le 99$ (Normal). |
| **P014 Nancy Drew** | SGOT | 22 | U/L | 29 | Female | AST | U/L | 8 – 43 | **NORMAL** | `2_medical_glossary.md`, `5_ranges_biochemistry.md` | **Multi-alias**: SGOT maps to AST. $8 \le 22 \le 43$ (Normal for female). |

---

## 20. Task 4 — Development Plan & Technical Architecture

### A. Recommended Backend Architecture
- **Language / Framework:** Python 3.10 + **FastAPI**.
- **Rationale:** 
  1. Python enables direct integration with existing data science / parsing tooling and provides instant access to official free-tier LLM SDKs (Google GenAI, Groq, OpenRouter).
  2. FastAPI provides automatic interactive OpenAPI/Swagger documentation, Pydantic type validation, asynchronous non-blocking request handling, and low latency.
  3. Clean separation of concerns:
     - `core/parser.py`: Robust regex and markdown AST cleaner stripping out repetitive appendices and extracting Section I and Section III tables.
     - `core/classifier.py`: Pure, zero-hallucination deterministic classification engine enforcing the exact boundary rules, sex-specific brackets, unit conversions, and urgent limits.
     - `core/privacy.py`: Pre-LLM filter enforcing strict patient context-locking.
     - `services/explainer.py`: LLM integration service generating simple 8th-grade explanations and doctor questions strictly grounded in the classified results.
     - `api/routes.py`: Clean REST endpoints.

### B. Recommended Frontend Architecture
- **Framework:** React 19 + Vite (built upon the organizer's existing `City-Lab-AI-Hackathon/frontend/`).
- **Styling:** Modern, accessible clinical styling (using CSS variables or Tailwind CSS via PostCSS) with responsive design.
- **Key UI Modules:**
  1. **Patient Report Navigator:** Sidebar/dropdown selecting between all 14 patients (CLD-P001 to CLD-P014) plus file upload support for custom reports.
  2. **Demographics Card:** Displays Patient Name, MRN, Age, Biological Sex, and Date. If demographics are corrupted or missing (P003, P012), presents interactive prompt inputs allowing the user to provide the missing age/sex to unlock classification.
  3. **Critical Alert Banner:** Bright, pulsing high-priority warning card displayed when urgent conditions are triggered (e.g., P004 Diana Prince, P013 Michael Scott).
  4. **Analytical Results Table & Visual Range Gauges:** Color-coded badges (`NORMAL` [green], `LOW` [blue], `HIGH` [amber], `URGENT` [red], `CANNOT CLASSIFY` [gray]). Interactive visual horizontal range bar showing where the reported value sits relative to min and max boundaries. Unit conversion badge showing mathematical derivation ($6.0\text{ mmol/L} \times 18 = 108\text{ mg/dL}$).
  5. **Layman Explanation Section:** Plain-language descriptions written at an 8th-grade level explaining each test analyte.
  6. **Questions for Your Doctor:** 3 to 5 highlighted questions formatted as ready-to-print or copy cards for doctor consultation.
  7. **Interactive Privacy-Guarded Patient Chat:** An assistant drawer where the patient can ask questions about their report. If the patient asks about another patient, the UI displays a clear privacy refusal badge.

### C. Recommended API Contract

#### `GET /api/reports`
Returns list of all available patient reports in the system.
```json
[
  {
    "patient_id": "P001",
    "patient_name": "Alice Smith",
    "mrn": "CLD-P001-9942",
    "file_name": "report_P001_Alice_Smith_CBC.md"
  }
]
```

#### `GET /api/reports/{patient_id}`
Returns parsed demographic information and raw reported results.
```json
{
  "patient_id": "P001",
  "patient_name": "Alice Smith",
  "mrn": "CLD-P001-9942",
  "recorded_age": 28,
  "biological_sex": "Female",
  "is_age_missing": false,
  "is_sex_missing": false,
  "date_of_issuance": "2026-11-13",
  "raw_results": [
    { "test_name": "Hemoglobin", "value": "13.5", "unit": "g/dL" },
    { "test_name": "WBC", "value": "6000", "unit": "cells/mcL" }
  ]
}
```

#### `POST /api/analyze`
Executes deterministic classification, urgent evaluation, layman explanation, and doctor questions.
**Request Body:**
```json
{
  "patient_id": "P002",
  "override_age": null,
  "override_sex": null
}
```
**Response Body:**
```json
{
  "patient_id": "P002",
  "patient_name": "Bob Jones",
  "mrn": "CLD-P002-9942",
  "demographics": { "age": 35, "sex": "Female" },
  "has_urgent_values": false,
  "urgent_warning": null,
  "demographics_required": false,
  "missing_demographic_message": null,
  "results": [
    {
      "reported_test": "SGPT",
      "canonical_test": "ALT",
      "reported_value": 45.0,
      "reported_unit": "U/L",
      "converted_value": 45.0,
      "converted_unit": "U/L",
      "conversion_note": null,
      "min_normal": 7.0,
      "max_normal": 45.0,
      "status": "NORMAL",
      "is_boundary_value": true,
      "status_reason": "Value 45 U/L sits exactly on upper limit (45 U/L). Classified as NORMAL per laboratory edge-case rule."
    }
  ],
  "layman_summary": "Alanine Aminotransferase (ALT/SGPT) is an enzyme found mainly in your liver. Your result of 45 U/L is right at the upper edge of the normal range for females...",
  "doctor_questions": [],
  "disclaimer": "This explanation is for educational purposes only. Only a licensed physician can diagnose medical conditions."
}
```

#### `POST /api/chat`
Session-locked Q&A endpoint with strict privacy validation.
**Request Body:**
```json
{
  "active_patient_id": "P001",
  "query": "Can you tell me what Bob Jones's liver results were?"
}
```
**Response Body:**
```json
{
  "active_patient_id": "P001",
  "allowed": false,
  "response": "Under CityLab Diagnostics lab safety rules and patient privacy protections, I cannot disclose or discuss information regarding any other patient. I can only answer questions regarding Alice Smith (CLD-P001-9942)."
}
```

### D. Testing Strategy
A multi-tier QA test suite will be deployed:
1. **Deterministic Unit Tests (`pytest tests/test_classifier.py`):**
   - Exact boundary classifications (P002 ALT 45 -> Normal; P010 Cholesterol 200 -> Normal).
   - Missing demographic triggers (P003 missing age/sex -> Prompt; P012 missing sex -> Prompt).
   - Urgent limit triggers (P004 Hb 6.5 -> Urgent Low; P013 Glucose 350 -> Urgent High).
   - Unit conversion accuracy (P005 6.0 mmol/L -> 108 mg/dL -> High).
   - Unknown test classification (P006 Ferritin -> Cannot classify).
   - Aliasing accuracy (P014 FBS -> Fasting Blood Sugar, SGOT -> AST).
2. **Privacy Security Tests (`pytest tests/test_privacy.py`):**
   - Tests attempting to extract P001 data while in P002 session, verifying 100% rejection.
3. **End-to-End API Integration Tests (`pytest tests/test_api.py`):**
   - Validates all API endpoints with HTTP requests across all 14 patients.
4. **Frontend Component Tests & Oxlint:**
   - Verify zero lint regressions and clean build.

### E. AI Provider Integration
- **Primary AI Provider:** Free-tier **Google Gemini Pro** (provided by Tech Fusion organizers) or **Groq / OpenRouter** (e.g. `llama-3.3-70b-versatile` or `gemini-1.5-pro`).
- **Architecture — Two-Tier Hybrid RAG / Rule Engine:**
  - **Tier 1 (Deterministic Engine):** Classifications, boundary checks, unit conversions, and urgent alerts are computed **100% deterministically in Python code** with zero chance of LLM hallucination.
  - **Tier 2 (Grounded LLM Generation):** The LLM receives the pre-classified, verified structured payload and is prompted strictly to translate the findings into 8th-grade layman explanations and formulate 3-5 doctor questions. The system prompt incorporates hard negative constraints: *"Never diagnose a disease. If a test is marked unclassified, state you cannot classify it. Strictly discuss only the active patient."*
  - **Offline Fallback:** If API keys are missing or rate limits occur, the backend includes deterministic fallback templates ensuring the application never crashes and continues to function seamlessly.

### F. Deployment & Containerization Approach
- **Local / Docker Containerization:**
  - Create a root `Dockerfile` and `docker-compose.yml` orchestrating the FastAPI backend and React frontend.
  - Single command startup: `docker-compose up --build`.
- **Live Deployment Option:**
  - Frontend configured for one-click deployment on **Vercel** / **Netlify**.
  - Backend configured for **Render** / **Railway** free-tier deployment.

---

## 21. Summary of Explicit Rules vs Missing vs Ambiguous Information

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   INFORMATION AUDIT BREAKDOWN                          │
├───────────────────────────────────┬────────────────────────────────────┤
│ A. Explicit Organizer Rules       │ - Exact boundary value is NORMAL   │
│                                   │ - Missing age/sex: Must ask user   │
│                                   │ - Unknown tests: Mark unclassified │
│                                   │ - Context-lock: Refuse other PII   │
│                                   │ - Class 8 words; Never diagnose    │
│                                   │ - 3-5 doctor questions if abnormal │
│                                   │ - Severe alert if urgent threshold │
├───────────────────────────────────┼────────────────────────────────────┤
│ B. Missing Information in Corpus  │ - Glucose unit conversion factor   │
│                                   │   (18.0) is not in any .md file    │
│                                   │ - No pediatric ranges (<18 yrs)    │
│                                   │ - RBC defined, but range missing   │
│                                   │ - Zero backend code or API schemas │
├───────────────────────────────────┼────────────────────────────────────┤
│ C. Ambiguous Information          │ - "Hit or pass" vs "Less than 7.0" │
│                                   │ - "pH Level" vs "Urine pH" naming  │
│                                   │ - 14KB repeated CLIA boilerplate   │
└───────────────────────────────────┴────────────────────────────────────┘
```

---
*End of AUDIT.md — Awaiting user authorization before modifying application code.*
