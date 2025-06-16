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

## 🧪 Testing & Quality Assurance

### Automated Testing

#### Unit Tests (Future Implementation)
```bash
# Install testing dependencies
npm install --save-dev jest supertest socket.io-client

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

#### Integration Tests
```bash
# Test complete workflow
npm run test:integration

# Test WebSocket communication
npm run test:websocket

# Test hardware simulation
npm run test:hardware
```

### Manual Testing

#### Backend API Testing
```bash
# 1. Health check
curl -X GET http://localhost:3000/api/health
# Expected: {"status": "healthy", ...}

# 2. Leaderboard (empty)
curl -X GET http://localhost:3000/api/leaderboard
# Expected: {"status": "success", "data": [], "total": 0}

# 3. Static files
curl -I http://localhost:3000/
# Expected: HTTP/1.1 200 OK

# 4. WebSocket connection test
npm install -g wscat
wscat -c ws://localhost:3000/socket.io/?transport=websocket
```

#### Frontend Testing Checklist
- [ ] **Page Load:** Website loads without errors
- [ ] **Responsive Design:** Works on desktop, tablet, mobile
- [ ] **Connection Status:** Shows 🟢 Terhubung when connected
- [ ] **Input Validation:** 
  - [ ] Empty name shows error
  - [ ] Name too short (< 2 chars) shows error  
  - [ ] Name too long (> 20 chars) gets truncated
- [ ] **Game Flow:**
  - [ ] "Mulai Permainan" button disables during game
  - [ ] Status message updates correctly
  - [ ] Leaderboard updates real-time
- [ ] **Error Handling:**
  - [ ] Network disconnect shows error
  - [ ] Server restart reconnects automatically

#### Hardware Testing Protocol

##### Step 1: Basic Hardware Test
```cpp
// Test each component individually
void testLEDs() {
  for(int i = 0; i < 4; i++) {
    digitalWrite(led[i], HIGH);
    delay(500);
    digitalWrite(led[i], LOW);
    delay(200);
  }
}

void testButtons() {
  for(int i = 0; i < 4; i++) {
    if(digitalRead(button[i]) == LOW) {
      Serial.print("Button "); Serial.print(i); Serial.println(" pressed");
    }
  }
}

void testBuzzer() {
  for(int freq = 200; freq <= 800; freq += 200) {
    tone(buzzer, freq, 300);
    delay(400);
  }
}
```

##### Step 2: Network Connectivity Test
```
Expected Serial Output:
✓ WiFi connecting...........
✓ WiFi connected! IP: 192.168.1.100
✓ Socket.IO connecting to server...
✓ Socket.IO connected successfully
✓ System ready! Waiting for game trigger...
```

##### Step 3: End-to-End Game Test
1. **Trigger Test:**
   - Web: Input "TestPlayer" → Click "Mulai Permainan"
   - Hardware: Should show "🎮 Perintah mulai diterima!"

2. **Game Logic Test:**
   - LED sequence displays correctly
   - Button presses register
   - Correct sequence advances game
   - Wrong press ends game

3. **Score Submission Test:**
   - Game over triggers score submission
   - Web leaderboard updates immediately
   - Serial shows: "📤 Mengirim skor: X"

### Performance Testing

#### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create artillery config (artillery.yml)
cat > artillery.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/leaderboard"
EOF

# Run load test
artillery run artillery.yml
```

#### Memory & CPU Monitoring
```bash
# Monitor Node.js process
top -p $(pgrep -f "node index.js")

# Monitor memory usage
ps aux | grep "node index.js"

# Check for memory leaks
node --inspect index.js
# Open chrome://inspect in browser
```

### Testing Hardware Scenarios

#### Scenario 1: Perfect Game
```
Input: Correct sequence for 10+ rounds
Expected: Score = 10+, leaderboard updates
```

#### Scenario 2: Quick Failure
```
Input: Wrong button on first attempt
Expected: Score = 0, loss animation plays
```

#### Scenario 3: Timeout
```
Input: No button press within 10 seconds
Expected: Timeout message, game ends
```

#### Scenario 4: Network Disconnection
```
Test: Disconnect WiFi during game
Expected: Game continues, score queued until reconnect
```

### Browser Compatibility

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 90+ | ✅ Full Support | WebSocket works perfectly |
| Firefox | 88+ | ✅ Full Support | All features working |
| Safari | 14+ | ✅ Full Support | iOS compatible |
| Edge | 90+ | ✅ Full Support | Windows 10/11 |
| Mobile Chrome | Latest | ✅ Responsive | Touch-friendly |
| Mobile Safari | iOS 14+ | ✅ Responsive | PWA installable |

### Test Data Generation

#### Generate Sample Leaderboard
```bash
# Create test data script
cat > generate_test_data.js << EOF
const fs = require('fs');
const testData = [];
for(let i = 1; i <= 20; i++) {
  testData.push({
    name: \`Player\${i}\`,
    score: Math.floor(Math.random() * 20) + 1,
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
  });
}
fs.writeFileSync('./data/leaderboard.json', JSON.stringify(testData, null, 2));
console.log('Test data generated!');
EOF

# Run test data generator
node generate_test_data.js
```

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

## 🐳 Docker Support

### Development dengan Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  simon-says:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  # Future: Redis untuk session management
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
```

#### Build & Run
```bash
# Build image
docker build -t simon-says-iot .

# Run container
docker run -p 3000:3000 simon-says-iot

# Using docker-compose
docker-compose up -d
```

## 📊 Performance & Monitoring

### Metrics & Analytics

#### Key Performance Indicators (KPIs)
- **Response Time:** < 100ms untuk API calls
- **WebSocket Latency:** < 50ms untuk real-time events
- **Hardware Response:** < 200ms dari trigger ke LED display
- **Memory Usage:** < 512MB untuk production server
- **Concurrent Users:** Support 100+ simultaneous players

#### Monitoring Setup
```bash
# Install PM2 untuk production monitoring
npm install -g pm2

# Start with monitoring
pm2 start index.js --name simon-says --watch

# Monitor real-time
pm2 monit

# View logs
pm2 logs simon-says

# Performance monitoring
pm2 install pm2-server-monit
```

#### Health Check Endpoint
```javascript
// Endpoint untuk monitoring external services
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    dependencies: {
      database: 'connected',
      websocket: io.engine.clientsCount > 0 ? 'active' : 'idle'
    }
  };
  res.json(healthCheck);
});
```

## 🔐 Security Considerations

### Input Validation & Sanitization
```javascript
// Sanitize player names
const sanitizeName = (name) => {
  return name
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .substring(0, 20);    // Limit length
};

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### WebSocket Security
```javascript
// CORS configuration
const cors = require('cors');
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Socket.IO authentication (future)
io.use((socket, next) => {
  // Validate session or JWT token
  next();
});
```

## 🤝 Contributing

### Development Workflow

#### Getting Started
1. **Fork** repository
2. **Clone** your fork: `git clone https://github.com/yourusername/simonsays.git`
3. **Create branch:** `git checkout -b feature/amazing-feature`
4. **Install dependencies:** `npm install`
5. **Start development:** `npm run dev`

#### Code Style Guidelines
```bash
# Install ESLint & Prettier
npm install --save-dev eslint prettier eslint-config-prettier

# Format code
npm run format

# Lint code
npm run lint

# Pre-commit hooks
npm install --save-dev husky lint-staged
```

#### Pull Request Process
1. Update README.md dengan details perubahan
2. Update version number di package.json
3. Ensure semua tests pass
4. Create descriptive PR dengan:
   - Clear title dan description
   - Screenshots untuk UI changes
   - Test instructions

### Architecture Decisions

#### Technology Choices

| Component | Technology | Reasoning |
|-----------|------------|-----------|
| Backend | Node.js + Express | Lightweight, JavaScript ecosystem |
| Real-time | Socket.IO | Reliable WebSocket dengan fallbacks |
| Frontend | Vanilla JS | No framework overhead, fast loading |
| Styling | CSS3 | Modern features, responsive design |
| Hardware | Arduino C++ | Real-time performance, extensive libraries |
| Cloud | Azure App Service | Easy deployment, WebSocket support |
| CI/CD | GitHub Actions | Integrated dengan repository |

#### Design Patterns
- **Event-driven Architecture:** All components communicate via events
- **Separation of Concerns:** Clear boundaries between layers
- **Responsive Design:** Mobile-first approach
- **Progressive Enhancement:** Core functionality works without JavaScript

## 📚 Learning Resources

### Tutorials & Guides
- [Node.js Real-time Apps](https://nodejs.org/en/docs/guides/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [ESP8266 Arduino Core](https://arduino-esp8266.readthedocs.io/)
- [Azure App Service Node.js](https://docs.microsoft.com/en-us/azure/app-service/)

### Video Tutorials (Future)
- [ ] "Setting up Simon Says IoT from Scratch"
- [ ] "ESP8266 Hardware Assembly Guide"  
- [ ] "Deploying to Azure Cloud"
- [ ] "Troubleshooting Common Issues"

## ❓ FAQ (Frequently Asked Questions)

### General Questions

**Q: Can I run this without Azure?**
A: Yes! You can run completely locally or deploy to other cloud providers like Heroku, Vercel, or AWS.

**Q: Do I need exactly those hardware components?**
A: No, you can substitute similar components. The code is easily adaptable for different pins and components.

**Q: Can multiple ESP8266 devices connect simultaneously?**
A: Currently supports one hardware device, but architecture allows for multiple devices with minor modifications.

### Technical Questions

**Q: Why does ESP8266 keep disconnecting?**
A: Common causes: Weak WiFi signal, power supply issues, or router configuration. Check Serial Monitor for exact error.

**Q: WebSocket connection fails in browser**
A: Ensure server is running, check browser console for errors, verify firewall settings.

**Q: Leaderboard doesn't update**
A: Check file permissions for `data/leaderboard.json`, verify WebSocket connection status.

### Development Questions

**Q: How to add new game modes?**
A: Extend the event payload structure and add corresponding logic in ESP8266 code and frontend.

**Q: Can I use a database instead of JSON files?**
A: Yes! Replace file operations with database queries. MongoDB or PostgreSQL work well.

**Q: How to add authentication?**
A: Implement JWT tokens or session-based auth. Update WebSocket middleware accordingly.

## 📈 Roadmap & Future Enhancements

### Version 2.0 Features
- [ ] **Multiple Difficulty Levels**
  - Easy: 3-second intervals
  - Normal: 2-second intervals  
  - Hard: 1-second intervals
- [ ] **Tournament Mode**
  - Bracket-style competitions
  - Real-time spectator mode
- [ ] **Sound Effects**
  - Web browser audio feedback
  - Different themes/sounds

### Version 3.0 Features
- [ ] **Mobile App**
  - React Native companion app
  - Push notifications for scores
- [ ] **Analytics Dashboard**
  - Player statistics
  - Game analytics and insights
- [ ] **Multiplayer Support**
  - Head-to-head competitions
  - Team-based games

### Hardware Enhancements
- [ ] **RGB LEDs** dengan color mixing
- [ ] **LCD Display** untuk scores dan status
- [ ] **Acceleration Sensor** untuk gesture controls
- [ ] **Multiple ESP8266** support

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Initial release
- ✅ Basic Simon Says gameplay
- ✅ Real-time WebSocket communication
- ✅ Azure deployment support
- ✅ Responsive web interface

### v0.9.0 (Beta)
- ✅ ESP8266 hardware integration
- ✅ Score submission and leaderboard
- ✅ GitHub Actions CI/CD

### v0.5.0 (Alpha)
- ✅ Basic web interface
- ✅ Socket.IO server implementation
- ✅ Game logic foundation

## 📄 License

### Academic License

This project is created for **educational and academic purposes**. You are free to:

- ✅ **Use** for learning and education
- ✅ **Modify** and adapt for your projects
- ✅ **Share** with attribution
- ✅ **Deploy** for non-commercial use

### Attribution Required
```
Simon Says IoT System
Original Creator: [Your Name]
GitHub: https://github.com/yourusername/simonsays
```

### Commercial Use
For commercial use, please contact the maintainers for licensing agreements.

## 👥 Contributors

### Core Team
- **[Your Name]** - *Initial work, System Architecture*
- **[Contributor 2]** - *Frontend Development*
- **[Contributor 3]** - *Hardware Integration*

### Special Thanks
- Arduino community untuk ESP8266 libraries
- Socket.IO team untuk real-time communication
- Azure team untuk cloud hosting support

---

## 📞 Support & Contact

### Getting Help
1. **Check FAQ** section untuk common issues
2. **Search existing issues** di GitHub
3. **Create new issue** dengan detailed description
4. **Join Discord** untuk real-time help (future)

### Contact Information
- **Email:** your.email@domain.com
- **GitHub:** [@yourusername](https://github.com/yourusername)
- **LinkedIn:** [Your LinkedIn Profile]

### Bug Reports
Use GitHub Issues dengan template:
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior.

**Expected behavior**
What you expected to happen.

**System Info:**
 - OS: [e.g. Windows 10]
 - Browser: [e.g. Chrome 90]
 - Node.js: [e.g. 18.15.0]
```

---

**🎮 Ready to play? Start with the [Quick Start Guide](#-quick-start-guide) above!**

**⭐ Don't forget to star this repository if you found it helpful!**

**📢 Share your high scores and improvements with the community!**

---

**Dibuat dengan ❤️ untuk pembelajaran IoT dan Real-time Systems** 

az ad sp create-for-rbac --name "simon-says-deploy" \  --role contributor \  --scopes /subscriptions/{subscription-id} \  --sdk-auth

## 🎊 Fitur Animasi Startup Baru!

Sekarang ketika pemain memulai permainan dengan memasukkan nama, sistem akan menjalankan **animasi startup LED** dengan pola:

**1 → 2 → 3 → 4 → 3 → 2 → 1**

### Detail Animasi:
- 🔴 **LED 1** (RED) menyala → 🔇 mati
- 🟢 **LED 2** (GREEN) menyala → 🔇 mati  
- 🔵 **LED 3** (BLUE) menyala → 🔇 mati
- 🟡 **LED 4** (YELLOW) menyala → 🔇 mati
- 🔵 **LED 3** (BLUE) menyala → 🔇 mati
- 🟢 **LED 2** (GREEN) menyala → 🔇 mati
- 🔴 **LED 1** (RED) menyala → 🔇 mati

### Timing:
- Setiap LED menyala selama **400ms** 
- Jeda antar LED: **200ms**
- Setiap LED disertai dengan **nada musik** yang berbeda
- Total durasi animasi: **~4.2 detik**

### Implementasi:
- **ESP8266**: Fungsi `startupAnimation()` di `simon_says_esp8266.ino`
- **Server**: Log informatif tentang animasi startup
- **Web Client**: Pesan "🎊 Memulai animasi startup... LED akan berjalan dengan pola 1-2-3-4-3-2-1!"

---

## 🎯 **SISTEM SKOR KOMPLEKS**

Sistem scoring telah ditingkatkan menjadi lebih sophistikasi dengan multiple faktor untuk memberikan ranking yang lebih adil dan akurat!

### **📊 Formula Skor Baru:**

```
Final Score = (Base Score × 1000) + Time Bonus + Accuracy Bonus
```

### **🔢 Komponen Skor:**

#### **1. Base Score** 
- **Definisi**: Jumlah level yang berhasil dilalui
- **Range**: 0 - tak terbatas
- **Multiplier**: ×1000 (untuk memberikan bobot utama)
- **Contoh**: Level 5 = 5000 poin base

#### **2. Time Bonus** (0-500 poin)
- **< 30 detik**: +500 poin (bonus maksimal)
- **30-60 detik**: +400 hingga +100 poin (linear)
- **1-2 menit**: +200 hingga 0 poin (linear)  
- **> 2 menit**: 0 poin
- **Tujuan**: Mengapresiasi kecepatan bermain

#### **3. Accuracy Bonus** (0-200 poin)
Berdasarkan **konsistensi response time**:
- **Variance < 500ms**: +200 poin (sangat konsisten)
- **Variance < 1000ms**: +150 poin (konsisten)
- **Variance < 2000ms**: +100 poin (cukup konsisten)
- **Variance < 5000ms**: +50 poin (kurang konsisten)
- **Variance ≥ 5000ms**: 0 poin (tidak konsisten)

### **🏆 Sistem Ranking Tie-Breaking:**

Ketika 2+ pemain memiliki **Final Score sama**, ranking ditentukan berdasarkan:

1. **Primary**: Final Score (tertinggi menang)
2. **Secondary**: Total Duration (tercepat menang)
3. **Tertiary**: Avg Response Time (tercepat menang)
4. **Quaternary**: Time Bonus (tertinggi menang)
5. **Final**: Accuracy Bonus (tertinggi menang)

### **📱 Tampilan Leaderboard Baru:**

| Rank | Nama | Final Score | Level | Bonus | Durasi | Avg Response | Waktu |
|------|------|-------------|-------|-------|--------|--------------|-------|
| 🥇 1 | Alice 🎯 | **3,687** | 3 | +687 | 45s | 892ms | 2 min ago |
| 🥈 2 | Bob ⚪ | **3,000** | 3 | +0 | 1:23 | 1205ms | 5 min ago |

**Legend:**
- 🎯 = **Complex Score** (sistem baru)
- ⚪ = **Simple Score** (sistem lama)

### **💡 Keuntungan Sistem Baru:**

1. **Lebih Adil**: Tidak hanya based level, tapi skill overall
2. **Motivasi Tambahan**: Incentive untuk main cepat dan konsisten  
3. **Competitive**: Tie-breaking yang sophistikasi
4. **Backward Compatible**: Skor lama tetap valid
5. **Detailed Analytics**: Tracking performance detail

### **⚡ Contoh Perhitungan:**

**Scenario**: Pemain mencapai **Level 5** dalam **45 detik** dengan **response variance 800ms**

```
Base Score: 5 × 1000 = 5,000 poin
Time Bonus: 45s → +250 poin  
Accuracy Bonus: 800ms variance → +150 poin
Final Score: 5,000 + 250 + 150 = 5,400 poin
```

**vs**

**Scenario**: Pemain mencapai **Level 5** dalam **90 detik** dengan **response variance 2500ms**

```
Base Score: 5 × 1000 = 5,000 poin
Time Bonus: 90s → +0 poin
Accuracy Bonus: 2500ms variance → +50 poin  
Final Score: 5,000 + 0 + 50 = 5,050 poin
```

**Hasil**: Pemain pertama menang dengan margin 350 poin meskipun level sama!

---