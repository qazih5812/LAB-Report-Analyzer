import re
from typing import List, Tuple, Optional, Dict, Any

from app.schemas import ClassifiedTestResult
from app.core.summary import (
    generate_layman_summary as deterministic_summary_fn,
    MANDATORY_DISCLAIMER
)
from app.services.llm_provider import llm_manager
from app.services.guardrails import validate_llm_output

EXPLAINER_SYSTEM_PROMPT = """You are the CityLab Diagnostics Educational Explainer Assistant (Problem Statement B).
Your ONLY job is to explain the patient's laboratory test results in simple everyday words that a Class 8 (8th grade) student can follow.

STRICT LABORATORY SAFETY DIRECTIVES (1_lab_safety_rules.md):
1. NO DIAGNOSTIC AUTHORITY: Never state or imply that the patient has a specific disease or medical condition (e.g., NEVER say "you have diabetes", "you have anemia", "you have hepatitis"). Only explain what the test measures in the body.
2. PRESERVE DETERMINISTIC CLASSIFICATIONS: All test classifications (NORMAL, LOW, HIGH, URGENT_LOW, URGENT_HIGH, CANNOT_BE_CLASSIFIED) have already been certified by the laboratory's deterministic rules engine. You must NEVER re-classify or alter any test status.
3. UNCLASSIFIED TESTS: If a test is marked CANNOT_BE_CLASSIFIED, state clearly that it cannot be classified from the laboratory's reference files. Do not invent reference ranges.
4. MISSING DEMOGRAPHICS: If demographic details are missing or corrupted, state that healthy normal ranges depend on age and sex, and remind the user to provide them.
5. URGENT WARNING: If any value is marked URGENT_LOW or URGENT_HIGH, you MUST add a severe prominent warning: "URGENT WARNING: You must see a doctor today or visit an emergency medical facility."
6. DOCTOR QUESTIONS: Formulate exactly 3 to 5 clear questions based on any abnormal or unclassified results for the patient to ask their physician.
7. DISCLAIMER: Always state that only a licensed physician can diagnose conditions.
"""

def generate_enhanced_explanation(
    patient_name: str,
    results: List[ClassifiedTestResult],
    is_demographics_missing: bool = False,
    demographics_message: Optional[str] = None,
    language: str = "en",
    eli10: bool = False
) -> Tuple[str, List[str], Optional[str], str]:
    """
    Generates layman explanation and doctor questions using Provider Priority:
    Gemini -> Groq -> OpenRouter -> Deterministic Fallback.
    Supports English, Urdu, Roman Urdu, and Arabic, and Explain-Like-I'm-10 mode.
    Validates output through clinical guardrails.
    Returns:
        (layman_summary, doctor_questions, urgent_warning, provider_used)
    """
    # 1. Generate guaranteed deterministic baseline in target language
    det_summary, det_questions, det_warning = deterministic_summary_fn(
        patient_name=patient_name,
        results=results,
        is_demographics_missing=is_demographics_missing,
        demographics_message=demographics_message,
        language=language,
        eli10=eli10
    )

    has_urgent = any(r.is_urgent for r in results)

    # If no external provider is configured, return deterministic immediately
    active_provider = llm_manager.get_active_primary_provider()
    if active_provider == "deterministic":
        return det_summary, det_questions, det_warning, "deterministic"

    # Language instruction
    lang_map = {
        "ur": "Urdu (اردو)",
        "roman_ur": "Roman Urdu (Urdu written in English alphabet)",
        "ar": "Arabic (العربية)",
        "en": "English"
    }
    lang_name = lang_map.get(language, "English")

    simplicity_instruction = (
        "EXPLAIN LIKE I'M 10 (ELI10): Use extremely simple child-friendly words and fun bodily analogies (e.g. oxygen delivery trucks, superhero white blood cells)."
        if eli10 else
        "Explain in simple Class 8 (8th grade) everyday language."
    )

    # 2. Build structured prompt for LLM
    results_prompt_lines = []
    for r in results:
        conv_info = f" (Converted: {r.converted_value} {r.converted_unit})" if r.conversion_applied else ""
        results_prompt_lines.append(
            f"- Test: {r.reported_test} (Canonical: {r.canonical_test})\n"
            f"  Reported Value: {r.reported_value} {r.reported_unit or ''}{conv_info}\n"
            f"  Expected Normal Range: {r.expected_range_display}\n"
            f"  Certified Status: {r.status} (Boundary limit: {r.is_boundary_value}, Urgent: {r.is_urgent})\n"
            f"  Laboratory Reason: {r.status_reason}\n"
        )

    user_prompt = f"""Patient: {patient_name}
Language Required: {lang_name} ({language})
Simplicity Level: {simplicity_instruction}
Demographics Note: {demographics_message or 'Demographics complete'}
Certified Laboratory Results:
{chr(10).join(results_prompt_lines)}

INSTRUCTIONS:
1. Write an educational explanation of these results in {lang_name}.
2. IMPORTANT: Keep all medical test names (e.g. Hemoglobin, Fasting Blood Sugar, ALT) and measurement units (g/dL, mg/dL, cells/mcL) unchanged.
3. Formulate a numbered list of exactly 3 to 5 questions in {lang_name} for the patient to ask their doctor.
4. If urgent values exist, include the urgent medical warning advising to see a doctor today.
5. NEVER state or imply a medical diagnosis (Directive 2).
"""

    # 3. Call LLM through provider priority manager
    llm_text, provider_used = llm_manager.generate_completion(
        prompt=user_prompt,
        system_instruction=EXPLAINER_SYSTEM_PROMPT
    )

    if not llm_text:
        return det_summary, det_questions, det_warning, "deterministic (fallback)"

    # 4. Validate LLM output with strict guardrails
    is_valid, rejection_reason = validate_llm_output(llm_text, has_urgent_values=has_urgent)
    if not is_valid:
        # Rejection: fall back seamlessly to deterministic baseline
        return det_summary, det_questions, det_warning, f"deterministic (fallback: {rejection_reason})"

    # 5. Extract doctor questions from LLM text if present
    extracted_questions = []
    for line in llm_text.splitlines():
        q_match = re.match(r"^\s*(?:\d+[\.\)]|[-*])\s+(.+\?)\s*$", line)
        if q_match:
            extracted_questions.append(q_match.group(1).strip())

    if len(extracted_questions) < 3 or len(extracted_questions) > 5:
        final_questions = det_questions
    else:
        final_questions = extracted_questions

    return llm_text, final_questions, det_warning, provider_used
