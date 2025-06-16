// Initialize Socket.IO connection
const socket = io();

// DOM Elements
const playerNameInput = document.getElementById('playerNameInput');
const startButton = document.getElementById('startButton');
const statusMessage = document.getElementById('statusMessage');
const leaderboard = document.getElementById('leaderboard');
const connectionStatus = document.getElementById('connectionStatus');

// State variables
let isConnected = false;
let gameInProgress = false;

// Initialize the application
function init() {
    setupEventListeners();
    fetchInitialLeaderboard();
}

// Setup all event listeners
function setupEventListeners() {
    // Socket.IO event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('server:leaderboard-update', handleLeaderboardUpdate);
    
    // DOM event listeners
    startButton.addEventListener('click', handleStartGame);
    playerNameInput.addEventListener('keypress', handleKeyPress);
    playerNameInput.addEventListener('input', handleNameInput);
}

// Socket.IO Event Handlers
function handleConnect() {
    console.log('Connected to server');
    isConnected = true;
    updateConnectionStatus(true);
    fetchInitialLeaderboard();
}

function handleDisconnect() {
    console.log('Disconnected from server');
    isConnected = false;
    updateConnectionStatus(false);
    showStatusMessage('❌ Koneksi terputus! Mencoba menghubungkan kembali...', 'error');
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
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            clearStatusMessage();
        }, 3000);
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
    
    if (playerName.length < 2) {
        showStatusMessage('⚠️ Nama pemain minimal 2 karakter!', 'error');
        playerNameInput.focus();
        return;
    }
    
    // Disable button and show status
    startButton.disabled = true;
    gameInProgress = true;
    
    // Send start game event
    socket.emit('frontend:start-game', { name: playerName });
    
    showStatusMessage('🎮 Permainan sedang berlangsung di perangkat fisik... Tunggu giliranmu!', 'active');
    
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
    startButton.disabled = gameInProgress || !playerName || !isConnected;
}

// Leaderboard Functions
async function fetchInitialLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        renderLeaderboard(data);
    } catch (error) {
        console.error('Error fetching initial leaderboard:', error);
        showEmptyLeaderboard();
    }
}

function renderLeaderboard(data) {
    if (!data || data.length === 0) {
        showEmptyLeaderboard();
        return;
    }
    
    // Create table HTML
    let tableHTML = `
        <table class="leaderboard-table">
            <thead>
                <tr>
                    <th>Peringkat</th>
                    <th>Nama</th>
                    <th>Skor</th>
                    <th>Waktu</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach((entry, index) => {
        const rank = index + 1;
        const rankClass = getRankClass(rank);
        const rankIcon = getRankIcon(rank);
        const formattedDate = formatTimestamp(entry.timestamp);
        
        tableHTML += `
            <tr>
                <td class="rank ${rankClass}">${rankIcon} ${rank}</td>
                <td class="name">${escapeHtml(entry.name)}</td>
                <td class="score">${entry.score}</td>
                <td class="timestamp">${formattedDate}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    leaderboard.innerHTML = tableHTML;
}

function showEmptyLeaderboard() {
    leaderboard.innerHTML = `
        <div class="empty-leaderboard">
            🎯 Belum ada permainan yang dimainkan.<br>
            Jadilah yang pertama untuk memulai!
        </div>
    `;
}

// Helper Functions
function getRankClass(rank) {
    switch (rank) {
        case 1: return 'gold';
        case 2: return 'silver';
        case 3: return 'bronze';
        default: return '';
    }
}

function getRankIcon(rank) {
    switch (rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return '#';
    }
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
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
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'flex';
}

function clearStatusMessage() {
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
    statusMessage.style.display = 'none';
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 