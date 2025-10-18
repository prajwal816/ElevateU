// controllers/plagiarismController.js
import Submission from "../models/Submission.js";
import PlagiarismReport from "../models/PlagiarismReport.js";
import Assignment from "../models/Assignment.js";
import Topic from "../models/Topic.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import axios from "axios";
import FormData from "form-data";
import fetch from "node-fetch";

/**
 * POST /api/plagiarism/check/:assignmentId
 * Only teacher can trigger plagiarism checking for an assignment.
 */
export const runPlagiarismCheck = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Access denied. Teachers only." });
    }
    // Check if it's a regular assignment or topic assignment
    let assignment = await Assignment.findById(assignmentId);
    let assignmentTitle = "Assignment";
    
    if (!assignment) {
      const topic = await Topic.findById(assignmentId);
      if (!topic || topic.type !== "assignment") {
        return res.status(404).json({ message: "Assignment not found" });
      }
      assignmentTitle = topic.title;
    } else {
      assignmentTitle = assignment.title;
    }

    // Get all submissions for this assignment
    const submissions = await Submission.find({ assignment: assignmentId })
      .populate("student", "name email");

    if (submissions.length < 2) {
      return res.status(400).json({ message: "Need at least 2 submissions for plagiarism check." });
    }
    // Prepare FormData for ML service
    const formData = new FormData();
    const metadata = [];

    // Download files from Cloudinary and add to form
    for (const submission of submissions) {
      try {
        const response = await fetch(submission.fileUrl);
        const buffer = await response.buffer();
        formData.append('files', buffer, {
          filename: `${submission._id}.pdf`,
          contentType: 'application/pdf'
        });
        
        metadata.push({
          submissionId: submission._id.toString(),
          studentId: submission.student._id.toString(),
          filename: `${submission._id}.pdf`
        });
      } catch (err) {
        console.error(`Failed to fetch file for submission ${submission._id}:`, err);
      }
    }

    formData.append('metadata', JSON.stringify(metadata));
    formData.append('method', 'tfidf');
    formData.append('threshold', '0.3');
    // Call ML service
    const mlUrl = process.env.ML_SERVICE_URL || "http://ml-service:8000/api/plagiarism";
    const mlResponse = await axios.post(mlUrl, formData, {
      headers: formData.getHeaders(),
      timeout: 60000
    });

    const mlResults = mlResponse.data.results;

    for (const result of mlResults) {
      const { submissionId, matches } = result;
      
      // Mark submission as plagiarism checked
      await Submission.findByIdAndUpdate(submissionId, {
        plagiarismChecked: true
      });

      // Delete old reports for this submission
      await PlagiarismReport.deleteMany({ submission: submissionId });

      // Create new reports for each match
      for (const match of matches) {
        await PlagiarismReport.create({
          submission: submissionId,
          matchedWithSubmission: match.matchedSubmissionId,
          similarity: match.similarity,
        });
      }
    }
    res.status(200).json({
      message: "✅ Plagiarism check completed.",
      results: mlResults,
    });
  } catch (error) {
    console.error("Plagiarism check error:", error);
    res.status(500).json({ 
      message: "Error running plagiarism check",
      error: error.message 
    });
  }
};

/**
 * GET /api/plagiarism/:assignmentId
 * Returns stored plagiarism reports for a teacher or student.
 */
export const getPlagiarismReports = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate("student", "name email");
    const submissionIds = submissions.map(s => s._id);

    const reports = await PlagiarismReport.find({ submission: { $in: submissionIds } })
      .populate({
        path: "submission",
        select: "student fileUrl",
        populate: { path: "student", select: "name email" },
      })
      .populate({
        path: "matchedWithSubmission",
        select: "student",
        populate: { path: "student", select: "name email" }
      });

    const formatted = reports.map(r => ({
      submissionId: r.submission._id,
      student: r.submission.student.name,
      studentEmail: r.submission.student.email,
      matchedSubmissionId: r.matchedWithSubmission._id,
      matchedStudent: r.matchedWithSubmission.student.name,
      similarity: r.similarity,
      fileUrl: r.submission.fileUrl,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Get plagiarism reports error:", error);
    res.status(500).json({ message: "Error fetching plagiarism reports" });
  }
};
