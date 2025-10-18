import Review from "../models/Review.js";
import Course from "../models/Course.js";
import asyncHandler from "express-async-handler";

// @desc    Submit a review for a course
// @route   POST /api/reviews/:courseId
// @access  Private (Student)
export const submitReview = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { rating, comment } = req.body;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  // Check if student has already reviewed this course
  const existingReview = await Review.findOne({
    course: courseId,
    student: req.user._id
  });

  if (existingReview) {
    res.status(400);
    throw new Error("You have already reviewed this course");
  }

  // Create new review
  const review = await Review.create({
    course: courseId,
    student: req.user._id,
    rating,
    comment: comment || ""
  });

  // Update course average rating
  await updateCourseRating(courseId);

  res.status(201).json(review);
});

// @desc    Get reviews for a course
// @route   GET /api/reviews/:courseId
// @access  Public
export const getCourseReviews = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const reviews = await Review.find({ course: courseId })
    .populate("student", "name email")
    .sort({ createdAt: -1 });

  res.json(reviews);
});

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private (Student)
export const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  // Check if user owns this review
  if (review.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this review");
  }

  review.rating = rating;
  review.comment = comment || "";
  await review.save();

  // Update course average rating
  await updateCourseRating(review.course);

  res.json(review);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (Student)
export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  // Check if user owns this review
  if (review.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this review");
  }

  const courseId = review.course;
  await review.deleteOne();

  // Update course average rating
  await updateCourseRating(courseId);

  res.json({ message: "Review deleted successfully" });
});

// Helper function to update course average rating
const updateCourseRating = async (courseId) => {
  const reviews = await Review.find({ course: courseId });
  
  if (reviews.length === 0) {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: 0,
      reviewCount: 0
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Course.findByIdAndUpdate(courseId, {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    reviewCount: reviews.length
  });
};
