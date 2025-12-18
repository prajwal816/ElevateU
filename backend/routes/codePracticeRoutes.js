import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getProblems,
    getProblemById,
    submitCode,
    getUserProgress,
    getUserSubmissions,
    getLeaderboard
} from "../controllers/codePracticeController.js";

const router = express.Router();

// Public routes (can be accessed without authentication for browsing)
router.get("/problems", getProblems);
router.get("/problems/:id", getProblemById);
router.get("/leaderboard", getLeaderboard);

// Protected routes (require authentication)
router.use(protect); // Apply authentication middleware to all routes below

router.post("/submit", submitCode);
router.get("/progress", getUserProgress);
router.get("/submissions", getUserSubmissions);

export default router;