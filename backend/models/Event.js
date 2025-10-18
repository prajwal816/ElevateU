import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  type: { type: String, enum: ["class", "assignment", "exam", "event"], default: "event" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);