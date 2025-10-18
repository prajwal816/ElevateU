import mongoose from "mongoose";

const courseUnitSchema = new mongoose.Schema({course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  description: String,
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("CourseUnit", courseUnitSchema);