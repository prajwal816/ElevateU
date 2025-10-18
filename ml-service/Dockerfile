FROM python:3.11-slim

# install dependencies for pdfminer and build tools
RUN apt-get update && apt-get install -y build-essential libxml2-dev libxslt1-dev zlib1g-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# NLTK data (punkt + stopwords). If sentence-transformers is used, models will be downloaded first run.
RUN python -m nltk.downloader punkt stopwords

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
