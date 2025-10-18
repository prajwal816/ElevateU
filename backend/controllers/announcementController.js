import Announcement from "../models/Announcement.js";
import Course from "../models/Course.js";

// Get all announcements for a course
export const getCourseAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ course: req.params.courseId })
      .populate("teacher", "name email")
      .sort("-createdAt");
    res.json(announcements);
  } catch (err) {
    next(err);
  }
};

// Create announcement (Teacher only)
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Only the course teacher can create announcements");
    }

    const announcement = await Announcement.create({
      course: req.params.courseId,
      teacher: req.user._id,
      title,
      content,
    });

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate("teacher", "name email");

    res.status(201).json(populatedAnnouncement);
  } catch (err) {
    next(err);
  }
};

// Update announcement
export const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      res.status(404);
      throw new Error("Announcement not found");
    }

    if (announcement.teacher.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this announcement");
    }

    announcement.title = req.body.title || announcement.title;
    announcement.content = req.body.content || announcement.content;

    await announcement.save();
    const updated = await Announcement.findById(announcement._id)
      .populate("teacher", "name email");

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete announcement
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      res.status(404);
      throw new Error("Announcement not found");
    }

    if (announcement.teacher.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this announcement");
    }

    await announcement.deleteOne();
    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    next(err);
  }
};