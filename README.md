# 🎮 Simon Says IoT System

[![Build Status](https://github.com/yourusername/simonsays/workflows/Deploy%20to%20Azure%20App%20Service/badge.svg)](https://github.com/yourusername/simonsays/actions)
[![Azure](https://img.shields.io/badge/Azure-Deployed-blue)](https://simon-says.azurewebsites.net)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-Academic-orange)](LICENSE)

> **Sistem permainan Simon Says yang terintegrasi dengan IoT** menggunakan NodeMCU ESP8266, dengan komunikasi real-time antara perangkat keras, server backend, dan klien web. Proyek ini mendemonstrasikan implementasi lengkap IoT system dengan WebSocket, real-time communication, dan modern web technologies.

## 🌟 Features

- ✅ **Real-time Communication** - WebSocket-based instant communication
- ✅ **IoT Integration** - ESP8266 hardware dengan sensor dan actuator
- ✅ **Modern UI/UX** - Responsive web interface dengan animations
- ✅ **Live Leaderboard** - Real-time score updates untuk semua players
- ✅ **Azure Cloud Deployment** - Production-ready cloud hosting
- ✅ **Automatic CI/CD** - GitHub Actions integration
- ✅ **Cross-platform** - Compatible dengan desktop dan mobile browsers
- ✅ **Offline Hardware Mode** - ESP8266 dapat beroperasi mandiri

## 📋 System Overview

Sistem ini terdiri dari **tiga komponen utama** yang bekerja secara sinergis:

### 🖥️ **Backend Server (Node.js + Socket.IO)**
- **Real-time Communication Hub** menggunakan WebSocket
- **RESTful API** untuk data management
- **Persistent Storage** dengan JSON file system
- **Event-driven Architecture** untuk optimal performance
- **Azure App Service** deployment ready

### 🌐 **Frontend Web Client (Vanilla JS + CSS3)**
- **Modern Responsive Design** dengan gradient themes
- **Real-time UI Updates** tanpa page refresh
- **Input Validation** dan error handling
- **Connection Status Monitoring** 
- **Progressive Web App** ready

### 🔧 **Hardware ESP8266 (Arduino C++)**
- **4x RGB LEDs** untuk visual feedback
- **4x Push Buttons** untuk user interaction  
- **Buzzer** untuk audio feedback
- **WiFi Connectivity** ke cloud server
- **Event-driven Game Logic** dengan non-blocking operations

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    WebSocket     ┌─────────────────┐    WebSocket     ┌─────────────────┐
│   Web Client    │ ◄───────────────► │  Backend Server │ ◄───────────────► │  ESP8266 MCU    │
│                 │                   │                 │                   │                 │
│ • Input nama    │   HTTP API        │ • Socket.IO Hub │   WiFi            │ • LEDs (4x)     │
│ • Mulai game    │ ◄───────────────► │ • Leaderboard   │                   │ • Buttons (4x)  │
│ • Lihat skor    │                   │ • State mgmt    │                   │ • Buzzer        │
└─────────────────┘                   └─────────────────┘                   └─────────────────┘
```

## 🛠️ Prerequisites

Sebelum memulai, pastikan Anda memiliki:

### Software Requirements
- **Node.js** 18.x atau higher ([Download](https://nodejs.org/))
- **Arduino IDE** 2.x atau higher ([Download](https://arduino.cc/downloads))
- **Git** untuk version control ([Download](https://git-scm.com/))
- **Web Browser** modern (Chrome, Firefox, Edge, Safari)

### Hardware Requirements  
- **NodeMCU ESP8266** development board
- **4x LEDs** (Red, Green, Blue, Yellow)
- **4x Push Buttons** (momentary)
- **1x Buzzer** (active atau passive)
- **Resistors:** 4x 220Ω (untuk LEDs), 4x 10kΩ (pull-up untuk buttons)
- **Breadboard** dan **jumper wires**
- **USB Cable** untuk programming ESP8266

### Cloud Services (Optional)
- **Azure Account** untuk cloud deployment
- **GitHub Account** untuk CI/CD dan version control

## 🚀 Quick Start Guide

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/simonsays.git
cd simonsays
```

### Step 2: Backend Server Setup

#### 2.1 Install Dependencies
```bash
npm install
```

#### 2.2 Environment Configuration (Optional)
```bash
# Create .env file for custom configuration
echo "PORT=3000" > .env
echo "NODE_ENV=development" >> .env
```

#### 2.3 Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**✅ Success:** Server akan berjalan di `http://localhost:3000`

### Step 3: Hardware ESP8266 Setup

#### 3.1 Install Arduino Libraries
Buka **Arduino IDE** → **Library Manager** → Install:
- `ArduinoJson` by Benoit Blanchon (versi 6.21.0+)
- `SocketIOClient` by Tuan PM (versi 0.9.3+)
- `ESP8266WiFi` (built-in dengan ESP8266 board package)

#### 3.2 Board Configuration
**Tools** → **Board** → **ESP8266 Boards** → **NodeMCU 1.0 (ESP-12E Module)**
- Upload Speed: 115200
- CPU Frequency: 80 MHz
- Flash Size: 4MB (FS:2MB OTA:~1019KB)

#### 3.3 Wiring Diagram
```
NodeMCU ESP8266 Pinout:
┌─────────────────────────────────┐
│  Component  │  ESP8266 Pin  │  Purpose           │
├─────────────────────────────────┤
│  LED Red    │      D5       │  Red indicator     │
│  LED Green  │      D6       │  Green indicator   │  
│  LED Blue   │      D7       │  Blue indicator    │
│  LED Yellow │      D8       │  Yellow indicator  │
│  Button Red │      D1       │  Red button input  │
│  Button Grn │      D2       │  Green button      │
│  Button Blu │      D3       │  Blue button       │
│  Button Ylw │      D4       │  Yellow button     │
│  Buzzer     │      D0       │  Audio feedback    │
│  Ground     │      GND      │  Common ground     │
│  Power      │      3V3      │  3.3V power supply │
└─────────────────────────────────┘

Wiring Notes:
- LEDs: Anode → ESP8266 Pin, Cathode → 220Ω resistor → GND
- Buttons: One terminal → ESP8266 Pin, Other → GND (internal pull-up)
- Buzzer: Positive → ESP8266 Pin, Negative → GND
```

#### 3.4 Configuration & Upload
```cpp
// 1. Edit WiFi credentials in simon_says_esp8266.ino
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// 2. Configure server URL (localhost untuk testing)
const char* socket_io_host = "192.168.x.x"; // Your computer's IP
// atau untuk Azure deployment:
// const char* socket_io_host = "your-app.azurewebsites.net";

// 3. Upload to ESP8266
```

**✅ Success:** Serial Monitor akan menampilkan WiFi connection dan Socket.IO status

### Step 4: Testing the System

#### 4.1 Verify Backend
```bash
# Test API endpoint
curl http://localhost:3000/api/leaderboard
# Expected: []

# Check server logs
# Should show: "Server berjalan di http://localhost:3000"
```

#### 4.2 Verify Frontend
1. Buka browser → `http://localhost:3000`
2. Check connection status: 🟢 Terhubung
3. Input test name dan click "Mulai Permainan"
4. Monitor browser console untuk WebSocket events

#### 4.3 Verify Hardware
1. Open **Arduino IDE Serial Monitor** (9600 baud)
2. Expected logs:
   ```
   === Simon Says IoT Hardware ===
   WiFi connected! IP: 192.168.x.x
   Socket.IO connected to server
   System ready! Waiting for game trigger...
   ```

#### 4.4 End-to-End Test
1. **Web:** Input nama → Click "Mulai Permainan"
2. **Hardware:** LED sequence akan ditampilkan
3. **Player:** Follow LED sequence dengan menekan buttons
4. **Result:** Score akan muncul di leaderboard secara real-time

## 🎯 Cara Bermain

1. **Mulai Permainan:**
   - Masukkan nama pemain di web interface
   - Klik tombol "Mulai Permainan"
   - Perangkat ESP8266 akan menerima trigger dan mulai menampilkan urutan

2. **Bermain:**
   - Perhatikan urutan LED yang menyala di perangkat fisik
   - Tekan tombol yang sesuai dengan urutan yang ditampilkan
   - Setiap putaran akan menambah satu warna baru ke urutan

3. **Game Over:**
   - Jika salah menekan tombol atau timeout (10 detik)
   - Animasi kalah akan ditampilkan
   - Skor otomatis terkirim ke leaderboard
   - Leaderboard web akan update secara real-time

## 🔄 Alur Komunikasi Event

```mermaid
sequenceDiagram
    participant W as Web Client
    participant S as Server
    participant H as Hardware ESP8266
    
    W->>S: frontend:start-game {name: "Player"}
    S->>S: lastPlayerName = "Player"
    S->>H: server:trigger-game (broadcast)
    H->>H: startGameLogic()
    Note over H: Player bermain Simon Says
    H->>S: hardware:submit-score {score: 5}
    S->>S: Save to leaderboard.json
    S->>W: server:leaderboard-update (broadcast)
    W->>W: Update UI leaderboard
```

## 📁 Struktur File

```
/
├── index.js              # Server utama
├── package.json          # Dependencies
├── simon_says_esp8266.ino # Kode Arduino
├── data/
│   └── leaderboard.json  # Data papan peringkat
└── public/
    ├── index.html        # Frontend HTML
    ├── style.css         # Styling
    └── script.js         # Frontend JavaScript
```

## ⚙️ Configuration

### Environment Variables

#### Backend Server (.env file)
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (untuk future expansion)
DATABASE_URL=./data/leaderboard.json

# CORS Configuration (jika diperlukan)
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Rate Limiting (requests per minute)
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

#### ESP8266 Configuration (simon_says_esp8266.ino)
```cpp
//================================================================
// NETWORK CONFIGURATION
//================================================================
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server Configuration
const char* socket_io_host = "your-server-host.com";
const uint16_t socket_io_port = 80;

//================================================================
// GAME CONFIGURATION  
//================================================================
#define MAX_SEQUENCE_LENGTH 100    // Maximum game sequence
#define USER_TIMEOUT_MS 10000      // 10 seconds timeout
#define LED_DISPLAY_DURATION 500   // LED on duration (ms)
#define LED_PAUSE_DURATION 300     // LED off duration (ms)

//================================================================
// HARDWARE CONFIGURATION
//================================================================
#define DEBOUNCE_DELAY 50          // Button debounce (ms)
#define SERIAL_BAUD_RATE 9600      // Serial communication speed

// Audio frequencies untuk each color (Hz)
int frequencies[] = {262, 330, 392, 523}; // C, E, G, C (high octave)
```

### Azure App Service Configuration

#### Application Settings
```json
{
  "PORT": "80",
  "NODE_ENV": "production",
  "WEBSITE_NODE_DEFAULT_VERSION": "18.x",
  "SCM_DO_BUILD_DURING_DEPLOYMENT": "true"
}
```

#### Connection Strings (jika menggunakan database)
```json
{
  "Database": {
    "value": "mongodb://username:password@host:port/database",
    "type": "Custom"
  }
}
```

## 🌐 Deployment ke Azure

1. **Prepare for Azure:**
   ```json
   // package.json
   "scripts": {
     "start": "node index.js"
   },
   "engines": {
     "node": ">=14.0.0"
   }
   ```

2. **Deploy:**
   - Push code ke GitHub repository
   - Connect Azure App Service ke repository
   - Set environment variables jika diperlukan

3. **Update ESP8266:**
   - Ganti `socket_io_host` dengan URL Azure App Service
   - Re-upload code ke ESP8266

## 🔍 API Documentation

### REST API Endpoints

#### GET /api/leaderboard
Mendapatkan data papan peringkat yang sudah diurutkan berdasarkan score (tertinggi ke terendah).

**Request:**
```http
GET /api/leaderboard HTTP/1.1
Host: localhost:3000
Accept: application/json
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "name": "Alice",
      "score": 12,
      "timestamp": "2024-01-15T10:30:00.000Z",
      "rank": 1
    },
    {
      "name": "Bob", 
      "score": 8,
      "timestamp": "2024-01-15T09:15:00.000Z",
      "rank": 2
    }
  ],
  "total": 2
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Unable to read leaderboard data",
  "code": "LEADERBOARD_READ_ERROR"
}
```

#### GET /api/health
Health check endpoint untuk monitoring system status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "dependencies": {
    "database": "connected",
    "websocket": "active"
  }
}
```

### WebSocket Events

#### Client → Server Events

##### `frontend:start-game`
Memulai permainan baru dengan nama pemain.

**Payload:**
```json
{
  "name": "PlayerName",
  "difficulty": "normal",  // optional: easy, normal, hard
  "mode": "classic"        // optional: classic, speed, memory
}
```

##### `hardware:submit-score` 
Mengirim skor dari hardware ESP8266 ke server.

**Payload:**
```json
{
  "score": 15,
  "duration": 120,         // game duration in seconds
  "mistakes": 2,           // number of mistakes made
  "difficulty": "normal"
}
```

#### Server → Client Events

##### `server:trigger-game`
Server memberitahu hardware untuk memulai permainan.

**Payload:**
```json
{
  "player": "PlayerName",
  "gameId": "uuid-12345",
  "settings": {
    "difficulty": "normal",
    "maxSequence": 50
  }
}
```

##### `server:leaderboard-update`
Update leaderboard real-time ke semua connected clients.

**Payload:**
```json
{
  "type": "leaderboard_update",
  "data": [
    {
      "name": "NewPlayer",
      "score": 10,
      "timestamp": "2024-01-15T10:30:00.000Z",
      "isNew": true
    }
  ]
}
```

##### `server:game-status`
Status update untuk permainan yang sedang berlangsung.

**Payload:**
```json
{
  "gameId": "uuid-12345",
  "status": "in_progress",  // waiting, in_progress, completed, error
  "currentTurn": 5,
  "playerName": "Alice"
}
```

### Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_PLAYER_NAME` | Nama pemain kosong atau invalid | Provide valid player name (2-20 characters) |
| `GAME_IN_PROGRESS` | Game sudah berjalan | Wait for current game to finish |
| `HARDWARE_DISCONNECTED` | ESP8266 tidak terhubung | Check hardware connection |
| `LEADERBOARD_WRITE_ERROR` | Gagal menyimpan score | Check file permissions |
| `WEBSOCKET_ERROR` | WebSocket connection error | Refresh page or check network |

## 🧪 Testing

### Test Backend
```bash
# Install dependencies
npm install

# Start server
npm run dev

# Test API endpoint
curl http://localhost:3000/api/leaderboard
```

### Test Frontend
1. Buka `http://localhost:3000`
2. Masukkan nama dan klik "Mulai Permainan"
3. Cek console browser untuk WebSocket events

### Test Hardware
1. Monitor Serial Output di Arduino IDE
2. Pastikan koneksi WiFi berhasil
3. Pastikan Socket.IO terhubung ke server
4. Test manual dengan menekan tombol

## 🐛 Troubleshooting

### Backend Issues
- **Port already in use:** Change PORT in environment variables
- **CORS errors:** Ensure Socket.IO client connects to correct host
- **File permission errors:** Check write permissions for `data/` directory

### Hardware Issues
- **WiFi connection failed:** Double-check SSID and password
- **Socket.IO connection failed:** Verify server URL and port
- **LEDs not working:** Check wiring and pin configurations
- **Buttons not responsive:** Verify pull-up resistors and debounce logic

### Frontend Issues
- **Connection failed:** Ensure server is running and accessible
- **Leaderboard not updating:** Check browser console for WebSocket errors
- **Button disabled:** Check connection status and input validation

## 📊 Monitoring & Logs

### Server Logs
```bash
# Development
npm run dev

# Production (with PM2)
npm install -g pm2
pm2 start index.js --name simon-says
pm2 logs simon-says
```

### Hardware Logs
Monitor Serial Output di Arduino IDE (9600 baud rate)

## 🔒 Security Considerations

- Sanitize user input untuk nama pemain
- Rate limiting untuk prevent spam requests
- Validate score data dari hardware
- HTTPS recommended untuk production

## 📈 Future Enhancements

- [ ] Multiple difficulty levels
- [ ] Sound effects di web interface
- [ ] Player authentication
- [ ] Game statistics dan analytics
- [ ] Multiple hardware devices support
- [ ] Tournament mode
- [ ] Mobile app companion

## 📞 Support

Jika mengalami masalah:

1. Cek troubleshooting section
2. Monitor logs untuk error messages
3. Verify semua connections dan configurations
4. Test individual components secara terpisah

## 📄 License

Proyek ini dibuat untuk keperluan akademik dan pembelajaran IoT.

---

**Dibuat dengan ❤️ untuk pembelajaran IoT dan Real-time Systems** 