import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'wabiseminar',
        port: parseInt(process.env.DB_PORT) || 3306
    },
    
    jwt: {
        secret: process.env.JWT_SECRET || 'development_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    },
    
    client: {
        url: process.env.CLIENT_URL || 'http://localhost:5173'
    },
    
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
        path: process.env.UPLOAD_PATH || './src/uploads'
    },
    
    rateLimit: {
        window: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000,
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100
    },
    
    socket: {
        port: parseInt(process.env.SOCKET_PORT) || 5001
    }
};

export default config;