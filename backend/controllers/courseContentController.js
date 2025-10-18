import asyncHandler from "express-async-handler";
import CourseUnit from "../models/CourseUnit.js";
import Topic from "../models/Topic.js";
import Course from "../models/Course.js";

// @desc    Get units for a course
// @route   GET /api/courses/:courseId/units
// @access  Private
export const getCourseUnits = asyncHandler(async (req, res) => {
  const units = await CourseUnit.find({ course: req.params.courseId }).sort("order");
  res.json(units);
});

// @desc    Create a unit
// @route   POST /api/courses/:courseId/units
// @access  Private (Teacher)
export const createUnit = asyncHandler(async (req, res) => {
  const { title, description, order } = req.body;
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (course.teacher.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const unit = await CourseUnit.create({
    course: req.params.courseId,
    title,
    description,
    order,
  });

  res.status(201).json(unit);
});

// @desc    Get topics for a unit
// @route   GET /api/units/:unitId/topics
// @access  Private
export const getUnitTopics = asyncHandler(async (req, res) => {
  const topics = await Topic.find({ unit: req.params.unitId }).sort("order");
  res.json(topics);
});

// @desc    Create a topic
// @route   POST /api/units/:unitId/topics
// @access  Private (Teacher)
export const createTopic = asyncHandler(async (req, res) => {
  const { title, type, contentUrl, description, order, dueDate, maxPoints } = req.body;

  const unit = await CourseUnit.findById(req.params.unitId).populate("course");
  if (!unit) {
    res.status(404);
    throw new Error("Unit not found");
  }

  const course = await Course.findById(unit.course);
  if (course.teacher.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const topicData = {
    unit: req.params.unitId,
    title,
    type,
    contentUrl,
    description,
    order,
  };

  // Add assignment-specific fields if type is assignment
  if (type === "assignment") {
    if (dueDate) topicData.dueDate = new Date(dueDate);
    if (maxPoints) topicData.maxPoints = parseInt(maxPoints);
  }

// Handle file upload if present
  if (req.file) {
    topicData.contentUrl = req.file.path;
  }

  const topic = await Topic.create(topicData);

  res.status(201).json(topic);
});

// @desc    Update a unit
// @route   PUT /api/units/:unitId
// @access  Private (Teacher)
export const updateUnit = asyncHandler(async (req, res) => {
  const unit = await CourseUnit.findById(req.params.unitId).populate("course");
  
  if (!unit) {
    res.status(404);
    throw new Error("Unit not found");
  }

  const course = await Course.findById(unit.course);
  if (course.teacher.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const updatedUnit = await CourseUnit.findByIdAndUpdate(req.params.unitId, req.body, { new: true });
  res.json(updatedUnit);
});

// @desc    Update a topic
// @route   PUT /api/topics/:topicId
// @access  Private (Teacher)
export const updateTopic = asyncHandler(async (req, res) => {
  const topic = await Topic.findById(req.params.topicId).populate({
    path: "unit",
    populate: { path: "course" }
  });
  
  if (!topic) {
    res.status(404);
    throw new Error("Topic not found");
  }

  const course = await Course.findById(topic.unit.course);
  if (course.teacher.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const updateData = { ...req.body };
  
  // Handle file upload if present
  if (req.file) {
    updateData.contentUrl = req.file.path;
  }

  const updatedTopic = await Topic.findByIdAndUpdate(req.params.topicId, updateData, { new: true });
  res.json(updatedTopic);
});

// @desc    Delete a unit
// @route   DELETE /api/units/:unitId
// @access  Private (Teacher)
export const deleteUnit = asyncHandler(async (req, res) => {
  const unit = await CourseUnit.findById(req.params.unitId).populate("course");
  
  if (!unit) {
    res.status(404);
    throw new Error("Unit not found");
  }

  const course = await Course.findById(unit.course);
  if (course.teacher.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  // Delete all topics in this unit
  await Topic.deleteMany({ unit: req.params.unitId });
  await unit.deleteOne();

  res.json({ message: "Unit deleted" });
});

// @desc    Delete a topic
// @route   DELETE /api/topics/:topicId
// @access  Private (Teacher)
export const deleteTopic = asyncHandler(async (req, res) => {
  const topic = await Topic.findById(req.params.topicId).populate({
    path: "unit",
    populate: { path: "course" }
  });
  
  if (!topic) {
    res.status(404);
    throw new Error("Topic not found");
  }

  const course = await Course.findById(topic.unit.course);
  if (course.teacher.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await topic.deleteOne();
  res.json({ message: "Topic deleted" });
});