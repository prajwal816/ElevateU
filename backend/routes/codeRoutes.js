import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    submitCode,
    getResult,
    getExecutionStats,
    executeCode,
} from '../controllers/codeController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// CodeArena-compatible endpoints
router.post('/submit', submitCode);
router.get('/result/:token', getResult);
router.get('/stats', getExecutionStats);

// Alternative endpoint for easier integration
router.post('/execute', executeCode);

export default router;