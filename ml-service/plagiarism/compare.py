# plagiarism/compare.py
from typing import List, Dict, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Optional embeddings import (heavy); use only if sentence-transformers installed
try:
    from sentence_transformers import SentenceTransformer
    _HAS_ST_MODEL = True
except Exception:
    _HAS_ST_MODEL = False
    SentenceTransformer = None

def compute_tfidf_similarity(docs: List[str]) -> np.ndarray:
    """
    Returns cosine similarity matrix between docs using TF-IDF.
    """
    if len(docs) == 0:
        return np.array([[]])
    vectorizer = TfidfVectorizer(ngram_range=(1,2), max_df=0.9, min_df=1)
    X = vectorizer.fit_transform(docs)
    sim = cosine_similarity(X)
    return sim

def compute_embedding_similarity(docs: List[str], model_name: str = "all-MiniLM-L6-v2") -> np.ndarray:
    """
    Uses sentence-transformers embeddings. Returns cosine similarity matrix.
    Requires sentence-transformers in requirements.
    """
    if not _HAS_ST_MODEL:
        raise RuntimeError("sentence-transformers not available in environment")
    model = SentenceTransformer(model_name)
    embeddings = model.encode(docs, show_progress_bar=False, convert_to_numpy=True)
    # normalize
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1e-10
    emb_norm = embeddings / norms
    sim = np.dot(emb_norm, emb_norm.T)
    return sim

def build_matches(submission_ids: List[str], sim_matrix: np.ndarray, threshold: float = 0.3, top_k: int = 5) -> List[Dict]:
    """
    Convert similarity matrix into list of matches per submission.
    - threshold: only report similarities above this (0-1)
    - top_k: max matches per doc
    Returns list of dicts: { submissionId, matches: [{ matchedSubmissionId, similarity }] }
    """
    n = len(submission_ids)
    results = []
    for i in range(n):
        sims = []
        for j in range(n):
            if i == j:
                continue
            score = float(sim_matrix[i, j])
            if score >= threshold:
                sims.append((j, score))
        # sort by similarity desc
        sims_sorted = sorted(sims, key=lambda x: x[1], reverse=True)[:top_k]
        matches = [{
            "matchedSubmissionId": submission_ids[jdx],
            "similarity": round(score * 100, 2)  # convert to percentage
        } for (jdx, score) in sims_sorted]
        results.append({
            "submissionId": submission_ids[i],
            "matches": matches
        })
    return results
