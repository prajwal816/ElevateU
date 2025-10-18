import express from "express";
import { submitAssignment, getSubmissionsByAssignment, getSubmissionsByCourse, getMySubmissions, updateSubmission } from "../controllers/submissionController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../utils/fileUpload.js";

const router = express.Router();

// file upload middleware expects field 'file'
router.post("/", protect, upload.single("file"), submitAssignment);

// Get my submissions
router.get("/my-submissions", protect, getMySubmissions);

router.get("/assignment/:assignmentId", protect, getSubmissionsByAssignment);
router.get("/course/:courseId", protect, getSubmissionsByCourse);

// Update submission (for draft functionality)
router.put("/:submissionId", protect, upload.single("file"), updateSubmission);

export default router;