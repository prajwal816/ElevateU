import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    executeCode,
    submitCode,
    getSubmission,
    getProblemSubmissions,
} from '../controllers/codeExecutionController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Execute code (for testing/debugging)
router.post('/execute', executeCode);

// Submit code for a problem (with test cases)
router.post('/submit', submitCode);

// Get submission details
router.get('/submissions/:submissionId', getSubmission);

// Get user's submissions for a specific problem
router.get('/problems/:problemId/submissions', getProblemSubmissions);

export default router;