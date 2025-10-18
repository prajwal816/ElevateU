import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  startStudySession,
  pingStudySession,
  endStudySession,
  getStudySessions,
  getStudyHoursSummary,
  getDailyTimetable,
} from "../controllers/studySessionController.js";

const router = express.Router();

router.post("/start", protect, startStudySession);
router.put("/ping", protect, pingStudySession);
router.post("/end", protect, endStudySession);
router.get("/", protect, getStudySessions);
router.get("/summary", protect, getStudyHoursSummary);
router.get("/timetable", protect, getDailyTimetable);

export default router;