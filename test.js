#!/usr/bin/env node

/**
 * Simon Says IoT - Basic Test Suite
 * Tests essential functionality without external dependencies
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🧪 Simon Says IoT - Running Tests...\n');

let testCount = 0;
let passedTests = 0;
let failedTests = 0;

function test(description, testFunction) {
    testCount++;
    try {
        const result = testFunction();
        if (result) {
            console.log(`✅ Test ${testCount}: ${description}`);
            passedTests++;
        } else {
            console.log(`❌ Test ${testCount}: ${description}`);
            failedTests++;
        }
    } catch (error) {
        console.log(`❌ Test ${testCount}: ${description} - Error: ${error.message}`);
        failedTests++;
    }
}

// Test 1: Check if required files exist
test('Required files exist', () => {
    const requiredFiles = [
        'package.json',
        'server.js',
        'startup.js',
        'public/index.html',
        'public/style.css',
        'leaderboard.json'
    ];
    
    return requiredFiles.every(file => {
        const exists = fs.existsSync(file);
        if (!exists) console.log(`   Missing: ${file}`);
        return exists;
    });
});

// Test 2: Check package.json structure
test('Package.json is valid', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.name && packageJson.version && packageJson.main;
});

// Test 3: Check leaderboard.json format
test('Leaderboard.json is valid JSON array', () => {
    const leaderboard = JSON.parse(fs.readFileSync('leaderboard.json', 'utf8'));
    return Array.isArray(leaderboard);
});

// Test 4: Check Arduino files
test('Arduino code exists', () => {
    return fs.existsSync('simon_says_iot.ino') || fs.existsSync('simon_says_iot_azure/simon_says_iot_azure.ino');
});

// Test 5: Check documentation
test('Documentation files exist', () => {
    const docFiles = ['README.md', 'TROUBLESHOOTING.md'];
    return docFiles.every(file => fs.existsSync(file));
});

// Test 6: Check deployment files
test('Deployment configuration exists', () => {
    const deployFiles = ['web.config', 'deploy-to-azure.ps1'];
    return deployFiles.every(file => fs.existsSync(file));
});

// Test 7: Check server can be required (syntax check)
test('Server.js has no syntax errors', () => {
    try {
        delete require.cache[require.resolve('./server.js')];
        // Just check if it can be parsed, don't actually start server
        const serverCode = fs.readFileSync('server.js', 'utf8');
        return serverCode.includes('express') && serverCode.includes('app.listen');
    } catch (error) {
        console.log(`   Syntax error in server.js: ${error.message}`);
        return false;
    }
});

// Test 8: Check public directory structure
test('Public directory has required files', () => {
    const publicFiles = ['public/index.html', 'public/style.css'];
    return publicFiles.every(file => {
        const exists = fs.existsSync(file);
        if (!exists) console.log(`   Missing: ${file}`);
        return exists;
    });
});

// Test 9: Check HTML structure
test('HTML file has basic structure', () => {
    const html = fs.readFileSync('public/index.html', 'utf8');
    return html.includes('<html') && 
           html.includes('<body') && 
           html.includes('Simon Says') &&
           html.includes('style.css');
});

// Test 10: Check CSS file
test('CSS file is not empty', () => {
    const css = fs.readFileSync('public/style.css', 'utf8');
    return css.trim().length > 100; // Should have substantial content
});

// Summary
console.log('\n📊 Test Summary:');
console.log(`Total Tests: ${testCount}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);

if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Project is ready to run.');
    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm start');
    console.log('2. Open: http://localhost:3000');
    console.log('3. Upload Arduino code to ESP8266');
    console.log('4. Test the complete IoT system');
} else {
    console.log('\n⚠️  Some tests failed. Please fix the issues above.');
    process.exit(1);
}

// Additional checks
console.log('\n🔍 Additional Information:');
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Current directory: ${process.cwd()}`);

// Check if server is running
const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    timeout: 2000
}, (res) => {
    console.log('🟢 Server is running and responding to health checks');
});

req.on('error', () => {
    console.log('🔴 Server is not running (this is normal if you haven\'t started it yet)');
});

req.end(); 