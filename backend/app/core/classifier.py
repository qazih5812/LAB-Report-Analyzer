from typing import Optional, Dict, Any, List
from app.schemas import RawTestResult, ClassifiedTestResult
from app.core.aliases import normalize_test_name
from app.core.units import normalize_unit_and_value
from app.core.ranges import get_reference_interval, REFERENCE_RANGES
from app.core.urgent import check_urgent_threshold

def classify_test_result(
    raw_result: RawTestResult,
    age: Optional[int],
    sex: Optional[str]
) -> ClassifiedTestResult:
    """
    Deterministically classifies a single test result following all laboratory rules,
    boundary constraints, unit conversions, and urgent thresholds.
    """
    # 1. Alias normalization
    canonical_name, alias_source = normalize_test_name(raw_result.test_name)

    # Check if analyte exists anywhere in the authoritative reference sheets (Core Directive 4)
    matching_analytes = [r for r in REFERENCE_RANGES if r.analyte == canonical_name]
    if not matching_analytes:
        return ClassifiedTestResult(
            reported_test=raw_result.test_name,
            canonical_test=canonical_name,
            reported_value=raw_result.raw_value,
            reported_unit=raw_result.unit,
            converted_value=None,
            converted_unit=None,
            conversion_applied=False,
            conversion_note=None,
            applicable_min=None,
            applicable_max=None,
            expected_range_display="N/A",
            status="CANNOT_BE_CLASSIFIED",
            is_urgent=False,
            is_boundary_value=False,
            source_file="1_lab_safety_rules.md",
            status_reason="Test is not present in the reference sheets (cannot be classified from the files)."
        )

    # 2. Unit and value normalization
    (
        norm_val,
        norm_unit,
        conv_applied,
        conv_note,
        is_valid_unit
    ) = normalize_unit_and_value(canonical_name, raw_result.raw_value, raw_result.unit)

    # Handle incompatible unit
    if not is_valid_unit:
        return ClassifiedTestResult(
            reported_test=raw_result.test_name,
            canonical_test=canonical_name,
            reported_value=raw_result.raw_value,
            reported_unit=raw_result.unit,
            converted_value=None,
            converted_unit=None,
            conversion_applied=False,
            conversion_note=conv_note,
            applicable_min=None,
            applicable_max=None,
            expected_range_display="N/A",
            status="CANNOT_BE_CLASSIFIED",
            is_urgent=False,
            is_boundary_value=False,
            source_file="1_lab_safety_rules.md",
            status_reason=conv_note or "Incompatible unit of measurement (cannot be classified from the files)."
        )

    # 3. Reference range lookup (checking age and sex)
    interval, range_reason = get_reference_interval(canonical_name, age, sex)

    if not interval:
        return ClassifiedTestResult(
            reported_test=raw_result.test_name,
            canonical_test=canonical_name,
            reported_value=raw_result.raw_value,
            reported_unit=raw_result.unit,
            converted_value=norm_val if conv_applied else None,
            converted_unit=norm_unit if conv_applied else None,
            conversion_applied=conv_applied,
            conversion_note=conv_note,
            applicable_min=None,
            applicable_max=None,
            expected_range_display="N/A",
            status="CANNOT_BE_CLASSIFIED",
            is_urgent=False,
            is_boundary_value=False,
            source_file="1_lab_safety_rules.md",
            status_reason=range_reason
        )

    # 4. Check urgent / critical thresholds (cannot be downgraded)
    is_urgent, urgent_status, urgent_desc = check_urgent_threshold(canonical_name, norm_val)

    # 5. Handle qualitative / categorical test (e.g. Urine Protein)
    if interval.expected_categorical is not None:
        reported_str = str(raw_result.raw_value).strip().lower()
        expected_str = interval.expected_categorical.strip().lower()
        
        if reported_str == expected_str:
            status = "NORMAL"
            reason = f"Qualitative result '{raw_result.raw_value}' matches expected normal '{interval.expected_categorical}'."
        else:
            status = "HIGH"
            reason = f"Qualitative result '{raw_result.raw_value}' differs from expected normal '{interval.expected_categorical}'."

        return ClassifiedTestResult(
            reported_test=raw_result.test_name,
            canonical_test=canonical_name,
            reported_value=raw_result.raw_value,
            reported_unit=raw_result.unit,
            converted_value=None,
            converted_unit=None,
            conversion_applied=False,
            conversion_note=None,
            applicable_min=None,
            applicable_max=None,
            expected_range_display=interval.expected_categorical,
            status=status,
            is_urgent=False,
            is_boundary_value=False,
            source_file=interval.source_file,
            status_reason=reason
        )

    # 6. Handle numeric test classification
    val = norm_val
    min_norm = interval.min_normal
    max_norm = interval.max_normal

    range_display = f"{min_norm} - {max_norm} {interval.unit or ''}".strip()
    is_boundary = False

    # Check exact boundary edge-case rule:
    # "If a patient's analytical value sits exactly on a lower or upper range limit,
    # the algorithmic classification MUST mark it as NORMAL."
    if val is not None and (val == min_norm or val == max_norm):
        is_boundary = True
        status = "NORMAL"
        which_limit = "lower" if val == min_norm else "upper"
        reason = (
            f"Value ({val}) sits exactly on the {which_limit} normal limit ({val}). "
            f"Classified as NORMAL per laboratory edge-case rule ({interval.source_file})."
        )
    elif val is not None and min_norm is not None and val < min_norm:
        if is_urgent and urgent_status == "URGENT_LOW":
            status = "URGENT_LOW"
            reason = urgent_desc or "Critical low value."
        else:
            status = "LOW"
            reason = f"Value ({val}) is below normal lower limit ({min_norm})."
    elif val is not None and max_norm is not None and val > max_norm:
        if is_urgent and urgent_status == "URGENT_HIGH":
            status = "URGENT_HIGH"
            reason = urgent_desc or "Critical high value."
        else:
            status = "HIGH"
            reason = f"Value ({val}) is above normal upper limit ({max_norm})."
    else:
        status = "NORMAL"
        reason = f"Value ({val}) is within normal reference interval [{min_norm} - {max_norm}]."

    return ClassifiedTestResult(
        reported_test=raw_result.test_name,
        canonical_test=canonical_name,
        reported_value=raw_result.raw_value,
        reported_unit=raw_result.unit,
        converted_value=norm_val if conv_applied else None,
        converted_unit=norm_unit if conv_applied else None,
        conversion_applied=conv_applied,
        conversion_note=conv_note,
        applicable_min=min_norm,
        applicable_max=max_norm,
        expected_range_display=range_display,
        status=status,
        is_urgent=is_urgent,
        urgent_trigger=urgent_desc if is_urgent else None,
        is_boundary_value=is_boundary,
        source_file=interval.source_file,
        status_reason=reason
    )
