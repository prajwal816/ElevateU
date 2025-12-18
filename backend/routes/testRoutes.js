import express from 'express';
import { testJudge0Connection, testBackendHealth } from '../controllers/testController.js';

const router = express.Router();

// Test endpoints (no auth required for debugging)
router.get('/health', testBackendHealth);
router.get('/judge0', testJudge0Connection);

export default router;