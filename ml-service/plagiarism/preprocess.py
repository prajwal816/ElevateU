# plagiarism/preprocess.py
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Ensure NLTK downloads were run in Dockerfile or runtime.
_stopwords = set(stopwords.words("english"))

def clean_text(text: str) -> str:
    if not text:
        return ""
    txt = text.lower()
    # remove non-alphanumeric but keep spaces
    txt = re.sub(r"[^a-z0-9\s]", " ", txt)
    # collapse spaces
    txt = re.sub(r"\s+", " ", txt).strip()
    return txt

def tokenize_and_remove_stopwords(text: str) -> str:
    txt = clean_text(text)
    tokens = word_tokenize(txt)
    tokens = [t for t in tokens if t not in _stopwords and len(t) > 1]
    return " ".join(tokens)
