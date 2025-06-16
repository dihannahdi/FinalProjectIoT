#!/usr/bin/env node

/**
 * Pre-start setup script for Azure deployment
 * Ensures all required directories and files exist
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Running pre-start setup...');

// Required directories
const directories = [
    'data',
    'logs',
    'public'
];

// Required files with default content
const files = {
    'data/leaderboard.json': '[]',
    'logs/.gitkeep': ''
};

// Create directories
directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    } else {
        console.log(`📁 Directory exists: ${dir}`);
    }
});

// Create files
Object.entries(files).forEach(([filepath, content]) => {
    if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, content);
        console.log(`✅ Created file: ${filepath}`);
    } else {
        console.log(`📄 File exists: ${filepath}`);
    }
});

// Verify critical files exist
const criticalFiles = [
    'index.js',
    'web.config',
    'public/index.html',
    'public/script.js',
    'public/style.css'
];

let allCriticalFilesExist = true;
criticalFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        console.error(`❌ Critical file missing: ${file}`);
        allCriticalFilesExist = false;
    } else {
        console.log(`✅ Critical file verified: ${file}`);
    }
});

if (!allCriticalFilesExist) {
    console.error('❌ Setup failed: Critical files missing');
    process.exit(1);
}

// Environment validation
const requiredEnvVars = {
    'NODE_ENV': process.env.NODE_ENV || 'production',
    'PORT': process.env.PORT || process.env.WEBSITES_PORT || '3000'
};

console.log('\n🔧 Environment Configuration:');
Object.entries(requiredEnvVars).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
});

console.log('\n✅ Setup completed successfully!');
console.log('🎮 Simon Says IoT system ready for deployment\n'); 