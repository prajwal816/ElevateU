import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  duration: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  thumbnail: String,
  category: String,
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
  outcomes: [String], // learning outcomes
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Course", courseSchema);
