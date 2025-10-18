import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// @desc    Get leaderboard (top users by XP)
// @route   GET /api/leaderboard
// @access  Private
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 10, role } = req.query;

  let query = {};
  if (role) {
    query.role = role;
  }

  const users = await User.find(query)
    .select("name email xp avatar role badges")
    .sort("-xp")
    .limit(parseInt(limit))
    .populate("badges", "name icon");

  // Add rank
  const leaderboard = users.map((user, index) => ({
    rank: index + 1,
    _id: user._id,
    name: user.name,
    email: user.email,
    xp: user.xp,
    avatar: user.avatar,
    role: user.role,
    badges: user.badges,
  }));

  res.json(leaderboard);
});

// @desc    Get current user's rank
// @route   GET /api/leaderboard/my-rank
// @access  Private
export const getMyRank = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  
  const usersAbove = await User.countDocuments({
    xp: { $gt: currentUser.xp },
    role: currentUser.role,
  });

  const rank = usersAbove + 1;

  res.json({
    rank,
    xp: currentUser.xp,
    name: currentUser.name,
    badges: currentUser.badges,
  });
});