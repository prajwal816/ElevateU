import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

const router = express.Router();

router.route("/").get(protect, getEvents).post(protect, createEvent);
router.route("/:id").put(protect, updateEvent).delete(protect, deleteEvent);

export default router;