#!/usr/bin/env node

/**
 * Simon Says IoT - Production Startup Script
 * Ensures optimal performance and handles edge cases
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Simon Says IoT - Starting Production Server...');

// Azure environment detection
const isAzure = process.env.WEBSITE_SITE_NAME !== undefined;
const isProduction = process.env.NODE_ENV === 'production';

console.log(`☁️  Azure Environment: ${isAzure ? 'YES' : 'NO'}`);
console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);

// Configure leaderboard file path for Azure
const leaderboardFile = process.env.AZURE_STORAGE_PATH 
    ? path.join(process.env.AZURE_STORAGE_PATH, 'leaderboard.json')
    : './leaderboard.json';

console.log(`📁 Leaderboard file path: ${leaderboardFile}`);

// Ensure leaderboard.json exists
if (!fs.existsSync(leaderboardFile)) {
    console.log('📄 Creating leaderboard.json file...');
    try {
        // Ensure directory exists for Azure storage path
        const dir = path.dirname(leaderboardFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        }
        
        fs.writeFileSync(leaderboardFile, '[]', 'utf8');
        console.log('✅ leaderboard.json created successfully');
    } catch (error) {
        console.error('❌ Failed to create leaderboard.json:', error.message);
        if (isAzure) {
            console.log('🔄 Falling back to local storage in Azure temp directory');
            const fallbackFile = './leaderboard.json';
            fs.writeFileSync(fallbackFile, '[]', 'utf8');
            console.log('✅ Fallback leaderboard.json created');
        } else {
            process.exit(1);
        }
    }
}

// Verify file permissions
try {
    fs.accessSync(fs.existsSync(leaderboardFile) ? leaderboardFile : './leaderboard.json', 
                  fs.constants.R_OK | fs.constants.W_OK);
    console.log('✅ File permissions verified');
} catch (err) {
    console.warn('⚠️  File permission warning:', err.message);
    if (!isAzure) {
        process.exit(1);
    }
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