import re
from typing import Tuple, Optional, Dict, List
from app.schemas import PatientReport

# Roster of known patients in CityLab corpus to prevent cross-patient data leaks
KNOWN_PATIENT_NAMES = {
    "P001": ["alice", "alice smith", "cld-p001"],
    "P002": ["bob", "bob jones", "cld-p002"],
    "P003": ["charlie", "charlie brown", "cld-p003"],
    "P004": ["diana", "diana prince", "cld-p004"],
    "P005": ["ethan", "ethan hunt", "cld-p005"],
    "P006": ["fiona", "fiona gallagher", "cld-p006"],
    "P007": ["george", "george costanza", "cld-p007"],
    "P008": ["haley", "haley dunphy", "cld-p008"],
    "P009": ["ian", "ian malcolm", "cld-p009"],
    "P010": ["julia", "julia child", "cld-p010"],
    "P011": ["kevin", "kevin hart", "cld-p011"],
    "P012": ["laura", "laura croft", "cld-p012"],
    "P013": ["michael", "michael scott", "cld-p013"],
    "P014": ["nancy", "nancy drew", "cld-p014"],
}

def validate_privacy_context(
    active_patient: PatientReport,
    user_query: str
) -> Tuple[bool, str, Optional[str]]:
    """
    Enforces strict context-locking (Directive 1 from 1_lab_safety_rules.md).
    Returns:
        (is_allowed, response_message, violation_reason)
    """
    clean_query = user_query.lower()
    active_pid = active_patient.patient_id.upper()

    # Generic other-patient probing terms
    generic_probes = [
        "another patient", "other patient", "someone else",
        "previous patient", "next patient", "all patients",
        "other people", "other reports"
    ]
    for probe in generic_probes:
        if probe in clean_query:
            msg = (
                f"Under CityLab Diagnostics lab safety rules and patient privacy protections "
                f"(1_lab_safety_rules.md Directive 1), I cannot discuss other patient records. "
                f"I operate under a strict context-lock and can only answer questions regarding "
                f"{active_patient.patient_name} ({active_patient.mrn})."
            )
            return False, msg, f"Query requested information on '{probe}'."

    # Check for references to other known patients in the corpus
    for other_pid, tokens in KNOWN_PATIENT_NAMES.items():
        if other_pid != active_pid:
            # Check ID match (e.g. "P002")
            if re.search(rf"\b{other_pid.lower()}\b", clean_query):
                msg = (
                    f"Under CityLab Diagnostics lab safety rules (Directive 1: Privacy and Data Protection), "
                    f"I cannot disclose records for patient {other_pid}. "
                    f"I am restricted to discussing only {active_patient.patient_name} ({active_patient.mrn})."
                )
                return False, msg, f"Query specifically referenced external patient ID '{other_pid}'."

            # Check name or MRN tokens
            for token in tokens:
                if re.search(rf"\b{re.escape(token)}\b", clean_query):
                    msg = (
                        f"Under CityLab Diagnostics lab safety rules (Directive 1: Privacy and Data Protection), "
                        f"I cannot disclose or discuss records for {token.title()} ({other_pid}). "
                        f"I am restricted to discussing only {active_patient.patient_name} ({active_patient.mrn})."
                    )
                    return False, msg, f"Query specifically referenced external patient identifier '{token}'."

    return True, "", None
