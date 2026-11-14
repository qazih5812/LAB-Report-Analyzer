from typing import Dict, Tuple, Optional

# Authoritative mappings from 2_medical_glossary.md and lab reports
# Map alias (case-insensitive) -> (Canonical Name, Source Rule)
ALIAS_MAP: Dict[str, Tuple[str, str]] = {
    # 2_medical_glossary.md mappings
    "sgpt": ("ALT", "2_medical_glossary.md: SGPT is the exact equivalent of ALT (Alanine Aminotransferase)"),
    "alt": ("ALT", "5_ranges_biochemistry.md: ALT"),
    "alanine aminotransferase": ("ALT", "2_medical_glossary.md"),
    
    "sgot": ("AST", "2_medical_glossary.md: SGOT is the exact equivalent of AST (Aspartate Aminotransferase)"),
    "ast": ("AST", "5_ranges_biochemistry.md: AST"),
    "aspartate aminotransferase": ("AST", "2_medical_glossary.md"),
    
    "fbs": ("Fasting Blood Sugar", "2_medical_glossary.md: FBS is the exact equivalent of Fasting Blood Sugar"),
    "fasting blood sugar": ("Fasting Blood Sugar", "5_ranges_biochemistry.md: Fasting Blood Sugar"),
    "glucose": ("Fasting Blood Sugar", "2_medical_glossary.md / 5_ranges_biochemistry.md"),
    "blood glucose": ("Fasting Blood Sugar", "Clinical alias for Fasting Blood Sugar"),
    "fasting glucose": ("Fasting Blood Sugar", "Clinical alias for Fasting Blood Sugar"),
    "blood sugar": ("Fasting Blood Sugar", "Clinical alias for Fasting Blood Sugar"),
    
    "hb": ("Hemoglobin", "2_medical_glossary.md: Hb maps to Hemoglobin"),
    "hgb": ("Hemoglobin", "Standard clinical abbreviation for Hemoglobin"),
    "hemoglobin": ("Hemoglobin", "4_ranges_hematology.md: Hemoglobin (Hb)"),
    
    "plt": ("Platelet Count", "2_medical_glossary.md: PLT maps to Platelet Count"),
    "platelet count": ("Platelet Count", "4_ranges_hematology.md: Platelet Count (PLT)"),
    "platelets": ("Platelet Count", "2_medical_glossary.md"),
    "platelet": ("Platelet Count", "Clinical alias for Platelet Count"),
    
    "wbc": ("White Blood Cell Count", "2_medical_glossary.md: WBC maps to White Blood Cell Count"),
    "wbc count": ("White Blood Cell Count", "Clinical alias for White Blood Cell Count"),
    "white blood cells": ("White Blood Cell Count", "Clinical alias for White Blood Cell Count"),
    "white blood cell count": ("White Blood Cell Count", "4_ranges_hematology.md: White Blood Cell Count (WBC)"),
    
    "rbc": ("Red Blood Cell Count", "2_medical_glossary.md: RBC maps to Red Blood Cell Count"),
    "red blood cell count": ("Red Blood Cell Count", "2_medical_glossary.md"),
    
    # 6_ranges_thyroid_urine.md mappings
    "tsh": ("TSH", "6_ranges_thyroid_urine.md: TSH"),
    "thyroid stimulating hormone": ("TSH", "6_ranges_thyroid_urine.md"),
    
    "ph level": ("Urine pH", "6_ranges_thyroid_urine.md: Urine pH"),
    "urine ph": ("Urine pH", "6_ranges_thyroid_urine.md: Urine pH"),
    "ph": ("Urine pH", "6_ranges_thyroid_urine.md: Urine pH"),
    
    "protein": ("Urine Protein", "6_ranges_thyroid_urine.md: Urine Protein"),
    "urine protein": ("Urine Protein", "6_ranges_thyroid_urine.md: Urine Protein"),
    
    # Other analytes in ranges
    "cholesterol": ("Cholesterol", "5_ranges_biochemistry.md: Cholesterol"),
    "total cholesterol": ("Cholesterol", "Clinical alias for Total Cholesterol"),
    
    # Unknown tests (in corpus)
    "serum ferritin": ("Serum Ferritin", "report_P006_Fiona_UnknownTest.md (Not present in range sheets)"),
    "ferritin": ("Serum Ferritin", "report_P006_Fiona_UnknownTest.md"),
}

def normalize_test_name(reported_name: str) -> Tuple[str, str]:
    """
    Normalizes a reported test name or alias to its canonical standard name.
    Returns: (canonical_name, mapping_source)
    """
    cleaned = reported_name.strip().lower()
    if cleaned in ALIAS_MAP:
        return ALIAS_MAP[cleaned]
    
    # Fallback to reported title case
    return reported_name.strip(), "Direct test name (Unmapped alias)"
