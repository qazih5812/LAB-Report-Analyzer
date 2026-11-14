from typing import Optional, Tuple

# Standard target units per canonical analyte
STANDARD_UNITS = {
    "Hemoglobin": "g/dL",
    "White Blood Cell Count": "cells/mcL",
    "Platelet Count": "cells/mcL",
    "Fasting Blood Sugar": "mg/dL",
    "ALT": "U/L",
    "AST": "U/L",
    "Cholesterol": "mg/dL",
    "TSH": "mIU/L",
    "Urine pH": None,
    "Urine Protein": None,
}

# Standard clinical conversion factor for blood glucose:
# Glucose (C6H12O6) molar mass = 180.156 g/mol
# 1 mmol/L = 18.0156 mg/dL -> standard clinical factor 18.0 mg/dL per mmol/L
GLUCOSE_MMOL_TO_MGDL_FACTOR = 18.0

def normalize_unit_and_value(
    canonical_test: str,
    reported_value_str: str,
    reported_unit: Optional[str]
) -> Tuple[Optional[float], Optional[str], bool, Optional[str], bool]:
    """
    Normalizes reported value and unit to standard reference unit.
    Returns:
        (converted_value, target_unit, conversion_applied, conversion_note, is_valid_conversion)
    """
    target_unit = STANDARD_UNITS.get(canonical_test)
    
    # Try converting raw value to float (handling commas such as "150,000")
    val: Optional[float] = None
    try:
        clean_num_str = str(reported_value_str).replace(",", "").strip()
        val = float(clean_num_str)
    except (ValueError, TypeError):
        # Non-numeric result (e.g. "Negative", "Pending", "Corrupted")
        return None, reported_unit, False, None, True

    norm_rep_unit = reported_unit.strip().lower() if reported_unit else ""
    norm_tgt_unit = target_unit.strip().lower() if target_unit else ""

    # Case 1: Glucose / Fasting Blood Sugar in mmol/L -> mg/dL
    if canonical_test == "Fasting Blood Sugar" and "mmol" in norm_rep_unit:
        converted_val = round(val * GLUCOSE_MMOL_TO_MGDL_FACTOR, 1)
        note = (
            f"Unit conversion applied: {val} mmol/L × {GLUCOSE_MMOL_TO_MGDL_FACTOR} "
            f"= {converted_val} mg/dL (Standard clinical glucose factor: 18.0 mg/dL per mmol/L)"
        )
        return converted_val, target_unit, True, note, True

    # Case 2: Unit matches target or no unit required
    if not reported_unit or norm_rep_unit == norm_tgt_unit:
        return val, target_unit, False, None, True

    # Case 3: Variations in spelling (e.g., u/l vs U/L, g/dl vs g/dL, cells/mcl vs cells/mcL)
    if norm_rep_unit.replace("/", "").replace(" ", "") == norm_tgt_unit.replace("/", "").replace(" ", ""):
        return val, target_unit, False, None, True

    # Case 4: Incompatible unit that cannot be converted
    note = f"Reported unit '{reported_unit}' cannot be converted to expected reference unit '{target_unit}'."
    return val, reported_unit, False, note, False
