// Base configuration - auto-detect environment
const BASE_URL = window.location.hostname === 'localhost' ? 
    'http://localhost:3000' : 
    window.location.origin;

// Initialize Socket.IO connection with specific configuration
const socket = io(BASE_URL, {
    transports: ['polling'],  // Use only polling to avoid WebSocket conflicts
    upgrade: false,  // Disable automatic upgrade
    rememberUpgrade: false,
    timeout: 20000,
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    maxReconnectionAttempts: 5
});

// DOM Elements
const playerNameInput = document.getElementById('playerNameInput');
const startButton = document.getElementById('startButton');
const statusMessage = document.getElementById('status');
const leaderboard = document.getElementById('leaderboard');
const connectionStatus = document.getElementById('connectionStatus');

// Audio Manager
let audioManager = null;

// State variables
let isConnected = false;
let gameInProgress = false;

// Initialize the application
function init() {
    // Check if all required DOM elements exist
    if (!playerNameInput || !startButton || !statusMessage || !leaderboard || !connectionStatus) {
        console.error('Some required DOM elements are missing:', {
            playerNameInput: !!playerNameInput,
            startButton: !!startButton,
            statusMessage: !!statusMessage,
            leaderboard: !!leaderboard,
            connectionStatus: !!connectionStatus
        });
        return;
    }
    
    // Initialize Audio Manager
    if (typeof AudioManager !== 'undefined') {
        audioManager = new AudioManager();
        console.log('🎵 Audio Manager initialized');
    } else {
        console.warn('⚠️ Audio Manager not available');
    }
    
    setupEventListeners();
    fetchInitialLeaderboard();
}

// Setup all event listeners
function setupEventListeners() {
    // Socket.IO event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('server:leaderboard-update', handleLeaderboardUpdate);
    socket.on('server:trigger-game', handleGameTriggered);
    socket.on('server:game-status', handleGameStatus);
    
    // DOM event listeners
    startButton.addEventListener('click', handleStartGame);
    startButton.addEventListener('mouseenter', () => {
        if (audioManager && !startButton.disabled) {
            audioManager.onButtonHover();
        }
    });
    
    playerNameInput.addEventListener('keypress', handleKeyPress);
    playerNameInput.addEventListener('input', handleNameInput);
    
    // Add click sound to buttons
    document.addEventListener('click', (event) => {
        if (audioManager && event.target.tagName === 'BUTTON' && !event.target.disabled) {
            audioManager.onButtonClick();
        }
    });
}

// Socket.IO Event Handlers
function handleConnect() {
    console.log('Connected to server');
    console.log('Socket ID:', socket.id);
    console.log('Transport:', socket.io.engine.transport.name);
    isConnected = true;
    updateConnectionStatus(true);
    fetchInitialLeaderboard();
    
    // Play connection sound
    if (audioManager) {
        audioManager.onConnectionChange(true);
    }
}

function handleDisconnect() {
    console.log('Disconnected from server');
    isConnected = false;
    updateConnectionStatus(false);
    showStatusMessage('❌ Koneksi terputus! Mencoba menghubungkan kembali...', 'error');
    
    // Play disconnection sound
    if (audioManager) {
        audioManager.onConnectionChange(false);
    }
}

function handleLeaderboardUpdate(data) {
    console.log('Leaderboard updated:', data);
    renderLeaderboard(data);
    
    // Re-enable the start button and clear status if game was in progress
    if (gameInProgress) {
        gameInProgress = false;
        startButton.disabled = false;
        showStatusMessage('✅ Permainan selesai! Papan peringkat telah diperbarui.', 'success');
        playerNameInput.value = '';
        
        // Play game completion sound and check for new record
        if (audioManager) {
            // Check if this is a new record (first position)
            const isNewRecord = data.length > 0 && data[0].timestamp === Math.max(...data.map(entry => entry.timestamp));
            if (isNewRecord) {
                audioManager.onNewRecord();
            } else {
                audioManager.onLevelComplete();
            }
            
            // Reset audio state to idle
            setTimeout(() => {
                audioManager.setGameState('idle');
            }, 1000);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            clearStatusMessage();
        }, 3000);
    }
}

function handleGameTriggered(data) {
    console.log('Game triggered on server:', data);
    
    if (audioManager) {
        audioManager.onGameInProgress();
        showStatusMessage('🎮 Game telah dimulai! Hardware menjalankan sequence...', 'active');
    }
}

function handleGameStatus(data) {
    console.log('Game status update:', data);
    
    if (audioManager && data.status) {
        switch (data.status) {
            case 'in_progress':
                audioManager.onGameInProgress();
                showStatusMessage(`🎯 Level ${data.currentTurn || 1} - Pemain: ${data.playerName}`, 'active');
                break;
            case 'waiting':
                audioManager.onPlayerTurn();
                showStatusMessage('⏳ Menunggu input pemain...', 'active');
                break;
            case 'completed':
                audioManager.onLevelComplete();
                break;
            case 'error':
                audioManager.onWrongInput();
                showStatusMessage('❌ Terjadi error dalam permainan', 'error');
                break;
        }
    }
}

// Game Control Functions
function handleStartGame() {
    const playerName = playerNameInput.value.trim();
    
    if (!isConnected) {
        showStatusMessage('❌ Tidak terhubung ke server!', 'error');
        return;
    }
    
    if (!playerName) {
        showStatusMessage('⚠️ Masukkan nama pemain terlebih dahulu!', 'error');
        playerNameInput.focus();
        return;
    }
    
    // More flexible validation: allow 1-30 characters, support spaces, numbers, basic symbols
    if (playerName.length > 30) {
        showStatusMessage('⚠️ Nama pemain maksimal 30 karakter!', 'error');
        playerNameInput.focus();
        return;
    }
    
    // Allow letters, numbers, spaces, and common symbols
    const validNamePattern = /^[a-zA-Z0-9\s\-_.]+$/;
    if (!validNamePattern.test(playerName)) {
        showStatusMessage('⚠️ Nama hanya boleh berisi huruf, angka, spasi, dan simbol (-_.)', 'error');
        playerNameInput.focus();
        return;
    }
    
    // Disable button and show status
    startButton.disabled = true;
    gameInProgress = true;
    
    // Send start game event
    socket.emit('frontend:start-game', { name: playerName });
    
    // Play game start sound and set audio state
    if (audioManager) {
        audioManager.onGameStart();
    }
    
    showStatusMessage('🎊 Memulai animasi startup... Skor akan dihitung berdasarkan level, kecepatan, dan akurasi!', 'active');
    
    console.log(`Starting game for player: ${playerName}`);
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        handleStartGame();
    }
}

function handleNameInput(event) {
    clearStatusMessage();
    
    // Enable/disable start button based on input
    const playerName = event.target.value.trim();
    const isValidLength = playerName.length >= 1 && playerName.length <= 30;
    startButton.disabled = gameInProgress || !playerName || !isConnected || !isValidLength;
}

// Leaderboard Functions
async function fetchInitialLeaderboard() {
    try {
        const response = await fetch(`${BASE_URL}/api/leaderboard`);
        const result = await response.json();
        
        // Handle successful response
        if (result.success && result.data) {
            renderLeaderboard(result.data);
        } else {
            console.warn('Leaderboard API returned unsuccessful response:', result);
            showEmptyLeaderboard();
        }
    } catch (error) {
        console.error('Error fetching initial leaderboard:', error);
        showEmptyLeaderboard();
    }
}

function renderLeaderboard(data) {
    // Ensure data is an array
    if (!Array.isArray(data) || data.length === 0) {
        showEmptyLeaderboard();
        return;
    }
    
    console.log('🔍 Debug: Leaderboard data received:', data);
    
    // Create table HTML with enhanced columns for complex scoring
    let tableHTML = `
        <div class="leaderboard-header">
            <h3>🏆 Papan Peringkat</h3>
            <div class="score-legend">
                <span class="legend-item"><span class="badge complex">🎯</span> Skor Kompleks</span>
                <span class="legend-item"><span class="badge simple">⚪</span> Skor Sederhana</span>
            </div>
        </div>
        <div class="table-container">
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th class="rank-col">Peringkat</th>
                        <th class="name-col">Pemain</th>
                        <th class="score-col">Final Score</th>
                        <th class="level-col">Level</th>
                        <th class="bonus-col">Bonus</th>
                        <th class="duration-col">Durasi</th>
                        <th class="response-col">Avg Response</th>
                        <th class="time-col">Waktu</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    data.forEach((entry, index) => {
        const rank = index + 1;
        const rankClass = getRankClass(rank);
        const rankIcon = getRankIcon(rank);
        const rankMedal = getRankMedal(rank);
        const formattedDate = formatTimestamp(entry.timestamp);
        
        // Debug log each entry
        console.log(`📊 Entry ${rank}:`, {
            name: entry.name,
            score: entry.score,
            isComplexScore: entry.isComplexScore,
            baseScore: entry.baseScore,
            timeBonus: entry.timeBonus,
            accuracyBonus: entry.accuracyBonus,
            totalDuration: entry.totalDuration,
            avgResponseTime: entry.avgResponseTime
        });
        
        // Format complex scoring data with better fallbacks
        const isComplex = entry.isComplexScore === true;
        const baseScore = entry.baseScore || entry.score || 0;
        const timeBonus = entry.timeBonus || 0;
        const accuracyBonus = entry.accuracyBonus || 0;
        const totalBonus = timeBonus + accuracyBonus;
        
        // Better handling of duration and response time
        const duration = (entry.totalDuration && entry.totalDuration > 0) ? 
            formatDuration(entry.totalDuration) : 
            (isComplex ? 'N/A' : '-');
            
        const avgResponse = (entry.avgResponseTime && entry.avgResponseTime > 0) ? 
            `${entry.avgResponseTime}ms` : 
            (isComplex ? 'N/A' : '-');
        
        // Add complexity indicator with better styling
        const complexityBadge = isComplex ? 
            '<span class="complexity-badge complex" title="Sistem Skor Kompleks">🎯</span>' : 
            '<span class="complexity-badge simple" title="Skor Sederhana">⚪</span>';
        
        // Better bonus display
        const bonusDisplay = isComplex ? 
            (totalBonus > 0 ? `+${totalBonus}` : '0') : 
            '-';
        
        const bonusTooltip = isComplex ? 
            `Time Bonus: +${timeBonus}, Accuracy Bonus: +${accuracyBonus}` : 
            'Skor sederhana tidak memiliki bonus';
        
        tableHTML += `
            <tr class="${isComplex ? 'complex-score' : 'simple-score'} rank-${rank}">
                <td class="rank ${rankClass}">
                    <div class="rank-content">
                        <span class="rank-icon">${rankIcon}</span>
                        <span class="rank-number">${rank}</span>
                        <span class="rank-medal">${rankMedal}</span>
                    </div>
                </td>
                <td class="name">
                    <div class="player-info">
                        <span class="player-name">${escapeHtml(entry.name)}</span>
                        ${complexityBadge}
                    </div>
                </td>
                <td class="score final-score">
                    <div class="score-display">
                        <strong>${entry.score.toLocaleString()}</strong>
                    </div>
                </td>
                <td class="base-score">
                    <span class="level-badge">${baseScore}</span>
                </td>
                <td class="bonus" title="${bonusTooltip}">
                    <span class="bonus-value ${totalBonus > 0 ? 'has-bonus' : 'no-bonus'}">${bonusDisplay}</span>
                </td>
                <td class="duration">
                    <span class="duration-value">${duration}</span>
                </td>
                <td class="response-time">
                    <span class="response-value">${avgResponse}</span>
                </td>
                <td class="timestamp">
                    <span class="time-value">${formattedDate}</span>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
        <div class="leaderboard-footer">
            <div class="stats-info">
                <span class="total-players">Total Pemain: ${data.length}</span>
                <span class="complex-count">Skor Kompleks: ${data.filter(e => e.isComplexScore).length}</span>
            </div>
        </div>
    `;
    
    leaderboard.innerHTML = tableHTML;
}

function showEmptyLeaderboard() {
    leaderboard.innerHTML = `
        <div class="empty-leaderboard">
            <div class="empty-icon">🏆</div>
            <h3>Belum Ada Skor</h3>
            <p>Jadilah yang pertama bermain Simon Says!</p>
        </div>
    `;
}

// Helper Functions
function getRankClass(rank) {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
}

function getRankIcon(rank) {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 5) return '⭐';
    if (rank <= 10) return '🏅';
    return '🎯';
}

function getRankMedal(rank) {
    if (rank === 1) return 'JUARA';
    if (rank === 2) return 'RUNNER UP';
    if (rank === 3) return 'THIRD PLACE';
    if (rank <= 5) return 'TOP 5';
    if (rank <= 10) return 'TOP 10';
    return '';
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    } else {
        return `${remainingSeconds}s`;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateConnectionStatus(connected) {
    if (connected) {
        connectionStatus.textContent = '🟢 Terhubung';
        connectionStatus.className = 'connection-status connected';
    } else {
        connectionStatus.textContent = '🔴 Terputus';
        connectionStatus.className = 'connection-status disconnected';
    }
    
    // Update start button state
    const playerName = playerNameInput.value.trim();
    startButton.disabled = gameInProgress || !playerName || !connected;
}

function showStatusMessage(message, type = 'active') {
    if (statusMessage) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'flex';
    } else {
        console.warn('Status message element not found');
    }
}

function clearStatusMessage() {
    if (statusMessage) {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
        statusMessage.style.display = 'none';
    } else {
        console.warn('Status message element not found');
    }
}

// Add additional Socket.IO event listeners for debugging
socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    showStatusMessage('❌ Gagal terhubung ke server!', 'error');
});

socket.on('disconnect', (reason) => {
    console.log('Disconnect reason:', reason);
});

socket.io.on('error', (error) => {
    console.error('Socket.IO error:', error);
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 