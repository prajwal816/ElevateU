import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
  dueDate: Date,
  maxPoints: { type: Number, default: 100 },
  xpReward: { type: Number, default: 50 },
}, { timestamps: true });

export default mongoose.model("Assignment", assignmentSchema);
