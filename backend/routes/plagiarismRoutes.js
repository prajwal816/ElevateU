// routes/plagiarismRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { runPlagiarismCheck, getPlagiarismReports } from "../controllers/plagiarismController.js";

const router = express.Router();

// Teacher triggers a plagiarism check for an assignment
router.post("/check/:assignmentId", protect, runPlagiarismCheck);

// Teacher or student fetches plagiarism results
router.get("/:assignmentId", protect, getPlagiarismReports);

export default router;
