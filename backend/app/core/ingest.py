import io
import re
import os
import base64
import logging
from typing import Tuple, Optional
from pathlib import Path

logger = logging.getLogger("citylab.ingest")

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts text from a digital PDF file using pypdf."""
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        pages_text = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                pages_text.append(text)
        return "\n\n".join(pages_text).strip()
    except Exception as e:
        logger.warning(f"pypdf extraction error: {e}")
        return ""

def extract_text_from_image_vision(
    image_bytes: bytes,
    mime_type: str = "image/png"
) -> Tuple[bool, str, Optional[str]]:
    """
    Extracts structured medical laboratory text from an image (PNG, JPG, WEBP)
    using Gemini Multimodal Vision or Groq Vision.
    """
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")

    prompt = (
        "You are an expert clinical medical laboratory transcription assistant.\n"
        "Please transcribe all patient demographic details and laboratory test results "
        "from this medical laboratory report image into clear, accurate Markdown format:\n\n"
        "* **Patient Full Name**: [Patient Name]\n"
        "* **Recorded Age**: [Age in years, or Missing if not provided]\n"
        "* **Biological Sex**: [Male or Female, or Missing if not provided]\n"
        "* **Medical Record Number (MRN)**: [MRN or CLD-UPLOAD-9942]\n"
        "* **Date of Issuance**: [Date]\n\n"
        "Followed by a Markdown table of all numerical and qualitative test results:\n"
        "| Test Name | Reported Value | Unit | Reference Range |\n\n"
        "IMPORTANT:\n"
        "- Preserve all test names, numerical values, units (e.g. g/dL, mg/dL, U/L), and reference ranges exactly as shown.\n"
        "- Do NOT invent or hallucinate missing data.\n"
        "- Do NOT provide any medical diagnoses or advice."
    )

    # 1. Try Gemini Vision if available
    if gemini_key:
        try:
            import google.generativeai as genai
            from PIL import Image

            genai.configure(api_key=gemini_key)
            vision_model = genai.GenerativeModel("gemini-1.5-flash")
            img = Image.open(io.BytesIO(image_bytes))

            response = vision_model.generate_content([prompt, img])
            if response and response.text:
                return True, response.text, "gemini_vision"
        except Exception as e:
            logger.warning(f"Gemini Vision extraction failed: {e}")

    # 2. Try Groq Vision if available
    if groq_key:
        try:
            import httpx
            b64_img = base64.b64encode(image_bytes).decode("utf-8")
            payload = {
                "model": "llama-3.2-11b-vision-preview",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:{mime_type};base64,{b64_img}"}
                            }
                        ]
                    }
                ],
                "temperature": 0.1,
                "max_tokens": 1500
            }
            with httpx.Client(timeout=30.0) as client:
                res = client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {groq_key}"},
                    json=payload
                )
                if res.status_code == 200:
                    text_out = res.json()["choices"][0]["message"]["content"]
                    return True, text_out, "groq_vision"
        except Exception as e:
            logger.warning(f"Groq Vision extraction failed: {e}")

    # Fallback message when external vision keys are not configured
    error_msg = (
        "Medical Image/PDF scan received. To extract text from visual lab report images (PNG/JPG/PDF), "
        "please configure a free GEMINI_API_KEY or GROQ_API_KEY in your environment (.env or Render). "
        "Alternatively, upload a Markdown (.md) or text (.txt) lab report."
    )
    return False, error_msg, None

def process_uploaded_file(raw_bytes: bytes, filename: str) -> str:
    """
    Ingests any supported lab report file format:
    - Markdown (.md)
    - Plain Text (.txt)
    - PDF Document (.pdf)
    - Images (.png, .jpg, .jpeg, .webp, .bmp)
    Returns normalized text content ready for parsing.
    """
    ext = Path(filename).suffix.lower()

    # 1. Plain text and markdown
    if ext in [".md", ".txt"]:
        try:
            return raw_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                return raw_bytes.decode("latin-1")
            except Exception as e:
                raise ValueError(f"Could not decode text file: {e}")

    # 2. PDF Document
    if ext == ".pdf":
        extracted_text = extract_text_from_pdf(raw_bytes)
        # If PDF contained selectable text, use it
        if extracted_text and len(extracted_text.strip()) >= 30:
            return extracted_text

        # Otherwise, attempt OCR / Multimodal Vision for scanned PDFs
        success, vision_text, _ = extract_text_from_image_vision(raw_bytes, "application/pdf")
        if success:
            return vision_text
        raise ValueError(
            "PDF contains no digital text and AI Vision API is not configured. "
            "Please ensure GEMINI_API_KEY is provided or upload a text/markdown report."
        )

    # 3. Image formats (PNG, JPG, JPEG, WEBP)
    if ext in [".png", ".jpg", ".jpeg", ".webp", ".bmp"]:
        mime_map = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".bmp": "image/bmp"
        }
        mime = mime_map.get(ext, "image/png")
        success, vision_text, _ = extract_text_from_image_vision(raw_bytes, mime)
        if success:
            return vision_text
        raise ValueError(vision_text)

    # Unknown extension: try utf-8 decode
    try:
        return raw_bytes.decode("utf-8")
    except Exception:
        raise ValueError(f"Unsupported file format '{ext}'. Supported formats: .pdf, .png, .jpg, .jpeg, .md, .txt")
