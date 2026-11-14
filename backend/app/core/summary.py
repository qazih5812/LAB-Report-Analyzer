from typing import List, Tuple, Optional, Dict
from app.schemas import ClassifiedTestResult

# Standard educational descriptions (Class 8 level)
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

# Explain Like I'm 10 (ELI10) simplified descriptions
ANALYTE_ELI10 = {
    "Hemoglobin": "Hemoglobin is like a fleet of tiny red delivery trucks that carry fresh oxygen all around your body.",
    "White Blood Cell Count": "White blood cells are your body's personal superhero team defending you against germs and bugs.",
    "Platelet Count": "Platelets are tiny sticky Lego bricks that quickly build a wall to stop you from bleeding when you scrape a knee.",
    "Fasting Blood Sugar": "Blood sugar is the fuel that powers your brain and muscles, like gasoline in a race car.",
    "ALT": "ALT is a helpful little worker that lives in your liver and helps clean up what you eat and drink.",
    "AST": "AST is a helper engine in your liver and muscles that helps turn food into building blocks.",
    "Cholesterol": "Cholesterol is like building putty that your body uses to wrap and protect all of its cells.",
    "TSH": "TSH is the boss messenger that tells your neck gland how fast your body should run today.",
    "Urine pH": "Urine pH is a test that shows if your pee is more sour like lemonade or mild like plain water.",
    "Urine Protein": "Urine protein checks if your kidney filters have tiny leaks letting healthy building blocks slip away.",
    "Serum Ferritin": "Ferritin is your body's piggy bank where it saves extra iron for a rainy day."
}

MANDATORY_DISCLAIMER_EN = (
    "NOTICE: This lab report explainer is for informational and educational purposes only. "
    "It does not provide medical diagnoses or treatment recommendations. Only a licensed "
    "medical doctor can diagnose conditions or interpret lab results in the context of your overall health."
)

MANDATORY_DISCLAIMER_UR = (
    "نوٹس: یہ لیب رپورٹ وضاحتی نظام صرف تعلیمی اور معلوماتی مقاصد کے لیے ہے۔ "
    "یہ کوئی باضابطہ طبی تشخیص یا علاج کی سفارشات فراہم نہیں کرتا۔ صرف ایک مستند "
    "ڈاکٹر ہی آپ کی مکمل صحت کے تناظر میں نتائج کی جانچ کر کے تشخیص کر سکتا ہے۔"
)

MANDATORY_DISCLAIMER_ROMAN = (
    "NOTICE: Yeh lab report explainer sirf maloomat aur educational guidance ke liye hai. "
    "Yeh koi medical diagnosis ya ilaaj tajweez nahi karta. Sirf certified licensed doctor hi "
    "aapki overall health dekh kar diagnosis kar sakta hai."
)

MANDATORY_DISCLAIMER_AR = (
    "ملاحظة: هذا التقرير التوضيحي للمختبر مخصص للأغراض التعليمية والمعلوماتية فقط. "
    "ولا يقدم أي تشخيصات طبية أو توصيات علاجية. الطبيب المرخص هو الوحيد المؤهل لتشخيص الحالات الصحية."
)

MANDATORY_DISCLAIMER = MANDATORY_DISCLAIMER_EN

def get_disclaimer(language: str = "en") -> str:
    lang = (language or "en").lower()
    if lang == "ur":
        return MANDATORY_DISCLAIMER_UR
    elif lang == "roman_ur":
        return MANDATORY_DISCLAIMER_ROMAN
    elif lang == "ar":
        return MANDATORY_DISCLAIMER_AR
    return MANDATORY_DISCLAIMER_EN

def generate_layman_summary(
    patient_name: str,
    results: List[ClassifiedTestResult],
    is_demographics_missing: bool = False,
    demographics_message: Optional[str] = None,
    language: str = "en",
    eli10: bool = False
) -> Tuple[str, List[str], Optional[str]]:
    """
    Generates an educational explanation, 3-5 doctor questions,
    and urgent alerts strictly adhering to no-diagnosis safety rules in selected language.
    Returns:
        (layman_summary, doctor_questions, urgent_warning)
    """
    lang = (language or "en").lower()
    urgent_items = [r for r in results if r.is_urgent]
    abnormal_items = [r for r in results if r.status in ["LOW", "HIGH", "URGENT_LOW", "URGENT_HIGH"]]
    unclassified_items = [r for r in results if r.status == "CANNOT_BE_CLASSIFIED"]

    # 1. Urgent Warning in selected language
    urgent_warning = None
    if urgent_items:
        triggers = ", ".join([f"{u.canonical_test} ({u.reported_value} {u.reported_unit or ''})" for u in urgent_items])
        if lang == "ur":
            urgent_warning = (
                f"فوری طبی الرٹ: تشویشناک لیبارٹری نتائج ({triggers}) سامنے آئے ہیں۔ "
                f"ان نتائج کے لیے فوری طبی معائنے کی ضرورت ہے۔ آپ کو آج ہی ڈاکٹر سے رجوع کرنا چاہیے "
                f"یا قریبی ایمرجنسی سنٹر جانا چاہیے۔"
            )
        elif lang == "roman_ur":
            urgent_warning = (
                f"URGENT MEDICAL ALERT: Aapki report mai critical values aayi hain ({triggers}). "
                f"Inke liye fori tor par medical checkup zaroori hai. Aapko aaj hi doctor se consult karna chahiye "
                f"ya qareebi emergency hospital jana chahiye."
            )
        elif lang == "ar":
            urgent_warning = (
                f"تنبيه طبي عاجل: تم اكتشاف قيم حرجة في نتائج المختبر ({triggers}). "
                f"تتطلب هذه المستويات تقييماً طبياً فورياً. يجب عليك مراجعة الطبيب اليوم "
                f"أو زيارة قسم الطوارئ فوراً."
            )
        else:
            urgent_warning = (
                f"URGENT MEDICAL ALERT: Critical laboratory value(s) detected: {triggers}. "
                f"These levels require immediate medical evaluation. You must see a doctor today "
                f"or visit an emergency medical facility immediately."
            )

    # 2. Layman Summary Text
    paragraphs = []
    if lang == "ur":
        paragraphs.append(f"مریض {patient_name} کی لیبارٹری رپورٹ کا آسان خلاصہ:")
    elif lang == "roman_ur":
        paragraphs.append(f"Yeh raha patient {patient_name} ke lab results ka simple khulasa:")
    elif lang == "ar":
        paragraphs.append(f"إليك ملخص مبسط لنتائج الفحوصات المخبرية للمريض {patient_name}:")
    else:
        intro_mode = " (Explained Like I'm 10)" if eli10 else ""
        paragraphs.append(f"Here is a simple summary of the laboratory results for {patient_name}{intro_mode}:")

    if is_demographics_missing:
        if lang == "ur":
            paragraphs.append(
                f"⚠️ مریض کے کوائف پر تنبیہ: {demographics_message or 'عمر یا جنس کی تفصیلات غائب ہیں۔'} "
                f"چونکہ صحت مند معمول کی حدود عمر اور جنس پر منحصر ہوتی ہیں، اس لیے لیب محفوظ طریقے سے نارمل رینج کا تعین نہیں کر سکی۔ "
                f"برائے مہربانی درست جانچ کے لیے اپنے کوائف درج کریں۔"
            )
        elif lang == "roman_ur":
            paragraphs.append(
                f"⚠️ Patient details ka notice: {demographics_message or 'Umar ya jins ki maloomat missing hain.'} "
                f"Chunkay normal healthy range umar aur sex par depend karti hai, is liye lab baghair confirm kiye range select nahi kar sakti. "
                f"Mukammal analysis ke liye missing details provide karein."
            )
        elif lang == "ar":
            paragraphs.append(
                f"⚠️ تنبيه حول بيانات المريض: {demographics_message or 'بعض البيانات الديموغرافية مفقودة.'} "
                f"نظراً لأن المعدلات الطبيعية تعتمد على العمر والجنس، يرجى تقديم البيانات المتبقية للحصول على التقييم الكامل."
            )
        else:
            paragraphs.append(
                f"⚠️ Notice on Patient Details: {demographics_message or 'Some demographic details (age or biological sex) are missing or corrupted.'} "
                f"Because normal healthy ranges change depending on a person's age and biological sex, the laboratory cannot safely "
                f"pick a reference range without guessing. Please provide the missing details to see a full evaluation."
            )

    if urgent_warning:
        paragraphs.append(f"🚨 {urgent_warning}")

    # Describe each result
    desc_dict = ANALYTE_ELI10 if eli10 else ANALYTE_DESCRIPTIONS
    for r in results:
        desc = desc_dict.get(
            r.canonical_test,
            f"{r.canonical_test} is a laboratory test measuring specific markers in your body."
        )

        val_display = f"{r.reported_value} {r.reported_unit or ''}".strip()
        ref_display = r.expected_range_display

        if lang == "ur":
            if r.status == "NORMAL":
                note = f"آپ کا نتیجہ {val_display} ہے، جو معمول کی حد ({ref_display}) کے اندر ہے (نارمل)۔"
            elif r.status in ["URGENT_LOW", "LOW"]:
                note = f"آپ کا نتیجہ {val_display} ہے، جو معمول کی حد ({ref_display}) سے کم ہے (لو)۔"
            elif r.status in ["URGENT_HIGH", "HIGH"]:
                note = f"آپ کا نتیجہ {val_display} ہے، جو معمول کی حد ({ref_display}) سے زیادہ ہے (ہائی)۔"
            else:
                note = f"آپ کا نتیجہ {val_display} ہے۔ اس ٹیسٹ کی درجہ بندی لیب فائلز سے ممکن نہیں ({r.status_reason})۔"
            paragraphs.append(f"• **{r.reported_test}** ({r.canonical_test}): {note}")

        elif lang == "roman_ur":
            if r.status == "NORMAL":
                note = f"Aapka result {val_display} hai, jo normal range ({ref_display}) ke mutabiq bilkul theek hai (Normal)."
            elif r.status in ["URGENT_LOW", "LOW"]:
                note = f"Aapka result {val_display} hai, jo normal range ({ref_display}) se kam hai (Low)."
            elif r.status in ["URGENT_HIGH", "HIGH"]:
                conv_txt = f" (Converted: {r.converted_value} {r.converted_unit})" if r.conversion_applied else ""
                note = f"Aapka result {val_display}{conv_txt} hai, jo normal range ({ref_display}) se zyada hai (High)."
            else:
                note = f"Aapka result {val_display} hai. Is test ko files se classify nahi kiya ja sakta ({r.status_reason})."
            paragraphs.append(f"• **{r.reported_test}** ({r.canonical_test}): {note}")

        elif lang == "ar":
            if r.status == "NORMAL":
                note = f"نتيجتك هي {val_display}، وهي ضمن المعدل الطبيعي المعتمد ({ref_display})."
            elif r.status in ["URGENT_LOW", "LOW"]:
                note = f"نتيجتك هي {val_display}، وهي أقل من المعدل الطبيعي ({ref_display})."
            elif r.status in ["URGENT_HIGH", "HIGH"]:
                note = f"نتيجتك هي {val_display}، وهي أعلى من المعدل الطبيعي ({ref_display})."
            else:
                note = f"نتيجتك هي {val_display}. لا يمكن تصنيف هذا الفحص من السجلات الحالية."
            paragraphs.append(f"• **{r.reported_test}** ({r.canonical_test}): {note}")

        else:
            # English (Default)
            if r.status == "NORMAL":
                if r.is_boundary_value:
                    note = f"Your result was {val_display}, which sits right at the boundary limit of the standard healthy range ({ref_display}). Under lab rules, this is considered Normal."
                else:
                    note = f"Your result was {val_display}, which is within the standard healthy range ({ref_display})."
            elif r.status in ["URGENT_LOW", "LOW"]:
                note = f"Your result was {val_display}, which is lower than the typical normal range ({ref_display})."
            elif r.status in ["URGENT_HIGH", "HIGH"]:
                if r.conversion_applied:
                    note = f"Your result was reported as {val_display}. When converted to standard lab units ({r.conversion_note}), it is {r.converted_value} {r.converted_unit}, which is higher than the typical healthy range ({ref_display})."
                else:
                    note = f"Your result was {val_display}, which is higher than the typical healthy range ({ref_display})."
            else:
                note = f"Your result was {val_display}. This test cannot be classified from the laboratory's reference files ({r.status_reason})."

            paragraphs.append(f"• **{r.reported_test}** ({r.canonical_test}): {desc} {note}")

    summary_text = "\n\n".join(paragraphs)

    # 3. Formulate 3 to 5 targeted doctor questions in selected language
    doctor_questions: List[str] = []

    if lang == "ur":
        if urgent_items:
            for u in urgent_items:
                doctor_questions.append(
                    f"میرا {u.canonical_test} لیول تشویشناک سطح پر ہے ({u.reported_value} {u.reported_unit or ''})۔ مجھے آج کیا فوری اقدامات یا دوبارہ ٹیسٹ کروانے کی ضرورت ہے؟"
                )
        for ab in abnormal_items:
            if not ab.is_urgent:
                doctor_questions.append(
                    f"کیا طرز زندگی، خوراک یا ادویات کے عوامل میرے {ab.canonical_test} کے غیر معمولی ہونے ({ab.reported_value}) کا سبب بن سکتے ہیں؟"
                )
        if len(doctor_questions) < 3:
            doctor_questions.append("ان نتائج کی روشنی میں آپ کن علامات پر نظر رکھنے کا مشورہ دیتے ہیں؟")
            doctor_questions.append("کیا مجھے چند ہفتوں بعد یہ ٹیسٹ دوبارہ دہرانا چاہیے؟")
            doctor_questions.append("میری صحت کو بہتر رکھنے کے لیے آپ کونسی عادات تجویز کرتے ہیں؟")

    elif lang == "roman_ur":
        if urgent_items:
            for u in urgent_items:
                doctor_questions.append(
                    f"Mera {u.canonical_test} level critical range mai hai ({u.reported_value} {u.reported_unit or ''}). Aaj mujhe fori tor par kya steps lene chahiye?"
                )
        for ab in abnormal_items:
            if not ab.is_urgent:
                doctor_questions.append(
                    f"Khaane peene ya routine ke konse factors ki wajah se mera {ab.canonical_test} {ab.status.lower()} ({ab.reported_value}) ho sakta hai?"
                )
        if len(doctor_questions) < 3:
            doctor_questions.append("Kya mujhe kuch hafton baad yeh test dobara repeat karwana chahiye?")
            doctor_questions.append("In numbers ke mutabiq mujhe kin khas alamaat (symptoms) par nazar rakhni chahiye?")
            doctor_questions.append("Healthy routine maintain karne ke liye aap kya recommend karte hain?")

    elif lang == "ar":
        if urgent_items:
            for u in urgent_items:
                doctor_questions.append(
                    f"مستوى {u.canonical_test} لدي في حالة حرجة ({u.reported_value} {u.reported_unit or ''}). ما هي الخطوات العاجلة المطلوبة اليوم؟"
                )
        for ab in abnormal_items:
            if not ab.is_urgent:
                doctor_questions.append(
                    f"ما هي العوامل أو الأدوية التي قد تكون سببت تغير مستوى {ab.canonical_test} ({ab.reported_value})؟"
                )
        if len(doctor_questions) < 3:
            doctor_questions.append("هل تنصح بإعادة إجراء هذه الفحوصات بعد عدة أسابيع لمتابعة الحالة؟")
            doctor_questions.append("ما هي الأعراض التحذيرية التي ينبغي علي الانتباه إليها؟")
            doctor_questions.append("ما هي التوصيات الغذائية لتحسين هذه المؤشرات؟")

    else:
        # English
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

    doctor_questions = doctor_questions[:5]
    return summary_text, doctor_questions, urgent_warning
