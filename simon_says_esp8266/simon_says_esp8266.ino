//================================================================
// Simon Says IoT - ESP8266 Hardware Component
// Dengan WebSocket Client untuk komunikasi real-time
//================================================================

#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

//================================================================
// KONFIGURASI (PALING ATAS)
//================================================================

// Kredensial Wi-Fi
const char* ssid = "Bapakmu Ijo";
const char* password = "irengputeh";

// Konfigurasi Server Azure
const char* websocket_host = "simon-says-exhqaycwc6c0hveg.canadacentral-01.azurewebsites.net";
const uint16_t websocket_port = 80;
const char* websocket_path = "/socket.io/?EIO=4&transport=websocket";

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
    Serial.begin(9600);
    Serial.println("=== Simon Says IoT Hardware ===");
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
}

//================================================================
// MAIN LOOP
//================================================================

void loop() {
    // WebSocket loop tetap berjalan
    webSocket.loop();
    
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
    Serial.print("Connecting to WiFi");
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println();
    Serial.print("✅ WiFi connected! IP: ");
    Serial.println(WiFi.localIP());
}

void setupWebSocket() {
    // server address, port and URL
    webSocket.begin(websocket_host, websocket_port, websocket_path);
    
    // event handler
    webSocket.onEvent(webSocketEvent);
    
    // use HTTP Basic Authorization this is optional remove if not needed
    // webSocket.setAuthorization("user", "Password");
    
    // try ever 5000 again if connection has failed
    webSocket.setReconnectInterval(5000);
    
    Serial.println("✅ WebSocket setup complete");
}

void testAllLeds() {
    Serial.println("Testing all LEDs...");
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
// WEBSOCKET EVENT HANDLERS
//================================================================

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[WSc] Disconnected!\n");
            isConnected = false;
            break;
            
        case WStype_CONNECTED:
            Serial.printf("[WSc] Connected to: %s\n", payload);
            isConnected = true;
            
            // Send connection message
            sendWebSocketMessage("hardware:connected", "{}");
            break;
            
        case WStype_TEXT:
            Serial.printf("[WSc] get text: %s\n", payload);
            handleWebSocketMessage((char*)payload);
            break;
            
        case WStype_BIN:
            Serial.printf("[WSc] get binary length: %u\n", length);
            break;
            
        case WStype_ERROR:
        case WStype_FRAGMENT_TEXT_START:
        case WStype_FRAGMENT_BIN_START:
        case WStype_FRAGMENT:
        case WStype_FRAGMENT_FIN:
            break;
    }
}

void handleWebSocketMessage(String message) {
    Serial.println("📨 Pesan diterima: " + message);
    
    // Parse Socket.IO message format
    if (message.startsWith("42")) {
        // Remove Socket.IO prefix
        String jsonStr = message.substring(2);
        
        StaticJsonDocument<512> doc;
        deserializeJson(doc, jsonStr);
        
        if (doc.is<JsonArray>()) {
            JsonArray arr = doc.as<JsonArray>();
            if (arr.size() >= 1) {
                String eventName = arr[0].as<String>();
                
                if (eventName == "server:trigger-game") {
                    triggerGameHandler();
                }
            }
        }
    }
}

void sendWebSocketMessage(String eventName, String data) {
    if (!isConnected) {
        Serial.println("⚠️ WebSocket not connected, cannot send message");
        return;
    }
    
    // Socket.IO format: 42["event_name", data]
    String message = "42[\"" + eventName + "\"," + data + "]";
    webSocket.sendTXT(message);
    
    Serial.println("📤 Mengirim: " + message);
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
    
    // Send event to server
    sendWebSocketMessage("hardware:submit-score", jsonBuffer);
    
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