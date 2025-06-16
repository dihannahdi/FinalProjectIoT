const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import monitoring components
const logger = require('./config/logger');
const metrics = require('./config/metrics');
const {
    requestMonitoring,
    errorMonitoring,
    healthCheck,
    metricsEndpoint,
    monitorWebSocketEvent,
    monitorWebSocketConnection
} = require('./middleware/monitoring');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Security and monitoring middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
app.use(limiter);
app.use(requestMonitoring);
app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global state management
let lastPlayerName = '';

// Ensure data directory and leaderboard file exist
async function ensureDataDirectory() {
    try {
        await fs.mkdir('data', { recursive: true });
        try {
            await fs.access('data/leaderboard.json');
        } catch {
            await fs.writeFile('data/leaderboard.json', '[]');
        }
        logger.info('Data directory and leaderboard file initialized', { type: 'initialization' });
    } catch (error) {
        logger.trackError(error, { context: 'data_directory_initialization' });
    }
}

// Health check and monitoring endpoints
app.get('/health', healthCheck);
app.get('/api/metrics', metricsEndpoint);

// API Endpoint: GET /api/leaderboard
app.get('/api/leaderboard', async (req, res) => {
    const timer = logger.performance.start('leaderboard_fetch');
    
    try {
        const data = await fs.readFile('data/leaderboard.json', 'utf8');
        let leaderboard = JSON.parse(data || '[]');
        
        // Sort by score (highest to lowest)
        leaderboard.sort((a, b) => b.score - a.score);
        
        timer.end();
        logger.info('Leaderboard fetched successfully', {
            totalEntries: leaderboard.length,
            type: 'leaderboard_fetch'
        });
        
        res.json({
            success: true,
            data: leaderboard,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        timer.end();
        logger.trackError(error, { context: 'leaderboard_fetch' });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch leaderboard',
            timestamp: new Date().toISOString()
        });
    }
});

// WebSocket monitoring integration
monitorWebSocketConnection(io);

// Socket.IO Connection Handling
io.on('connection', (socket) => {
    logger.info('WebSocket client connected', {
        socketId: socket.id,
        address: socket.conn.remoteAddress,
        userAgent: socket.request.headers['user-agent'],
        type: 'websocket_connection'
    });

    // Event: frontend:start-game
    socket.on('frontend:start-game', monitorWebSocketEvent('frontend:start-game', (socket, payload) => {
        if (payload && payload.name) {
            lastPlayerName = payload.name;
            
            // Record game start metrics
            metrics.recordGameStart(lastPlayerName, socket.id);
            
            logger.info('Game start requested', {
                playerName: lastPlayerName,
                socketId: socket.id,
                type: 'game_start_request'
            });
            
            // Broadcast to all clients (including hardware)
            io.emit('server:trigger-game');
            metrics.recordWebSocketEvent('sent');
            
            logger.websocketMetrics.eventSent('server:trigger-game', 'all', { triggeredBy: lastPlayerName });
        } else {
            logger.warn('Invalid game start payload', {
                payload,
                socketId: socket.id,
                type: 'invalid_payload'
            });
        }
    }));

    // Event: hardware:submit-score
    socket.on('hardware:submit-score', monitorWebSocketEvent('hardware:submit-score', async (socket, payload) => {
        const timer = logger.performance.start('score_submission');
        
        if (payload && typeof payload.score === 'number' && lastPlayerName) {
            try {
                logger.info('Score submission received', {
                    playerName: lastPlayerName,
                    score: payload.score,
                    socketId: socket.id,
                    type: 'score_submission'
                });
                
                // Record game completion metrics
                const gameDuration = payload.duration || 0;
                metrics.recordGameComplete(lastPlayerName, payload.score, gameDuration);
                metrics.recordScoreSubmission(lastPlayerName, payload.score);
                
                // Create new entry
                const newEntry = {
                    name: lastPlayerName,
                    score: payload.score,
                    timestamp: new Date().toISOString()
                };

                // Read current leaderboard
                const data = await fs.readFile('data/leaderboard.json', 'utf8');
                let leaderboard = JSON.parse(data || '[]');
                
                // Add new entry
                leaderboard.push(newEntry);
                
                // Sort by score (highest to lowest)
                leaderboard.sort((a, b) => b.score - a.score);
                
                // Write back to file
                await fs.writeFile('data/leaderboard.json', JSON.stringify(leaderboard, null, 2));
                
                // Record leaderboard update metrics
                metrics.recordLeaderboardUpdate(leaderboard.length);
                
                // Broadcast updated leaderboard to all web clients
                io.emit('server:leaderboard-update', leaderboard);
                metrics.recordWebSocketEvent('sent');
                
                logger.websocketMetrics.eventSent('server:leaderboard-update', 'all', { 
                    newEntry: newEntry,
                    totalEntries: leaderboard.length
                });
                
                logger.info('Score processed successfully', {
                    playerName: lastPlayerName,
                    score: payload.score,
                    leaderboardPosition: leaderboard.findIndex(entry => entry.name === lastPlayerName && entry.score === payload.score) + 1,
                    totalEntries: leaderboard.length,
                    type: 'score_processed'
                });
                
                // Reset player name
                lastPlayerName = '';
                timer.end();
                
            } catch (error) {
                timer.end();
                logger.trackError(error, {
                    context: 'score_submission',
                    playerName: lastPlayerName,
                    payload,
                    socketId: socket.id
                });
            }
        } else {
            timer.end();
            logger.warn('Invalid score submission', {
                payload,
                lastPlayerName,
                socketId: socket.id,
                type: 'invalid_score_submission'
            });
        }
    }));

    // Event: disconnect
    socket.on('disconnect', (reason) => {
        logger.info('WebSocket client disconnected', {
            socketId: socket.id,
            reason,
            type: 'websocket_disconnect'
        });
        
        // If this was the player who started a game but didn't finish, reset
        if (lastPlayerName) {
            logger.warn('Player disconnected during game', {
                playerName: lastPlayerName,
                socketId: socket.id,
                type: 'player_disconnect_during_game'
            });
            lastPlayerName = '';
        }
    });
});

// Error handling middleware (must be last)
app.use(errorMonitoring);

// Handle 404 errors
app.use('*', (req, res) => {
    logger.warn('404 Not Found', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        type: '404_error'
    });
    
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        timestamp: new Date().toISOString()
    });
});

// Initialize and start server
async function startServer() {
    await ensureDataDirectory();
    
    const PORT = process.env.PORT || process.env.WEBSITES_PORT || 3000;
    
    server.listen(PORT, () => {
        logger.info('Server started successfully', {
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            pid: process.pid,
            nodeVersion: process.version,
            memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            type: 'server_start'
        });
        
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`📈 Metrics: http://localhost:${PORT}/api/metrics`);
        console.log('🎮 Simon Says IoT System ready with full monitoring!');
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
}

function gracefulShutdown(signal) {
    logger.info('Graceful shutdown initiated', {
        signal,
        uptime: process.uptime(),
        type: 'server_shutdown'
    });
    
    server.close(() => {
        logger.info('Server closed successfully', { type: 'server_closed' });
        process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
        logger.error('Force shutdown after timeout', { type: 'force_shutdown' });
        process.exit(1);
    }, 10000);
}

startServer(); 