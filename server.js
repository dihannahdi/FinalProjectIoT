const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LEADERBOARD_FILE = './leaderboard.json';

// ===== SECURITY MIDDLEWARE =====
// Add CORS support for IoT devices
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, device-id');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// ===== ENHANCED GAME TRIGGER MANAGEMENT =====
let gameTrigger = {
    startGame: false,
    playerName: '',
    triggeredAt: null,
    deviceId: null
};

// ===== AUTO-RESET MECHANISM FOR FAST FLOW =====
setInterval(() => {
    if (gameTrigger.startGame && gameTrigger.triggeredAt) {
        const triggerAge = Date.now() - new Date(gameTrigger.triggeredAt).getTime();
        // Auto-reset after 45 seconds to prevent stuck triggers
        if (triggerAge > 45000) {
            console.log(`🔄 Auto-resetting stale game trigger (${Math.floor(triggerAge/1000)}s old)`);
            gameTrigger = {
                startGame: false,
                playerName: '',
                triggeredAt: null,
                deviceId: null
            };
        }
    }
}, 10000); // Check every 10 seconds

// ===== PERFORMANCE MONITORING =====
let requestCount = 0;
let lastReset = Date.now();

app.use((req, res, next) => {
    requestCount++;
    
    // Reset counter every hour
    if (Date.now() - lastReset > 3600000) {
        console.log(`📊 Performance: ${requestCount} requests in last hour`);
        requestCount = 0;
        lastReset = Date.now();
    }
    
    next();
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Helper function to read leaderboard
async function readLeaderboard() {
    try {
        const data = await fs.readFile(LEADERBOARD_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Helper function to write leaderboard
async function writeLeaderboard(data) {
    await fs.writeFile(LEADERBOARD_FILE, JSON.stringify(data, null, 2));
}

// API endpoint for ESP8266 to check game trigger
app.get('/check-game-trigger', (req, res) => {
    const deviceId = req.headers['device-id'];
    
    // DEBUG: Log all trigger checks
    console.log(`🔍 Device ${deviceId} checking for trigger - Status: ${gameTrigger.startGame ? 'ACTIVE' : 'WAITING'}`);
    
    if (gameTrigger.startGame) {
        console.log(`🎮 Game trigger sent to device: ${deviceId}`);
        console.log(`👤 Player: ${gameTrigger.playerName}`);
        
        // Send trigger data
        const triggerData = {
            startGame: true,
            playerName: gameTrigger.playerName
        };
        
        // Keep trigger active for 30 seconds or until device confirms
        const triggerAge = Date.now() - new Date(gameTrigger.triggeredAt).getTime();
        if (triggerAge > 30000) { // 30 seconds timeout
            console.log(`⏰ Trigger expired after 30 seconds, resetting`);
            gameTrigger = {
                startGame: false,
                playerName: '',
                triggeredAt: null,
                deviceId: null
            };
        } else {
            console.log(`⏱️  Trigger still active (${Math.floor(triggerAge/1000)}s old), keeping available for other polls`);
        }
        
        res.json(triggerData);
    } else {
        res.json({ startGame: false });
    }
});

// API endpoint for web interface to start game
app.post('/start-game', (req, res) => {
    try {
        const { playerName } = req.body;
        
        if (!playerName || typeof playerName !== 'string' || playerName.trim() === '') {
            return res.status(400).json({ 
                error: 'Player name is required' 
            });
        }
        
        // Set game trigger
        gameTrigger = {
            startGame: true,
            playerName: playerName.trim(),
            triggeredAt: new Date().toISOString(),
            deviceId: null
        };
        
        console.log(`🌐 Game start triggered from web for: ${playerName.trim()}`);
        
        res.json({ 
            success: true, 
            message: 'Game triggered successfully',
            playerName: playerName.trim()
        });
        
    } catch (error) {
        console.error('Error triggering game:', error);
        res.status(500).json({ 
            error: 'Internal server error while triggering game' 
        });
    }
});

// Enhanced API endpoint to submit score (with detailed analytics)
app.post('/submit-score', async (req, res) => {
    try {
        const { name, score, network, deviceId, timestamp, level, gameTime, perfectGame } = req.body;

        // Validation
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ 
                error: 'Name is required and must be a non-empty string' 
            });
        }

        if (score === undefined || typeof score !== 'number' || score < 0) {
            return res.status(400).json({ 
                error: 'Score is required and must be a non-negative number' 
            });
        }

        // Read current leaderboard
        let leaderboard = await readLeaderboard();

        // Add new score with enhanced analytics data
        const newEntry = {
            name: name.trim(),
            score: score,
            level: level || 1,
            gameTime: gameTime || 0,
            perfectGame: perfectGame || false,
            timestamp: new Date().toISOString(),
            network: network || 'Unknown',
            deviceId: deviceId || 'Unknown'
        };
        
        leaderboard.push(newEntry);

        // Sort by score (highest first)
        leaderboard.sort((a, b) => b.score - a.score);

        // Find position of this entry
        const position = leaderboard.findIndex(entry => 
            entry.name === newEntry.name && 
            entry.score === newEntry.score && 
            entry.timestamp === newEntry.timestamp
        ) + 1;

        // Calculate statistics
        const playerScores = leaderboard.filter(entry => entry.name === name.trim());
        const personalBest = Math.max(...playerScores.map(entry => entry.score));
        const averageScore = playerScores.reduce((sum, entry) => sum + entry.score, 0) / playerScores.length;
        const gamesPlayed = playerScores.length;

        // Keep only top 100 entries
        leaderboard = leaderboard.slice(0, 100);

        // Write back to file
        await writeLeaderboard(leaderboard);

        console.log(`🎮 Enhanced Score: ${name} - Score: ${score} - Level: ${level} - Time: ${gameTime}ms - Perfect: ${perfectGame} - Position: #${position}`);
        
        // Enhanced response with detailed analytics
        res.status(200).json({ 
            success: true,
            message: 'Score submitted successfully',
            position: position,
            totalPlayers: leaderboard.length,
            playerName: name.trim(),
            score: score,
            level: level,
            gameTime: gameTime,
            perfectGame: perfectGame,
            analytics: {
                personalBest: personalBest,
                averageScore: Math.round(averageScore),
                gamesPlayed: gamesPlayed,
                improvement: score >= personalBest ? 'new_record' : 'normal'
            }
        });

    } catch (error) {
        console.error('Error processing score submission:', error);
        res.status(500).json({ 
            error: 'Internal server error while processing score' 
        });
    }
});

// API endpoint to get leaderboard data
app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboard = await readLeaderboard();
        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ 
            error: 'Internal server error while fetching leaderboard' 
        });
    }
});

// API endpoint to get game status
app.get('/api/game-status', (req, res) => {
    res.json({
        isGameActive: gameTrigger.startGame,
        currentPlayer: gameTrigger.playerName,
        triggeredAt: gameTrigger.triggeredAt
    });
});

// Manual reset endpoint for testing
app.post('/reset-trigger', (req, res) => {
    console.log('🔄 Manually resetting game trigger');
    gameTrigger = {
        startGame: false,
        playerName: '',
        triggeredAt: null,
        deviceId: null
    };
    res.json({ success: true, message: 'Trigger reset successfully' });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime() 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`📱 Local access: http://localhost:${PORT}`);
    console.log(`🔗 Network access: http://0.0.0.0:${PORT}`);
    console.log(`☁️  Azure deployment ready - use 'npm run azure-deploy'`);
    console.log(`📊 Visit the dashboard to start playing!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0); 
}); 