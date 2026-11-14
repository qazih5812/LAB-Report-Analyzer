import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

from app.schemas import PatientReport, RawTestResult, ReportMetadata

def strip_boilerplate(content: str) -> str:
    """Strips CLIA, HIPAA and Westgard boilerplate noise appended to files."""
    idx = content.find("### APPENDIX")
    if idx != -1:
        return content[:idx].strip()
    return content.strip()

def parse_patient_content(full_content: str, file_name: str) -> PatientReport:
    """Parses raw markdown content of a patient report into a structured PatientReport model."""
    core = strip_boilerplate(full_content)

    # Extract Patient ID from file_name (e.g. report_P001_Alice_Smith_CBC.md -> P001)
    pid_match = re.search(r"(?:report_)?(P\d{3})", file_name, re.I)
    if pid_match:
        patient_id = pid_match.group(1).upper()
    else:
        import hashlib
        short_hash = hashlib.md5(file_name.encode()).hexdigest()[:4].upper()
        patient_id = f"P_UP_{short_hash}"

    # Flexible demographics regex matching standard and OCR formats
    name_m = (
        re.search(r"\*\s*\*\*Patient Full Name\*\*:\s*(.+)", core, re.I) or
        re.search(r"(?:Patient\s+(?:Full\s+)?Name|Full\s+Name)\*?\*?[:\s]+\*?\*?\s*([^\n\r*#|]+)", core, re.I) or
        re.search(r"\bName\*?\*?[:\s]+\*?\*?\s*([^\n\r*#|]+)", core, re.I)
    )
    age_m = (
        re.search(r"\*\s*\*\*(?:Recorded\s+)?Age\*\*:\s*(.+)", core, re.I) or
        re.search(r"\b(?:Recorded\s+)?Age\*?\*?[:\s]+\*?\*?\s*([^\n\r*#|]+)", core, re.I)
    )
    sex_m = (
        re.search(r"\*\s*\*\*(?:Biological\s+)?Sex\*\*:\s*(.+)", core, re.I) or
        re.search(r"\b(?:Biological\s+)?Sex\*?\*?[:\s]+\*?\*?\s*([^\n\r*#|]+)", core, re.I)
    )
    mrn_m = (
        re.search(r"\*\s*\*\*Medical Record Number \(MRN\)\*\*:\s*(.+)", core, re.I) or
        re.search(r"\bMRN\*?\*?[:\s]+\*?\*?\s*([A-Za-z0-9\-]+)", core, re.I)
    )
    date_m = (
        re.search(r"\*\s*\*\*Date of Issuance\*\*:\s*(.+)", core, re.I) or
        re.search(r"\b(?:Date of Issuance|Date)\*?\*?[:\s]+\*?\*?\s*([0-9\-\/]{4,12})", core, re.I)
    )

    patient_name = name_m.group(1).strip() if name_m else "Custom Uploaded Patient"
    raw_age = age_m.group(1).strip() if age_m else ""
    raw_sex = sex_m.group(1).strip() if sex_m else ""
    mrn = mrn_m.group(1).strip() if mrn_m else f"CLD-{patient_id}-9942"
    date_of_issuance = date_m.group(1).strip() if date_m else "2026-11-14"

    # Parse age according to strict safety rules (never guess)
    recorded_age: Optional[int] = None
    is_age_missing = False
    if not raw_age or "CORRUPTED" in raw_age.upper() or "NOT PROVIDED" in raw_age.upper() or "UNKNOWN" in raw_age.upper():
        is_age_missing = True
    else:
        num_m = re.search(r"\b(\d{1,3})\b", raw_age)
        if num_m:
            try:
                recorded_age = int(num_m.group(1))
            except ValueError:
                is_age_missing = True
        else:
            is_age_missing = True

    # Parse sex according to strict safety rules (never guess from name)
    biological_sex: Optional[str] = None
    is_sex_missing = False
    if not raw_sex or "CORRUPTED" in raw_sex.upper() or "NOT PROVIDED" in raw_sex.upper() or "UNKNOWN" in raw_sex.upper():
        is_sex_missing = True
    elif raw_sex.strip().lower() in ["female", "f"]:
        biological_sex = "Female"
    elif raw_sex.strip().lower() in ["male", "m"]:
        biological_sex = "Male"
    else:
        is_sex_missing = True

    # Section III parsing
    sec3_idx = core.find("## SECTION III")
    sec3 = core[sec3_idx:] if sec3_idx != -1 else core

    raw_results: List[RawTestResult] = []

    # Format A: Markdown tables (robust line-by-line split)
    found_table = False
    for line in sec3.splitlines():
        if "|" in line:
            parts = [p.strip("*_ ") for p in line.split("|") if p.strip()]
            if len(parts) >= 2:
                col0 = parts[0]
                col1 = parts[1]
                col2 = parts[2] if len(parts) >= 3 else None
                if "---" in col0 or col0.lower() in ["test", "test name", "analyte"]:
                    continue
                if col1.lower() in ["result", "value", "reported value"]:
                    continue
                # If col2 is empty or looks like a reference range, split col1 if it has value + unit
                v_tokens = col1.split()
                if len(v_tokens) > 1 and (not col2 or "-" in col2):
                    raw_results.append(RawTestResult(test_name=col0, raw_value=v_tokens[0], unit=" ".join(v_tokens[1:])))
                else:
                    raw_results.append(RawTestResult(test_name=col0, raw_value=col1, unit=col2 or None))
                found_table = True

    if not found_table:
        # Format B: Key-values across multiple lines (Test Conducted / Value Recorded)
        tc_m = re.search(r"Test Conducted:\s*(.+)", sec3)
        vr_m = re.search(r"Value Recorded:\s*(.+)", sec3)
        if tc_m and vr_m:
            t_name = tc_m.group(1).strip("*_ ")
            v_tokens = vr_m.group(1).strip().split()
            v_val = v_tokens[0] if v_tokens else ""
            v_unit = " ".join(v_tokens[1:]) if len(v_tokens) > 1 else None
            raw_results.append(RawTestResult(test_name=t_name, raw_value=v_val, unit=v_unit))

        # Format C: Test: AST \n Result: 44 U/L
        t_m = re.search(r"Test:\s*(.+)", sec3)
        r_m = re.search(r"Result:\s*(.+)", sec3)
        if t_m and r_m and not tc_m:
            t_name = t_m.group(1).strip("*_ ")
            v_tokens = r_m.group(1).strip().split()
            v_val = v_tokens[0] if v_tokens else ""
            v_unit = " ".join(v_tokens[1:]) if len(v_tokens) > 1 else None
            raw_results.append(RawTestResult(test_name=t_name, raw_value=v_val, unit=v_unit))

        # Format D: Line-by-line bullets or colons (- Hemoglobin: 13.5 g/dL, * pH Level -> 5.5, TSH: 2.5 mIU/L)
        if not raw_results:
            lines = sec3.splitlines()
            for line in lines:
                l = line.strip()
                if not l or l.startswith("#") or "The analytical phase" in l:
                    continue

                # Pattern D1: Arrow (* pH Level -> 5.5, * Protein -> Negative)
                arrow_m = re.match(r"^[*-]\s*(.+?)\s*->\s*(.+)$", l)
                if arrow_m:
                    t_name = arrow_m.group(1).strip("*_ ")
                    val_tokens = arrow_m.group(2).strip().split()
                    v_val = val_tokens[0] if val_tokens else ""
                    v_unit = " ".join(val_tokens[1:]) if len(val_tokens) > 1 else None
                    raw_results.append(RawTestResult(test_name=t_name, raw_value=v_val, unit=v_unit))
                    continue

                # Pattern D2: Colon (- Hemoglobin: 13.5 g/dL, * **WBC**: 12000 cells/mcL, TSH: 2.5 mIU/L)
                colon_m = re.match(r"^[*-]?\s*\*?\*?([A-Za-z0-9\s/]+?)\*?\*?:\s*(.+)$", l)
                if colon_m:
                    t_name = colon_m.group(1).strip("*_ ")
                    val_tokens = colon_m.group(2).strip().split()
                    v_val = val_tokens[0] if val_tokens else ""
                    v_unit = " ".join(val_tokens[1:]) if len(val_tokens) > 1 else None
                    raw_results.append(RawTestResult(test_name=t_name, raw_value=v_val, unit=v_unit))
                    continue

    return PatientReport(
        patient_id=patient_id,
        patient_name=patient_name,
        mrn=mrn,
        recorded_age=recorded_age,
        biological_sex=biological_sex,
        is_age_missing=is_age_missing,
        is_sex_missing=is_sex_missing,
        date_of_issuance=date_of_issuance,
        file_name=file_name,
        raw_results=raw_results,
    )

def parse_patient_file(file_path: Path) -> PatientReport:
    """Parses a patient report markdown file on disk."""
    with open(file_path, "r", encoding="utf-8") as f:
        full_content = f.read()
    return parse_patient_content(full_content, file_path.name)

def load_all_reports(lab_reports_dir: Path) -> List[PatientReport]:
    """Loads and parses all report_P*.md files in the specified directory."""
    reports = []
    files = sorted(lab_reports_dir.glob("report_P*.md"))
    for f in files:
        reports.append(parse_patient_file(f))
    return reports
