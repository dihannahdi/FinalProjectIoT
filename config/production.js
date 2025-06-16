/**
 * Production Configuration for Azure Deployment
 */

module.exports = {
    // Server Configuration
    server: {
        port: process.env.PORT || process.env.WEBSITES_PORT || 8080,
        host: '0.0.0.0',
        trustProxy: true, // Trust Azure Load Balancer
        timeout: 30000,
        keepAliveTimeout: 65000,
        headersTimeout: 66000
    },

    // Security Configuration
    security: {
        allowedOrigins: process.env.ALLOWED_ORIGINS ? 
            process.env.ALLOWED_ORIGINS.split(',') : 
            ['https://*.azurewebsites.net'],
        rateLimiting: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
            skipSuccessfulRequests: true
        },
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
                    fontSrc: ["'self'", "fonts.gstatic.com"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "wss:", "ws:"]
                }
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            }
        }
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        enableConsole: false, // Azure handles console logs
        enableFile: true,
        enableAzureAppInsights: process.env.APPINSIGHTS_INSTRUMENTATIONKEY ? true : false,
        format: 'json',
        maxFiles: '14d',
        maxSize: '20m'
    },

    // Database/Storage Configuration
    storage: {
        type: 'file', // Using local file system for now
        dataPath: './data',
        backupEnabled: true,
        backupInterval: '1h'
    },

    // WebSocket Configuration
    websocket: {
        transports: ['polling'], // Polling only for Azure compatibility
        pingTimeout: 60000,
        pingInterval: 25000,
        allowUpgrades: false,
        compression: false, // Disable for hardware compatibility
        maxHttpBufferSize: 1e6 // 1MB
    },

    // Monitoring Configuration
    monitoring: {
        enabled: true,
        healthCheckPath: '/health',
        metricsPath: '/api/metrics',
        memoryAlertThreshold: parseInt(process.env.MEMORY_ALERT_THRESHOLD_MB) || 400,
        heapUsageAlertPercentage: parseInt(process.env.HEAP_USAGE_ALERT_PERCENTAGE) || 85
    },

    // Azure Specific Configuration
    azure: {
        applicationInsights: {
            instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
            enableAutoCollectRequests: true,
            enableAutoCollectPerformance: true,
            enableAutoCollectExceptions: true,
            enableAutoCollectDependencies: true,
            enableAutoCollectConsole: true
        },
        staticWebApps: process.env.AZURE_STATIC_WEB_APPS_API_TOKEN ? true : false,
        appService: {
            enableWebSocket: true,
            alwaysOn: true,
            http20Enabled: true,
            ftpsState: 'Disabled'
        }
    },

    // Performance Optimization
    performance: {
        compression: {
            level: 6,
            threshold: 1024
        },
        caching: {
            staticMaxAge: 86400000, // 1 day
            apiMaxAge: 0 // No caching for API
        },
        clustering: {
            enabled: false, // Azure handles scaling
            workers: 'auto'
        }
    },

    // Error Handling
    errorHandling: {
        showStackTrace: false,
        logErrors: true,
        notifyOnError: true,
        gracefulShutdownTimeout: 10000
    }
}; 