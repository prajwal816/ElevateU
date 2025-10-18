import asyncHandler from "express-async-handler";
import Event from "../models/Event.js";
import Enrollment from "../models/Enrollment.js";

// @desc    Get events for user (based on enrolled courses)
// @route   GET /api/events
// @access  Private
export const getEvents = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  
  let query = {};
  
  // If student, get events from enrolled courses
  if (req.user.role === "Student") {
    const enrollments = await Enrollment.find({ student: req.user._id });
    const courseIds = enrollments.map(e => e.course);
    query = { $or: [{ course: { $in: courseIds } }, { createdBy: req.user._id }] };
  } else {
    // If teacher, get their own events
    query = { createdBy: req.user._id };
  }

  // Filter by date range if provided
  if (start && end) {
    query.startTime = { $gte: new Date(start), $lte: new Date(end) };
  }

  const events = await Event.find(query)
    .populate("course", "title")
    .populate("createdBy", "name")
    .sort("startTime");

  res.json(events);
});

// @desc    Create an event
// @route   POST /api/events
// @access  Private
export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, startTime, endTime, course, type } = req.body;

  const event = await Event.create({
    title,
    description,
    startTime,
    endTime,
    course,
    type,
    createdBy: req.user._id,
  });

  res.status(201).json(event);
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  if (event.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedEvent);
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  if (event.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await event.deleteOne();
  res.json({ message: "Event deleted" });
});