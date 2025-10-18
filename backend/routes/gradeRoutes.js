import express from "express";
import { gradeSubmission, getGradesForStudent, getGradesByCourse, getPendingGrades } from "../controllers/gradeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Teacher grades a submission
router.post("/submission/:submissionId", protect, gradeSubmission);

// Get grades for a student
router.get("/student/:studentId", protect, getGradesForStudent);

// Get grades for a course
router.get("/course/:courseId", protect, getGradesByCourse);

// Get pending grades (ungraded submissions)
router.get("/pending", protect, getPendingGrades);

export default router;