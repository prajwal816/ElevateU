// utils/plagiarismClient.js
import axios from "axios";

/**
 * Sends assignment submissions to the ML microservice for plagiarism detection.
 * @param {Array<string>} submissionIds
 * @param {Array<string>} files - URLs of PDFs to compare
 * @returns {Promise<Array<{submissionId, matchedWith, similarity}>>}
 */
export const checkPlagiarism = async (submissionIds, files) => {
  try {
    const mlUrl = process.env.ML_SERVICE_URL || "http://ml-service:8000/api/plagiarism";
    const response = await axios.post(mlUrl, { submissionIds, files });
    return response.data.results;
  } catch (error) {
    console.error("❌ ML plagiarism API error:", error.message);
    throw new Error("ML service unavailable or failed to process data");
  }
};
