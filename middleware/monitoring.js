const logger = require('../config/logger');
const metrics = require('../config/metrics');

// Request performance monitoring middleware
const requestMonitoring = (req, res, next) => {
    const startTime = process.hrtime.bigint();
    const startTimestamp = Date.now();
    
    // Track the original end method
    const originalEnd = res.end;
    
    // Override res.end to capture response metrics
    res.end = function(...args) {
        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        const success = res.statusCode < 400;
        
        // Record metrics
        metrics.recordRequest(responseTime, success);
        
        // Log request details
        logger.info('HTTP Request', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime.toFixed(2)}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            success,
            timestamp: new Date(startTimestamp).toISOString(),
            type: 'http_request'
        });
        
        // Call original end method
        originalEnd.apply(this, args);
    };
    
    next();
};

// Error handling middleware
const errorMonitoring = (error, req, res, next) => {
    // Track error in metrics
    metrics.recordRequest(0, false);
    
    // Log error with context
    logger.trackError(error, {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        body: req.body,
        params: req.params,
        query: req.query
    });
    
    // Send error response
    const statusCode = error.status || error.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : error.message;
    
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
        },
        timestamp: new Date().toISOString()
    });
};

// Health check endpoint handler
const healthCheck = (req, res) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
        },
        system: {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            pid: process.pid
        }
    };
    
    logger.info('Health check requested', {
        ...healthData,
        type: 'health_check'
    });
    
    res.json(healthData);
};

// Detailed metrics endpoint handler
const metricsEndpoint = (req, res) => {
    try {
        const metricsData = metrics.getMetrics();
        
        logger.info('Metrics endpoint accessed', {
            totalRequests: metricsData.requests.total,
            currentConnections: metricsData.websocket.currentConnections,
            type: 'metrics_access'
        });
        
        res.json({
            success: true,
            data: metricsData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.trackError(error, { endpoint: 'metrics' });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve metrics',
            timestamp: new Date().toISOString()
        });
    }
};

// WebSocket monitoring wrapper
const monitorWebSocketEvent = (eventName, handler) => {
    return (socket, data, callback) => {
        const startTime = process.hrtime.bigint();
        
        // Log incoming event
        logger.websocketMetrics.eventReceived(eventName, socket.id, data);
        metrics.recordWebSocketEvent('received');
        
        try {
            // Execute original handler
            const result = handler(socket, data, callback);
            
            // If handler returns a promise, monitor it
            if (result && typeof result.then === 'function') {
                result
                    .then(() => {
                        const endTime = process.hrtime.bigint();
                        const duration = Number(endTime - startTime) / 1000000;
                        
                        logger.debug('WebSocket event completed', {
                            event: eventName,
                            socketId: socket.id,
                            duration: `${duration.toFixed(2)}ms`,
                            type: 'websocket_event_completed'
                        });
                    })
                    .catch((error) => {
                        logger.trackError(error, {
                            event: eventName,
                            socketId: socket.id,
                            data
                        });
                    });
            }
            
            return result;
        } catch (error) {
            logger.trackError(error, {
                event: eventName,
                socketId: socket.id,
                data
            });
            throw error;
        }
    };
};

// Connection monitoring for WebSocket
const monitorWebSocketConnection = (io) => {
    io.on('connection', (socket) => {
        // Record connection
        metrics.recordWebSocketConnection();
        
        logger.info('WebSocket client connected', {
            socketId: socket.id,
            address: socket.conn.remoteAddress,
            userAgent: socket.request.headers['user-agent'],
            totalConnections: metrics.getMetrics().websocket.currentConnections,
            type: 'websocket_connection'
        });
        
        // Monitor disconnection
        socket.on('disconnect', (reason) => {
            metrics.recordWebSocketDisconnection();
            
            logger.info('WebSocket client disconnected', {
                socketId: socket.id,
                reason,
                totalConnections: metrics.getMetrics().websocket.currentConnections,
                type: 'websocket_disconnection'
            });
        });
        
        // Monitor ping/pong for connection health
        socket.on('ping', () => {
            logger.debug('WebSocket ping received', {
                socketId: socket.id,
                type: 'websocket_ping'
            });
        });
        
        socket.on('pong', (latency) => {
            logger.debug('WebSocket pong received', {
                socketId: socket.id,
                latency: `${latency}ms`,
                type: 'websocket_pong'
            });
        });
    });
};

// Memory monitoring alerts
const checkMemoryUsage = () => {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const rssMB = memUsage.rss / 1024 / 1024;
    
    // Alert if memory usage is high
    if (heapUsedMB > 200) { // Alert if heap usage > 200MB
        logger.warn('High memory usage detected', {
            heapUsed: `${heapUsedMB.toFixed(2)}MB`,
            heapTotal: `${heapTotalMB.toFixed(2)}MB`,
            rss: `${rssMB.toFixed(2)}MB`,
            type: 'memory_alert'
        });
    }
    
    // Alert if heap usage is > 80% of total
    const heapUsagePercentage = (heapUsedMB / heapTotalMB) * 100;
    if (heapUsagePercentage > 80) {
        logger.warn('High heap usage percentage', {
            percentage: `${heapUsagePercentage.toFixed(2)}%`,
            heapUsed: `${heapUsedMB.toFixed(2)}MB`,
            heapTotal: `${heapTotalMB.toFixed(2)}MB`,
            type: 'heap_usage_alert'
        });
    }
};

// Start memory monitoring
setInterval(checkMemoryUsage, 2 * 60 * 1000); // Check every 2 minutes

module.exports = {
    requestMonitoring,
    errorMonitoring,
    healthCheck,
    metricsEndpoint,
    monitorWebSocketEvent,
    monitorWebSocketConnection,
    checkMemoryUsage
}; 