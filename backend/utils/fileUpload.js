import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms_uploads',           // Folder name in your Cloudinary account
    resource_type: 'auto',           // Supports PDFs, images, etc.
    allowed_formats: ['pdf', 'png', 'jpg', 'jpeg', 'docx', 'pptx'],
  },
});

const upload = multer({ storage });

export default upload;
