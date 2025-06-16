/*
 * ESP8266 Button Interaction Diagnostic Tool
 * Tests communication endpoints to identify issues with Azure deployment
 * Run this to verify your local server is working correctly before Azure deployment
 */

const axios = require('axios');

// Test only local server - VPS removed, migrating to Azure
const TEST_SERVERS = [
    {
        name: 'Local Server',
        ip: 'localhost',
        port: 3000,
        description: 'Local development server for testing before Azure deployment'
    }
];

async function testServer(server) {
    const BASE_URL = `http://${server.ip}:${server.port}`;
    console.log(`\n🔧 Testing ${server.name}: ${BASE_URL}`);
    console.log('=' + '='.repeat(50 + server.name.length));
    
    let allTestsPassed = true;
    
    // Test 1: Server Health Check
    console.log('1️⃣  Testing server health...');
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Server is online');
        console.log(`   Status: ${response.data.status}`);
        console.log(`   Uptime: ${Math.floor(response.data.uptime)}s\n`);
    } catch (error) {
        console.log('❌ Server health check failed');
        console.log(`   Error: ${error.message}\n`);
        allTestsPassed = false;
    }
    
    // Test 2: Game Trigger Endpoint
    console.log('2️⃣  Testing game trigger endpoint...');
    try {
        const response = await axios.post(`${BASE_URL}/start-game`, {
            playerName: 'TestPlayer'
        });
        console.log('✅ Game trigger works');
        console.log(`   Response: ${response.data.message}\n`);
    } catch (error) {
        console.log('❌ Game trigger failed');
        console.log(`   Error: ${error.message}\n`);
        allTestsPassed = false;
    }
    
    // Test 3: Check Game Trigger Status
    console.log('3️⃣  Testing ESP8266 polling endpoint...');
    try {
        const response = await axios.get(`${BASE_URL}/check-game-trigger`, {
            headers: { 'device-id': 'ESP8266-Test-Device' }
        });
        console.log('✅ ESP8266 polling endpoint works');
        console.log(`   Game active: ${response.data.startGame}`);
        if (response.data.startGame) {
            console.log(`   Player: ${response.data.playerName}`);
        }
        console.log('');
    } catch (error) {
        console.log('❌ ESP8266 polling failed');
        console.log(`   Error: ${error.message}\n`);
        allTestsPassed = false;
    }
    
    // Test 4: Score Submission
    console.log('4️⃣  Testing score submission...');
    try {
        const response = await axios.post(`${BASE_URL}/submit-score`, {
            name: 'TestPlayer',
            score: 15,
            network: 'Test Network',
            deviceId: 'ESP8266-Test-Device',
            timestamp: Date.now()
        });
        console.log('✅ Score submission works');
        console.log(`   Position: #${response.data.position}`);
        console.log(`   Total players: ${response.data.totalPlayers}\n`);
    } catch (error) {
        console.log('❌ Score submission failed');
        console.log(`   Error: ${error.message}\n`);
        allTestsPassed = false;
    }
    
    // Test 5: Leaderboard Endpoint
    console.log('5️⃣  Testing leaderboard endpoint...');
    try {
        const response = await axios.get(`${BASE_URL}/api/leaderboard`);
        console.log('✅ Leaderboard endpoint works');
        console.log(`   Total entries: ${response.data.length}`);
        if (response.data.length > 0) {
            console.log(`   Top player: ${response.data[0].name} (${response.data[0].score} points)`);
        }
        console.log('');
    } catch (error) {
        console.log('❌ Leaderboard failed');
        console.log(`   Error: ${error.message}\n`);
        allTestsPassed = false;
    }
    
    // Summary
    console.log('📋 DIAGNOSTIC SUMMARY');
    console.log('=====================');
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED!');
        console.log('✅ Server communication is working perfectly');
        console.log('🔧 Issue is likely with ESP8266 hardware or WiFi');
        console.log('\n📝 NEXT STEPS:');
        console.log('1. Upload the updated ESP8266 code');
        console.log('2. Check Serial Monitor for button test results');
        console.log('3. Verify button wiring (D5=Red, D6=Green, D7=Blue, D8=Yellow)');
        console.log('4. Ensure pull-up resistors are connected');
        console.log('5. Deploy to Azure using: npm run azure-deploy');
    } else {
        console.log('❌ SOME TESTS FAILED');
        console.log('🔧 Fix local server issues first, then deploy to Azure');
        console.log('\n🚀 TO START LOCAL SERVER:');
        console.log('   npm start');
    }
}

// Run diagnostics
async function runDiagnostics() {
    console.log('🔧 ESP8266 Button Interaction Diagnostics - Azure Migration');
    console.log('===========================================================');
    console.log('🌐 VPS removed - Testing local server before Azure deployment');
    console.log('');
    
    for (const server of TEST_SERVERS) {
        await testServer(server);
    }
    
    console.log('\n🚀 AZURE DEPLOYMENT NOTES:');
    console.log('==========================');
    console.log('1. Test locally first with: npm start');
    console.log('2. Deploy to Azure with: npm run azure-deploy');
    console.log('3. Update ESP8266 code with Azure URL');
    console.log('4. Test ESP8266 connectivity with Azure endpoint');
}

runDiagnostics().catch(console.error); 