import express from 'express';
import reactionController from '../controllers/reactionController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateReaction } from '../validators/chatValidator.js';

const router = express.Router();

router.use(authenticate);

// Toggle reaction
router.post('/:meetingId', validateReaction, reactionController.toggleReaction);

// Get meeting reactions
router.get('/:meetingId', reactionController.getMeetingReactions);

// Get reaction counts
router.get('/:meetingId/counts', reactionController.getReactionCounts);

// Remove reaction
router.delete('/:reactionId', reactionController.removeReaction);

export default router;