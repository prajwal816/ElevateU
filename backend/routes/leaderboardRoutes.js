import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getLeaderboard, getMyRank } from "../controllers/leaderboardController.js";

const router = express.Router();

router.get("/", protect, getLeaderboard);
router.get("/my-rank", protect, getMyRank);

export default router;