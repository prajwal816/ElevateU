import express from "express";
import { 
    createCourse, 
    updateCourse,
    deleteCourse,
    getCourses, 
    getCourseById, 
    getTeacherCourses,
    getEnrolledCourses,
    getStudentsInCourse,
    enrollInCourse,
    unenrollFromCourse
  } from "../controllers/courseController.js";
  import { 
    getCourseUnits, 
    createUnit, 
    updateUnit, 
    deleteUnit,
    getUnitTopics, 
    createTopic,
    updateTopic,
    deleteTopic
  } from "../controllers/courseContentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadThumbnail, uploadCourseMaterial } from "../middleware/upload.js";
const router = express.Router();

router.post("/", protect, uploadThumbnail.single('thumbnail'), createCourse);
router.get("/", protect, getCourses);
router.get("/my-courses", protect, getTeacherCourses);
router.get("/enrolled", protect, getEnrolledCourses);
router.get("/:id", protect, getCourseById);
router.put("/:id", protect, uploadThumbnail.single('thumbnail'), updateCourse);
router.delete("/:id", protect, deleteCourse);

// Course enrollment
router.post("/:courseId/enroll", protect, enrollInCourse);
router.delete("/:courseId/unenroll", protect, unenrollFromCourse);
router.get("/:courseId/students", protect, getStudentsInCourse);
router.get("/:courseId/units", protect, getCourseUnits);
router.post("/:courseId/units", protect, createUnit);

// Units management
router.put("/units/:unitId", protect, updateUnit);
router.delete("/units/:unitId", protect, deleteUnit);

// Unit topics
router.get("/units/:unitId/topics", protect, getUnitTopics);
router.post("/units/:unitId/topics", protect, uploadCourseMaterial.single('content'), createTopic);

// Topics management
router.put("/topics/:topicId", protect, uploadCourseMaterial.single('content'), updateTopic);
router.delete("/topics/:topicId", protect, deleteTopic);

export default router;
