# plagiarism/utils.py
import numpy as np
import logging
from datetime import datetime

# -----------------------------------------------------------------------------
# Logging setup
# -----------------------------------------------------------------------------
def setup_logger(name="plagiarism-service", level=logging.INFO):
    """
    Sets up and returns a standard logger for the plagiarism service.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] %(name)s: %(message)s", "%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(level)
    return logger


# -----------------------------------------------------------------------------
# Similarity normalization
# -----------------------------------------------------------------------------
def normalize_similarity_matrix(sim_matrix: np.ndarray) -> np.ndarray:
    """
    Ensures cosine similarity matrix values are within [0, 1].
    Some models may produce values slightly >1 or <0 due to rounding errors.
    """
    sim_matrix = np.clip(sim_matrix, 0, 1)
    return sim_matrix


# -----------------------------------------------------------------------------
# Report helpers
# -----------------------------------------------------------------------------
def summarize_results(sim_matrix, submission_ids, threshold=0.3):
    """
    Generate a simple plagiarism summary for quick human-readable inspection.
    Returns a string summary that can be logged or emailed.
    """
    n = len(submission_ids)
    summary_lines = [f"📄 Plagiarism Summary ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')}):"]
    for i in range(n):
        matches = []
        for j in range(n):
            if i == j:
                continue
            score = float(sim_matrix[i, j])
            if score >= threshold:
                matches.append(f"{submission_ids[j]} ({round(score*100,2)}%)")
        if matches:
            summary_lines.append(f"- {submission_ids[i]} matches with: {', '.join(matches)}")
        else:
            summary_lines.append(f"- {submission_ids[i]}: no significant matches")
    return "\n".join(summary_lines)


# -----------------------------------------------------------------------------
# Safety helpers
# -----------------------------------------------------------------------------
def validate_inputs(submission_ids, texts):
    """
    Quick validation of inputs to prevent runtime errors.
    """
    if not submission_ids or not texts:
        raise ValueError("Submission IDs and document texts are required.")
    if len(submission_ids) != len(texts):
        raise ValueError("Number of submission IDs does not match number of documents.")
