import pytest
from fastapi import HTTPException
from app.api.routes import health_check, list_reports, get_report, analyze_report, patient_chat, get_providers
from app.schemas import AnalysisRequest, ChatRequest

def test_health_endpoint():
    data = health_check()
    assert data["status"] == "healthy"
    assert data["reports_loaded"] == 14
    assert "CityLab Diagnostics" in data["app"]
    assert "provider_status" in data

def test_providers_endpoint():
    prov = get_providers()
    assert "gemini" in prov
    assert "groq" in prov
    assert "openrouter" in prov
    assert "deterministic_fallback" in prov
    assert prov["gemini"]["priority"] == 1

def test_list_reports_endpoint():
    reports = list_reports()
    assert len(reports) == 14
    patient_ids = [r.patient_id for r in reports]
    assert "P001" in patient_ids
    assert "P014" in patient_ids

def test_get_single_report_endpoint():
    report = get_report("P001")
    assert report.patient_name == "Alice Smith"
    assert report.recorded_age == 28
    assert report.biological_sex == "Female"
    assert len(report.raw_results) == 2

def test_get_nonexistent_report():
    with pytest.raises(HTTPException) as exc_info:
        get_report("P999")
    assert exc_info.value.status_code == 404

def test_analyze_urgent_report():
    # Diana Prince P004 has critical Hemoglobin
    req = AnalysisRequest(patient_id="P004")
    res = analyze_report(req)
    assert res.has_urgent_values is True
    assert res.urgent_warning is not None
    assert "see a doctor today" in res.urgent_warning.lower()
    assert len(res.doctor_questions) >= 3
    assert len(res.doctor_questions) <= 5
    assert "NOTICE: This lab report explainer is for informational" in res.disclaimer

def test_analyze_missing_demographics_and_override():
    # P003 Charlie Brown has corrupted demographics initially
    req1 = AnalysisRequest(patient_id="P003")
    res1 = analyze_report(req1)
    assert res1.demographics_missing is True
    assert res1.results[0].status == "CANNOT_BE_CLASSIFIED"
    assert "cannot guess" in res1.demographics_prompt.lower()

    # Now provide override age=35, sex=Male
    req2 = AnalysisRequest(patient_id="P003", override_age=35, override_sex="Male")
    res2 = analyze_report(req2)
    assert res2.demographics_missing is False
    # Fasting Blood Sugar 110 mg/dL with valid adult age -> HIGH (> 99)
    assert res2.results[0].status == "HIGH"

def test_analyze_laura_sex_override():
    # P012 Laura Croft has AST 44 U/L, sex not provided
    # If Female, 44 > 43 -> HIGH
    req_female = AnalysisRequest(patient_id="P012", override_sex="Female")
    res_female = analyze_report(req_female)
    assert res_female.results[0].status == "HIGH"

    # If Male, 44 <= 48 -> NORMAL
    req_male = AnalysisRequest(patient_id="P012", override_sex="Male")
    res_male = analyze_report(req_male)
    assert res_male.results[0].status == "NORMAL"

def test_chat_privacy_enforcement():
    # Asking about Bob while in P001 session
    req_refuse = ChatRequest(
        active_patient_id="P001",
        query="What did Bob Jones have on his test?"
    )
    res_refuse = patient_chat(req_refuse)
    assert res_refuse.allowed is False
    assert "Directive 1" in res_refuse.response

    # Asking valid question about active patient
    req_valid = ChatRequest(
        active_patient_id="P001",
        query="Is my hemoglobin normal?"
    )
    res_valid = patient_chat(req_valid)
    assert res_valid.allowed is True
    assert "Alice Smith" in res_valid.response
