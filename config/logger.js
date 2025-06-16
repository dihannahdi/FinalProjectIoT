const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Ensure logs directory exists
const fs = require('fs');
const logsDir = './logs';
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
            timestamp,
            level: level.toUpperCase(),
            message,
            ...meta
        });
    })
);

// Daily rotate file transport for application logs
const appLogTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    maxSize: '20m',
    format: logFormat
});

// Daily rotate file transport for error logs
const errorLogTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: '30d',
    maxSize: '20m',
    format: logFormat
});

// Console transport with colors for development
const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
            format: 'HH:mm:ss'
        }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
            return `[${timestamp}] ${level}: ${message}${metaStr}`;
        })
    )
});

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        appLogTransport,
        errorLogTransport,
        ...(process.env.NODE_ENV !== 'production' ? [consoleTransport] : [])
    ],
    exitOnError: false
});

// Performance logging helpers
logger.performance = {
    start: (label) => {
        const start = process.hrtime.bigint();
        return {
            end: () => {
                const end = process.hrtime.bigint();
                const duration = Number(end - start) / 1000000; // Convert to milliseconds
                logger.info('Performance metric', {
                    label,
                    duration: `${duration.toFixed(2)}ms`,
                    type: 'performance'
                });
                return duration;
            }
        };
    }
};

// System metrics logging
logger.systemMetrics = () => {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    logger.info('System metrics', {
        memory: {
            rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)}MB`,
            heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
            heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
            external: `${(memUsage.external / 1024 / 1024).toFixed(2)}MB`
        },
        cpu: {
            user: `${(cpuUsage.user / 1000).toFixed(2)}ms`,
            system: `${(cpuUsage.system / 1000).toFixed(2)}ms`
        },
        uptime: `${process.uptime().toFixed(2)}s`,
        type: 'system_metrics'
    });
};

// Error tracking
logger.trackError = (error, context = {}) => {
    logger.error('Error tracked', {
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name
        },
        context,
        type: 'error_tracking'
    });
};

// Game metrics tracking
logger.gameMetrics = {
    gameStarted: (playerName, socketId) => {
        logger.info('Game started', {
            playerName,
            socketId,
            type: 'game_started'
        });
    },
    
    gameCompleted: (playerName, score, duration) => {
        logger.info('Game completed', {
            playerName,
            score,
            duration: `${duration}ms`,
            type: 'game_completed'
        });
    },
    
    scoreSubmitted: (playerName, score) => {
        logger.info('Score submitted', {
            playerName,
            score,
            type: 'score_submitted'
        });
    },
    
    leaderboardUpdated: (totalEntries) => {
        logger.info('Leaderboard updated', {
            totalEntries,
            type: 'leaderboard_updated'
        });
    }
};

// WebSocket metrics tracking
logger.websocketMetrics = {
    clientConnected: (socketId, totalClients) => {
        logger.info('WebSocket client connected', {
            socketId,
            totalClients,
            type: 'websocket_connected'
        });
    },
    
    clientDisconnected: (socketId, totalClients) => {
        logger.info('WebSocket client disconnected', {
            socketId,
            totalClients,
            type: 'websocket_disconnected'
        });
    },
    
    eventReceived: (event, socketId, payload = {}) => {
        logger.debug('WebSocket event received', {
            event,
            socketId,
            payload: typeof payload === 'object' ? payload : { data: payload },
            type: 'websocket_event_received'
        });
    },
    
    eventSent: (event, recipients, payload = {}) => {
        logger.debug('WebSocket event sent', {
            event,
            recipients,
            payload: typeof payload === 'object' ? payload : { data: payload },
            type: 'websocket_event_sent'
        });
    }
};

module.exports = logger; 