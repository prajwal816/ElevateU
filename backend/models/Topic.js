import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: "CourseUnit", required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["video", "assignment", "quiz", "pdf"], required: true },
  contentUrl: String, // URL to video or PDF on Cloudinary
  description: String,
  order: { type: Number, default: 0 },
  // Assignment-specific fields
  dueDate: Date, // Due date for assignments
  maxPoints: { type: Number, default: 100 }, // Maximum points for assignments
}, { timestamps: true });

export default mongoose.model("Topic", topicSchema);