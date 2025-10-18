import express from "express";
import {
  createAssignment,
  getAssignmentsByCourse,
  getMyAssignments,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Teacher creates assignment
router.post("/", protect, createAssignment);

// Get all assignments for a course
router.get("/course/:courseId", protect, getAssignmentsByCourse);

// Get all assignments for the logged-in student/teacher
router.get("/", protect, getMyAssignments);

// Update assignment
router.put("/:id", protect, updateAssignment);

// Delete assignment
router.delete("/:id", protect, deleteAssignment);

export default router;