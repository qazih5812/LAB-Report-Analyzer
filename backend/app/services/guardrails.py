import re
from typing import Tuple, List, Optional

# Prohibited prompt injection patterns
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous\s+|prior\s+|above\s+)?(instructions|prompts|rules|guidelines)",
    r"disregard\s+(all\s+)?(previous\s+|prior\s+|system\s+)?(instructions|rules|guidelines)",
    r"forget\s+(all\s+)?(previous\s+|prior\s+)?instructions",
    r"you\s+are\s+now\s+(a\s+doctor|unrestricted|dan|in\s+developer\s+mode)",
    r"pretend\s+you\s+are\s+(a\s+doctor|a\s+physician|unrestricted)",
    r"bypass\s+(safety|privacy|rules|filters)",
    r"(reveal|print|show)\s+(system\s+prompt|hidden\s+instructions|secret\s+key)",
    r"act\s+as\s+(an\s+unconstrained|a\s+diagnosing|a\s+licensed\s+physician)",
    r"give\s+me\s+a\s+formal\s+medical\s+diagnosis",
    r"override\s+system\s+directive",
    r"disable\s+privacy\s+mode",
    r"jailbreak",
    r"admin\s+mode",
]

# Prohibited diagnostic phrases in generated output (Directive 2: No Diagnostic Authority)
PROHIBITED_DIAGNOSTIC_PHRASES = [
    r"\byou\s+have\s+(diabetes|anemia|hepatitis|leukemia|cancer|infection|thyroid\s+disease|hyperglycemia)\b",
    r"\bpatient\s+has\s+(diabetes|anemia|hepatitis|leukemia|cancer|infection)\b",
    r"\byou\s+are\s+diagnosed\s+with\b",
    r"\bi\s+diagnose\s+you\s+with\b",
    r"\bthis\s+proves\s+you\s+have\b",
    r"\byou\s+suffer\s+from\b",
]

def sanitize_user_input(user_query: str) -> Tuple[str, bool, Optional[str]]:
    """
    Scans for and neutralizes prompt injection attempts.
    Returns:
        (sanitized_query, is_suspicious, injection_reason)
    """
    clean = user_query.strip()
    
    # Check injection patterns
    for pat in INJECTION_PATTERNS:
        if re.search(pat, clean, re.IGNORECASE):
            # Neutralize: wrap with safe containment and flag
            sanitized = re.sub(pat, "[FILTERED PROMPT INJECTION]", clean, flags=re.IGNORECASE)
            return (
                sanitized,
                True,
                f"Prompt injection pattern detected: '{pat}'"
            )

    # General sanity checks (excessive length, control characters)
    if len(clean) > 2000:
        clean = clean[:2000]
        return clean, True, "Input truncated to 2000 characters."

    return clean, False, None

def validate_llm_output(
    generated_text: str,
    has_urgent_values: bool = False
) -> Tuple[bool, Optional[str]]:
    """
    Validates LLM-generated output against clinical safety guidelines:
    1. No diagnostic claims (Directive 2).
    2. Must preserve urgent warnings when critical values exist.
    Returns:
        (is_valid, rejection_reason)
    """
    if not generated_text or len(generated_text.strip()) < 20:
        return False, "Generated text is empty or too brief."

    # 1. Check for diagnostic authority violations
    for pat in PROHIBITED_DIAGNOSTIC_PHRASES:
        if re.search(pat, generated_text, re.IGNORECASE):
            return False, f"Output violated no-diagnosis rule (Directive 2): matched '{pat}'."

    # 2. Check urgent preservation
    if has_urgent_values:
        # Output must contain an urgent indicator or referral to a doctor
        urgent_indicators = ["urgent", "critical", "doctor", "emergency", "immediate", "today"]
        matches = [ind for ind in urgent_indicators if ind in generated_text.lower()]
        if len(matches) < 2:
            return False, "Output failed to properly convey urgent medical warning for critical values."

    return True, None
