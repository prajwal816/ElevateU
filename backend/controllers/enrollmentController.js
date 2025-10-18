import asyncHandler from "express-async-handler";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private (Student)
export const enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const studentId = req.user._id;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({ course: courseId, student: studentId });
  if (existingEnrollment) {
    res.status(400);
    throw new Error("Already enrolled in this course");
  }

  const enrollment = await Enrollment.create({
    course: courseId,
    student: studentId,
    lastAccessedAt: new Date(),
  });

  res.status(201).json(enrollment);
});

// @desc    Get student's enrollments
// @route   GET /api/enrollments
// @access  Private
export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate("course")
    .sort("-lastAccessedAt");

  res.json(enrollments);
});

// @desc    Update enrollment progress
// @route   PUT /api/enrollments/:id/progress
// @access  Private (Student)
export const updateEnrollmentProgress = asyncHandler(async (req, res) => {
  const { topicId } = req.body;
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    res.status(404);
    throw new Error("Enrollment not found");
  }

  if (enrollment.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  // Add topic to completed topics if not already there
  if (!enrollment.completedTopics.includes(topicId)) {
    enrollment.completedTopics.push(topicId);
  }

  // Calculate progress percentage
  const progress = await calculateCourseProgress(enrollment.course, enrollment.completedTopics);
  enrollment.progress = progress;

  enrollment.lastAccessedAt = new Date();
  await enrollment.save();

  res.json(enrollment);
});

// Helper function to calculate course progress
const calculateCourseProgress = async (courseId, completedTopics) => {
  // Get all topics in the course
  const CourseUnit = (await import("../models/CourseUnit.js")).default;
  const Topic = (await import("../models/Topic.js")).default;
  
  const units = await CourseUnit.find({ course: courseId });
  const unitIds = units.map(unit => unit._id);
  const allTopics = await Topic.find({ unit: { $in: unitIds } });
  
  if (allTopics.length === 0) {
    return 0;
  }
  
  const completedCount = completedTopics.length;
  const totalCount = allTopics.length;
  
  return Math.round((completedCount / totalCount) * 100);
};

// @desc    Get students in a course
// @route   GET /api/enrollments/course/:courseId/students
// @access  Private (Teacher)
export const getStudentsInCourse = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ course: req.params.courseId })
    .populate("student", "name email xp")
    .sort("-createdAt");

  res.json(enrollments);
});