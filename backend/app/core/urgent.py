from typing import Optional, Tuple
from dataclasses import dataclass

@dataclass
class UrgentThreshold:
    analyte: str
    condition: str  # "less_than" or "greater_than"
    threshold: float
    unit: str
    source_file: str = "3_dangerous_urgent_values.md"

URGENT_THRESHOLDS = [
    UrgentThreshold("Hemoglobin", "less_than", 7.0, "g/dL"),
    UrgentThreshold("Fasting Blood Sugar", "greater_than", 300.0, "mg/dL"),
    UrgentThreshold("Platelet Count", "less_than", 50000.0, "cells/mcL"),
    UrgentThreshold("ALT", "greater_than", 1000.0, "U/L"),
]

def check_urgent_threshold(
    canonical_test: str,
    normalized_numeric_value: Optional[float]
) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Evaluates whether a normalized value triggers an urgent / critical condition.
    Returns:
        (is_urgent, urgent_status, urgent_trigger_description)
    """
    if normalized_numeric_value is None:
        return False, None, None

    for ut in URGENT_THRESHOLDS:
        if ut.analyte == canonical_test:
            if ut.condition == "less_than" and normalized_numeric_value < ut.threshold:
                desc = (
                    f"CRITICAL VALUE: {canonical_test} ({normalized_numeric_value} {ut.unit}) "
                    f"is less than urgent threshold ({ut.threshold} {ut.unit}) from {ut.source_file}. "
                    f"Requires immediate medical attention (see a doctor today)."
                )
                return True, "URGENT_LOW", desc
            elif ut.condition == "greater_than" and normalized_numeric_value > ut.threshold:
                desc = (
                    f"CRITICAL VALUE: {canonical_test} ({normalized_numeric_value} {ut.unit}) "
                    f"is greater than urgent threshold ({ut.threshold} {ut.unit}) from {ut.source_file}. "
                    f"Requires immediate medical attention (see a doctor today)."
                )
                return True, "URGENT_HIGH", desc

    return False, None, None
