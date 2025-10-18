import express from "express";
import {
  submitReview,
  getCourseReviews,
  updateReview,
  deleteReview
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Submit a review
router.post("/:courseId", protect, submitReview);

// Get reviews for a course
router.get("/:courseId", getCourseReviews);

// Update a review
router.put("/:reviewId", protect, updateReview);

// Delete a review
router.delete("/:reviewId", protect, deleteReview);

export default router;
