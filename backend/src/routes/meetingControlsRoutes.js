import express from 'express';
import meetingControlsController from '../controllers/meetingControlsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// POST /api/meetings/:meetingId/lock
router.post('/:meetingId/lock', meetingControlsController.lockMeeting);

// POST /api/meetings/:meetingId/unlock
router.post('/:meetingId/unlock', meetingControlsController.unlockMeeting);

// POST /api/meetings/:meetingId/waiting-room/enable
router.post('/:meetingId/waiting-room/enable', meetingControlsController.enableWaitingRoom);

// POST /api/meetings/:meetingId/waiting-room/disable
router.post('/:meetingId/waiting-room/disable', meetingControlsController.disableWaitingRoom);

// GET /api/meetings/:meetingId/status
router.get('/:meetingId/status', meetingControlsController.getMeetingStatus);

export default router;