import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number, // index of correct option
    points: { type: Number, default: 1 }
  }],
  totalPoints: Number,
  timeLimit: Number, // in minutes
}, { timestamps: true });

export default mongoose.model("Quiz", quizSchema);