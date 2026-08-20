import express from 'express';
import wabifocusController from '../controllers/wabifocusController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateCreateItem, validateReorderItems } from '../validators/wabifocusValidator.js';

const router = express.Router();

router.use(authenticate);

// Get my assigned action items
router.get('/my-actions', wabifocusController.getMyActionItems);

// Get upcoming action items
router.get('/upcoming-actions', wabifocusController.getUpcomingActionItems);

// Get meeting items
router.get('/:meetingId', wabifocusController.getMeetingItems);

// Get items by type
router.get('/:meetingId/type/:type', wabifocusController.getItemsByType);

// Get action items for meeting
router.get('/:meetingId/actions', wabifocusController.getActionItems);

// Get summary
router.get('/:meetingId/summary', wabifocusController.getSummary);

// Get full summary
router.get('/:meetingId/summary/full', wabifocusController.getFullSummary);

// Get meeting outcome
router.get('/:meetingId/outcome', wabifocusController.getMeetingOutcome);

// Create item
router.post('/:meetingId', validateCreateItem, wabifocusController.createItem);

// Update item
router.put('/:itemId', validateCreateItem, wabifocusController.updateItem);

// Complete action item
router.post('/:itemId/complete', wabifocusController.completeActionItem);

// Reorder items
router.put('/:meetingId/reorder', validateReorderItems, wabifocusController.reorderItems);

// Delete item
router.delete('/:itemId', wabifocusController.deleteItem);

export default router;