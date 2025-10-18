import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

/**
 * Dynamically determine upload parameters for each file type.
 * Ensures PDFs and DOCX are uploaded correctly and remain viewable/downloadable with proper MIME.
 */
const getUploadParams = async (req, file, folder) => {
  const mime = file.mimetype;

  // === Images ===
  if (mime.startsWith("image/")) {
    return {
      folder,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "gif"],
    };
  }

  // === Videos ===
  if (mime.startsWith("video/")) {
    return {
      folder,
      resource_type: "video",
      allowed_formats: ["mp4", "mov", "avi"],
    };
  }

  // === Documents / PDFs ===
  if (
    mime === "application/pdf" ||
    mime === "application/msword" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/zip" ||
    mime === "text/plain"
  ) {
    return {
      folder,
      resource_type: "auto", // ✅ Changed from "raw" to "auto" for accessibility
      public_id: file.originalname.split(".")[0], // keep original name
      format: file.originalname.split(".").pop(), // preserve extension
      type: "upload",
    };
  }

  // === Fallback ===
  return {
    folder,
    resource_type: "auto",
    type: "upload",
  };
};

// === Course materials (PDFs, videos, images) ===
const courseStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) =>
    getUploadParams(req, file, "lms/course-materials"),
});

// === Assignments ===
const assignmentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) =>
    getUploadParams(req, file, "lms/assignments"),
});

// === Thumbnails (always images) ===
const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "lms/thumbnails",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
  },
});

// === Profile pictures (always images) ===
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "lms/profiles",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

export const uploadCourseMaterial = multer({ storage: courseStorage });
export const uploadAssignment = multer({ storage: assignmentStorage });
export const uploadThumbnail = multer({ storage: thumbnailStorage });
export const uploadProfile = multer({ storage: profileStorage });
