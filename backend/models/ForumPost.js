import mongoose from "mongoose";

const forumPostSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "ForumReply" }],
}, { timestamps: true });

export default mongoose.model("ForumPost", forumPostSchema);