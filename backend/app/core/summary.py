from typing import List, Tuple, Optional
from app.schemas import ClassifiedTestResult, PatientReport

ANALYTE_DESCRIPTIONS = {
    "Hemoglobin": "Hemoglobin is a protein in red blood cells that carries oxygen from your lungs to the rest of your body.",
    "White Blood Cell Count": "White blood cells are part of your body's immune defense system that helps fight off infections.",
    "Platelet Count": "Platelets are tiny blood cell fragments that stick together to form clots and stop bleeding when you have a cut.",
    "Fasting Blood Sugar": "Fasting blood sugar measures the level of glucose (sugar) in your bloodstream after not eating overnight. Glucose provides energy to your cells.",
    "ALT": "ALT (Alanine Aminotransferase) is an enzyme found mostly inside liver cells that helps process nutrients.",
    "AST": "AST (Aspartate Aminotransferase) is an enzyme found in liver and muscle cells that helps your body break down amino acids.",
    "Cholesterol": "Cholesterol is a waxy, fat-like substance your body needs to build healthy cells and make hormones.",
    "TSH": "TSH (Thyroid Stimulating Hormone) is a chemical messenger made by your brain that directs your thyroid gland how much energy-regulating hormone to make.",
    "Urine pH": "Urine pH measures how acidic or alkaline your urine is.",
    "Urine Protein": "Urine protein checks whether kidneys are keeping vital proteins in the bloodstream where they belong.",
    "Serum Ferritin": "Serum Ferritin measures how much iron your body has stored away for future use."
}

MANDATORY_DISCLAIMER = (
    "NOTICE: This lab report explainer is for informational and educational purposes only. "
    "It does not provide medical diagnoses or treatment recommendations. Only a licensed "
    "medical doctor can diagnose conditions or interpret lab results in the context of your overall health."
)

def generate_layman_summary(
    patient_name: str,
    results: List[ClassifiedTestResult],
    is_demographics_missing: bool = False,
    demographics_message: Optional[str] = None
) -> Tuple[str, List[str], Optional[str]]:
    """
    Generates an 8th-grade educational explanation, 3-5 doctor questions,
    and urgent alerts strictly adhering to no-diagnosis safety rules.
    Returns:
        (layman_summary, doctor_questions, urgent_warning)
    """
    urgent_items = [r for r in results if r.is_urgent]
    abnormal_items = [r for r in results if r.status in ["LOW", "HIGH", "URGENT_LOW", "URGENT_HIGH"]]
    unclassified_items = [r for r in results if r.status == "CANNOT_BE_CLASSIFIED"]
    normal_items = [r for r in results if r.status == "NORMAL"]

    # 1. Urgent Warning
    urgent_warning = None
    if urgent_items:
        triggers = ", ".join([f"{u.canonical_test} ({u.reported_value} {u.reported_unit or ''})" for u in urgent_items])
        urgent_warning = (
            f"URGENT MEDICAL ALERT: Critical laboratory value(s) detected: {triggers}. "
            f"These levels require immediate medical evaluation. You must see a doctor today "
            f"or visit an emergency medical facility immediately."
        )

    # 2. Layman Summary Text
    paragraphs = []
    paragraphs.append(f"Here is a simple summary of the laboratory results for {patient_name}:")

    if is_demographics_missing:
        paragraphs.append(
            f"⚠️ Notice on Patient Details: {demographics_message or 'Some demographic details (age or biological sex) are missing or corrupted.'} "
            f"Because normal healthy ranges change depending on a person's age and biological sex, the laboratory cannot safely "
            f"pick a reference range without guessing. Please provide the missing details to see a full evaluation."
        )

    if urgent_warning:
        paragraphs.append(f"🚨 {urgent_warning}")

    # Describe each result in simple terms
    for r in results:
        desc = ANALYTE_DESCRIPTIONS.get(
            r.canonical_test,
            f"{r.canonical_test} is a laboratory test measuring specific markers in your body."
        )
        
        status_word = r.status.replace("_", " ")
        if r.status == "NORMAL":
            if r.is_boundary_value:
                note = f"Your result was {r.reported_value} {r.reported_unit or ''}, which sits right at the boundary limit of the standard healthy range ({r.expected_range_display}). Under lab rules, this is considered Normal."
            else:
                note = f"Your result was {r.reported_value} {r.reported_unit or ''}, which is within the standard healthy range ({r.expected_range_display})."
        elif r.status in ["URGENT_LOW", "LOW"]:
            note = f"Your result was {r.reported_value} {r.reported_unit or ''}, which is lower than the typical normal range ({r.expected_range_display})."
        elif r.status in ["URGENT_HIGH", "HIGH"]:
            if r.conversion_applied:
                note = f"Your result was reported as {r.reported_value} {r.reported_unit or ''}. When converted to standard lab units ({r.conversion_note}), it is {r.converted_value} {r.converted_unit}, which is higher than the typical healthy range ({r.expected_range_display})."
            else:
                note = f"Your result was {r.reported_value} {r.reported_unit or ''}, which is higher than the typical healthy range ({r.expected_range_display})."
        else:
            note = f"Your result was {r.reported_value} {r.reported_unit or ''}. This test cannot be classified from the laboratory's reference files ({r.status_reason})."

        paragraphs.append(f"• **{r.reported_test}** ({r.canonical_test}): {desc} {note}")

    summary_text = "\n\n".join(paragraphs)

    # 3. Formulate 3 to 5 targeted doctor questions
    doctor_questions: List[str] = []

    if urgent_items:
        for u in urgent_items:
            doctor_questions.append(
                f"My {u.canonical_test} level is at a critical level ({u.reported_value} {u.reported_unit or ''}). What immediate steps or re-testing do I need today?"
            )

    for ab in abnormal_items:
        if not ab.is_urgent:
            doctor_questions.append(
                f"What lifestyle, medication, or dietary factors might have caused my {ab.canonical_test} to be {ab.status.lower()} ({ab.reported_value} {ab.reported_unit or ''})?"
            )

    if unclassified_items:
        for unc in unclassified_items:
            doctor_questions.append(
                f"Could you explain what standard reference range you use for {unc.reported_test} and how my result of {unc.reported_value} should be interpreted?"
            )

    if is_demographics_missing:
        doctor_questions.append(
            "How do my age and biological sex influence the expected normal ranges for these specific tests?"
        )

    # General baseline question if fewer than 3 questions
    fallback_questions = [
        "Do you recommend repeating any of these tests in a few weeks to check for trends?",
        "Are there any specific symptoms or warning signs I should watch out for based on these findings?",
        "Should we consider any follow-up tests or changes to my daily routine based on these numbers?"
    ]
    for fq in fallback_questions:
        if len(doctor_questions) < 3:
            doctor_questions.append(fq)
        elif len(doctor_questions) >= 5:
            break

    # Limit to between 3 and 5 questions
    doctor_questions = doctor_questions[:5]

    return summary_text, doctor_questions, urgent_warning
