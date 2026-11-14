from typing import Tuple, Optional, List, Dict, Any
from app.schemas import PatientReport, ClassifiedTestResult, CitationInfo
from app.core.privacy import validate_privacy_context
from app.core.summary import MANDATORY_DISCLAIMER, get_disclaimer
from app.services.guardrails import sanitize_user_input, validate_llm_output
from app.services.llm_provider import llm_manager

CHAT_SYSTEM_PROMPT = """You are the CityLab Diagnostics Patient Q&A Assistant.
You are in a confidential session discussing ONLY ONE patient report.

CRITICAL PRIVACY & CLINICAL SAFETY DIRECTIVES (1_lab_safety_rules.md):
1. STRICT PRIVACY (Directive 1): Discuss ONLY the active patient whose results are provided below. NEVER mention, compare, or discuss records of other patients. If asked about another person, refuse immediately.
2. NO DIAGNOSTIC AUTHORITY (Directive 2): NEVER state or imply a medical diagnosis (e.g., do NOT say "you have diabetes" or "you have anemia"). Explain results in simple Class 8 words.
3. PRESERVE NUMERICAL VALUES: Refer only to the verified numbers and certified statuses provided in the context. Never change numbers or units.
4. MANDATORY DISCLAIMER: Always advise consulting a licensed physician.
"""

EMERGENCY_KEYWORDS = [
    "chest pain", "shortness of breath", "can't breathe", "cannot breathe",
    "difficulty breathing", "fainting", "passed out", "loss of consciousness",
    "coughing blood", "sudden weakness", "numbness", "severe bleeding",
    "severe allergic", "anaphylaxis", "crushing pressure"
]

DEFAULT_CITATIONS = [
    CitationInfo(
        source="World Health Organization (WHO)",
        url="https://www.who.int/publications/i/item/9789240011311",
        topic="Clinical laboratory reference standards & safety",
        retrieved_at="2026-11-14"
    ),
    CitationInfo(
        source="MedlinePlus (US National Library of Medicine)",
        url="https://medlineplus.gov/lab-tests/",
        topic="Understanding your lab test ranges and clinical significance",
        retrieved_at="2026-11-14"
    ),
    CitationInfo(
        source="NHS - Pathology Guide",
        url="https://www.nhs.uk/conditions/blood-tests/",
        topic="Blood tests reference and healthcare consultation advice",
        retrieved_at="2026-11-14"
    )
]

class ChatResult(tuple):
    """A 4-tuple that unrolls into (allowed, response, reason, provider) for backward compatibility,
    while carrying citations and emergency flags as attributes."""
    def __new__(cls, allowed, response, reason, provider, citations=None, is_emergency=False):
        return super().__new__(cls, (allowed, response, reason, provider))

    def __init__(self, allowed, response, reason, provider, citations=None, is_emergency=False):
        self.citations = citations or []
        self.is_emergency = is_emergency

def handle_patient_chat(
    active_report: PatientReport,
    classified_results: List[ClassifiedTestResult],
    raw_query: str,
    language: str = "en"
) -> ChatResult:
    """
    Handles interactive patient chat with multi-layer defense:
    1. Privacy context-lock verification.
    2. Prompt injection sanitization.
    3. Multi-provider LLM response generation with deterministic fallback.
    4. Emergency keyword triage detection.
    5. WHO/MedlinePlus/NHS citations.
    6. Multilingual localization.
    """
    # 1. Privacy context-lock check (Directive 1)
    is_allowed, refusal_msg, reason = validate_privacy_context(active_report, raw_query)
    if not is_allowed:
        return ChatResult(False, refusal_msg, reason, "privacy_guard", citations=[], is_emergency=False)

    # 2. Prompt injection detection & sanitization
    sanitized_query, is_suspicious, injection_reason = sanitize_user_input(raw_query)

    # 3. Detect clinical emergency red-flags
    q_lower = sanitized_query.lower()
    is_emergency = any(kw in q_lower for kw in EMERGENCY_KEYWORDS)
    emergency_prefix = ""
    if is_emergency:
        if language == "ur":
            emergency_prefix = "🚨 ہنگامی طبی الرٹ: اگر آپ کو سینے میں درد یا سانس لینے میں شدید دشواری کا سامنا ہے تو فوراً قریبی ایمرجنسی سنٹر (1122) سے رجوع کریں۔\n\n"
        elif language == "roman_ur":
            emergency_prefix = "🚨 EMERGENCY MEDICAL ALERT: Agar aap ko seene me dard ya saans lene me takleef ho rahi hai to foran emergency (1122) ya qareebi hospital tashreef le jayen.\n\n"
        elif language == "ar":
            emergency_prefix = "🚨 تنبيه طبي طارئ: إذا كنت تعاني من ألم في الصدر أو صعوبة في التنفس، يرجى التوجه إلى قسم الطوارئ فوراً.\n\n"
        else:
            emergency_prefix = "🚨 EMERGENCY MEDICAL ALERT: If you are experiencing acute symptoms like chest pain or severe shortness of breath, please call emergency services (911 / 1122) or visit the nearest emergency room immediately.\n\n"

    # Select appropriate disclaimer for language
    active_disclaimer = get_disclaimer(language)

    # 4. Build deterministic baseline response
    urgent_items = [r for r in classified_results if r.is_urgent]
    abnormal_items = [r for r in classified_results if r.status in ["LOW", "HIGH", "URGENT_LOW", "URGENT_HIGH"]]

    det_lines = []
    if emergency_prefix:
        det_lines.append(emergency_prefix.strip())

    if "urgent" in q_lower or "critical" in q_lower or "danger" in q_lower or "khatarnak" in q_lower:
        if urgent_items:
            triggers = ", ".join([f"{u.canonical_test} ({u.reported_value} {u.reported_unit or ''})" for u in urgent_items])
            if language == "ur":
                det_lines.append(f"🚨 فوری توجہ درکار ہے: مندرجہ ذیل ٹیسٹ خطرے کی حد میں ہیں: {triggers}۔ آپ کو آج ہی ڈاکٹر سے رجوع کرنا چاہیے۔")
            elif language == "roman_ur":
                det_lines.append(f"🚨 FORI ALERT: Critical test values paye gaye hain: {triggers}. Aap ko foran doctor se rabta karna chahiye.")
            elif language == "ar":
                det_lines.append(f"🚨 تنبيه عاجل: قيم حرجة تم اكتشافها: {triggers}. يجب عليك مراجعة الطبيب اليوم فوراً.")
            else:
                det_lines.append(
                    f"🚨 URGENT MEDICAL ALERT: Critical laboratory value(s) detected: {triggers}. "
                    f"These levels require immediate medical evaluation. You must see a doctor today "
                    f"or visit an emergency medical facility immediately."
                )
        else:
            if language == "ur":
                det_lines.append("آپ کی کوئی بھی رپورٹ فوری یا خطرناک حد میں نہیں ہے۔")
            elif language == "roman_ur":
                det_lines.append("Aap ka koi bhi test result urgent ya critical range me nahi hai.")
            elif language == "ar":
                det_lines.append("لا توجد أي نتائج تقع في النطاق الحرج أو الطارئ.")
            else:
                det_lines.append("None of your laboratory test values were in the critical or urgent danger range.")
    elif "question" in q_lower or "doctor" in q_lower or "ask" in q_lower or "sawal" in q_lower:
        det_lines.append(f"Key questions for doctor regarding {active_report.patient_name}'s results:")
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

    det_lines.append(f"\n{active_disclaimer}")
    deterministic_response = "\n".join(det_lines)

    # 5. Check if provider is available
    active_provider = llm_manager.get_active_primary_provider()
    if active_provider == "deterministic" or is_suspicious:
        note = "deterministic" if not is_suspicious else f"deterministic (injection neutralized: {injection_reason})"
        return ChatResult(True, deterministic_response, None, note, citations=DEFAULT_CITATIONS, is_emergency=is_emergency)

    # 6. Build prompt for LLM provider with language directives
    context_lines = [
        f"Active Patient: {active_report.patient_name} (MRN: {active_report.mrn})",
        f"Age: {active_report.recorded_age or 'Missing/Corrupted'}, Biological Sex: {active_report.biological_sex or 'Missing/Corrupted'}",
        "Certified Results:",
    ]
    for r in classified_results:
        context_lines.append(f"- {r.canonical_test}: {r.reported_value} {r.reported_unit or ''} -> Status: {r.status} (Range: {r.expected_range_display})")

    lang_instruction = "Respond in clear English."
    if language == "ur":
        lang_instruction = "Respond in Urdu (اردو). Preserve exact medical test names and units in English script."
    elif language == "roman_ur":
        lang_instruction = "Respond in Roman Urdu (informal conversational Urdu using Latin alphabet). Preserve medical test names and units."
    elif language == "ar":
        lang_instruction = "Respond in Modern Standard Arabic (العربية). Preserve exact medical test names and units in English script."

    full_prompt = (
        f"PATIENT CONTEXT:\n{chr(10).join(context_lines)}\n\n"
        f"LANGUAGE DIRECTIVE: {lang_instruction}\n\n"
        f"USER QUESTION: {sanitized_query}\n\n"
        f"ANSWER:"
    )

    llm_resp, provider_used = llm_manager.generate_completion(
        prompt=full_prompt,
        system_instruction=CHAT_SYSTEM_PROMPT
    )

    if not llm_resp:
        return ChatResult(True, deterministic_response, None, "deterministic (fallback)", citations=DEFAULT_CITATIONS, is_emergency=is_emergency)

    # 7. Validate output
    is_valid, rej_reason = validate_llm_output(llm_resp, has_urgent_values=bool(urgent_items))
    if not is_valid:
        return ChatResult(True, deterministic_response, None, f"deterministic (fallback: {rej_reason})", citations=DEFAULT_CITATIONS, is_emergency=is_emergency)

    # Attach emergency prefix if triggered
    final_resp = llm_resp
    if emergency_prefix and emergency_prefix not in final_resp:
        final_resp = emergency_prefix + final_resp

    # Ensure physician disclaimer is attached
    if "physician" not in final_resp.lower() and "doctor" not in final_resp.lower():
        final_resp += f"\n\n{active_disclaimer}"

    return ChatResult(True, final_resp, None, provider_used, citations=DEFAULT_CITATIONS, is_emergency=is_emergency)
