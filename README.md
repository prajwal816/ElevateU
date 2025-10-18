# ML Plagiarism Service

## Build & Run (Docker)
# from ml-service/ directory
docker build -t ml-plagiarism:latest .
docker run -p 8000:8000 ml-plagiarism:latest

## Or run locally (dev)
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000

## Example curl (multipart + metadata)
Assume you have files: `abc.pdf`, `def.pdf`.

curl -X POST "http://localhost:8000/api/plagiarism" \
  -F "files=@abc.pdf" \
  -F "files=@def.pdf" \
  -F 'metadata=[{"submissionId":"sub_abc","filename":"abc.pdf"},{"submissionId":"sub_def","filename":"def.pdf"}]' \
  -F "method=tfidf" \
  -F "threshold=0.25" \
  -F "top_k=3"

## Expected response
{
  "results": [
    {
      "submissionId": "sub_abc",
      "matches": [
        {"matchedSubmissionId": "sub_def", "similarity": 82.34}
      ]
    },
    {
      "submissionId": "sub_def",
      "matches": [
        {"matchedSubmissionId": "sub_abc", "similarity": 82.34}
      ]
    }
  ]
}
