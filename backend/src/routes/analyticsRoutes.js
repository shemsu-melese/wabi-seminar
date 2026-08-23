import express from 'express';
import analyticsController from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Get meeting analytics
router.get('/meeting/:meetingId', analyticsController.getMeetingAnalytics);

// Get user analytics
router.get('/user', analyticsController.getUserAnalytics);

// Get platform analytics (admin only)
router.get('/platform', analyticsController.getPlatformAnalytics);

// Get trends
router.get('/trends', analyticsController.getTrends);

// Get stats
router.get('/stats', analyticsController.getStats);

export default router;