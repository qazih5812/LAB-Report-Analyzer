from dataclasses import dataclass
from typing import Optional, Dict, List, Tuple

@dataclass
class ReferenceInterval:
    analyte: str
    sex: str  # "Male", "Female", "All"
    age_min: int
    age_max: int
    min_normal: Optional[float]
    max_normal: Optional[float]
    expected_categorical: Optional[str] = None
    unit: Optional[str] = None
    source_file: str = ""

# Authoritative range definitions compiled directly from reference sheets
REFERENCE_RANGES: List[ReferenceInterval] = [
    # 4_ranges_hematology.md
    ReferenceInterval(
        analyte="Hemoglobin",
        sex="Male",
        age_min=18,
        age_max=100,
        min_normal=13.8,
        max_normal=17.2,
        unit="g/dL",
        source_file="4_ranges_hematology.md"
    ),
    ReferenceInterval(
        analyte="Hemoglobin",
        sex="Female",
        age_min=18,
        age_max=100,
        min_normal=12.1,
        max_normal=15.1,
        unit="g/dL",
        source_file="4_ranges_hematology.md"
    ),
    ReferenceInterval(
        analyte="White Blood Cell Count",
        sex="All",
        age_min=18,
        age_max=100,
        min_normal=4500.0,
        max_normal=11000.0,
        unit="cells/mcL",
        source_file="4_ranges_hematology.md"
    ),
    ReferenceInterval(
        analyte="Platelet Count",
        sex="All",
        age_min=18,
        age_max=100,
        min_normal=150000.0,
        max_normal=450000.0,
        unit="cells/mcL",
        source_file="4_ranges_hematology.md"
    ),
    # 5_ranges_biochemistry.md
    ReferenceInterval(
        analyte="Fasting Blood Sugar",
        sex="All",
        age_min=18,
        age_max=100,
        min_normal=70.0,
        max_normal=99.0,
        unit="mg/dL",
        source_file="5_ranges_biochemistry.md"
    ),
    ReferenceInterval(
        analyte="ALT",
        sex="Male",
        age_min=18,
        age_max=100,
        min_normal=7.0,
        max_normal=55.0,
        unit="U/L",
        source_file="5_ranges_biochemistry.md"
    ),
    ReferenceInterval(
        analyte="ALT",
        sex="Female",
        age_min=18,
        age_max=100,
        min_normal=7.0,
        max_normal=45.0,
        unit="U/L",
        source_file="5_ranges_biochemistry.md"
    ),
    ReferenceInterval(
        analyte="AST",
        sex="Male",
        age_min=18,
        age_max=100,
        min_normal=8.0,
        max_normal=48.0,
        unit="U/L",
        source_file="5_ranges_biochemistry.md"
    ),
    ReferenceInterval(
        analyte="AST",
        sex="Female",
        age_min=18,
        age_max=100,
        min_normal=8.0,
        max_normal=43.0,
        unit="U/L",
        source_file="5_ranges_biochemistry.md"
    ),
    ReferenceInterval(
        analyte="Cholesterol",
        sex="All",
        age_min=18,
        age_max=100,
        min_normal=125.0,
        max_normal=200.0,
        unit="mg/dL",
        source_file="5_ranges_biochemistry.md"
    ),
    # 6_ranges_thyroid_urine.md
    ReferenceInterval(
        analyte="TSH",
        sex="All",
        age_min=18,
        age_max=100,
        min_normal=0.4,
        max_normal=4.0,
        unit="mIU/L",
        source_file="6_ranges_thyroid_urine.md"
    ),
    ReferenceInterval(
        analyte="Urine pH",
        sex="All",
        age_min=18,
        age_max=100,
        min_normal=4.5,
        max_normal=8.0,
        unit=None,
        source_file="6_ranges_thyroid_urine.md"
    ),
    ReferenceInterval(
        analyte="Urine Protein",
        sex="All",
        age_min=18,
        age_max=100,
        min_normal=None,
        max_normal=None,
        expected_categorical="Negative",
        unit=None,
        source_file="6_ranges_thyroid_urine.md"
    ),
]

SEX_SPECIFIC_ANALYTES = {"Hemoglobin", "ALT", "AST"}

def get_reference_interval(
    canonical_test: str,
    age: Optional[int],
    sex: Optional[str]
) -> Tuple[Optional[ReferenceInterval], str]:
    """
    Selects the applicable reference interval based on canonical analyte, age and sex.
    Returns:
        (ReferenceInterval or None, reason_or_status)
    """
    # Check if analyte exists in reference library
    matching_analytes = [r for r in REFERENCE_RANGES if r.analyte == canonical_test]
    if not matching_analytes:
        return None, "Test is not present in the reference sheets (cannot be classified from the files)."

    # Check for missing demographics
    if age is None:
        return None, "Patient age is missing or corrupted. Normal range cannot be chosen without age verification."

    # Age boundary check
    if age < 18 or age > 100:
        return None, f"Patient age ({age}) is outside the adult reference range (18-100 years). Cannot be classified from the files."

    # Sex check for sex-dependent analytes
    if canonical_test in SEX_SPECIFIC_ANALYTES:
        clean_sex: Optional[str] = None
        if sex:
            s_up = sex.strip().upper()
            if s_up.startswith("M"):
                clean_sex = "Male"
            elif s_up.startswith("F"):
                clean_sex = "Female"

        if not clean_sex:
            return None, f"Biological sex is missing or not provided. Normal range for {canonical_test} differs between males and females."

        for r in matching_analytes:
            if r.sex == clean_sex and r.age_min <= age <= r.age_max:
                return r, "Matched sex-specific reference interval"
        return None, f"No reference interval found for sex={clean_sex}, age={age}"

    # Non-sex-specific analytes
    for r in matching_analytes:
        if r.sex == "All" and r.age_min <= age <= r.age_max:
            return r, "Matched general reference interval"

    return None, f"No applicable reference interval found for {canonical_test}."
