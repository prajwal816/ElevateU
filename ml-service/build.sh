#!/usr/bin/env bash
# Exit on error
set -e

# Install dependencies
pip install -r requirements.txt

# Download NLTK data
python -m nltk.downloader stopwords -d /opt/render/project/src/nltk_data