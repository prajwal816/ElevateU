import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [Number], // array of selected answer indices
  score: Number,
  completed: { type: Boolean, default: false },
  startedAt: Date,
  completedAt: Date,
}, { timestamps: true });

export default mongoose.model("QuizAttempt", quizAttemptSchema);