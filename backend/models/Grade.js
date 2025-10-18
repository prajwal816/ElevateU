import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema({
  submission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission" },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  grade: Number,
  feedback: String,
  xpAwarded: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Grade", gradeSchema);
