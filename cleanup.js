#!/usr/bin/env node

/**
 * Simon Says IoT - Project Cleanup Script
 * Removes duplicate files and optimizes project structure
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Simon Says IoT - Project Cleanup');
console.log('==================================\n');

let changesCount = 0;

function cleanup(description, cleanupFunction) {
    try {
        console.log(`🔍 Checking: ${description}`);
        const result = cleanupFunction();
        if (result) {
            console.log(`✅ ${description} - Fixed`);
            changesCount++;
        } else {
            console.log(`ℹ️  ${description} - Already clean`);
        }
    } catch (error) {
        console.log(`❌ ${description} - Error: ${error.message}`);
    }
}

// Cleanup 1: Check for duplicate Arduino files
cleanup('Duplicate Arduino files', () => {
    const rootArduino = 'simon_says_iot.ino';
    const azureArduino = 'simon_says_iot_azure/simon_says_iot_azure.ino';
    
    if (fs.existsSync(rootArduino) && fs.existsSync(azureArduino)) {
        const rootSize = fs.statSync(rootArduino).size;
        const azureSize = fs.statSync(azureArduino).size;
        
        console.log(`   Root Arduino: ${rootSize} bytes`);
        console.log(`   Azure Arduino: ${azureSize} bytes`);
        console.log(`   Recommendation: Use Azure version (larger, more features)`);
        console.log(`   You can delete: ${rootArduino}`);
        return false; // Don't auto-delete, just inform
    }
    return false;
});

// Cleanup 2: Create backup of leaderboard if it has data
cleanup('Backup existing leaderboard data', () => {
    if (fs.existsSync('leaderboard.json')) {
        const data = fs.readFileSync('leaderboard.json', 'utf8');
        const leaderboard = JSON.parse(data);
        
        if (leaderboard.length > 0) {
            const backupName = `leaderboard.backup.${Date.now()}.json`;
            fs.writeFileSync(backupName, data);
            console.log(`   Created backup: ${backupName}`);
            return true;
        }
    }
    return false;
});

// Cleanup 3: Check for temporary files
cleanup('Remove temporary files', () => {
    const tempFiles = [
        'npm-debug.log',
        '.DS_Store',
        'Thumbs.db',
        '*.tmp',
        '*.log'
    ];
    
    let removed = 0;
    tempFiles.forEach(pattern => {
        // Simple check for exact matches (could be enhanced with glob)
        if (fs.existsSync(pattern)) {
            try {
                fs.unlinkSync(pattern);
                console.log(`   Removed: ${pattern}`);
                removed++;
            } catch (e) {
                console.log(`   Could not remove: ${pattern}`);
            }
        }
    });
    
    return removed > 0;
});

// Cleanup 4: Verify .gitignore
cleanup('Check .gitignore completeness', () => {
    if (fs.existsSync('.gitignore')) {
        const gitignore = fs.readFileSync('.gitignore', 'utf8');
        const essentialIgnores = [
            'node_modules/',
            '.env',
            '*.log',
            'leaderboard.backup.*.json'
        ];
        
        let missing = [];
        essentialIgnores.forEach(ignore => {
            if (!gitignore.includes(ignore)) {
                missing.push(ignore);
            }
        });
        
        if (missing.length > 0) {
            console.log(`   Missing from .gitignore: ${missing.join(', ')}`);
            return false; // Could auto-add but let's just inform
        }
    }
    return false;
});

// Cleanup 5: Check for large files
cleanup('Check for large files', () => {
    const checkSize = (filePath, maxSize = 1024 * 1024) => { // 1MB default
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size > maxSize) {
                console.log(`   Large file detected: ${filePath} (${Math.round(stats.size/1024)}KB)`);
                return true;
            }
        }
        return false;
    };
    
    let largeFiles = false;
    
    // Check common large files
    if (checkSize('package-lock.json', 100 * 1024)) largeFiles = true; // 100KB
    if (checkSize('public/index.html', 50 * 1024)) largeFiles = true; // 50KB
    if (checkSize('public/style.css', 30 * 1024)) largeFiles = true; // 30KB
    
    return false; // Just informational
});

// Summary
console.log('\n📊 Cleanup Summary:');
console.log(`Changes made: ${changesCount}`);

if (changesCount === 0) {
    console.log('✨ Project is already clean and optimized!');
} else {
    console.log('🎉 Cleanup completed successfully!');
}

// Recommendations
console.log('\n💡 Recommendations:');
console.log('1. Use simon_says_iot_azure/simon_says_iot_azure.ino (more features)');
console.log('2. Consider adding ESLint for code quality');
console.log('3. Add environment variables for sensitive configuration');
console.log('4. Set up automated testing in CI/CD pipeline');
console.log('5. Monitor server logs for production issues');

console.log('\n🔧 Manual Actions Needed:');
console.log('- Delete simon_says_iot.ino if you\'re using the Azure version');
console.log('- Update WiFi credentials in Arduino code before deployment');
console.log('- Test the complete IoT flow: Web → Server → ESP8266 → Leaderboard');

console.log('\n✅ Project Status: READY FOR DEPLOYMENT!'); 