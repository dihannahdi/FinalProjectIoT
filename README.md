# Simon Says IoT Leaderboard System - Azure Deployment

Modern IoT system for Simon Says game with real-time leaderboard running on Microsoft Azure Cloud Platform and ESP8266 hardware.

## 🎯 Overview

This project consists of two main components:
1. **Azure Web App** - Node.js backend + web frontend hosted on Azure
2. **ESP8266 Firmware** - Arduino code for ESP8266 that communicates with Azure

## 📋 Project Structure

```
Final/
├── server.js                    # Express.js server
├── package.json                 # Node.js dependencies
├── package-lock.json           # Locked dependency versions
├── web.config                   # Azure deployment configuration
├── deploy-to-azure.ps1         # Azure deployment script
├── .deployment                 # Azure deployment settings
├── public/
│   ├── index.html              # Frontend dashboard
│   └── style.css              # Modern responsive styling
├── simon_says_iot_azure/
│   └── simon_says_iot_azure.ino # ESP8266 firmware (Azure version)
├── test_esp8266_connectivity.js # Diagnostic tool
└── README.md                   # This guide
```

## ☁️ Azure Deployment

### 1. Prerequisites

- Microsoft Azure account
- Node.js 18.x installed locally
- PowerShell (for deployment script)
- Arduino IDE (for ESP8266)

### 2. Local Development Setup

```bash
# Clone or extract the project
cd Final/

# Install dependencies
npm install

# Create initial leaderboard file
npm run setup

# Test locally
npm start
```

The local server will run on `http://localhost:3000`

### 3. Deploy to Azure

#### Option A: Automated Deployment (Recommended)

```powershell
# Run the automated deployment script
npm run azure-deploy
```

This script will:
- Create an Azure App Service
- Configure Node.js runtime
- Deploy your application
- Set up custom domain (if configured)

#### Option B: Manual Azure Portal Deployment

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **App Service**
3. Choose **Node.js 18 LTS** runtime
4. Upload the project files
5. Configure environment variables

### 4. Configure ESP8266

Update the Arduino code with your Azure URL:

```cpp
// In simon_says_iot_azure/simon_says_iot_azure.ino
const char* azureServerURL = "https://your-app-name.azurewebsites.net";
const char* ssid = "your-wifi-name";
const char* password = "your-wifi-password";
```

### 5. Test Connection

```bash
# Test ESP8266 connectivity
node test_esp8266_connectivity.js

# Or test specific endpoints
curl https://your-app-name.azurewebsites.net/health
```

## 🔧 Hardware Setup (ESP8266)

### 1. Component List

- ESP8266 board (NodeMCU/Wemos D1 Mini)
- 4x Push buttons
- 4x LEDs (Red, Green, Blue, Yellow)
- 1x Buzzer
- Resistors and breadboard
- Jumper wires

### 2. Pin Configuration

```
LED Connections:
- Red LED    → D5
- Green LED  → D6  
- Blue LED   → D7
- Yellow LED → D8

Button Connections:
- Red Button    → D1
- Green Button  → D2
- Blue Button   → D3
- Yellow Button → D4

Buzzer → D0
```

### 3. Arduino IDE Setup

```bash
# 1. Install ESP8266 board package
# In Arduino IDE: File → Preferences
# Add URL: http://arduino.esp8266.com/stable/package_esp8266com_index.json

# 2. Install required libraries
# - ESP8266WiFi
# - ESP8266HTTPClient  
# - ArduinoJson
```

### 4. Upload Firmware

1. Open `simon_says_iot_azure/simon_says_iot_azure.ino`
2. Update WiFi credentials and Azure URL
3. Select board: **NodeMCU 1.0 (ESP-12E Module)**
4. Upload to ESP8266
5. Open Serial Monitor (115200 baud) for debugging

## 🎮 How to Play

### 1. Start a Game

1. Visit your Azure web app URL
2. Enter your player name
3. Click "Start Game"
4. Watch the LED sequence on ESP8266
5. Repeat the pattern using buttons

### 2. Game Features

- **Progressive Difficulty**: Sequences get longer each level
- **Real-time Scoring**: Scores sync to Azure instantly
- **Leaderboard**: Compare with other players
- **Hardware Feedback**: LEDs light up when buttons pressed
- **Sound Effects**: Audio feedback through buzzer

## 🔍 Troubleshooting

### Common Issues

1. **ESP8266 won't connect to WiFi**
   ```cpp
   // Check Serial Monitor for error messages
   // Verify SSID and password are correct
   // Ensure ESP8266 is in range of router
   ```

2. **Buttons not working**
   ```bash
   # Run hardware test
   node test_esp8266_connectivity.js
   
   # Check button wiring
   # Verify pull-up resistors
   ```

3. **Azure deployment fails**
   ```powershell
   # Check Azure CLI is installed
   # Verify authentication: az login
   # Check resource group permissions
   ```

### Debug Commands

```bash
# Test local server
npm start

# Test Azure connectivity  
curl https://your-app-name.azurewebsites.net/health

# Check ESP8266 logs via Serial Monitor
# Monitor button responses in real-time
```

## 📊 API Endpoints

### Game Control
- `GET /health` - Server health check
- `POST /start-game` - Trigger game start
- `GET /check-game-trigger` - ESP8266 polling endpoint

### Leaderboard
- `GET /api/leaderboard` - Get all scores
- `POST /submit-score` - Submit new score
- `GET /api/game-status` - Current game status

### Example API Usage

```bash
# Start a game
curl -X POST https://your-app-name.azurewebsites.net/start-game \
  -H "Content-Type: application/json" \
  -d '{"playerName": "Player1"}'

# Submit score
curl -X POST https://your-app-name.azurewebsites.net/submit-score \
  -H "Content-Type: application/json" \
  -d '{"name": "Player1", "score": 150, "level": 5}'
```

## 🚀 Advanced Features

### Performance Optimization
- **Local Validation**: ESP8266 validates sequences locally
- **Azure Scaling**: Automatic scaling based on usage
- **Caching**: Optimized for fast response times

### Security
- **HTTPS Only**: All communication encrypted
- **Input Validation**: Server-side validation
- **Rate Limiting**: Prevents abuse

### Monitoring
- **Azure Application Insights**: Performance monitoring
- **Real-time Logging**: Debug issues quickly
- **Health Checks**: Automatic uptime monitoring

## 📈 Scaling and Production

### Azure Configuration
```json
{
  "NODE_ENV": "production",
  "PORT": "80",
  "WEBSITE_NODE_DEFAULT_VERSION": "18.17.0"
}
```

### Backup Strategy
```bash
# Backup leaderboard data
npm run backup

# Restore from backup
cp leaderboard.backup.json leaderboard.json
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 Credits

Developed for IoT Practicum - Modern cloud-based IoT system with Azure integration.

---

**Happy Gaming! 🎮** 