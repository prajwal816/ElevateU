# plagiarism/extractor.py
from pdfminer.high_level import extract_text
from typing import Optional
import io

def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    """
    Extract text from PDF bytes using pdfminer.six.
    Returns a (possibly empty) string.
    """
    try:
        fp = io.BytesIO(file_bytes)
        text = extract_text(fp)
        if not text:
            return ""
        return text
    except Exception as e:
        # fallback: return empty string on error
        return ""
