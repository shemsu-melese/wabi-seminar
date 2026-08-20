import express from 'express';
import participantController from '../controllers/participantController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// GET /api/participants/:meetingId
router.get('/:meetingId', participantController.getMeetingParticipants);

// GET /api/participants/:meetingId/waiting
router.get('/:meetingId/waiting', participantController.getWaitingParticipants);

// POST /api/participants/:meetingId/admit/:userId
router.post('/:meetingId/admit/:userId', participantController.admitParticipant);

// POST /api/participants/:meetingId/admit-all
router.post('/:meetingId/admit-all', participantController.admitAll);

// DELETE /api/participants/:meetingId/:userId
router.delete('/:meetingId/:userId', participantController.removeParticipant);

// POST /api/participants/:meetingId/mute/:userId
router.post('/:meetingId/mute/:userId', participantController.muteParticipant);

// POST /api/participants/:meetingId/unmute/:userId
router.post('/:meetingId/unmute/:userId', participantController.unmuteParticipant);

// POST /api/participants/:meetingId/mute-all
router.post('/:meetingId/mute-all', participantController.muteAll);

// PUT /api/participants/:meetingId/:userId/role
router.put('/:meetingId/:userId/role', participantController.updateRole);

export default router;