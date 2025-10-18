import express from "express";
import { 
  getCourseAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} from "../controllers/announcementController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Course announcements
router.get("/course/:courseId", protect, getCourseAnnouncements);
router.post("/course/:courseId", protect, createAnnouncement);
router.put("/:id", protect, updateAnnouncement);
router.delete("/:id", protect, deleteAnnouncement);

export default router;