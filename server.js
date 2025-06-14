const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LEADERBOARD_FILE = './leaderboard.json';

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

// API endpoint to submit score
app.post('/submit-score', async (req, res) => {
    try {
        const { name, score } = req.body;

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

        // Add new score
        const newEntry = {
            name: name.trim(),
            score: score,
            timestamp: new Date().toISOString()
        };
        
        leaderboard.push(newEntry);

        // Sort by score (highest first)
        leaderboard.sort((a, b) => b.score - a.score);

        // Keep only top 50 entries to prevent file from growing too large
        leaderboard = leaderboard.slice(0, 50);

        // Write back to file
        await writeLeaderboard(leaderboard);

        console.log(`New score submitted: ${name} - ${score}`);
        
        res.status(200).json({ 
            message: 'Score submitted successfully',
            rank: leaderboard.findIndex(entry => 
                entry.name === newEntry.name && 
                entry.score === newEntry.score && 
                entry.timestamp === newEntry.timestamp
            ) + 1
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