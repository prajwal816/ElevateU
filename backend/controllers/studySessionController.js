import asyncHandler from "express-async-handler";
import StudySession from "../models/StudySession.js";
import User from "../models/User.js";

// @desc    Start a study session
// @route   POST /api/study-sessions/start
// @access  Private
export const startStudySession = asyncHandler(async (req, res) => {
  const { course, activity } = req.body;

  // Close any existing active sessions for this user
  await StudySession.updateMany(
    { user: req.user._id, isActive: true },
    { endTime: new Date(), isActive: false }
  );

  // Calculate durations for closed sessions
  const activeSessions = await StudySession.find({ user: req.user._id, isActive: false, duration: 0 });
  for (let session of activeSessions) {
    if (session.endTime && session.startTime) {
      session.duration = Math.round((session.endTime - session.startTime) / (1000 * 60));
      await session.save();
    }
  }

  // Award daily XP (5 XP for first login of the day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySession = await StudySession.findOne({
    user: req.user._id,
    createdAt: { $gte: today }
  });

  if (!todaySession) {
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 5 } });
  }

  const session = await StudySession.create({
    user: req.user._id,
    startTime: new Date(),
    course,
    activity: activity || "general",
    isActive: true,
  });

  res.status(201).json(session);
});

// @desc    Update/ping active study session (keep alive)
// @route   PUT /api/study-sessions/ping
// @access  Private
export const pingStudySession = asyncHandler(async (req, res) => {
  const activeSession = await StudySession.findOne({
    user: req.user._id,
    isActive: true,
  });

  if (activeSession) {
    // Update the session to keep it alive (you can add last activity time if needed)
    activeSession.updatedAt = new Date();
    await activeSession.save();
    res.json({ message: "Session active", session: activeSession });
  } else {
    res.status(404);
    throw new Error("No active session found");
  }
});

// @desc    End a study session
// @route   POST /api/study-sessions/end
// @access  Private
export const endStudySession = asyncHandler(async (req, res) => {
  const activeSession = await StudySession.findOne({
    user: req.user._id,
    isActive: true,
  });

  if (!activeSession) {
    res.status(404);
    throw new Error("No active session found");
  }

  activeSession.endTime = new Date();
  activeSession.isActive = false;
  activeSession.duration = Math.round(
    (activeSession.endTime - activeSession.startTime) / (1000 * 60)
  );
  await activeSession.save();

  res.json(activeSession);
});

// @desc    Get study sessions for a user (with date range)
// @route   GET /api/study-sessions
// @access  Private
export const getStudySessions = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let query = { user: req.user._id };

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const sessions = await StudySession.find(query)
    .populate("course", "title")
    .sort("-createdAt");

  res.json(sessions);
});

// @desc    Get study hours summary (last 7 days)
// @route   GET /api/study-sessions/summary
// @access  Private
export const getStudyHoursSummary = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  startDate.setHours(0, 0, 0, 0);

  const sessions = await StudySession.find({
    user: req.user._id,
    createdAt: { $gte: startDate },
    isActive: false, // only completed sessions
  });

  // Group by date
  const summary = {};
  for (let i = 0; i < parseInt(days); i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    summary[dateKey] = 0;
  }

  sessions.forEach((session) => {
    const dateKey = session.createdAt.toISOString().split("T")[0];
    if (summary[dateKey] !== undefined) {
      summary[dateKey] += session.duration;
    }
  });

  // Convert to array format
  const result = Object.keys(summary)
    .sort()
    .map((date) => ({
      date,
      hours: Math.round((summary[date] / 60) * 10) / 10, // convert to hours with 1 decimal
      minutes: summary[date],
    }));

  res.json(result);
});

// @desc    Get daily tasks/timetable for a specific date
// @route   GET /api/study-sessions/timetable
// @access  Private
export const getDailyTimetable = asyncHandler(async (req, res) => {
  const { date } = req.query;
  
  if (!date) {
    res.status(400);
    throw new Error("Date parameter required");
  }
  // Parse date string properly to avoid timezone issues
  const [year, month, day] = date.split('-').map(Number);
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

  // Get todos for this date
  const TodoItem = (await import("../models/TodoItem.js")).default;
  const todos = await TodoItem.find({
    user: req.user._id,
    dueDate: { $gte: startOfDay, $lte: endOfDay },
  }).sort("dueDate");

  // Get events for this date
  const Event = (await import("../models/Event.js")).default;
  const events = await Event.find({
    $or: [
      { createdBy: req.user._id },
      // Add enrolled courses events if student
    ],
    startTime: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate("course", "title")
    .sort("startTime");

  // Get assignments due this date
  const Assignment = (await import("../models/Assignment.js")).default;
  const assignments = await Assignment.find({
    dueDate: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate("course", "title")
    .sort("dueDate");

  res.json({
    date: startOfDay,
    todos,
    events,
    assignments,
  });
});
