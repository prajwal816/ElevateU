#!/usr/bin/env bash
# Exit on error
set -e

# Install dependencies
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; nltk.download('stopwords')"