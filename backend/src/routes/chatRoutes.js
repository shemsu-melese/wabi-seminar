import express from 'express';
import chatController from '../controllers/chatController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateSendMessage } from '../validators/chatValidator.js';

const router = express.Router();

router.use(authenticate);

// Send message
router.post('/:meetingId', validateSendMessage, chatController.sendMessage);

// Get messages
router.get('/:meetingId', chatController.getMessages);

// Get pinned messages
router.get('/:meetingId/pinned', chatController.getPinnedMessages);

// Delete message
router.delete('/:messageId', chatController.deleteMessage);

// Pin message
router.post('/:messageId/pin', chatController.pinMessage);

// Unpin message
router.post('/:messageId/unpin', chatController.unpinMessage);

export default router;