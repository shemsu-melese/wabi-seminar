/**
 * Central configuration for the application
 * All environment variables are accessed here
 */

const config = {
    // API Configuration
    api: {
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
        socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
    },
    
    // App Configuration
    app: {
        name: import.meta.env.VITE_APP_NAME || 'WabiSeminar',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        env: import.meta.env.VITE_NODE_ENV || 'development',
    },
    
    // Feature Flags
    features: {
        analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
        logging: import.meta.env.VITE_ENABLE_LOGGING === 'true',
        debug: import.meta.env.VITE_DEBUG_MODE === 'true',
    },
    
    // Environment Helpers
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
};

// Validate required environment variables
const required = ['VITE_API_URL'];
for (const key of required) {
    if (!import.meta.env[key]) {
        console.warn(`⚠️ Missing environment variable: ${key}`);
    }
}

// Log configuration in development
if (config.isDevelopment && config.features.logging) {
    console.log('📋 App Configuration:', {
        name: config.app.name,
        version: config.app.version,
        env: config.app.env,
        apiUrl: config.api.baseUrl,
        socketUrl: config.api.socketUrl,
        features: config.features,
    });
}

export default config;