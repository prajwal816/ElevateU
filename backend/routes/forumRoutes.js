import express from "express";
import { 
  getForumPosts, 
  createForumPost, 
  replyToPost, 
  deleteForumPost 
} from "../controllers/forumController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Forum routes
router.get("/:courseId", protect, getForumPosts);
router.post("/:courseId", protect, createForumPost);
router.post("/posts/:postId/reply", protect, replyToPost);
router.delete("/posts/:postId", protect, deleteForumPost);

export default router;