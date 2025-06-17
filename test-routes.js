// Test script untuk memverifikasi routing
const https = require('https');

const BASE_URL = 'https://simon-says-exhqaycwc6c0hveg.canadacentral-01.azurewebsites.net';

async function testRoute(path, description) {
    return new Promise((resolve) => {
        const url = `${BASE_URL}${path}`;
        console.log(`\n🔍 Testing: ${description}`);
        console.log(`📍 URL: ${url}`);
        
        https.get(url, (res) => {
            console.log(`✅ Status: ${res.statusCode}`);
            console.log(`📋 Content-Type: ${res.headers['content-type']}`);
            
            if (res.statusCode === 200) {
                console.log(`✅ ${description} - SUCCESS`);
            } else {
                console.log(`❌ ${description} - FAILED (${res.statusCode})`);
            }
            resolve(res.statusCode);
        }).on('error', (err) => {
            console.log(`❌ ${description} - ERROR: ${err.message}`);
            resolve(null);
        });
    });
}

async function testAllRoutes() {
    console.log('🚀 Testing Simon Says IoT Routes on Azure');
    console.log('==================================================');
    
    const tests = [
        { path: '/', description: 'Main Game Page' },
        { path: '/faq', description: 'FAQ Page (clean URL)' },
        { path: '/faq.html', description: 'FAQ Page (with extension)' },
        { path: '/health', description: 'Health Check' },
        { path: '/api/leaderboard', description: 'Leaderboard API' },
        { path: '/api/metrics', description: 'Metrics API' }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
        const result = await testRoute(test.path, test.description);
        if (result === 200) passed++;
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
    }
    
    console.log('\n==================================================');
    console.log(`📊 Test Results: ${passed}/${total} routes working`);
    console.log(`🎯 Success Rate: ${Math.round((passed/total) * 100)}%`);
    
    if (passed === total) {
        console.log('🎉 All routes are working correctly!');
        console.log('✅ FAQ page is accessible at:');
        console.log(`   📱 ${BASE_URL}/faq`);
        console.log(`   📱 ${BASE_URL}/faq.html`);
    } else {
        console.log('⚠️ Some routes need attention.');
    }
}

// Run tests
testAllRoutes().catch(console.error); 