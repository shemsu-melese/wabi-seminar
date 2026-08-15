import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { corsOptions } from './config/cors.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import notFoundMiddleware from './middleware/notFoundMiddleware.js';
import rateLimitMiddleware from './middleware/rateLimitMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import { testConnection } from './config/database.js';
import meetingRoutes from './routes/meetingRoutes.js';
import webrtcRoutes from './routes/webrtcRoutes.js';
import participantRoutes from './routes/participantRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import meetingControlsRoutes from './routes/meetingControlsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import reactionRoutes from './routes/reactionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import wabifocusRoutes from './routes/wabifocusRoutes.js';


// ... rest of code ...
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimitMiddleware);

// Test database connection
await testConnection();
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/webrtc', webrtcRoutes); 
app.use('/api/participants', participantRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/meetings', meetingControlsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/wabifocus', wabifocusRoutes);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'WabiSeminar API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 404 handler
app.use(notFoundMiddleware);

// Error handler
app.use(errorMiddleware);

export default app;