import pytest
from app.db.database import (
    init_db,
    record_report_history,
    get_report_history,
    delete_report_history,
    get_patient_trend
)
from app.schemas import AnalysisRequest, ChatRequest
from app.api.routes import analyze_report, patient_chat, get_history, get_trends, delete_history_item

def test_database_persistence_and_retrieval():
    init_db()
    
    mock_results = [
        {"canonical_test": "Hemoglobin", "reported_value": "14.2", "reported_unit": "g/dL", "status": "NORMAL", "is_urgent": False},
        {"canonical_test": "Fasting Blood Sugar", "reported_value": "145", "reported_unit": "mg/dL", "status": "HIGH", "is_urgent": False},
        {"canonical_test": "Potassium", "reported_value": "6.8", "reported_unit": "mmol/L", "status": "URGENT_HIGH", "is_urgent": True}
    ]
    
    record_report_history(
        patient_id="P_TEST_DB",
        patient_name="John Doe",
        mrn="CLD-TEST-001",
        report_date="2026-11-14",
        results=mock_results,
        has_urgent=True,
        summary_excerpt="Test patient report snapshot."
    )
    
    history = get_report_history(limit=5, search="P_TEST_DB")
    assert len(history) >= 1
    found = history[0]
    assert found["patient_id"] == "P_TEST_DB"
    assert found["total_tests"] == 3
    assert found["normal_count"] == 1
    assert found["high_count"] == 2 # 1 HIGH + 1 URGENT_HIGH
    assert found["urgent_count"] == 1
    assert found["has_urgent"] is True

def test_multilingual_analysis():
    # Test analysis with Urdu language request
    req_ur = AnalysisRequest(patient_id="P001", language="ur", eli10=True)
    res_ur = analyze_report(req_ur)
    assert res_ur.language == "ur"
    assert len(res_ur.results) > 0
    # Must preserve exact canonical test names and clinical units
    assert any(r.canonical_test == "Hemoglobin" for r in res_ur.results)

def test_emergency_triage_chat():
    req_emerg = ChatRequest(
        active_patient_id="P001",
        query="I have crushing chest pain and I can't breathe",
        language="en"
    )
    res_emerg = patient_chat(req_emerg)
    assert res_emerg.allowed is True
    assert res_emerg.is_emergency is True
    assert "EMERGENCY MEDICAL ALERT" in res_emerg.response
    assert len(res_emerg.citations) > 0
