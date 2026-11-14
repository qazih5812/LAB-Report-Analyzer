from typing import Tuple, Optional, List
from app.schemas import PatientReport, ClassifiedTestResult
from app.core.privacy import validate_privacy_context
from app.core.summary import MANDATORY_DISCLAIMER
from app.services.guardrails import sanitize_user_input, validate_llm_output
from app.services.llm_provider import llm_manager

CHAT_SYSTEM_PROMPT = """You are the CityLab Diagnostics Patient Q&A Assistant.
You are in a confidential session discussing ONLY ONE patient report.

CRITICAL PRIVACY & CLINICAL SAFETY DIRECTIVES (1_lab_safety_rules.md):
1. STRICT PRIVACY (Directive 1): Discuss ONLY the active patient whose results are provided below. NEVER mention, compare, or discuss records of other patients. If asked about another person, refuse immediately.
2. NO DIAGNOSTIC AUTHORITY (Directive 2): NEVER state or imply a medical diagnosis (e.g., do NOT say "you have diabetes" or "you have anemia"). Explain results in simple Class 8 words.
3. PRESERVE NUMERICAL VALUES: Refer only to the verified numbers and certified statuses provided in the context.
4. MANDATORY DISCLAIMER: Always advise consulting a licensed physician.
"""

def handle_patient_chat(
    active_report: PatientReport,
    classified_results: List[ClassifiedTestResult],
    raw_query: str
) -> Tuple[bool, str, Optional[str], str]:
    """
    Handles interactive patient chat with multi-layer defense:
    1. Privacy context-lock verification.
    2. Prompt injection sanitization.
    3. Multi-provider LLM response generation with deterministic fallback.
    4. Clinical output validation.
    Returns:
        (allowed, response_text, reason, provider_used)
    """
    # 1. Privacy context-lock check (Directive 1)
    is_allowed, refusal_msg, reason = validate_privacy_context(active_report, raw_query)
    if not is_allowed:
        return False, refusal_msg, reason, "privacy_guard"

    # 2. Prompt injection detection & sanitization
    sanitized_query, is_suspicious, injection_reason = sanitize_user_input(raw_query)

    # 3. Build deterministic baseline response
    urgent_items = [r for r in classified_results if r.is_urgent]
    abnormal_items = [r for r in classified_results if r.status in ["LOW", "HIGH", "URGENT_LOW", "URGENT_HIGH"]]

    det_lines = []
    clean_q = sanitized_query.lower()

    if "urgent" in clean_q or "critical" in clean_q or "danger" in clean_q:
        if urgent_items:
            triggers = ", ".join([f"{u.canonical_test} ({u.reported_value} {u.reported_unit or ''})" for u in urgent_items])
            det_lines.append(
                f"🚨 URGENT MEDICAL ALERT: Critical laboratory value(s) detected: {triggers}. "
                f"These levels require immediate medical evaluation. You must see a doctor today "
                f"or visit an emergency medical facility immediately."
            )
        else:
            det_lines.append("None of your laboratory test values were in the critical or urgent danger range.")
    elif "question" in clean_q or "doctor" in clean_q or "ask" in clean_q:
        det_lines.append(f"Here are key questions to discuss with your doctor regarding {active_report.patient_name}'s results:")
        for r in abnormal_items:
            det_lines.append(f"• What factors might have contributed to my {r.canonical_test} being {r.status.lower()} ({r.reported_value} {r.reported_unit or ''})?")
        if not abnormal_items:
            det_lines.append("• All of your test results were within standard normal reference ranges. What routine monitoring or lifestyle habits do you recommend to maintain healthy levels?")
    else:
        det_lines.append(f"Regarding the laboratory report for {active_report.patient_name} ({active_report.mrn}):")
        for res in classified_results:
            det_lines.append(f"- **{res.reported_test}** ({res.canonical_test}): Result is {res.reported_value} {res.reported_unit or ''} (Status: {res.status}). {res.status_reason}")
        if urgent_items:
            det_lines.append("\n🚨 URGENT: One or more test values are at critical levels. You must see a doctor today.")

    det_lines.append(f"\n{MANDATORY_DISCLAIMER}")
    deterministic_response = "\n".join(det_lines)

    # 4. If active provider is deterministic or input was suspicious, return deterministic response
    active_provider = llm_manager.get_active_primary_provider()
    if active_provider == "deterministic" or is_suspicious:
        note = "deterministic" if not is_suspicious else f"deterministic (injection neutralized: {injection_reason})"
        return True, deterministic_response, None, note

    # 5. Build prompt for LLM provider
    context_lines = [
        f"Active Patient: {active_report.patient_name} (MRN: {active_report.mrn})",
        f"Age: {active_report.recorded_age or 'Missing/Corrupted'}, Biological Sex: {active_report.biological_sex or 'Missing/Corrupted'}",
        "Certified Results:",
    ]
    for r in classified_results:
        context_lines.append(f"- {r.canonical_test}: {r.reported_value} {r.reported_unit or ''} -> Status: {r.status} (Range: {r.expected_range_display})")

    full_prompt = (
        f"PATIENT CONTEXT:\n{chr(10).join(context_lines)}\n\n"
        f"USER QUESTION: {sanitized_query}\n\n"
        f"ANSWER:"
    )

    llm_resp, provider_used = llm_manager.generate_completion(
        prompt=full_prompt,
        system_instruction=CHAT_SYSTEM_PROMPT
    )

    if not llm_resp:
        return True, deterministic_response, None, "deterministic (fallback)"

    # 6. Validate output
    is_valid, rej_reason = validate_llm_output(llm_resp, has_urgent_values=bool(urgent_items))
    if not is_valid:
        return True, deterministic_response, None, f"deterministic (fallback: {rej_reason})"

    # Ensure physician disclaimer is attached
    if "physician" not in llm_resp.lower() and "doctor" not in llm_resp.lower():
        llm_resp += f"\n\n{MANDATORY_DISCLAIMER}"

    return True, llm_resp, None, provider_used
