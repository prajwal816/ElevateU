import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  submission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
  matchedWithSubmission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
  similarity: { type: Number, required: true }, // percentage 0-100
}, { timestamps: true });

export default mongoose.model("PlagiarismReport", reportSchema);
