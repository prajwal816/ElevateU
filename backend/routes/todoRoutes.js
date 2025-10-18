import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
} from "../controllers/todoController.js";

const router = express.Router();

router.route("/").get(protect, getTodos).post(protect, createTodo);
router.route("/:id").put(protect, updateTodo).delete(protect, deleteTodo);
router.route("/:id/toggle").put(protect, toggleTodo);

export default router;