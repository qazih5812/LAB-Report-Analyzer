import pytest
from app.config import LAB_REPORTS_DIR
from app.core.parser import load_all_reports
from app.core.classifier import classify_test_result

@pytest.fixture(scope="module")
def reports_by_id():
    reports = load_all_reports(LAB_REPORTS_DIR)
    return {r.patient_id: r for r in reports}

def test_p001_alice_smith_all_normal(reports_by_id):
    p001 = reports_by_id["P001"]
    res = [classify_test_result(r, p001.recorded_age, p001.biological_sex) for r in p001.raw_results]
    assert len(res) == 2
    # Hemoglobin 13.5 (Female range: 12.1 - 15.1) -> NORMAL
    assert res[0].canonical_test == "Hemoglobin"
    assert res[0].status == "NORMAL"
    assert res[0].is_urgent is False
    # WBC 6000 (Range: 4500 - 11000) -> NORMAL
    assert res[1].canonical_test == "White Blood Cell Count"
    assert res[1].status == "NORMAL"
    assert res[1].is_urgent is False

def test_p002_bob_jones_alias_and_boundary(reports_by_id):
    p002 = reports_by_id["P002"]
    # Trap: Patient is named Bob Jones, but Biological Sex is Female!
    assert p002.biological_sex == "Female"
    res = [classify_test_result(r, p002.recorded_age, p002.biological_sex) for r in p002.raw_results]
    assert len(res) == 1
    # SGPT maps to ALT; Female ALT range is 7 - 45 U/L; Value is 45.
    # Boundary rule: Value exactly on limit is NORMAL.
    assert res[0].reported_test == "SGPT"
    assert res[0].canonical_test == "ALT"
    assert res[0].status == "NORMAL"
    assert res[0].is_boundary_value is True
    assert res[0].is_urgent is False

def test_p003_charlie_brown_missing_demographics(reports_by_id):
    p003 = reports_by_id["P003"]
    assert p003.is_age_missing is True
    res = [classify_test_result(r, p003.recorded_age, p003.biological_sex) for r in p003.raw_results]
    assert len(res) == 1
    # Missing demographics protocol: must refuse to classify
    assert res[0].status == "CANNOT_BE_CLASSIFIED"
    assert "missing" in res[0].status_reason.lower() or "corrupted" in res[0].status_reason.lower()

def test_p004_diana_prince_urgent_low_and_low(reports_by_id):
    p004 = reports_by_id["P004"]
    res = [classify_test_result(r, p004.recorded_age, p004.biological_sex) for r in p004.raw_results]
    assert len(res) == 2
    # Hemoglobin 6.5 < 7.0 urgent threshold -> URGENT_LOW
    assert res[0].canonical_test == "Hemoglobin"
    assert res[0].status == "URGENT_LOW"
    assert res[0].is_urgent is True
    # Platelet Count 120,000 < 150,000 (Low), but >= 50,000 (Not urgent) -> LOW
    assert res[1].canonical_test == "Platelet Count"
    assert res[1].status == "LOW"
    assert res[1].is_urgent is False

def test_p005_ethan_hunt_unit_conversion(reports_by_id):
    p005 = reports_by_id["P005"]
    res = [classify_test_result(r, p005.recorded_age, p005.biological_sex) for r in p005.raw_results]
    assert len(res) == 1
    # Fasting Blood Sugar: 6.0 mmol/L -> converted 108.0 mg/dL -> HIGH (> 99 mg/dL)
    assert res[0].canonical_test == "Fasting Blood Sugar"
    assert res[0].conversion_applied is True
    assert res[0].converted_value == 108.0
    assert res[0].converted_unit == "mg/dL"
    assert res[0].status == "HIGH"
    assert res[0].is_urgent is False

def test_p006_fiona_unknown_test(reports_by_id):
    p006 = reports_by_id["P006"]
    res = [classify_test_result(r, p006.recorded_age, p006.biological_sex) for r in p006.raw_results]
    assert len(res) == 1
    # Serum Ferritin is not in reference ranges -> CANNOT_BE_CLASSIFIED
    assert res[0].canonical_test == "Serum Ferritin"
    assert res[0].status == "CANNOT_BE_CLASSIFIED"
    assert "not present in the reference sheets" in res[0].status_reason

def test_p007_george_thyroid_normal(reports_by_id):
    p007 = reports_by_id["P007"]
    res = [classify_test_result(r, p007.recorded_age, p007.biological_sex) for r in p007.raw_results]
    assert len(res) == 1
    # TSH 2.5 (Range: 0.4 - 4.0) -> NORMAL
    assert res[0].canonical_test == "TSH"
    assert res[0].status == "NORMAL"

def test_p008_haley_urine_normal(reports_by_id):
    p008 = reports_by_id["P008"]
    res = [classify_test_result(r, p008.recorded_age, p008.biological_sex) for r in p008.raw_results]
    assert len(res) == 2
    # pH Level 5.5 (Range: 4.5 - 8.0) -> NORMAL
    assert res[0].canonical_test == "Urine pH"
    assert res[0].status == "NORMAL"
    # Protein Negative -> NORMAL
    assert res[1].canonical_test == "Urine Protein"
    assert res[1].status == "NORMAL"

def test_p009_ian_liver_high_non_urgent(reports_by_id):
    p009 = reports_by_id["P009"]
    res = [classify_test_result(r, p009.recorded_age, p009.biological_sex) for r in p009.raw_results]
    assert len(res) == 2
    # ALT 85 > 55 (Male high), AST 60 > 48 (Male high)
    assert res[0].canonical_test == "ALT"
    assert res[0].status == "HIGH"
    assert res[0].is_urgent is False
    assert res[1].canonical_test == "AST"
    assert res[1].status == "HIGH"
    assert res[1].is_urgent is False

def test_p010_julia_cholesterol_boundary(reports_by_id):
    p010 = reports_by_id["P010"]
    res = [classify_test_result(r, p010.recorded_age, p010.biological_sex) for r in p010.raw_results]
    assert len(res) == 1
    # Cholesterol 200 mg/dL is exactly on upper limit 200 -> NORMAL
    assert res[0].canonical_test == "Cholesterol"
    assert res[0].status == "NORMAL"
    assert res[0].is_boundary_value is True

def test_p011_kevin_cbc_abnormal(reports_by_id):
    p011 = reports_by_id["P011"]
    res = [classify_test_result(r, p011.recorded_age, p011.biological_sex) for r in p011.raw_results]
    assert len(res) == 2
    # WBC 12000 > 11000 -> HIGH
    assert res[0].canonical_test == "White Blood Cell Count"
    assert res[0].status == "HIGH"
    # PLT 140000 < 150000 -> LOW
    assert res[1].canonical_test == "Platelet Count"
    assert res[1].status == "LOW"

def test_p012_laura_missing_sex_dependency(reports_by_id):
    p012 = reports_by_id["P012"]
    assert p012.is_sex_missing is True
    res = [classify_test_result(r, p012.recorded_age, p012.biological_sex) for r in p012.raw_results]
    assert len(res) == 1
    # AST 44 U/L requires biological sex to classify -> CANNOT_BE_CLASSIFIED
    assert res[0].canonical_test == "AST"
    assert res[0].status == "CANNOT_BE_CLASSIFIED"
    assert "sex" in res[0].status_reason.lower()

def test_p013_michael_urgent_high_sugar(reports_by_id):
    p013 = reports_by_id["P013"]
    res = [classify_test_result(r, p013.recorded_age, p013.biological_sex) for r in p013.raw_results]
    assert len(res) == 1
    # Fasting Blood Sugar 350 > 300 urgent limit -> URGENT_HIGH
    assert res[0].canonical_test == "Fasting Blood Sugar"
    assert res[0].status == "URGENT_HIGH"
    assert res[0].is_urgent is True

def test_p014_nancy_multiple_aliases(reports_by_id):
    p014 = reports_by_id["P014"]
    res = [classify_test_result(r, p014.recorded_age, p014.biological_sex) for r in p014.raw_results]
    assert len(res) == 2
    # FBS 85 -> Fasting Blood Sugar (Range 70 - 99) -> NORMAL
    assert res[0].reported_test == "FBS"
    assert res[0].canonical_test == "Fasting Blood Sugar"
    assert res[0].status == "NORMAL"
    # SGOT 22 -> AST (Female Range 8 - 43) -> NORMAL
    assert res[1].reported_test == "SGOT"
    assert res[1].canonical_test == "AST"
    assert res[1].status == "NORMAL"
