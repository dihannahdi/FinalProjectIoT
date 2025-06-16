const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const WebSocket = require('ws');
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

// Configure Socket.IO with proper CORS and options
const io = socketIo(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true,  // Allow Engine.IO v3 compatibility
    transports: ['polling'],  // Use only polling to avoid conflicts with hardware WebSocket
    pingTimeout: 60000,  // 60 seconds
    pingInterval: 25000,  // 25 seconds
    allowUpgrades: false  // Disable WebSocket upgrade to prevent conflicts
});

// Create a WebSocket server that shares the same HTTP server (Azure compatible)
const wsServer = new WebSocket.Server({ 
    server: server,  // Use same server instead of separate port
    path: '/hardware-ws',  // Specific path for hardware WebSocket
    verifyClient: (info) => {
        logger.info('Hardware WebSocket connection attempt', {
            origin: info.origin,
            userAgent: info.req.headers['user-agent'],
            path: info.req.url,
            type: 'hardware_connection_attempt'
        });
        // Only allow connections to the exact hardware WebSocket path
        return info.req.url === '/hardware-ws' && info.req.headers['user-agent']?.includes('arduino');
    },
    perMessageDeflate: false  // Disable compression for better hardware compatibility
});

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
        
        // Sort by complex criteria
        leaderboard.sort((a, b) => {
            // Primary: Final score (highest first)
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            
            // Secondary: Total duration (fastest first) 
            if (a.totalDuration !== b.totalDuration) {
                return a.totalDuration - b.totalDuration;
            }
            
            // Tertiary: Average response time (fastest first)
            if (a.avgResponseTime !== b.avgResponseTime) {
                return a.avgResponseTime - b.avgResponseTime;
            }
            
            // Quaternary: Time bonus (highest first)
            if (b.timeBonus !== a.timeBonus) {
                return b.timeBonus - a.timeBonus;
            }
            
            // Final: Accuracy bonus (highest first)
            return b.accuracyBonus - a.accuracyBonus;
        });
        
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
    socket.on('frontend:start-game', (payload) => {
        if (payload && payload.name) {
            lastPlayerName = payload.name;
            
            // Record game start metrics
            metrics.recordGameStart(lastPlayerName, socket.id);
            
            logger.info('Game start requested', {
                playerName: lastPlayerName,
                socketId: socket.id,
                message: 'Starting game with LED startup animation (1-2-3-4-3-2-1)',
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
    });

    // Event: hardware:submit-score
    socket.on('hardware:submit-score', async (payload) => {
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
                    timestamp: new Date().toISOString(),
                    // Complex scoring data
                    isComplexScore: payload.isComplexScore || false,
                    baseScore: payload.baseScore || payload.score,
                    totalDuration: payload.totalDuration || 0,
                    timeBonus: payload.timeBonus || 0,
                    accuracyBonus: payload.accuracyBonus || 0,
                    avgResponseTime: payload.avgResponseTime || 0,
                    fastestTime: payload.fastestTime || 0,
                    slowestTime: payload.slowestTime || 0,
                    responseCount: payload.responseCount || 0
                };

                // Read current leaderboard
                const data = await fs.readFile('data/leaderboard.json', 'utf8');
                let leaderboard = JSON.parse(data || '[]');
                
                // Add new entry
                leaderboard.push(newEntry);
                
                // Sort by complex criteria
                leaderboard.sort((a, b) => {
                    // Primary: Final score (highest first)
                    if (b.score !== a.score) {
                        return b.score - a.score;
                    }
                    
                    // Secondary: Total duration (fastest first) 
                    if (a.totalDuration !== b.totalDuration) {
                        return a.totalDuration - b.totalDuration;
                    }
                    
                    // Tertiary: Average response time (fastest first)
                    if (a.avgResponseTime !== b.avgResponseTime) {
                        return a.avgResponseTime - b.avgResponseTime;
                    }
                    
                    // Quaternary: Time bonus (highest first)
                    if (b.timeBonus !== a.timeBonus) {
                        return b.timeBonus - a.timeBonus;
                    }
                    
                    // Final: Accuracy bonus (highest first)
                    return b.accuracyBonus - a.accuracyBonus;
                });
                
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
    });

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

// Hardware WebSocket Server (separate from Socket.IO)
let hardwareConnected = false;
let hardwareWs = null;

wsServer.on('connection', (ws, req) => {
    hardwareConnected = true;
    hardwareWs = ws;
    
    logger.info('Hardware WebSocket connected', {
        userAgent: req.headers['user-agent'],
        ip: req.socket.remoteAddress,
        type: 'hardware_websocket_connected'
    });
    
    // Send welcome message to hardware
    ws.send(JSON.stringify({
        type: 'connected',
        message: 'Hardware connected successfully'
    }));
    
    // Listen for messages from hardware
    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data.toString());
            
            logger.info('Hardware message received', {
                messageType: message.type,
                data: message.data,
                type: 'hardware_message'
            });
            
            if (message.type === 'score') {
                // Process score submission like Socket.IO handler
                if (message.data && typeof message.data.score === 'number' && lastPlayerName) {
                    try {
                        logger.info('Hardware score submission received', {
                            playerName: lastPlayerName,
                            score: message.data.score,
                            type: 'hardware_score_submission'
                        });
                        
                        // Create new entry
                        const newEntry = {
                            name: lastPlayerName,
                            score: message.data.score,
                            timestamp: new Date().toISOString(),
                            // Complex scoring data
                            isComplexScore: message.data.isComplexScore || false,
                            baseScore: message.data.baseScore || message.data.score,
                            totalDuration: message.data.totalDuration || 0,
                            timeBonus: message.data.timeBonus || 0,
                            accuracyBonus: message.data.accuracyBonus || 0,
                            avgResponseTime: message.data.avgResponseTime || 0,
                            fastestTime: message.data.fastestTime || 0,
                            slowestTime: message.data.slowestTime || 0,
                            responseCount: message.data.responseCount || 0
                        };

                        // Read current leaderboard
                        const data = await fs.readFile('data/leaderboard.json', 'utf8');
                        let leaderboard = JSON.parse(data || '[]');
                        
                        // Add new entry
                        leaderboard.push(newEntry);
                        
                        // Sort by complex criteria
                        leaderboard.sort((a, b) => {
                            // Primary: Final score (highest first)
                            if (b.score !== a.score) {
                                return b.score - a.score;
                            }
                            
                            // Secondary: Total duration (fastest first) 
                            if (a.totalDuration !== b.totalDuration) {
                                return a.totalDuration - b.totalDuration;
                            }
                            
                            // Tertiary: Average response time (fastest first)
                            if (a.avgResponseTime !== b.avgResponseTime) {
                                return a.avgResponseTime - b.avgResponseTime;
                            }
                            
                            // Quaternary: Time bonus (highest first)
                            if (b.timeBonus !== a.timeBonus) {
                                return b.timeBonus - a.timeBonus;
                            }
                            
                            // Final: Accuracy bonus (highest first)
                            return b.accuracyBonus - a.accuracyBonus;
                        });
                        
                        // Write back to file
                        await fs.writeFile('data/leaderboard.json', JSON.stringify(leaderboard, null, 2));
                        
                        // Broadcast updated leaderboard to all web clients
                        io.emit('server:leaderboard-update', leaderboard);
                        
                        logger.info('Hardware score processed successfully', {
                            playerName: lastPlayerName,
                            score: message.data.score,
                            leaderboardPosition: leaderboard.findIndex(entry => entry.name === lastPlayerName && entry.score === message.data.score) + 1,
                            totalEntries: leaderboard.length,
                            type: 'hardware_score_processed'
                        });
                        
                        // Reset player name
                        lastPlayerName = '';
                        
                    } catch (error) {
                        logger.trackError(error, {
                            context: 'hardware_score_submission',
                            playerName: lastPlayerName,
                            messageData: message.data
                        });
                    }
                } else {
                    logger.warn('Invalid hardware score submission', {
                        messageData: message.data,
                        lastPlayerName,
                        type: 'invalid_hardware_score_submission'
                    });
                }
            }
            
        } catch (error) {
            logger.error('Error parsing hardware message', {
                error: error.message,
                data: data.toString(),
                type: 'hardware_message_error'
            });
        }
    });
    
    // Handle WebSocket errors
    ws.on('error', (error) => {
        logger.error('Hardware WebSocket error', {
            error: error.message,
            type: 'hardware_websocket_error'
        });
    });
    
    // Handle WebSocket close
    ws.on('close', (code, reason) => {
        hardwareConnected = false;
        hardwareWs = null;
        
        logger.info('Hardware WebSocket disconnected', {
            code,
            reason: reason ? reason.toString() : 'No reason provided',
            type: 'hardware_websocket_disconnected'
        });
    });
});

// Listen for game triggers from frontend and forward to hardware
io.on('connection', (socket) => {
    socket.on('frontend:start-game', (payload) => {
        if (hardwareConnected && hardwareWs) {
            hardwareWs.send(JSON.stringify({
                type: 'trigger-game',
                data: {
                    ...payload,
                    startupAnimation: true,
                    animationPattern: '1-2-3-4-3-2-1'
                }
            }));
            
            logger.info('Game trigger sent to hardware', {
                playerName: payload.name,
                startupAnimation: true,
                animationPattern: '1-2-3-4-3-2-1',
                type: 'game_trigger_forwarded'
            });
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