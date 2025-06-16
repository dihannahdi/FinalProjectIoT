#!/usr/bin/env node

/**
 * Quick Deploy Script
 * Commits and pushes changes to trigger Azure deployment
 */

const { exec } = require('child_process');
const fs = require('fs').promises;

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

async function runCommand(command, description) {
    log(`\n🔄 ${description}...`, colors.blue);
    
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                log(`❌ ${description} failed:`, colors.red);
                log(error.message, colors.red);
                reject(error);
                return;
            }
            
            if (stderr && !stderr.includes('warning')) {
                log(`⚠️  ${description} warning:`, colors.yellow);
                log(stderr, colors.yellow);
            }
            
            if (stdout.trim()) {
                log(`✅ ${description} completed:`, colors.green);
                log(stdout.trim(), colors.reset);
            } else {
                log(`✅ ${description} completed`, colors.green);
            }
            
            resolve(stdout);
        });
    });
}

async function quickDeploy() {
    try {
        log(`${colors.bold}🚀 Quick Deploy to Azure${colors.reset}`, colors.blue);
        log('='.repeat(40), colors.blue);
        
        // Check git status
        await runCommand('git status --porcelain', 'Checking git status');
        
        // Add all changes
        await runCommand('git add .', 'Adding changes to git');
        
        // Create commit with timestamp
        const timestamp = new Date().toISOString();
        const commitMessage = `Quick deploy: favicon fix and improvements (${timestamp})`;
        await runCommand(`git commit -m "${commitMessage}"`, 'Creating commit');
        
        // Push to main branch (triggers Azure deployment)
        await runCommand('git push origin main', 'Pushing to GitHub (triggers Azure deployment)');
        
        log('\n🎉 Deployment triggered successfully!', colors.green);
        log('📝 Next steps:', colors.blue);
        log('   1. Check GitHub Actions for deployment status', colors.blue);
        log('   2. Wait 3-5 minutes for Azure deployment', colors.blue);
        log('   3. Test the app: https://simon-says-exhqaycwc6c0hveg.canadacentral-01.azurewebsites.net/', colors.blue);
        log('   4. Run: npm run test:azure', colors.blue);
        
    } catch (error) {
        log('\n❌ Deployment failed!', colors.red);
        log('Please check the error above and try again.', colors.yellow);
        process.exit(1);
    }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Usage: node scripts/quick-deploy.js

This script will:
  1. Add all changes to git
  2. Create a commit with timestamp
  3. Push to main branch (triggers Azure deployment)

Options:
  --help, -h    Show this help message

Examples:
  node scripts/quick-deploy.js
  npm run deploy
`);
    process.exit(0);
}

quickDeploy(); 