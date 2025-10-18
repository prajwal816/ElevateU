import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  progress: { type: Number, default: 0 }, // percentage 0-100
  completedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
  lastAccessedAt: Date,
}, { timestamps: true });

export default mongoose.model("Enrollment", enrollmentSchema);
