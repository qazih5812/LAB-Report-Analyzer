from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from pathlib import Path

from app.config import LAB_REPORTS_DIR, APP_NAME, VERSION
from app.schemas import (
    ReportMetadata,
    PatientReport,
    AnalysisRequest,
    AnalysisResponse,
    ChatRequest,
    ChatResponse,
    ClassifiedTestResult,
)
from app.core.parser import load_all_reports, parse_patient_file
from app.core.classifier import classify_test_result
from app.core.summary import MANDATORY_DISCLAIMER
from app.services.llm_provider import llm_manager
from app.services.explainer import generate_enhanced_explanation
from app.services.chat import handle_patient_chat

router = APIRouter(prefix="/api")

# In-memory store of loaded reports indexed by patient_id
REPORTS_CACHE = {}

def get_reports_cache():
    global REPORTS_CACHE
    if not REPORTS_CACHE:
        reports = load_all_reports(LAB_REPORTS_DIR)
        for r in reports:
            REPORTS_CACHE[r.patient_id.upper()] = r
    return REPORTS_CACHE

@router.get("/health")
def health_check():
    cache = get_reports_cache()
    return {
        "status": "healthy",
        "app": APP_NAME,
        "version": VERSION,
        "reports_loaded": len(cache),
        "reports_dir": str(LAB_REPORTS_DIR),
        "provider_status": llm_manager.get_provider_status(),
    }

@router.get("/providers")
def get_providers():
    """Returns the priority status and availability of all LLM providers."""
    return llm_manager.get_provider_status()

@router.get("/reports", response_model=List[ReportMetadata])
def list_reports():
    cache = get_reports_cache()
    meta_list = []
    for pid in sorted(cache.keys()):
        r = cache[pid]
        meta_list.append(
            ReportMetadata(
                patient_id=r.patient_id,
                patient_name=r.patient_name,
                mrn=r.mrn,
                file_name=r.file_name,
                recorded_age=r.recorded_age,
                biological_sex=r.biological_sex,
                is_age_missing=r.is_age_missing,
                is_sex_missing=r.is_sex_missing,
            )
        )
    return meta_list

@router.get("/reports/{patient_id}", response_model=PatientReport)
def get_report(patient_id: str):
    cache = get_reports_cache()
    pid = patient_id.strip().upper()
    if pid not in cache:
        raise HTTPException(status_code=404, detail=f"Patient report '{patient_id}' not found.")
    return cache[pid]

@router.post("/analyze", response_model=AnalysisResponse)
def analyze_report(request: AnalysisRequest):
    cache = get_reports_cache()
    pid = request.patient_id.strip().upper()
    if pid not in cache:
        raise HTTPException(status_code=404, detail=f"Patient report '{request.patient_id}' not found.")

    report: PatientReport = cache[pid]

    # Handle demographic overrides if user provided them
    eff_age = request.override_age if request.override_age is not None else report.recorded_age
    eff_sex = request.override_sex if request.override_sex is not None else report.biological_sex

    # Normalize effective sex
    if eff_sex:
        if eff_sex.strip().lower() in ["male", "m"]:
            eff_sex = "Male"
        elif eff_sex.strip().lower() in ["female", "f"]:
            eff_sex = "Female"

    is_age_missing = eff_age is None
    is_sex_missing = eff_sex is None

    demographics_missing = is_age_missing or is_sex_missing
    demo_prompt = None
    if is_age_missing and is_sex_missing:
        demo_prompt = f"Both patient age and biological sex are missing or corrupted for {report.patient_name}. Under safety rules (Directive 3), the assistant cannot guess demographics. Please supply age and sex to choose the correct reference ranges."
    elif is_age_missing:
        demo_prompt = f"Patient age is missing or corrupted for {report.patient_name}. Please provide patient age to verify adult reference range eligibility."
    elif is_sex_missing:
        demo_prompt = f"Biological sex is not provided for {report.patient_name}. Reference ranges for some tests (e.g., ALT, AST, Hemoglobin) vary significantly by biological sex. Please provide biological sex to enable classification."

    # Perform deterministic classification on all raw results
    classified_results: List[ClassifiedTestResult] = []
    has_urgent = False

    for raw in report.raw_results:
        classified = classify_test_result(raw, eff_age, eff_sex)
        if classified.is_urgent:
            has_urgent = True
        classified_results.append(classified)

    # Generate layman explanation through LLM layer with guardrails & fallback
    summary, doctor_questions, urgent_warning, provider_used = generate_enhanced_explanation(
        patient_name=report.patient_name,
        results=classified_results,
        is_demographics_missing=demographics_missing,
        demographics_message=demo_prompt
    )

    return AnalysisResponse(
        patient_id=report.patient_id,
        patient_name=report.patient_name,
        mrn=report.mrn,
        demographics={
            "age": eff_age,
            "sex": eff_sex,
            "age_original": report.recorded_age,
            "sex_original": report.biological_sex,
            "is_age_missing": is_age_missing,
            "is_sex_missing": is_sex_missing,
            "age_overridden": request.override_age is not None,
            "sex_overridden": request.override_sex is not None,
        },
        demographics_missing=demographics_missing,
        demographics_prompt=demo_prompt,
        has_urgent_values=has_urgent,
        urgent_warning=urgent_warning,
        results=classified_results,
        layman_summary=summary,
        doctor_questions=doctor_questions,
        disclaimer=MANDATORY_DISCLAIMER,
        provider_used=provider_used,
    )

@router.post("/chat", response_model=ChatResponse)
def patient_chat(request: ChatRequest):
    cache = get_reports_cache()
    pid = request.active_patient_id.strip().upper()
    if pid not in cache:
        raise HTTPException(status_code=404, detail=f"Active patient report '{request.active_patient_id}' not found.")

    active_report = cache[pid]

    # Perform deterministic classification for active patient to provide ground truth
    classified_results = [
        classify_test_result(r, active_report.recorded_age, active_report.biological_sex)
        for r in active_report.raw_results
    ]

    # Process through contextual chat service with prompt-injection defense and privacy lock
    allowed, response_text, reason, provider_used = handle_patient_chat(
        active_report=active_report,
        classified_results=classified_results,
        raw_query=request.query
    )

    return ChatResponse(
        active_patient_id=active_report.patient_id,
        allowed=allowed,
        response=response_text,
        reason=reason,
        provider_used=provider_used,
    )
