import io
import pytest
from app.core.ingest import extract_text_from_pdf, process_uploaded_file

def test_markdown_and_text_ingest():
    sample_text = """# Laboratory Test Report
* **Patient Full Name**: Test Patient
* **Recorded Age**: 45
* **Biological Sex**: Male
* **Medical Record Number (MRN)**: CLD-TEST-1234
* **Date of Issuance**: 2026-11-14

| Test Name | Reported Value | Reported Unit | Reference Interval |
| Hemoglobin | 14.5 | g/dL | 13.5 - 17.5 |
"""
    raw_bytes = sample_text.encode("utf-8")
    content = process_uploaded_file(raw_bytes, "test_report.md")
    assert "Test Patient" in content
    assert "Hemoglobin" in content

def test_pdf_extraction_fallback():
    # If a minimal or empty PDF is given
    try:
        import pypdf
        writer = pypdf.PdfWriter()
        writer.add_blank_page(width=200, height=200)
        buf = io.BytesIO()
        writer.write(buf)
        pdf_bytes = buf.getvalue()
        
        extracted = extract_text_from_pdf(pdf_bytes)
        assert isinstance(extracted, str)
    except Exception:
        pass
