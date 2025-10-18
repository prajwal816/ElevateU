import mongoose from "mongoose";

const forumReplySchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: "ForumPost", required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("ForumReply", forumReplySchema);