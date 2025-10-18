import asyncHandler from "express-async-handler";
import ForumPost from "../models/ForumPost.js";
import ForumReply from "../models/ForumReply.js";

// @desc    Get forum posts for a course
// @route   GET /api/forum/:courseId
// @access  Private
export const getForumPosts = asyncHandler(async (req, res) => {
  const posts = await ForumPost.find({ course: req.params.courseId })
    .populate("author", "name avatar")
    .populate({
      path: "replies",
      populate: { path: "author", select: "name avatar" }
    })
    .sort("-createdAt");

  res.json(posts);
});

// @desc    Create a forum post
// @route   POST /api/forum/:courseId
// @access  Private
export const createForumPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const post = await ForumPost.create({
    course: req.params.courseId,
    author: req.user._id,
    title,
    content,
  });

  const populatedPost = await ForumPost.findById(post._id).populate("author", "name avatar");
  res.status(201).json(populatedPost);
});

// @desc    Reply to a forum post
// @route   POST /api/forum/posts/:postId/reply
// @access  Private
export const replyToPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const post = await ForumPost.findById(req.params.postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const reply = await ForumReply.create({
    post: req.params.postId,
    author: req.user._id,
    content,
  });

  post.replies.push(reply._id);
  await post.save();

  const populatedReply = await ForumReply.findById(reply._id).populate("author", "name avatar");
  res.status(201).json(populatedReply);
});

// @desc    Delete a forum post
// @route   DELETE /api/forum/posts/:postId
// @access  Private
export const deleteForumPost = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  // Delete all replies
  await ForumReply.deleteMany({ post: req.params.postId });
  await post.deleteOne();

  res.json({ message: "Post deleted" });
});