import Assignment from "../models/Assignment.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Submission from "../models/Submission.js";
import Topic from "../models/Topic.js";
import CourseUnit from "../models/CourseUnit.js";
import asyncHandler from "express-async-handler";

// ===============================
// TEACHER: Create a new assignment
// ===============================
export const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, dueDate, courseId, topicId, maxPoints, xpReward } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  // Verify teacher owns the course
  if (course.teacher.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to create assignments for this course");
  }

  const newAssignment = new Assignment({
    title,
    description,
    dueDate,
    course: courseId,
    topic: topicId || null,
    maxPoints: maxPoints || 100,
    xpReward: xpReward || 50,
  });

  await newAssignment.save();
  res.status(201).json({
    message: "Assignment created successfully",
    assignment: newAssignment,
  });
});

// ===================================
// BOTH: Get assignments for a course
// ===================================
export const getAssignmentsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  
  const assignments = await Assignment.find({ course: courseId })
    .populate("course", "title")
    .populate("topic", "title")
    .sort({ createdAt: -1 });
  // Also get assignment-type topics from units of this course
  const units = await CourseUnit.find({ course: courseId });
  const unitIds = units.map(u => u._id);
  const assignmentTopics = await Topic.find({ 
    unit: { $in: unitIds },
    type: "assignment"
  }).populate({
    path: "unit",
    populate: { path: "course", select: "title" }
  });

 // Convert topics to assignment format
 const topicAssignments = assignmentTopics.map(topic => ({
   _id: topic._id,
   title: topic.title,
   description: topic.description,
   course: { _id: topic.unit.course._id, title: topic.unit.course.title },
   topic: topic._id,
   dueDate: topic.dueDate || null,
   maxPoints: topic.maxPoints || 100,
   xpReward: 50,
   fromTopic: true,
   contentUrl: topic.contentUrl,
   createdAt: topic.createdAt
 }));

 const allAssignments = [...assignments, ...topicAssignments];
 
 res.status(200).json(allAssignments);
});

// ===================================
// BOTH: Get assignments for logged-in user
// ===================================
export const getMyAssignments = asyncHandler(async (req, res) => {
  let assignments;

  if (req.user.role === "Teacher") {
    // Teacher: Fetch all courses they teach
    const courses = await Course.find({ teacher: req.user._id }).select("_id");
    const courseIds = courses.map(c => c._id);
    
    // Get all assignments for those courses
    assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate("course", "title")
      .populate("topic", "title")
      .sort({ createdAt: -1 });
    // Also get assignment-type topics from units
    const units = await CourseUnit.find({ course: { $in: courseIds } });
    const unitIds = units.map(u => u._id);
    const assignmentTopics = await Topic.find({ 
      unit: { $in: unitIds },
      type: "assignment"
    }).populate({
      path: "unit",
      populate: { path: "course", select: "title" }
    });

    // Convert topics to assignment format
    const topicAssignments = assignmentTopics.map(topic => ({
      _id: topic._id,
      title: topic.title,
      description: topic.description,
      course: { _id: topic.unit.course._id, title: topic.unit.course.title },
      topic: topic._id,
      dueDate: topic.dueDate ? new Date(topic.dueDate) : null,
      maxPoints: topic.maxPoints || 100,
      xpReward: 50,
      fromTopic: true,
      contentUrl: topic.contentUrl,
      createdAt: topic.createdAt
    }));

    assignments = [...assignments, ...topicAssignments];
  } else if (req.user.role === "Student") {
    // Student: Fetch enrolled courses
    const enrollments = await Enrollment.find({ student: req.user._id }).select("course");
    const courseIds = enrollments.map(e => e.course);
    
    // Get all assignments for enrolled courses
    assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate("course", "title")
      .populate("topic", "title")
      .sort({ dueDate: 1 });
    // Also get assignment-type topics from enrolled courses
    const units = await CourseUnit.find({ course: { $in: courseIds } });
    const unitIds = units.map(u => u._id);
    const assignmentTopics = await Topic.find({ 
      unit: { $in: unitIds },
      type: "assignment"
    }).populate({
      path: "unit",
      populate: { path: "course", select: "title" }
    });

    // Convert topics to assignment format
    const topicAssignments = assignmentTopics.map(topic => ({
      _id: topic._id,
      title: topic.title,
      description: topic.description,
      course: { _id: topic.unit.course._id, title: topic.unit.course.title },
      topic: topic._id,
      dueDate: topic.dueDate ? new Date(topic.dueDate) : null,
      maxPoints: topic.maxPoints || 100,
      xpReward: 50,
      fromTopic: true,
      contentUrl: topic.contentUrl,
      createdAt: topic.createdAt
    }));

    const allAssignments = [...assignments, ...topicAssignments];
    // Check if student has submitted each assignment
    const assignmentsWithStatus = await Promise.all(
      allAssignments.map(async (assignment) => {
        const submission = await Submission.findOne({
          assignment: assignment._id,
          student: req.user._id
        });
        return {
          ...assignment.toObject ? assignment.toObject() : assignment,
          submitted: !!submission,
          submissionId: submission?._id
        };
      })
    );
    
    assignments = assignmentsWithStatus;
  } else {
    res.status(403);
    throw new Error("Invalid user role");
  }

  res.status(200).json(assignments);
});

// ===================================
// UPDATE assignment
// ===================================
export const updateAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, maxPoints, xpReward } = req.body;

  const assignment = await Assignment.findById(id).populate("course");
  
  if (!assignment) {
    res.status(404);
    throw new Error("Assignment not found");
  }

  // Verify teacher owns the course
  if (assignment.course.teacher.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this assignment");
  }

  if (title) assignment.title = title;
  if (description) assignment.description = description;
  if (dueDate) assignment.dueDate = dueDate;
  if (maxPoints) assignment.maxPoints = maxPoints;
  if (xpReward) assignment.xpReward = xpReward;

  await assignment.save();
  res.json(assignment);
});

// ===================================
// DELETE assignment
// ===================================
export const deleteAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const assignment = await Assignment.findById(id).populate("course");
  
  if (!assignment) {
    res.status(404);
    throw new Error("Assignment not found");
  }

  // Verify teacher owns the course
  if (assignment.course.teacher.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this assignment");
  }

  await assignment.deleteOne();
  res.json({ message: "Assignment deleted successfully" });
});