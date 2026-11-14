# CityLab Diagnostics — Medical Lab Report Explainer
## 2–3 Minute Demonstration Script & Video Guide

**Hackathon Challenge:** Tech Fusion '26 — Problem Statement B  
**Audience:** Hackathon Judges, Clinical Evaluators & Technical Jury  
**Target Duration:** 2 minutes 45 seconds (165 seconds)  
**Live URL / Port:** `http://localhost:5173` (Frontend) & `http://localhost:8000` (FastAPI Backend)  
**Required Demo Flow:**
1. Uploading a report
2. Normal and abnormal results
3. Urgent result
4. Unit conversion
5. Missing age / sex
6. AI explanation
7. Doctor questions
8. Privacy refusal

---

### Timing Breakdown & Slide/Screen Map

```
00:00 - 00:20 │ Scene 1: Introduction & Architecture Overview (20s)
00:20 - 00:40 │ Scene 2: Uploading a Custom Lab Report (20s)
00:40 - 01:05 │ Scene 3: Normal Results & Exact Boundary Edges (25s)
01:05 - 01:25 │ Scene 4: Unit Conversion in Action (Fasting Blood Sugar) (20s)
01:25 - 01:50 │ Scene 5: Missing Demographics & Interactive Resolver (25s)
01:50 - 02:15 │ Scene 6: Critical Urgent Alert & "See a Doctor Today" (25s)
02:15 - 02:35 │ Scene 7: Class 8 Layman Explanation & Doctor Questions (20s)
02:35 - 02:45 │ Scene 8: Patient Privacy Context-Lock Refusal & Wrap-up (10s)
```

---

### Scene-by-Scene Script & Action Guide

#### Scene 1: Introduction & Architecture Overview [00:00 – 00:20]
- **On Screen:** Browser opens to `http://localhost:5173`. Show the clean CityLab Diagnostics dashboard with Plus Jakarta typography, 14-patient sidebar, and the top status badge *"Deterministic Core (Offline Safe) • 14 Reports Loaded"*.
- **Voiceover:**
  > *"Welcome to CityLab Diagnostics Medical Lab Report Explainer, built for Tech Fusion '26 Problem Statement B. In medical AI, relying solely on LLMs to read numbers leads to catastrophic hallucinations. Our solution decouples the engine: Tier 1 is a 100% deterministic rules core certified against clinical boundary sheets. Tier 2 is an LLM layer that translates certified numbers into simple Class 8 everyday words with zero diagnostic hallucination."*

---

#### Scene 2: Uploading a Custom Lab Report [00:20 – 00:40]
- **On Screen:** Click the **"Upload Report"** button in the top navigation. Drag and drop a new `.md` lab report file into the modal. Click **"Process & Analyze Report"**.
- **System Action:** `/api/upload` reads the file, strips 14KB of CLIA/HIPAA appendix noise, parses Section I (demographics) and Section III (results), runs deterministic classification, and renders the patient immediately.
- **Voiceover:**
  > *"Let's test dynamic ingestion. We upload a messy markdown lab report containing extensive CLIA and HIPAA appendix noise. The parser instantly strips the noise, extracts the analytical values, runs deterministic classification, and loads the patient into the active dashboard with full audit traceability."*

---

#### Scene 3: Normal Results & Exact Boundary Edges [00:40 – 01:05]
- **On Screen:** In the patient selector, click **P001 (Alice Smith)**, showing all normal CBC values (Hb 13.5 g/dL, WBC 6,000 cells/mcL).
- **Then Switch to:** **P002 (Bob Jones)**. Expand the **"How We Checked"** accordion on the **SGPT (ALT)** card.
- **Visual Highlight:** Value is `45.0 U/L`. Female upper normal limit is `45.0 U/L`. Status is `NORMAL (Boundary)`.
- **Voiceover:**
  > *"Here is Alice Smith with a completely normal baseline. Next, look at Bob Jones: despite a male name, the biological sex is female. The test is listed as SGPT, which maps to ALT. The reported value is exactly 45 U/L. Under 4_ranges_hematology.md, values sitting exactly on range limits MUST be classified as NORMAL. Our engine handles both the alias, the sex trap, and the exact boundary rule with zero errors."*

---

#### Scene 4: Unit Conversion in Action (Ethan Hunt) [01:05 – 01:25]
- **On Screen:** Select **P005 (Ethan Hunt)**.
- **Visual Highlight:** Fasting Blood Sugar card displays:
  - Reported: `6.0 mmol/L`
  - Converted: `108.0 mg/dL`
  - Reference Range: `70 - 99 mg/dL`
  - Status: `HIGH`
  - Formula Box: `Unit conversion applied: 6.0 mmol/L × 18.0 = 108.0 mg/dL (Standard clinical glucose factor: 18.0 mg/dL per mmol/L)`
- **Voiceover:**
  > *"Patient Ethan Hunt reported Fasting Blood Sugar in mmol/L rather than standard mg/dL. Our engine detects the unit mismatch, applies the clinical factor 18.0, calculates 108.0 mg/dL, and marks it as HIGH because 108 exceeds 99. Most importantly, the exact conversion formula is displayed for the patient."*

---

#### Scene 5: Missing Demographics & Interactive Resolver [01:25 – 01:50]
- **On Screen:** Select **P003 (Charlie Brown)**.
- **Visual Highlight:** Demographics card shows `Age: Missing / Corrupted` and `Sex: Missing / Corrupted`. Fasting Blood Sugar is `110 mg/dL`, marked `CANNOT_BE_CLASSIFIED`.
- **Interactive Action:** In the Demographics Card, enter Age: `35`, select Sex: `Male`, and click **"Apply Override"**. The page refreshes instantly, and Fasting Blood Sugar transitions from `CANNOT_BE_CLASSIFIED` $\rightarrow$ `HIGH (110 > 99)`.
- **Voiceover:**
  > *"Under Safety Directive 3, when age or sex is corrupted, the system MUST NOT guess based on the patient's name. Here with Charlie Brown, the engine halts classification and requests demographics. When we provide age 35, the engine re-evaluates and classifies the blood sugar as High."*

---

#### Scene 6: Critical Urgent Alert & "See a Doctor Today" [01:50 – 02:15]
- **On Screen:** Select **P004 (Diana Prince)**.
- **Visual Highlight:** A pulsing crimson banner appears at the top:
  `CRITICAL DANGEROUS VALUE DETECTED — URGENT MEDICAL ALERT`
  `Critical low Hemoglobin (6.5 g/dL < 7.0 g/dL). You must see a doctor today or visit an urgent care facility.`
- **Action:** Click **"View Doctor Questions"**, smoothly scrolling down to the questions section.
- **Voiceover:**
  > *"Diana Prince has a critical hemoglobin of 6.5 g/dL, which breaches the urgent threshold of 7.0 g/dL. Immediately, a prominent crimson alert triggers with the mandatory directive: 'You must see a doctor today'. Urgent values are mathematically locked and can never be downgraded."*

---

#### Scene 7: Class 8 Layman AI Explanation & Doctor Questions [02:15 – 02:35]
- **On Screen:** Show the **Layman Summary Card** and the **Recommended Questions for Your Doctor Card**.
- **Action:** Click the **"Copy Questions"** button. The button flashes green with a checkmark *"Copied!"*.
- **Voiceover:**
  > *"Below the results, our explainer translates the findings into 8th-grade layman prose. Under Safety Directive 2, it never claims 'you have anemia' or 'you have diabetes'. Instead, it generates 3 to 5 tailored questions for the patient to take to their physician, along with a mandatory non-diagnostic disclaimer."*

---

#### Scene 8: Patient Privacy Context-Lock Refusal [02:35 – 02:45]
- **On Screen:** Click the floating **"AI Lab Assistant"** button in the bottom right corner.
- **Action:** Type: `"What did Bob Jones have on his test?"` and hit Send.
- **Response Received:**
  `Under CityLab Diagnostics lab safety rules (Directive 1: Privacy and Data Protection), I cannot disclose or discuss records for Bob Jones (P002). I am restricted to discussing only Diana Prince (CLD-P004-9942).`
- **Voiceover:**
  > *"Finally, we test patient privacy under Directive 1. In Diana's session, we ask about Bob Jones. The context-lock immediately intercepts and refuses the cross-patient query. 68 out of 68 automated tests pass. CityLab Explainer is ready for production."*

---

## 3. Pre-Flight Demonstration Checklist

Before recording the demonstration video or presenting live to the jury:

- [x] **Backend running:** `cd backend && python -m uvicorn app.main:app --port 8000`
- [x] **Frontend running:** `cd frontend && npm run dev`
- [x] **API Health verified:** `GET http://localhost:8000/api/health` returns `healthy` with 14 reports.
- [x] **Sample upload file ready:** Keep `City-Lab-AI-Hackathon/lab_reports/report_P001_Alice_Smith_CBC.md` ready to drag into the upload modal.
- [x] **Clipboard active:** Confirm clipboard permissions for the "Copy Questions" button test.
- [x] **Resolution:** Set browser zoom to 100% at $1920 \times 1080$ for optimal card readability.
