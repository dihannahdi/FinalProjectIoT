//================================================================
// Simon Says IoT - ESP8266 Hardware Component
// Dengan WebSocket Client untuk komunikasi real-time
//================================================================

#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

//================================================================
// KONFIGURASI (PALING ATAS)
//================================================================

// Kredensial Wi-Fi
const char* ssid = "Bapakmu Ijo";
const char* password = "irengputeh";

// Konfigurasi Server - Easy switch between local and Azure
// Uncomment ONE of these configurations:

// === LOCAL TESTING ===
const char* websocket_host = "192.168.1.6";  // Your computer's IP address
const uint16_t websocket_port = 3000;  // Same port as main server
const char* websocket_path = "/hardware-ws";  // Hardware WebSocket path

// === AZURE DEPLOYMENT === 
// const char* websocket_host = "simon-says-exhqaycwc6c0hveg.canadacentral-01.azurewebsites.net";
// const uint16_t websocket_port = 80;  // Standard HTTP port
// const char* websocket_path = "/hardware-ws";  // Hardware WebSocket path

// Definisi Pin
int led[] = {D5, D6, D7, D8};  // LED untuk Red, Green, Blue, Yellow
int button[] = {D1, D2, D3, D4}; // Tombol untuk Red, Green, Blue, Yellow
int buzzer = D0;  // Pin buzzer

// Warna dan nama
String colors[] = {"RED", "GREEN", "BLUE", "YELLOW"};
int ledColors[] = {0, 1, 2, 3}; // Index untuk LED

//================================================================
// VARIABEL STATUS GLOBAL
//================================================================

WebSocketsClient webSocket;
String currentPlayerName = "";
bool gameInProgress = false;
bool isConnected = false;

// Connection monitoring
unsigned long lastConnectionAttempt = 0;
unsigned long lastPingTime = 0;
int connectionAttempts = 0;
bool wifiConnected = false;

// Variabel permainan Simon Says
int sequence[100];  // Urutan warna yang harus diikuti
int turn = 0;       // Putaran saat ini
int seqL = 0;       // Panjang urutan saat ini
unsigned long timer = 0;
bool userTurn = false;
int userInput = 0;

// Status LED dan timing
bool ledState = false;
unsigned long lastLedTime = 0;
int currentLed = -1;

//================================================================
// SETUP FUNCTION
//================================================================

void setup() {
    Serial.begin(115200);
    Serial.println();
    Serial.println("=== Simon Says IoT Hardware ===");
    Serial.println("Version: 2.0 with Enhanced WebSocket");
    Serial.println("Initializing...");
    
    // Setup pins
    setupPins();
    
    // Setup Wi-Fi
    setupWifi();
    
    // Setup WebSocket
    setupWebSocket();
    
    // Test semua LED
    testAllLeds();
    
    Serial.println("✅ System ready! Waiting for game trigger...");
    printConnectionInfo();
}

//================================================================
// MAIN LOOP
//================================================================

void loop() {
    // Check WiFi connection
    checkWiFiConnection();
    
    // WebSocket loop tetap berjalan
    webSocket.loop();
    
    // Connection monitoring
    monitorConnection();
    
    // Game loop hanya berjalan saat game aktif
    if (gameInProgress) {
        gameLoop();
    }
    
    // Small delay untuk stabilitas
    delay(10);
}

//================================================================
// SETUP FUNCTIONS
//================================================================

void setupPins() {
    // Setup LED pins sebagai OUTPUT
    for (int i = 0; i < 4; i++) {
        pinMode(led[i], OUTPUT);
        digitalWrite(led[i], LOW);
    }
    
    // Setup Button pins sebagai INPUT_PULLUP
    for (int i = 0; i < 4; i++) {
        pinMode(button[i], INPUT_PULLUP);
    }
    
    // Setup Buzzer
    pinMode(buzzer, OUTPUT);
    
    Serial.println("✅ Pins configured");
}

void setupWifi() {
    WiFi.begin(ssid, password);
    Serial.print("🔌 Connecting to WiFi");
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        wifiConnected = true;
        Serial.println();
        Serial.print("✅ WiFi connected! IP: ");
        Serial.println(WiFi.localIP());
        Serial.print("📶 Signal strength: ");
        Serial.print(WiFi.RSSI());
        Serial.println(" dBm");
    } else {
        Serial.println();
        Serial.println("❌ WiFi connection failed!");
        Serial.println("🔄 Please check your WiFi credentials and try again");
    }
}

void setupWebSocket() {
    if (!wifiConnected) {
        Serial.println("⚠️ Cannot setup WebSocket - WiFi not connected");
        return;
    }
    
    Serial.println("🔗 Setting up WebSocket connection...");
    Serial.print("Host: ");
    Serial.println(websocket_host);
    Serial.print("Port: ");
    Serial.println(websocket_port);
    Serial.print("Path: ");
    Serial.println(websocket_path);
    
    // server address, port and URL
    webSocket.begin(websocket_host, websocket_port, websocket_path);
    
    // event handler
    webSocket.onEvent(webSocketEvent);
    
    // Additional WebSocket settings for better stability
    webSocket.enableHeartbeat(15000, 3000, 2); // ping interval, pong timeout, disconnect timeout
    webSocket.setReconnectInterval(5000);
    
    Serial.println("✅ WebSocket setup complete");
    lastConnectionAttempt = millis();
}

void testAllLeds() {
    Serial.println("🔆 Testing all LEDs...");
    for (int i = 0; i < 4; i++) {
        digitalWrite(led[i], HIGH);
        tone(buzzer, 440 + (i * 220), 200);
        delay(300);
        digitalWrite(led[i], LOW);
        delay(100);
    }
    Serial.println("✅ LED test complete");
}

//================================================================
// CONNECTION MONITORING
//================================================================

void checkWiFiConnection() {
    if (WiFi.status() != WL_CONNECTED && wifiConnected) {
        Serial.println("⚠️ WiFi connection lost! Attempting reconnection...");
        wifiConnected = false;
        isConnected = false;
        setupWifi();
        if (wifiConnected) {
            setupWebSocket();
        }
    }
}

void monitorConnection() {
    // Check connection status every 10 seconds for faster recovery
    if (millis() - lastConnectionAttempt > 10000) {
        if (!isConnected && wifiConnected) {
            connectionAttempts++;
            Serial.print("🔄 Connection attempt #");
            Serial.println(connectionAttempts);
            
            if (connectionAttempts == 3) {
                Serial.println("🔧 Running connection diagnostic...");
                testConnection();
            }
            
            if (connectionAttempts == 5) {
                Serial.println("🛠️ Multiple connection failures - trying alternative settings...");
                tryAlternativeConnection();
            }
            
            if (connectionAttempts > 10) {
                Serial.println("🔄 Resetting connection attempts counter");
                connectionAttempts = 0;
            }
        }
        lastConnectionAttempt = millis();
    }
    
    // Send periodic ping if connected
    if (isConnected && millis() - lastPingTime > 60000) {
        Serial.println("📡 Sending keepalive ping...");
        webSocket.sendPing();
        lastPingTime = millis();
    }
}

void printConnectionInfo() {
    Serial.println("\n📋 Connection Information:");
    Serial.print("WiFi SSID: ");
    Serial.println(ssid);
    Serial.print("Local IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("Gateway: ");
    Serial.println(WiFi.gatewayIP());
    Serial.print("DNS: ");
    Serial.println(WiFi.dnsIP());
    Serial.print("WebSocket Target: ");
    Serial.print(websocket_host);
    Serial.print(":");
    Serial.println(websocket_port);
    Serial.println("==========================================\n");
}

//================================================================
// WEBSOCKET EVENT HANDLERS
//================================================================

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("❌ [WSc] Disconnected! Reason: Connection lost\n");
            isConnected = false;
            connectionAttempts++;
            break;
            
        case WStype_CONNECTED:
            Serial.printf("✅ [WSc] Connected to: %s\n", payload);
            isConnected = true;
            connectionAttempts = 0;
            lastPingTime = millis();
            
            // Send connection message
            sendWebSocketMessage("connected", "{}");
            Serial.println("📤 Hardware connection notification sent");
            break;
            
        case WStype_TEXT:
            Serial.printf("📨 [WSc] Received text: %s\n", payload);
            handleWebSocketMessage((char*)payload);
            break;
            
        case WStype_BIN:
            Serial.printf("📦 [WSc] Received binary length: %u\n", length);
            break;
            
        case WStype_PING:
            Serial.println("🏓 [WSc] Received ping");
            break;
            
        case WStype_PONG:
            Serial.println("🏓 [WSc] Received pong");
            break;
            
        case WStype_ERROR:
            Serial.printf("❌ [WSc] Error: %s\n", payload);
            break;
            
        case WStype_FRAGMENT_TEXT_START:
        case WStype_FRAGMENT_BIN_START:
        case WStype_FRAGMENT:
        case WStype_FRAGMENT_FIN:
            Serial.println("📦 [WSc] Fragment received");
            break;
    }
}

void handleWebSocketMessage(String message) {
    Serial.println("📨 Pesan diterima: " + message);
    
    // Parse simple JSON message format (not Socket.IO)
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (error) {
        Serial.print("⚠️ JSON parse error: ");
        Serial.println(error.c_str());
        return;
    }
    
    // Check message type
    if (doc.containsKey("type")) {
        String messageType = doc["type"].as<String>();
        
        Serial.print("🎯 Message type: ");
        Serial.println(messageType);
        
        if (messageType == "connected") {
            Serial.println("✅ Hardware connected to server!");
            // Send confirmation back
            sendWebSocketMessage("ready", "{}");
            
        } else if (messageType == "trigger-game") {
            triggerGameHandler();
            
        } else {
            Serial.println("⚠️ Unknown message type: " + messageType);
        }
    }
}

void sendWebSocketMessage(String messageType, String data) {
    if (!isConnected) {
        Serial.println("⚠️ WebSocket not connected, cannot send message");
        return;
    }
    
    // Create simple JSON message
    StaticJsonDocument<256> doc;
    doc["type"] = messageType;
    
    // Parse data if it's JSON, otherwise use as string
    if (data.startsWith("{")) {
        StaticJsonDocument<128> dataDoc;
        if (deserializeJson(dataDoc, data) == DeserializationError::Ok) {
            doc["data"] = dataDoc;
        } else {
            doc["data"] = data;
        }
    } else {
        doc["data"] = data;
    }
    
    String message;
    serializeJson(doc, message);
    
    bool success = webSocket.sendTXT(message);
    
    if (success) {
        Serial.println("📤 Message sent successfully: " + message);
    } else {
        Serial.println("❌ Failed to send message: " + message);
    }
}

void triggerGameHandler() {
    Serial.println("🎮 Perintah mulai diterima!");
    
    if (gameInProgress) {
        Serial.println("⚠️ Game sudah berjalan, mengabaikan trigger");
        return;
    }
    
    gameInProgress = true;
    startGameLogic();
}

//================================================================
// TROUBLESHOOTING FUNCTIONS
//================================================================

void testConnection() {
    Serial.println("\n🔧 CONNECTION DIAGNOSTIC TEST");
    Serial.println("==============================");
    
    // Test 1: WiFi Status
    Serial.print("WiFi Status: ");
    switch(WiFi.status()) {
        case WL_CONNECTED:
            Serial.println("✅ Connected");
            break;
        case WL_NO_SSID_AVAIL:
            Serial.println("❌ SSID not available");
            break;
        case WL_CONNECT_FAILED:
            Serial.println("❌ Connection failed");
            break;
        case WL_CONNECTION_LOST:
            Serial.println("❌ Connection lost");
            break;
        case WL_DISCONNECTED:
            Serial.println("❌ Disconnected");
            break;
        default:
            Serial.println("❓ Unknown status");
    }
    
    // Test 2: Network Info
    if (WiFi.status() == WL_CONNECTED) {
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
        Serial.print("Gateway: ");
        Serial.println(WiFi.gatewayIP());
        Serial.print("DNS: ");
        Serial.println(WiFi.dnsIP());
        Serial.print("Signal Strength: ");
        Serial.print(WiFi.RSSI());
        Serial.println(" dBm");
    }
    
    // Test 3: WebSocket Status
    Serial.print("WebSocket Connected: ");
    Serial.println(isConnected ? "✅ Yes" : "❌ No");
    Serial.print("Connection Attempts: ");
    Serial.println(connectionAttempts);
    
    Serial.println("==============================\n");
}

void tryAlternativeConnection() {
    Serial.println("🔄 Trying to reconnect WebSocket...");
    
    // Disconnect current WebSocket
    webSocket.disconnect();
    delay(2000);
    
    // Reconnect with same settings
    Serial.println("Attempting reconnection...");
    webSocket.begin(websocket_host, websocket_port, websocket_path);
    webSocket.onEvent(webSocketEvent);
    webSocket.enableHeartbeat(15000, 3000, 2);
    webSocket.setReconnectInterval(5000);
    
    delay(5000); // Wait for connection attempt
    
    if (!isConnected) {
        Serial.println("❌ Reconnection failed");
        Serial.println("🔧 Check server status and network connectivity");
    } else {
        Serial.println("✅ Reconnection successful!");
    }
}

//================================================================
// SIMON SAYS GAME LOGIC
//================================================================

void startGameLogic() {
    Serial.println("🎯 Memulai Simon Says Game Logic");
    
    // Reset variabel game
    turn = 0;
    seqL = 0;
    userInput = 0;
    userTurn = false;
    
    // Seed random generator
    randomSeed(analogRead(A0));
    
    // Mulai permainan
    nextTurn();
}

void nextTurn() {
    turn++;
    Serial.print("Turn ke-");
    Serial.println(turn);
    
    // Tambah warna baru ke urutan
    sequence[seqL] = random(0, 4);
    seqL++;
    
    // Tampilkan urutan kepada pemain
    showSequence();
    
    // Sekarang giliran user
    userTurn = true;
    userInput = 0;
    timer = millis();
    
    Serial.println("👤 Giliran pemain untuk memasukkan urutan");
}

void showSequence() {
    Serial.print("Menampilkan urutan: ");
    
    for (int i = 0; i < seqL; i++) {
        Serial.print(colors[sequence[i]]);
        Serial.print(" ");
        
        // Nyalakan LED
        digitalWrite(led[sequence[i]], HIGH);
        playTone(sequence[i]);
        delay(500);
        
        // Matikan LED
        digitalWrite(led[sequence[i]], LOW);
        delay(300);
    }
    
    Serial.println();
    Serial.println("Urutan selesai ditampilkan");
}

void checkUserInput() {
    if (!userTurn) return;
    
    // Check timeout (10 detik)
    if (millis() - timer > 10000) {
        Serial.println("❌ Timeout! Pemain terlalu lama");
        loss();
        return;
    }
    
    // Check button presses
    for (int i = 0; i < 4; i++) {
        if (digitalRead(button[i]) == LOW) {
            delay(50); // Debounce
            if (digitalRead(button[i]) == LOW) {
                handleButtonPress(i);
                
                // Wait for button release
                while (digitalRead(button[i]) == LOW) {
                    delay(10);
                }
            }
        }
    }
}

void handleButtonPress(int buttonIndex) {
    Serial.print("Button pressed: ");
    Serial.println(colors[buttonIndex]);
    
    // Visual feedback
    digitalWrite(led[buttonIndex], HIGH);
    playTone(buttonIndex);
    delay(200);
    digitalWrite(led[buttonIndex], LOW);
    
    // Check if correct
    if (buttonIndex == sequence[userInput]) {
        Serial.println("✅ Correct!");
        userInput++;
        
        // Reset timer untuk input berikutnya
        timer = millis();
        
        // Check if sequence complete
        if (userInput >= seqL) {
            Serial.println("🎉 Urutan completed!");
            userTurn = false;
            delay(1000);
            
            // Next turn
            nextTurn();
        }
    } else {
        Serial.println("❌ Wrong button! Game over.");
        loss();
    }
}

void loss() {
    Serial.print("💀 Game Over! Final Score: ");
    Serial.println(turn - 1);
    
    // Animasi kalah
    lossAnimation();
    
    // Kirim skor ke server
    submitScore(turn - 1);
    
    // Reset game state
    gameInProgress = false;
    turn = 0;
    seqL = 0;
    userInput = 0;
    userTurn = false;
    
    Serial.println("🔄 Game reset, waiting for next trigger...");
}

void lossAnimation() {
    Serial.println("Playing loss animation...");
    
    // Flash all LEDs 3 times
    for (int i = 0; i < 3; i++) {
        // All ON
        for (int j = 0; j < 4; j++) {
            digitalWrite(led[j], HIGH);
        }
        tone(buzzer, 200, 300);
        delay(300);
        
        // All OFF
        for (int j = 0; j < 4; j++) {
            digitalWrite(led[j], LOW);
        }
        delay(300);
    }
    
    // Final buzzer sound
    tone(buzzer, 100, 1000);
    delay(1000);
    noTone(buzzer);
}

void submitScore(int score) {
    Serial.print("📤 Mengirim skor: ");
    Serial.println(score);
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["score"] = score;
    
    String jsonBuffer;
    serializeJson(doc, jsonBuffer);
    
    // Send event to server with correct message type
    sendWebSocketMessage("score", jsonBuffer);
    
    Serial.print("Skor terkirim: ");
    Serial.println(jsonBuffer);
}

//================================================================
// HELPER FUNCTIONS
//================================================================

void playTone(int colorIndex) {
    int frequencies[] = {262, 330, 392, 523}; // C, E, G, C (oktaf tinggi)
    tone(buzzer, frequencies[colorIndex], 200);
}

//================================================================
// GAME LOOP UNTUK USER INPUT
//================================================================

// Custom loop untuk mengecek input user saat gameInProgress
void gameLoop() {
    if (gameInProgress && userTurn) {
        checkUserInput();
    }
} 