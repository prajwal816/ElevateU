import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import CourseUnit from "../models/CourseUnit.js";
import Topic from "../models/Topic.js";
import User from "../models/User.js";
import Grade from "../models/Grade.js";
import Submission from "../models/Submission.js";

export const createCourse = async (req, res, next) => {
  try {
    const { title, description, duration, category, level, outcomes } = req.body;
    if (!title) {
      res.status(400);
      throw new Error("Title is required");
    }
    const courseData = {
      title,
      description,
      duration,
      category,
      level,
      outcomes: outcomes ? JSON.parse(outcomes) : [],
      teacher: req.user._id,
    };

    // Handle thumbnail upload
    if (req.file) {
      courseData.thumbnail = req.file.path;
    }

    const course = await Course.create(courseData);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

// Update course
export const updateCourse = async (req, res, next) => {
  try {
    const { title, description, duration, category, level, outcomes, isPublished } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }

    // Check if user is the teacher
    if (course.teacher.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this course");
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.duration = duration || course.duration;
    course.category = category || course.category;
    course.level = level || course.level;
    course.outcomes = outcomes ? JSON.parse(outcomes) : course.outcomes;
    if (isPublished !== undefined) course.isPublished = isPublished;

    if (req.file) {
      course.thumbnail = req.file.path;
    }

    await course.save();
    res.json(course);
  } catch (err) {
    next(err);
  }
};

// Delete course
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this course");
    }

    await course.deleteOne();
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getCourses = async (req, res, next) => {
  try {
    const { search, category, level, published } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (level) query.level = level;
    if (published !== undefined) query.isPublished = published === 'true';

    const courses = await Course.find(query).populate("teacher", "name email");
    
    // Add enrolledCount and reviews for each course
    const coursesWithCount = await Promise.all(
      courses.map(async (course) => {
        const count = await Enrollment.countDocuments({ course: course._id });
        
        // Get reviews for this course
        const Review = (await import("../models/Review.js")).default;
        const reviews = await Review.find({ course: course._id })
          .populate("student", "name email")
          .sort({ createdAt: -1 });
        
        // Calculate average rating
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;
        
        return { 
          ...course.toObject(), 
          enrolledCount: count,
          reviews,
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: reviews.length
        };
      })
    );
    
    res.json(coursesWithCount);
  } catch (err) {
    next(err);
  }
};

// Get courses by teacher
export const getTeacherCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ teacher: req.user._id }).populate("teacher", "name email");
    
    // Add enrolledCount for each course
    const coursesWithCount = await Promise.all(
      courses.map(async (course) => {
        const count = await Enrollment.countDocuments({ course: course._id });
        return { ...course.toObject(), enrolledCount: count };
      })
    );
    
    res.json(coursesWithCount);
  } catch (err) {
    next(err);
  }
};
// Get enrolled courses for student
export const getEnrolledCourses = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'teacher', select: 'name email' }
      });
    res.json(enrollments);
  } catch (err) {
    next(err);
  }
};

// Get course by ID with full details
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate("teacher", "name email");
    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }

    // Get units with topics
    const units = await CourseUnit.find({ course: req.params.id }).sort('order');
    const unitsWithTopics = await Promise.all(
      units.map(async (unit) => {
        const topics = await Topic.find({ unit: unit._id }).sort('order');
        return { ...unit.toObject(), topics };
      })
    );
    
    // Add enrolledCount
    const enrolledCount = await Enrollment.countDocuments({ course: req.params.id });

    res.json({ ...course.toObject(), units: unitsWithTopics, enrolledCount });
  } catch (err) {
    next(err);
  }
};



export const getStudentsInCourse = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate("student", "name email");
    
    // Get grades for each student
    const studentsWithGrades = await Promise.all(
      enrollments.map(async (enrollment) => {
        const submissions = await Submission.find({ 
          student: enrollment.student._id 
        }).populate('assignment');
        
        const grades = await Grade.find({
          submission: { $in: submissions.map(s => s._id) }
        });

        const avgGrade = grades.length > 0
          ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
          : 0;

        return {
          ...enrollment.student.toObject(),
          enrollment: enrollment._id,
          progress: enrollment.progress || 0,
          avgGrade: Math.round(avgGrade * 10) / 10,
        };
      })
    );

    res.json(studentsWithGrades);
  } catch (err) {
    next(err);
  }
};

// Enroll in course
export const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }

    if (!course.isPublished) {
      res.status(400);
      throw new Error("Cannot enroll in unpublished course");
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (existingEnrollment) {
      res.status(400);
      throw new Error("Already enrolled in this course");
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
    });

    res.status(201).json(enrollment);
  } catch (err) {
    next(err);
  }
};

// Unenroll from course
export const unenrollFromCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOneAndDelete({
      student: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      res.status(404);
      throw new Error("Enrollment not found");
    }

    res.json({ message: "Successfully unenrolled from course" });
  } catch (err) {
    next(err);
  }
};