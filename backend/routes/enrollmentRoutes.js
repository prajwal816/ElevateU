import express from "express";
import {
  enrollInCourse,
  getMyEnrollments,
  updateEnrollmentProgress,
  getStudentsInCourse
} from "../controllers/enrollmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Enroll in a course
router.post("/", protect, enrollInCourse);

// Get student's enrollments
router.get("/", protect, getMyEnrollments);

// Update enrollment progress
router.put("/:id/progress", protect, updateEnrollmentProgress);

// Get students in a course (for teachers)
router.get("/course/:courseId/students", protect, getStudentsInCourse);

export default router;
