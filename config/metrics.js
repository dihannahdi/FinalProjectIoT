const logger = require('./logger');

class MetricsCollector {
    constructor() {
        this.metrics = {
            // System metrics
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                averageResponseTime: 0
            },
            
            // WebSocket metrics
            websocket: {
                totalConnections: 0,
                currentConnections: 0,
                totalDisconnections: 0,
                eventsReceived: 0,
                eventsSent: 0
            },
            
            // Game metrics
            games: {
                totalStarted: 0,
                totalCompleted: 0,
                averageScore: 0,
                highestScore: 0,
                averageGameDuration: 0
            },
            
            // Leaderboard metrics
            leaderboard: {
                totalPlayers: 0,
                totalScoresSubmitted: 0,
                lastUpdated: null
            },
            
            // System performance
            system: {
                startTime: Date.now(),
                lastSystemCheck: Date.now(),
                memoryUsage: {},
                cpuUsage: {}
            }
        };
        
        // Store for calculating averages
        this.dataStore = {
            responseTimes: [],
            scores: [],
            gameDurations: []
        };
        
        // Start periodic system monitoring
        this.startSystemMonitoring();
    }
    
    // Request metrics
    recordRequest(responseTime, success = true) {
        this.metrics.requests.total++;
        if (success) {
            this.metrics.requests.successful++;
        } else {
            this.metrics.requests.failed++;
        }
        
        this.dataStore.responseTimes.push(responseTime);
        this.metrics.requests.averageResponseTime = this.calculateAverage(this.dataStore.responseTimes);
        
        logger.debug('Request metric recorded', {
            responseTime: `${responseTime}ms`,
            success,
            totalRequests: this.metrics.requests.total,
            type: 'request_metric'
        });
    }
    
    // WebSocket metrics
    recordWebSocketConnection() {
        this.metrics.websocket.totalConnections++;
        this.metrics.websocket.currentConnections++;
        
        logger.websocketMetrics.clientConnected(
            'unknown', 
            this.metrics.websocket.currentConnections
        );
    }
    
    recordWebSocketDisconnection() {
        this.metrics.websocket.totalDisconnections++;
        this.metrics.websocket.currentConnections = Math.max(0, this.metrics.websocket.currentConnections - 1);
        
        logger.websocketMetrics.clientDisconnected(
            'unknown', 
            this.metrics.websocket.currentConnections
        );
    }
    
    recordWebSocketEvent(type = 'received') {
        if (type === 'received') {
            this.metrics.websocket.eventsReceived++;
        } else {
            this.metrics.websocket.eventsSent++;
        }
    }
    
    // Game metrics
    recordGameStart(playerName, socketId) {
        this.metrics.games.totalStarted++;
        logger.gameMetrics.gameStarted(playerName, socketId);
    }
    
    recordGameComplete(playerName, score, duration) {
        this.metrics.games.totalCompleted++;
        
        // Update score statistics
        this.dataStore.scores.push(score);
        this.metrics.games.averageScore = this.calculateAverage(this.dataStore.scores);
        this.metrics.games.highestScore = Math.max(this.metrics.games.highestScore, score);
        
        // Update duration statistics
        this.dataStore.gameDurations.push(duration);
        this.metrics.games.averageGameDuration = this.calculateAverage(this.dataStore.gameDurations);
        
        logger.gameMetrics.gameCompleted(playerName, score, duration);
    }
    
    recordScoreSubmission(playerName, score) {
        this.metrics.leaderboard.totalScoresSubmitted++;
        logger.gameMetrics.scoreSubmitted(playerName, score);
    }
    
    recordLeaderboardUpdate(totalPlayers) {
        this.metrics.leaderboard.totalPlayers = totalPlayers;
        this.metrics.leaderboard.lastUpdated = new Date().toISOString();
        logger.gameMetrics.leaderboardUpdated(totalPlayers);
    }
    
    // System monitoring
    startSystemMonitoring() {
        // Monitor system metrics every 5 minutes
        setInterval(() => {
            this.collectSystemMetrics();
        }, 5 * 60 * 1000);
        
        // Log system metrics every hour
        setInterval(() => {
            logger.systemMetrics();
            this.logMetricsSummary();
        }, 60 * 60 * 1000);
        
        // Cleanup old data every 10 minutes
        setInterval(() => {
            this.cleanupDataStore();
        }, 10 * 60 * 1000);
    }
    
    collectSystemMetrics() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        this.metrics.system.memoryUsage = {
            rss: memUsage.rss,
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external
        };
        
        this.metrics.system.cpuUsage = {
            user: cpuUsage.user,
            system: cpuUsage.system
        };
        
        this.metrics.system.lastSystemCheck = Date.now();
    }
    
    // Utility functions
    calculateAverage(array) {
        if (array.length === 0) return 0;
        const sum = array.reduce((acc, val) => acc + val, 0);
        return Math.round((sum / array.length) * 100) / 100;
    }
    
    cleanupDataStore() {
        // Keep only last 1000 entries to prevent memory leaks
        const maxEntries = 1000;
        
        if (this.dataStore.responseTimes.length > maxEntries) {
            this.dataStore.responseTimes = this.dataStore.responseTimes.slice(-maxEntries);
        }
        
        if (this.dataStore.scores.length > maxEntries) {
            this.dataStore.scores = this.dataStore.scores.slice(-maxEntries);
        }
        
        if (this.dataStore.gameDurations.length > maxEntries) {
            this.dataStore.gameDurations = this.dataStore.gameDurations.slice(-maxEntries);
        }
    }
    
    // Get formatted metrics
    getMetrics() {
        const uptime = Date.now() - this.metrics.system.startTime;
        
        return {
            ...this.metrics,
            system: {
                ...this.metrics.system,
                uptime: uptime,
                uptimeFormatted: this.formatUptime(uptime)
            },
            computed: {
                successRate: this.metrics.requests.total > 0 
                    ? Math.round((this.metrics.requests.successful / this.metrics.requests.total) * 100) 
                    : 0,
                gameCompletionRate: this.metrics.games.totalStarted > 0 
                    ? Math.round((this.metrics.games.totalCompleted / this.metrics.games.totalStarted) * 100) 
                    : 0,
                averageWebSocketEvents: Math.round((this.metrics.websocket.eventsReceived + this.metrics.websocket.eventsSent) / 2)
            }
        };
    }
    
    logMetricsSummary() {
        const metrics = this.getMetrics();
        
        logger.info('Metrics summary', {
            requests: {
                total: metrics.requests.total,
                successRate: `${metrics.computed.successRate}%`,
                averageResponseTime: `${metrics.requests.averageResponseTime}ms`
            },
            websocket: {
                currentConnections: metrics.websocket.currentConnections,
                totalEvents: metrics.websocket.eventsReceived + metrics.websocket.eventsSent
            },
            games: {
                total: metrics.games.totalStarted,
                completionRate: `${metrics.computed.gameCompletionRate}%`,
                averageScore: metrics.games.averageScore,
                highestScore: metrics.games.highestScore
            },
            system: {
                uptime: metrics.system.uptimeFormatted,
                memoryUsed: `${(metrics.system.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`
            },
            type: 'metrics_summary'
        });
    }
    
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
    
    // Reset metrics (for testing)
    reset() {
        this.metrics = {
            requests: { total: 0, successful: 0, failed: 0, averageResponseTime: 0 },
            websocket: { totalConnections: 0, currentConnections: 0, totalDisconnections: 0, eventsReceived: 0, eventsSent: 0 },
            games: { totalStarted: 0, totalCompleted: 0, averageScore: 0, highestScore: 0, averageGameDuration: 0 },
            leaderboard: { totalPlayers: 0, totalScoresSubmitted: 0, lastUpdated: null },
            system: { startTime: Date.now(), lastSystemCheck: Date.now(), memoryUsage: {}, cpuUsage: {} }
        };
        
        this.dataStore = {
            responseTimes: [],
            scores: [],
            gameDurations: []
        };
    }
}

// Create singleton instance
const metrics = new MetricsCollector();

module.exports = metrics; 