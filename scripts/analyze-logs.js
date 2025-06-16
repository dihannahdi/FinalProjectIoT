#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class LogAnalyzer {
    constructor() {
        this.logsDir = './logs';
        this.analysis = {
            summary: {},
            errors: [],
            performance: [],
            websocket: {},
            requests: {},
            games: {},
            alerts: []
        };
    }

    async analyzeLogs(date = null) {
        try {
            const targetDate = date || new Date().toISOString().split('T')[0];
            const logFiles = await this.getLogFiles(targetDate);
            
            console.log(`🔍 Analyzing logs for ${targetDate}...`);
            console.log(`📁 Found ${logFiles.length} log files`);
            
            for (const logFile of logFiles) {
                await this.processLogFile(logFile);
            }
            
            this.generateReport();
            
        } catch (error) {
            console.error('Error analyzing logs:', error);
        }
    }

    async getLogFiles(date) {
        const files = await fs.readdir(this.logsDir);
        return files.filter(file => 
            file.includes(date) && 
            (file.endsWith('.log') || file.includes('app-') || file.includes('error-'))
        );
    }

    async processLogFile(filename) {
        const filePath = path.join(this.logsDir, filename);
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        console.log(`📄 Processing ${filename} (${lines.length} entries)`);
        
        for (const line of lines) {
            try {
                const entry = JSON.parse(line);
                this.processLogEntry(entry);
            } catch (error) {
                // Skip invalid JSON lines
            }
        }
    }

    processLogEntry(entry) {
        const type = entry.type || 'unknown';
        
        // Initialize counters
        if (!this.analysis.summary[type]) {
            this.analysis.summary[type] = 0;
        }
        this.analysis.summary[type]++;
        
        // Process different types of log entries
        switch (type) {
            case 'error_tracking':
                this.analysis.errors.push({
                    timestamp: entry.timestamp,
                    message: entry.error?.message,
                    context: entry.context
                });
                break;
                
            case 'performance':
                this.analysis.performance.push({
                    timestamp: entry.timestamp,
                    label: entry.label,
                    duration: parseFloat(entry.duration)
                });
                break;
                
            case 'http_request':
                if (!this.analysis.requests.total) {
                    this.analysis.requests = { total: 0, successful: 0, failed: 0, avgResponseTime: 0 };
                }
                this.analysis.requests.total++;
                if (entry.success) {
                    this.analysis.requests.successful++;
                } else {
                    this.analysis.requests.failed++;
                }
                break;
                
            case 'websocket_connected':
            case 'websocket_disconnected':
                if (!this.analysis.websocket.connections) {
                    this.analysis.websocket.connections = [];
                }
                this.analysis.websocket.connections.push({
                    type: type.replace('websocket_', ''),
                    timestamp: entry.timestamp,
                    socketId: entry.socketId
                });
                break;
                
            case 'game_started':
            case 'game_completed':
            case 'score_submitted':
                if (!this.analysis.games[type]) {
                    this.analysis.games[type] = 0;
                }
                this.analysis.games[type]++;
                break;
                
            case 'memory_alert':
            case 'heap_usage_alert':
                this.analysis.alerts.push({
                    type,
                    timestamp: entry.timestamp,
                    details: entry
                });
                break;
        }
    }

    generateReport() {
        console.log('\n📊 LOG ANALYSIS REPORT');
        console.log('=' .repeat(50));
        
        // Summary
        console.log('\n📈 SUMMARY:');
        Object.entries(this.analysis.summary)
            .sort((a, b) => b[1] - a[1])
            .forEach(([type, count]) => {
                console.log(`  ${type}: ${count} entries`);
            });
        
        // Errors
        if (this.analysis.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            console.log(`  Total errors: ${this.analysis.errors.length}`);
            
            // Group errors by message
            const errorGroups = {};
            this.analysis.errors.forEach(error => {
                const key = error.message || 'Unknown error';
                errorGroups[key] = (errorGroups[key] || 0) + 1;
            });
            
            Object.entries(errorGroups)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .forEach(([message, count]) => {
                    console.log(`    ${message}: ${count} times`);
                });
        }
        
        // Performance
        if (this.analysis.performance.length > 0) {
            console.log('\n⚡ PERFORMANCE:');
            
            const perfGroups = {};
            this.analysis.performance.forEach(perf => {
                if (!perfGroups[perf.label]) {
                    perfGroups[perf.label] = [];
                }
                perfGroups[perf.label].push(perf.duration);
            });
            
            Object.entries(perfGroups).forEach(([label, durations]) => {
                const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
                const max = Math.max(...durations);
                console.log(`    ${label}: avg ${avg.toFixed(2)}ms, max ${max.toFixed(2)}ms (${durations.length} samples)`);
            });
        }
        
        // Requests
        if (this.analysis.requests.total) {
            console.log('\n🌐 HTTP REQUESTS:');
            const successRate = (this.analysis.requests.successful / this.analysis.requests.total * 100).toFixed(2);
            console.log(`    Total: ${this.analysis.requests.total}`);
            console.log(`    Successful: ${this.analysis.requests.successful} (${successRate}%)`);
            console.log(`    Failed: ${this.analysis.requests.failed}`);
        }
        
        // WebSocket
        if (this.analysis.websocket.connections?.length > 0) {
            console.log('\n🔌 WEBSOCKET CONNECTIONS:');
            const connections = this.analysis.websocket.connections.filter(c => c.type === 'connected').length;
            const disconnections = this.analysis.websocket.connections.filter(c => c.type === 'disconnected').length;
            console.log(`    Connections: ${connections}`);
            console.log(`    Disconnections: ${disconnections}`);
        }
        
        // Games
        if (Object.keys(this.analysis.games).length > 0) {
            console.log('\n🎮 GAME STATISTICS:');
            Object.entries(this.analysis.games).forEach(([type, count]) => {
                console.log(`    ${type.replace('_', ' ')}: ${count}`);
            });
        }
        
        // Alerts
        if (this.analysis.alerts.length > 0) {
            console.log('\n🚨 ALERTS:');
            this.analysis.alerts.forEach(alert => {
                console.log(`    ${alert.type} at ${alert.timestamp}`);
            });
        }
        
        console.log('\n✅ Analysis complete!');
    }

    async exportReport(filename) {
        const reportData = {
            generatedAt: new Date().toISOString(),
            analysis: this.analysis
        };
        
        await fs.writeFile(filename, JSON.stringify(reportData, null, 2));
        console.log(`📄 Report exported to ${filename}`);
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const date = args[0]; // Optional date parameter
    
    const analyzer = new LogAnalyzer();
    
    analyzer.analyzeLogs(date).then(() => {
        if (args.includes('--export')) {
            const filename = `log-analysis-${date || new Date().toISOString().split('T')[0]}.json`;
            return analyzer.exportReport(filename);
        }
    }).catch(console.error);
}

module.exports = LogAnalyzer; 