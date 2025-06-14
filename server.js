const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LEADERBOARD_FILE = './leaderboard.json';

// Game trigger state
let gameTrigger = {
    startGame: false,
    playerName: '',
    triggeredAt: null,
    deviceId: null
};

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
    
    if (gameTrigger.startGame) {
        console.log(`🎮 Game trigger sent to device: ${deviceId}`);
        console.log(`👤 Player: ${gameTrigger.playerName}`);
        
        // Send trigger data
        const triggerData = {
            startGame: true,
            playerName: gameTrigger.playerName
        };
        
        // Reset trigger after sending (single use)
        gameTrigger = {
            startGame: false,
            playerName: '',
            triggeredAt: null,
            deviceId: null
        };
        
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

// Enhanced API endpoint to submit score (with leaderboard position)
app.post('/submit-score', async (req, res) => {
    try {
        const { name, score, network, deviceId, timestamp } = req.body;

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

        // Add new score with enhanced data
        const newEntry = {
            name: name.trim(),
            score: score,
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

        // Keep only top 100 entries
        leaderboard = leaderboard.slice(0, 100);

        // Write back to file
        await writeLeaderboard(leaderboard);

        console.log(`📊 Score submitted: ${name} - Score: ${score} - Position: #${position}`);
        
        // Enhanced response with leaderboard position
        res.status(200).json({ 
            success: true,
            message: 'Score submitted successfully',
            position: position,
            totalPlayers: leaderboard.length,
            playerName: name.trim(),
            score: score
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Access leaderboard at: http://10.33.102.140:${PORT}`);
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