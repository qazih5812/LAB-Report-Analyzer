import pytest
from pathlib import Path
from app.config import LAB_REPORTS_DIR
from app.core.parser import load_all_reports, parse_patient_file, strip_boilerplate

def test_load_all_14_reports():
    reports = load_all_reports(LAB_REPORTS_DIR)
    assert len(reports) == 14, f"Expected 14 patient reports, found {len(reports)}"
    
    patient_ids = [r.patient_id for r in reports]
    expected_ids = [f"P{i:03d}" for i in range(1, 15)]
    assert sorted(patient_ids) == sorted(expected_ids)

def test_strip_boilerplate():
    sample_text = "Core results\n\n### APPENDIX 1: EXTENDED DOCUMENTATION\nBoilerplate text"
    stripped = strip_boilerplate(sample_text)
    assert stripped == "Core results"
    assert "Boilerplate text" not in stripped

def test_corrupted_demographics_detection():
    # Charlie Brown P003 has corrupted age and sex
    p003_file = LAB_REPORTS_DIR / "report_P003_Charlie_Brown_Sugar_NoDemo.md"
    p003 = parse_patient_file(p003_file)
    assert p003.patient_id == "P003"
    assert p003.is_age_missing is True
    assert p003.is_sex_missing is True
    assert p003.recorded_age is None
    assert p003.biological_sex is None
    assert len(p003.raw_results) == 1
    assert p003.raw_results[0].test_name == "Fasting Blood Sugar"

def test_missing_sex_detection():
    # Laura Croft P012 has missing sex
    p012_file = LAB_REPORTS_DIR / "report_P012_Laura_AST_MissingSex.md"
    p012 = parse_patient_file(p012_file)
    assert p012.patient_id == "P012"
    assert p012.recorded_age == 32
    assert p012.is_age_missing is False
    assert p012.is_sex_missing is True
    assert p012.biological_sex is None
    assert len(p012.raw_results) == 1
    assert p012.raw_results[0].test_name == "AST"
    assert p012.raw_results[0].raw_value == "44"

def test_multi_result_extraction():
    # Diana Prince P004 has 2 results: Hemoglobin and Platelet Count
    p004_file = LAB_REPORTS_DIR / "report_P004_Diana_Prince_Hem_Urgent.md"
    p004 = parse_patient_file(p004_file)
    assert len(p004.raw_results) == 2
    test_names = [r.test_name for r in p004.raw_results]
    assert "Hemoglobin" in test_names
    assert "Platelet Count" in test_names
