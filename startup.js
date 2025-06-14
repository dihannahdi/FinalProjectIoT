#!/usr/bin/env node

/**
 * Simon Says IoT - Production Startup Script
 * Ensures optimal performance and handles edge cases
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Simon Says IoT - Starting Production Server...');

// Ensure leaderboard.json exists
const leaderboardFile = './leaderboard.json';
if (!fs.existsSync(leaderboardFile)) {
    console.log('📄 Creating leaderboard.json file...');
    fs.writeFileSync(leaderboardFile, '[]', 'utf8');
    console.log('✅ leaderboard.json created successfully');
}

// Verify file permissions
try {
    fs.accessSync(leaderboardFile, fs.constants.R_OK | fs.constants.W_OK);
    console.log('✅ File permissions verified');
} catch (err) {
    console.error('❌ File permission error:', err.message);
    process.exit(1);
}

// Check required directories
const publicDir = './public';
if (!fs.existsSync(publicDir)) {
    console.error('❌ Public directory not found!');
    process.exit(1);
}

const requiredFiles = ['./public/index.html', './public/style.css'];
for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
        console.error(`❌ Required file missing: ${file}`);
        process.exit(1);
    }
}

// Check environment
const PORT = process.env.PORT || 3000;
console.log(`🌐 Server will start on port: ${PORT}`);

if (process.env.NODE_ENV === 'production') {
    console.log('🏭 Running in PRODUCTION mode');
} else {
    console.log('🔧 Running in DEVELOPMENT mode');
}

// Memory monitoring
const checkMemory = () => {
    const used = process.memoryUsage();
    const heapUsed = Math.round(used.heapUsed / 1024 / 1024 * 100) / 100;
    const heapTotal = Math.round(used.heapTotal / 1024 / 1024 * 100) / 100;
    
    if (heapUsed > 100) { // Alert if using more than 100MB
        console.warn(`⚠️  High memory usage: ${heapUsed}MB / ${heapTotal}MB`);
    }
};

// Check memory every 5 minutes
setInterval(checkMemory, 5 * 60 * 1000);

console.log('🎮 All checks passed - Starting server...');

// Start the main server
require('./server.js'); 