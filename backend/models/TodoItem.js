import mongoose from "mongoose";

const todoItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  dueDate: Date, // Full datetime including time
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
}, { timestamps: true });

export default mongoose.model("TodoItem", todoItemSchema);