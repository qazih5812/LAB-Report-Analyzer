import pytest
from app.config import LAB_REPORTS_DIR
from app.core.parser import load_all_reports
from app.core.privacy import validate_privacy_context

@pytest.fixture(scope="module")
def reports_by_id():
    reports = load_all_reports(LAB_REPORTS_DIR)
    return {r.patient_id: r for r in reports}

def test_privacy_allows_own_patient_query(reports_by_id):
    p001 = reports_by_id["P001"]  # Alice Smith
    
    # Query about her own hemoglobin
    allowed, msg, reason = validate_privacy_context(p001, "What was my hemoglobin value?")
    assert allowed is True
    assert reason is None

    # Query mentioning her own name
    allowed2, msg2, reason2 = validate_privacy_context(p001, "Can you explain Alice Smith's WBC count?")
    assert allowed2 is True

def test_privacy_refuses_other_patient_name(reports_by_id):
    p001 = reports_by_id["P001"]  # Alice Smith
    
    # User attempts to ask about Bob Jones
    allowed, msg, reason = validate_privacy_context(p001, "Can you tell me about Bob Jones's liver results?")
    assert allowed is False
    assert "cannot disclose or discuss" in msg
    assert "bob" in reason.lower()

def test_privacy_refuses_other_patient_id(reports_by_id):
    p001 = reports_by_id["P001"]  # Alice Smith
    
    # User asks about patient ID P002
    allowed, msg, reason = validate_privacy_context(p001, "Show me the report for P002 please.")
    assert allowed is False
    assert "patient P002" in msg

def test_privacy_refuses_generic_other_patient_probing(reports_by_id):
    p002 = reports_by_id["P002"]  # Bob Jones
    
    # User asks generic cross-patient question
    allowed, msg, reason = validate_privacy_context(p002, "What did another patient score on this test?")
    assert allowed is False
    assert "1_lab_safety_rules.md Directive 1" in msg
