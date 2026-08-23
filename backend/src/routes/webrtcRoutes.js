import express from 'express';
import webrtcController from '../controllers/webrtcController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Get ICE server configuration
router.get('/ice-servers', webrtcController.getIceServers);

// Get TURN credentials
router.post('/turn-credentials', webrtcController.getTurnCredentials);

// Generate room ID
router.get('/room-id', webrtcController.generateRoomId);

export default router;