#!/usr/bin/env node

/**
 * Deployment Testing Script
 * Tests local deployment readiness and Azure connectivity
 */

const http = require('http');
const https = require('https');
const fs = require('fs').promises;
const path = require('path');

const config = {
    local: {
        host: 'localhost',
        port: process.env.PORT || 3000
    },
    azure: {
        appName: process.env.AZURE_APP_NAME || 'simon-says',
        domain: process.env.AZURE_DOMAIN || '-exhqaycwc6c0hveg.canadacentral-01.azurewebsites.net'
    }
};

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

// Test local server
async function testLocalServer() {
    log('\n🔍 Testing Local Server...', colors.blue);
    
    return new Promise((resolve) => {
        const req = http.get(`http://${config.local.host}:${config.local.port}/health`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    log('✅ Local server is running and healthy', colors.green);
                    try {
                        const healthData = JSON.parse(data);
                        log(`   Status: ${healthData.status}`, colors.green);
                        log(`   Uptime: ${Math.floor(healthData.uptime)}s`, colors.green);
                        log(`   Memory: ${healthData.memory.used}MB used`, colors.green);
                    } catch (e) {
                        log('   Health data received but could not parse JSON', colors.yellow);
                    }
                } else {
                    log(`❌ Local server responded with status ${res.statusCode}`, colors.red);
                }
                resolve(res.statusCode === 200);
            });
        });
        
        req.on('error', (error) => {
            log(`❌ Local server connection failed: ${error.message}`, colors.red);
            log('   Make sure to run: node index.js', colors.yellow);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            log('❌ Local server timeout', colors.red);
            req.destroy();
            resolve(false);
        });
    });
}

// Test Azure deployment
async function testAzureDeployment() {
    log('\n🌐 Testing Azure Deployment...', colors.blue);
    
    const azureUrl = `https://${config.azure.appName}${config.azure.domain}`;
    
    return new Promise((resolve) => {
        const req = https.get(`${azureUrl}/health`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    log('✅ Azure deployment is healthy', colors.green);
                    try {
                        const healthData = JSON.parse(data);
                        log(`   URL: ${azureUrl}`, colors.green);
                        log(`   Status: ${healthData.status}`, colors.green);
                        log(`   Environment: ${healthData.environment}`, colors.green);
                        log(`   Uptime: ${Math.floor(healthData.uptime)}s`, colors.green);
                    } catch (e) {
                        log('   Health data received but could not parse JSON', colors.yellow);
                    }
                } else {
                    log(`❌ Azure deployment responded with status ${res.statusCode}`, colors.red);
                    if (res.statusCode === 404) {
                        log('   This usually means:', colors.yellow);
                        log('   • Deployment is still in progress', colors.yellow);
                        log('   • App Service is not configured correctly', colors.yellow);
                        log('   • Environment variables are missing', colors.yellow);
                    }
                }
                resolve(res.statusCode === 200);
            });
        });
        
        req.on('error', (error) => {
            log(`❌ Azure deployment connection failed: ${error.message}`, colors.red);
            log(`   URL tested: ${azureUrl}/health`, colors.yellow);
            if (error.code === 'ENOTFOUND') {
                log('   • Check if AZURE_APP_NAME is correct', colors.yellow);
                log('   • Verify the app exists in Azure portal', colors.yellow);
            }
            resolve(false);
        });
        
        req.setTimeout(10000, () => {
            log('❌ Azure deployment timeout', colors.red);
            req.destroy();
            resolve(false);
        });
    });
}

// Check deployment files
async function checkDeploymentFiles() {
    log('\n📁 Checking Deployment Files...', colors.blue);
    
    const requiredFiles = [
        'package.json',
        'index.js',
        'Dockerfile',
        '.github/workflows/main.yml',
        'config/production.js'
    ];
    
    const requiredDirs = [
        'public',
        'data',
        'logs',
        'middleware',
        'config'
    ];
    
    let allGood = true;
    
    for (const file of requiredFiles) {
        try {
            await fs.access(file);
            log(`✅ ${file}`, colors.green);
        } catch {
            log(`❌ Missing: ${file}`, colors.red);
            allGood = false;
        }
    }
    
    for (const dir of requiredDirs) {
        try {
            const stat = await fs.stat(dir);
            if (stat.isDirectory()) {
                log(`✅ ${dir}/`, colors.green);
            } else {
                log(`❌ ${dir} is not a directory`, colors.red);
                allGood = false;
            }
        } catch {
            log(`❌ Missing directory: ${dir}/`, colors.red);
            allGood = false;
        }
    }
    
    return allGood;
}

// Check environment variables
function checkEnvironmentVariables() {
    log('\n🔧 Checking Environment Variables...', colors.blue);
    
    const requiredVars = [
        'NODE_ENV',
        'PORT'
    ];
    
    const optionalVars = [
        'AZURE_APP_NAME',
        'LOG_LEVEL'
    ];
    
    let allGood = true;
    
    for (const varName of requiredVars) {
        if (process.env[varName]) {
            log(`✅ ${varName}: ${process.env[varName]}`, colors.green);
        } else {
            log(`❌ Missing: ${varName}`, colors.red);
            allGood = false;
        }
    }
    
    for (const varName of optionalVars) {
        if (process.env[varName]) {
            log(`✅ ${varName}: ${process.env[varName]}`, colors.green);
        } else {
            log(`⚠️  Optional: ${varName} (not set)`, colors.yellow);
        }
    }
    
    return allGood;
}

// Main test function
async function runTests() {
    log(`${colors.bold}🚀 Simon Says IoT - Deployment Test Suite${colors.reset}`, colors.blue);
    log('='.repeat(50), colors.blue);
    
    // Check deployment readiness
    const filesOk = await checkDeploymentFiles();
    const envOk = checkEnvironmentVariables();
    
    // Test servers
    const localOk = await testLocalServer();
    const azureOk = await testAzureDeployment();
    
    // Summary
    log('\n📊 Test Summary:', colors.bold);
    log('='.repeat(30), colors.blue);
    log(`Files & Directories: ${filesOk ? '✅' : '❌'}`, filesOk ? colors.green : colors.red);
    log(`Environment Variables: ${envOk ? '✅' : '❌'}`, envOk ? colors.green : colors.red);
    log(`Local Server: ${localOk ? '✅' : '❌'}`, localOk ? colors.green : colors.red);
    log(`Azure Deployment: ${azureOk ? '✅' : '❌'}`, azureOk ? colors.green : colors.red);
    
    if (filesOk && envOk && localOk && azureOk) {
        log('\n🎉 All tests passed! Deployment is ready.', colors.green);
        process.exit(0);
    } else {
        log('\n⚠️  Some tests failed. Check the issues above.', colors.yellow);
        
        if (!localOk) {
            log('\n💡 To start local server: node index.js', colors.blue);
        }
        
        if (!azureOk) {
            log('\n💡 Azure deployment troubleshooting:', colors.blue);
            log('   1. Check Azure portal for deployment status', colors.blue);
            log('   2. Verify environment variables in App Service', colors.blue);
            log('   3. Check GitHub Actions workflow logs', colors.blue);
            log('   4. Wait for deployment to complete (can take 5+ minutes)', colors.blue);
        }
        
        process.exit(1);
    }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Usage: node scripts/test-deployment.js [options]

Options:
  --help, -h    Show this help message
  --local       Test only local server
  --azure       Test only Azure deployment
  --files       Check only deployment files
  --env         Check only environment variables

Environment Variables:
  NODE_ENV      Environment (development/production)
  PORT          Server port (default: 3000)
  AZURE_APP_NAME App name for Azure testing (default: simon-says-iot)
  LOG_LEVEL     Logging level (optional)

Examples:
  node scripts/test-deployment.js           # Run all tests
  node scripts/test-deployment.js --local   # Test local server only
  node scripts/test-deployment.js --azure   # Test Azure deployment only
`);
    process.exit(0);
}

// Run specific tests based on arguments
if (process.argv.includes('--local')) {
    testLocalServer().then(() => process.exit(0));
} else if (process.argv.includes('--azure')) {
    testAzureDeployment().then(() => process.exit(0));
} else if (process.argv.includes('--files')) {
    checkDeploymentFiles().then(() => process.exit(0));
} else if (process.argv.includes('--env')) {
    checkEnvironmentVariables();
    process.exit(0);
} else {
    runTests();
} 