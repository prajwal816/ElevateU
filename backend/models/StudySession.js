import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // in minutes
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  activity: { type: String, enum: ["studying", "assignment", "quiz", "forum", "general"], default: "general" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Calculate duration before saving
studySessionSchema.pre("save", function(next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // minutes
  }
  next();
});

export default mongoose.model("StudySession", studySessionSchema);