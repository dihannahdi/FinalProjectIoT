const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs').promises;
const path = require('path');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.static('public'));
app.use(express.json());

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
    } catch (error) {
        console.error('Error creating data directory:', error);
    }
}

// API Endpoint: GET /api/leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const data = await fs.readFile('data/leaderboard.json', 'utf8');
        let leaderboard = JSON.parse(data || '[]');
        
        // Sort by score (highest to lowest)
        leaderboard.sort((a, b) => b.score - a.score);
        
        res.json(leaderboard);
    } catch (error) {
        console.error('Error reading leaderboard:', error);
        res.json([]);
    }
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
    console.log('Klien terhubung:', socket.id);

    // Event: frontend:start-game
    socket.on('frontend:start-game', (payload) => {
        if (payload && payload.name) {
            lastPlayerName = payload.name;
            console.log(`Permintaan mulai dari: ${lastPlayerName}`);
            
            // Broadcast to all clients (including hardware)
            io.emit('server:trigger-game');
        }
    });

    // Event: hardware:submit-score
    socket.on('hardware:submit-score', async (payload) => {
        if (payload && typeof payload.score === 'number' && lastPlayerName) {
            console.log(`Skor diterima: ${lastPlayerName} - ${payload.score}`);
            
            try {
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
                
                // Broadcast updated leaderboard to all web clients
                io.emit('server:leaderboard-update', leaderboard);
                
                // Reset player name
                lastPlayerName = '';
                
            } catch (error) {
                console.error('Error updating leaderboard:', error);
            }
        }
    });

    // Event: disconnect
    socket.on('disconnect', () => {
        console.log('Klien terputus:', socket.id);
    });
});

// Initialize and start server
async function startServer() {
    await ensureDataDirectory();
    
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
        console.log('Simon Says IoT System siap!');
    });
}

startServer(); 