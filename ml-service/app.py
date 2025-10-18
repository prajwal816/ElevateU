# app.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from plagiarism.extractor import extract_text_from_pdf_bytes
from plagiarism.preprocess import tokenize_and_remove_stopwords
from plagiarism.compare import compute_tfidf_similarity, compute_embedding_similarity, build_matches
import uvicorn
import json

app = FastAPI(title="LMS Plagiarism Service", version="1.0")

class CheckResponseItem(BaseModel):
    submissionId: str
    matches: List[dict]

class CheckResponse(BaseModel):
    results: List[CheckResponseItem]

@app.post("/api/plagiarism", response_model=CheckResponse)
async def check_plagiarism(
    files: List[UploadFile] = File(...),
    metadata: Optional[str] = Form(None),
    method: Optional[str] = Form("tfidf"),
    threshold: Optional[float] = Form(0.3),
    top_k: Optional[int] = Form(5),
):
    """
    Accepts multipart/form-data:
      - files[]: PDF files (filename should ideally be '<submissionId>.pdf' or you send metadata)
      - metadata: JSON string mapping files to submissionId & studentId, e.g.
          [{ "submissionId": "abc", "studentId": "s1", "filename": "abc.pdf" }, ...]
    Query options:
      - method: "tfidf" (default) or "embeddings" (requires sentence-transformers)
      - threshold: similarity threshold (0-1)
      - top_k: max matches per document
    Returns:
      { results: [{ submissionId, matches: [{matchedSubmissionId, similarity}] }, ...] }
    """
    # parse metadata
    mapping = {}
    if metadata:
        try:
            meta = json.loads(metadata)
            # meta expected to be a list of entries with submissionId and filename OR submissionId mapping order
            for entry in meta:
                # either map by filename or positionally keyed by filename or an index
                if "filename" in entry:
                    mapping[entry["filename"]] = entry.get("submissionId")
                elif "submissionId" in entry:
                    # fallback: use a generated key; handled below by filenames
                    mapping[str(entry.get("submissionId"))] = entry.get("submissionId")
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid metadata JSON")

    # Extract text from each uploaded file; preserve order
    texts = []
    submission_ids = []
    for f in files:
        content = await f.read()
        text = extract_text_from_pdf_bytes(content)
        # basic preprocessing/tokenization
        proc = tokenize_and_remove_stopwords(text)
        texts.append(proc)
        # determine submissionId: try metadata by filename, else filename w/out extension
        sid = None
        if f.filename and f.filename in mapping:
            sid = mapping[f.filename]
        else:
            # try filename without extension as id
            name = f.filename or ""
            sid_guess = name.rsplit(".", 1)[0] if "." in name else name
            sid = mapping.get(name) or sid_guess or f.filename
        submission_ids.append(str(sid))

    if len(texts) < 2:
        # not enough docs to compare
        return {"results": []}

    # compute similarity matrix
    method = method.lower() if method else "tfidf"
    if method == "embeddings":
        try:
            sim_mat = compute_embedding_similarity(texts)
        except Exception as e:
            raise HTTPException(status_code=500, detail="Embedding model unavailable. Install sentence-transformers.")
    else:
        sim_mat = compute_tfidf_similarity(texts)

    # build matches using threshold and top_k
    if threshold is None:
        threshold = 0.3
    if isinstance(threshold, str):
        threshold = float(threshold)
    matches = build_matches(submission_ids, sim_mat, threshold=threshold, top_k=int(top_k))

    return {"results": matches}

# simple health check
@app.get("/api/health")
async def health():
    return {"status": "ok"}
