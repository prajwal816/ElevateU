import Grade from "../models/Grade.js";
import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import PlagiarismReport from "../models/PlagiarismReport.js";

export const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    const submission = await Submission.findById(submissionId)
      .populate("assignment")
      .populate("student");
      
    if (!submission) {
      res.status(404);
      throw new Error("Submission not found");
    }

     const assignmentId = submission.assignment?._id || submission.assignment;
    const studentId = submission.student?._id || submission.student;

    if (!assignmentId || !studentId) {
      res.status(400);
      throw new Error("Submission is missing assignment or student reference");
    }

    // Verify teacher owns the course
    const assignment = await Assignment.findById(assignmentId).populate("course");
    if (!assignment) {
      res.status(404);
      throw new Error("Assignment not found");
    }
    if (assignment.course.teacher.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to grade this submission");
    }

    // Check if grade already exists
    let gradeDoc = await Grade.findOne({ submission: submissionId });
    
    if (gradeDoc) {
      // Update existing grade
      gradeDoc.grade = grade;
      gradeDoc.feedback = feedback;
      
      await gradeDoc.save();
    } else {
      // Create new grade
      gradeDoc = await Grade.create({
        submission: submissionId,
        assignment: assignmentId,
        student: studentId,
        grade,
        feedback,
      });
      
      // Award XP for completing assignment
      await User.findByIdAndUpdate(studentId, {
        $inc: { xp: assignment.xpReward || 50 }
      });
    }

    res.status(201).json(gradeDoc);
  } catch (err) {
    next(err);
  }
};

export const getGradesForStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    
    // Find all submissions by student
    const submissions = await Submission.find({ student: studentId })
      .populate({
        path: "assignment",
        populate: { path: "course", select: "title" }
      });
    
    const submissionIds = submissions.map(s => s._id);
    
    
    // Find grades for those submissions
    const grades = await Grade.find({ submission: { $in: submissionIds } })
      .populate({
        path: "submission",
        populate: {
          path: "assignment",
          populate: { path: "course", select: "title" }
        }
      })
      .sort({ createdAt: -1 });

    res.json(grades);
  } catch (err) {
    next(err);
  }
};

export const getGradesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    
    // Get all assignments for the course
    const assignments = await Assignment.find({ course: courseId });
    const assignmentIds = assignments.map(a => a._id);
    
    // Get all submissions for those assignments
    const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
      .populate("student", "name email")
      .populate("assignment", "title maxPoints");
    
    const submissionIds = submissions.map(s => s._id);
    
    // Get all grades for those submissions
    const grades = await Grade.find({ submission: { $in: submissionIds } })
      .populate({
        path: "submission",
        populate: [
          { path: "student", select: "name email" },
          { path: "assignment", select: "title maxPoints" }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(grades);
  } catch (err) {
    next(err);
  }
};

export const getPendingGrades = async (req, res, next) => {
  try {
    // Get all courses taught by teacher
    const courses = await Course.find({ teacher: req.user._id });
    const courseIds = courses.map(c => c._id);
    
    // Get all assignments for those courses
    const assignments = await Assignment.find({ course: { $in: courseIds } });
    const assignmentIds = assignments.map(a => a._id);
    
    // Get all submissions
    const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
      .populate("student", "name email")
      .populate("assignment", "title course")
      .populate({
        path: "assignment",
        populate: { path: "course", select: "title" }
      });
    
    const submissionIds = submissions.map(s => s._id);
    
    // Find grades that exist
    const existingGrades = await Grade.find({ submission: { $in: submissionIds } });
    const gradedSubmissionIds = existingGrades.map(g => g.submission.toString());

    // Find plagiarism reports
    const plagiarismReports = await PlagiarismReport.find({ 
      submission: { $in: submissionIds } 
    });
    
    // Create a map of submission IDs to plagiarism data
    const plagiarismMap = {};
    for (const report of plagiarismReports) {
      if (!plagiarismMap[report.submission.toString()]) {
        plagiarismMap[report.submission.toString()] = {
          hasPlagiarism: report.similarity > 30,
          maxSimilarity: report.similarity
        };
      } else {
        if (report.similarity > plagiarismMap[report.submission.toString()].maxSimilarity) {
          plagiarismMap[report.submission.toString()].maxSimilarity = report.similarity;
          plagiarismMap[report.submission.toString()].hasPlagiarism = report.similarity > 30;
        }
      }
    }
    
    // Filter out submissions that already have grades and add plagiarism info
    const pendingSubmissions = submissions
      .filter(s => !gradedSubmissionIds.includes(s._id.toString()))
      .map(s => ({
        ...s.toObject(),
        plagiarismChecked: s.plagiarismChecked || false,
        plagiarismData: plagiarismMap[s._id.toString()] || null
      }));

    res.json(pendingSubmissions);
  } catch (err) {
    next(err);
  }
};