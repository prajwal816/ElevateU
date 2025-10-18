// utils/calculateGrades.js
import Grade from "../models/Grade.js";
import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";

/**
 * Calculate grade summary for a student in a course
 * @param {string} studentId - MongoDB ObjectId of the student
 * @param {string} courseId - MongoDB ObjectId of the course
 * @returns {Promise<{ totalAssignments, gradedCount, averageGrade, details }>}
 */
export const calculateCourseGrades = async (studentId, courseId) => {
  // 1️⃣ Get all assignments for that course
  const assignments = await Assignment.find({ course: courseId }).select("_id");
  const assignmentIds = assignments.map(a => a._id);

  // 2️⃣ Get all submissions by the student
  const submissions = await Submission.find({
    assignment: { $in: assignmentIds },
    student: studentId,
  }).select("_id assignment");

  const submissionIds = submissions.map(s => s._id);

  // 3️⃣ Fetch all grades for those submissions
  const grades = await Grade.find({ submission: { $in: submissionIds } });

  if (grades.length === 0) {
    return {
      totalAssignments: assignments.length,
      gradedCount: 0,
      averageGrade: 0,
      details: [],
    };
  }

  const total = grades.reduce((acc, g) => acc + g.grade, 0);
  const avg = total / grades.length;

  return {
    totalAssignments: assignments.length,
    gradedCount: grades.length,
    averageGrade: Math.round(avg * 100) / 100,
    details: grades.map(g => ({
      submission: g.submission,
      grade: g.grade,
      feedback: g.feedback,
    })),
  };
};

/**
 * Calculate average grade for all students in a course
 * @param {string} courseId
 * @returns {Promise<Array<{ studentId, name, averageGrade }>>}
 */
export const calculateAllStudentsAverage = async (courseId) => {
  const assignments = await Assignment.find({ course: courseId }).select("_id");
  const assignmentIds = assignments.map(a => a._id);

  const submissions = await Submission.find({ assignment: { $in: assignmentIds } }).populate("student", "name");
  const submissionIds = submissions.map(s => s._id);

  const grades = await Grade.find({ submission: { $in: submissionIds } });

  const studentMap = {};

  for (const g of grades) {
    const submission = submissions.find(s => s._id.toString() === g.submission.toString());
    if (!submission) continue;
    const sid = submission.student._id.toString();
    if (!studentMap[sid]) {
      studentMap[sid] = { name: submission.student.name, grades: [] };
    }
    studentMap[sid].grades.push(g.grade);
  }

  return Object.entries(studentMap).map(([studentId, data]) => ({
    studentId,
    name: data.name,
    averageGrade:
      data.grades.length > 0
        ? Math.round((data.grades.reduce((a, b) => a + b, 0) / data.grades.length) * 100) / 100
        : 0,
  }));
};
