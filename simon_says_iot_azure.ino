/*
 * Simon Says IoT Game - ESP8266 Firmware (Azure Version)
 * Multi-WiFi Support: Personal WiFi (Secure) + Enterprise WiFi (Fallback)
 * Sends scores to Azure App Service via HTTPS
 * 
 * Security Features:
 * - Prioritizes personal WiFi (more secure)
 * - Fallback to enterprise WiFi if needed
 * - HTTPS communication with Azure server
 * 
 * Hardware Requirements:
 * - ESP8266 (NodeMCU/Wemos D1 Mini)
 * - 4 LEDs (Red, Green, Blue, Yellow)
 * - 4 Push Buttons
 * - 1 Buzzer
 * - Resistors for LEDs and pull-up for buttons
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>

// External declarations for WPA2 Enterprise
extern "C" {
#include "user_interface.h"
#include "wpa2_enterprise.h"
#include "c_types.h"
}

// ===== MULTI-WIFI CONFIGURATION =====
struct WiFiConfig {
  const char* ssid;
  const char* password;
  const char* username; // For enterprise networks
  bool isEnterprise;
  const char* description;
};

// Define multiple WiFi networks (priority order)
WiFiConfig wifiNetworks[] = {
  // PRIMARY: UGM Enterprise - Try with domain format
  {"UGM-Secure", "Alhamdulillah33kali", "fariddihannahdi@ugm.ac.id", true, "UGM Enterprise (Domain Format)"},
  
  // BACKUP: UGM Enterprise - Try without domain
  {"UGM-Secure", "Alhamdulillah33kali", "fariddihannahdi", true, "UGM Enterprise (Simple Format)"},
  
  // FALLBACK: Personal WiFi (for local testing)
  {"nahdii", "bismillah2", "", false, "Personal WiFi (Local Only)"}
};

const int numWiFiNetworks = sizeof(wifiNetworks) / sizeof(wifiNetworks[0]);
int currentWiFiIndex = -1;

// ===== AZURE SERVER CONFIGURATION =====
// Update this with your Azure App Service URL after deployment
const char* azureServerURL = "https://simon-says-leaderboard.azurewebsites.net";

// For local testing, you can temporarily use:
// const char* azureServerURL = "http://10.33.102.140:3000";

const char* playerName = "fariddihannahdi";    // Nama pemain

// ===== HARDWARE PIN DEFINITIONS =====
// LEDs
const int ledRed = D1;    // LED Merah
const int ledGreen = D2;  // LED Hijau
const int ledBlue = D3;   // LED Biru
const int ledYellow = D4; // LED Kuning

// Buttons
const int btnRed = D5;    // Tombol Merah
const int btnGreen = D6;  // Tombol Hijau
const int btnBlue = D7;   // Tombol Biru
const int btnYellow = D8; // Tombol Kuning

// Buzzer
const int buzzer = D0;

// ===== GAME VARIABLES =====
int sequence[100];        // Array untuk menyimpan urutan
int userSequence[100];    // Array untuk input user
int turn = 1;            // Turn saat ini
int level = 1;           // Level saat ini
int inputIndex = 0;      // Index input user
bool gameOver = false;   // Status game over
bool waitingForInput = false; // Status menunggu input

// ===== WIFI STATUS VARIABLES =====
bool wifiConnected = false;
unsigned long lastWifiCheck = 0;
const unsigned long wifiCheckInterval = 30000; // Check setiap 30 detik

// ===== WEB API VARIABLES =====
String currentPlayerName = "Guest";
bool gameStartTriggered = false;
bool waitingForWebTrigger = true;
unsigned long lastWebCheck = 0;
const unsigned long webCheckInterval = 2000; // Check setiap 2 detik

// ===== TIMING CONSTANTS =====
const int ledOnTime = 500;       // Durasi LED menyala (ms)
const int ledOffTime = 200;      // Durasi LED mati (ms)
const int inputTimeout = 5000;   // Timeout input user (ms)
const int buttonDebounceTime = 50; // Debounce untuk tombol

// ===== SOUND FREQUENCIES =====
const int soundRed = 220;      // A3
const int soundGreen = 277;    // C#4
const int soundBlue = 330;     // E4
const int soundYellow = 415;   // G#4
const int soundWin = 523;      // C5
const int soundLose = 147;     // D3

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("=== Simon Says IoT Game Starting (Azure Version) ===");
  Serial.println("=== Multi-WiFi Security Configuration ===");
  
  // Initialize hardware pins
  initializeHardware();
  
  // Connect to WiFi (tries multiple networks)
  connectToMultipleWiFi();
  
  // Generate random seed
  randomSeed(analogRead(A0));
  
  // Initialize for web-triggered mode
  waitingForWebTrigger = true;
  gameStartTriggered = false;
  
  Serial.println("🌐 WEB-TRIGGERED MODE ACTIVE (Azure)!");
  Serial.println("✅ Hardware ready!");
  Serial.println("💻 Go to your Azure web interface to start games");
  Serial.print("🔗 Azure Server: ");
  Serial.println(azureServerURL);
  
  playStartupSound();
}

void loop() {
  // Check WiFi connection periodically
  if (millis() - lastWifiCheck > wifiCheckInterval) {
    checkWiFiConnection();
    lastWifiCheck = millis();
  }
  
  // Check for web triggers periodically
  if (wifiConnected && millis() - lastWebCheck > webCheckInterval) {
    checkWebTrigger();
    lastWebCheck = millis();
  }
  
  if (waitingForWebTrigger) {
    // Waiting for web trigger to start game
    // Show idle status with blinking LED
    static unsigned long lastBlink = 0;
    static bool ledState = false;
    
    if (millis() - lastBlink > 1000) {
      ledState = !ledState;
      digitalWrite(ledBlue, ledState ? HIGH : LOW);
      lastBlink = millis();
      
      // Print status every 10 seconds
      static unsigned long lastStatus = 0;
      if (millis() - lastStatus > 10000) {
        Serial.println("🌐 Waiting for game start from Azure website...");
        Serial.println("💡 Go to your Azure web interface to start a new game!");
        lastStatus = millis();
      }
    }
  } else if (!gameOver) {
    digitalWrite(ledBlue, LOW); // Turn off waiting LED
    
    if (!waitingForInput) {
      // Show sequence to player
      showSequence();
      waitingForInput = true;
      inputIndex = 0;
    } else {
      // Wait for user input
      handleUserInput();
    }
  } else {
    // Game over - automatically reset for next web trigger
    digitalWrite(ledBlue, LOW);
    delay(3000); // Show game over for 3 seconds
    resetForNextGame();
  }
  
  delay(10); // Small delay to prevent excessive CPU usage
}

// [Rest of the functions remain the same, but with updated HTTP requests]

void initializeHardware() {
  // Setup LED pins as outputs
  pinMode(ledRed, OUTPUT);
  pinMode(ledGreen, OUTPUT);
  pinMode(ledBlue, OUTPUT);
  pinMode(ledYellow, OUTPUT);
  
  // Setup button pins as inputs with pull-up resistors
  pinMode(btnRed, INPUT_PULLUP);
  pinMode(btnGreen, INPUT_PULLUP);
  pinMode(btnBlue, INPUT_PULLUP);
  pinMode(btnYellow, INPUT_PULLUP);
  
  // Setup buzzer pin
  pinMode(buzzer, OUTPUT);
  
  // Turn off all LEDs initially
  digitalWrite(ledRed, LOW);
  digitalWrite(ledGreen, LOW);
  digitalWrite(ledBlue, LOW);
  digitalWrite(ledYellow, LOW);
  
  Serial.println("✅ Hardware pins initialized");
}

void connectToMultipleWiFi() {
  Serial.println("🔍 Scanning for available WiFi networks...");
  
  for (int i = 0; i < numWiFiNetworks; i++) {
    Serial.print("🔄 Trying ");
    Serial.print(wifiNetworks[i].description);
    Serial.print(" (");
    Serial.print(wifiNetworks[i].ssid);
    Serial.println(")");
    
    bool connected = false;
    
    if (wifiNetworks[i].isEnterprise) {
      connected = connectToEnterpriseWiFi(
        wifiNetworks[i].ssid,
        wifiNetworks[i].username,
        wifiNetworks[i].password
      );
    } else {
      connected = connectToPersonalWiFi(
        wifiNetworks[i].ssid,
        wifiNetworks[i].password
      );
    }
    
    if (connected) {
      currentWiFiIndex = i;
      wifiConnected = true;
      Serial.print("✅ Connected to: ");
      Serial.println(wifiNetworks[i].description);
      Serial.print("📡 IP Address: ");
      Serial.println(WiFi.localIP());
      return;
    } else {
      Serial.print("❌ Failed to connect to ");
      Serial.println(wifiNetworks[i].description);
    }
    
    delay(2000);
  }
  
  Serial.println("❌ Failed to connect to any WiFi network!");
  wifiConnected = false;
}

bool connectToPersonalWiFi(const char* ssid, const char* password) {
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  return WiFi.status() == WL_CONNECTED;
}

bool connectToEnterpriseWiFi(const char* ssid, const char* username, const char* password) {
  // Disconnect if already connected
  WiFi.disconnect();
  delay(1000);
  
  // Configure for WPA2 Enterprise
  wifi_station_set_enterprise_identity((uint8*)username, strlen(username));
  wifi_station_set_enterprise_username((uint8*)username, strlen(username));
  wifi_station_set_enterprise_password((uint8*)password, strlen(password));
  
  WiFi.begin(ssid);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  return WiFi.status() == WL_CONNECTED;
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️  WiFi connection lost! Attempting to reconnect...");
    wifiConnected = false;
    connectToMultipleWiFi();
  } else {
    wifiConnected = true;
  }
}

void checkWebTrigger() {
  if (!wifiConnected) {
    return;
  }
  
  WiFiClientSecure client;
  client.setInsecure(); // For testing - in production, use proper certificate validation
  
  HTTPClient http;
  
  String triggerURL = String(azureServerURL) + "/check-game-trigger";
  http.begin(client, triggerURL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("device-id", "ESP8266-" + WiFi.macAddress());
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    
    // Parse JSON response
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    
    bool startGame = doc["startGame"];
    
    if (startGame && waitingForWebTrigger) {
      String webPlayerName = doc["playerName"];
      currentPlayerName = webPlayerName;
      
      Serial.println("🎮 GAME START TRIGGERED FROM AZURE WEB!");
      Serial.print("👤 Player: ");
      Serial.println(currentPlayerName);
      
      // Start the game
      waitingForWebTrigger = false;
      gameStartTriggered = true;
      resetGame();
      
      // Visual feedback
      playStartGameSound();
      flashAllLeds();
    }
  } else {
    Serial.print("❌ HTTP Error checking trigger: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

void submitScore(int finalScore) {
  if (!wifiConnected) {
    Serial.println("❌ Cannot submit score - no WiFi connection");
    return;
  }
  
  Serial.println("📊 Submitting score to Azure server...");
  
  WiFiClientSecure client;
  client.setInsecure(); // For testing - in production, use proper certificate validation
  
  HTTPClient http;
  
  String submitURL = String(azureServerURL) + "/submit-score";
  http.begin(client, submitURL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("device-id", "ESP8266-" + WiFi.macAddress());
  
  // Create JSON payload
  DynamicJsonDocument doc(1024);
  doc["name"] = currentPlayerName;
  doc["score"] = finalScore;
  doc["network"] = (currentWiFiIndex >= 0) ? wifiNetworks[currentWiFiIndex].description : "Unknown";
  doc["deviceId"] = "ESP8266-" + WiFi.macAddress();
  doc["timestamp"] = millis();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.print("📤 Sending data: ");
  Serial.println(jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("✅ Server response (");
    Serial.print(httpResponseCode);
    Serial.print("): ");
    Serial.println(response);
    
    // Parse response to get leaderboard position
    DynamicJsonDocument responseDoc(1024);
    deserializeJson(responseDoc, response);
    
    if (responseDoc["success"]) {
      int position = responseDoc["position"];
      Serial.print("🏆 Leaderboard position: #");
      Serial.println(position);
      
      // Play success sound
      playSuccessSound();
    }
  } else {
    Serial.print("❌ HTTP Error: ");
    Serial.println(httpResponseCode);
    playErrorSound();
  }
  
  http.end();
}

// [Continue with other game functions - they remain largely the same]
// Adding key game functions here for completeness:

void resetGame() {
  turn = 1;
  level = 1;
  inputIndex = 0;
  gameOver = false;
  waitingForInput = false;
  
  // Generate first sequence
  for (int i = 0; i < 100; i++) {
    sequence[i] = random(1, 5);
  }
  
  Serial.println("🔄 Game reset - starting new game!");
}

void resetForNextGame() {
  waitingForWebTrigger = true;
  gameStartTriggered = false;
  currentPlayerName = "Guest";
  
  Serial.println("🌐 Ready for next web trigger...");
}

void showSequence() {
  Serial.print("🎯 Level ");
  Serial.print(level);
  Serial.print(" - Showing sequence of ");
  Serial.print(turn);
  Serial.println(" steps");
  
  delay(1000);
  
  for (int i = 0; i < turn; i++) {
    lightUpLED(sequence[i]);
    delay(ledOffTime);
  }
  
  Serial.println("👤 Your turn! Repeat the sequence...");
}

void lightUpLED(int color) {
  // Turn off all LEDs first
  digitalWrite(ledRed, LOW);
  digitalWrite(ledGreen, LOW);
  digitalWrite(ledBlue, LOW);
  digitalWrite(ledYellow, LOW);
  
  // Light up the specified LED and play sound
  switch(color) {
    case 1: // Red
      digitalWrite(ledRed, HIGH);
      tone(buzzer, soundRed, ledOnTime);
      break;
    case 2: // Green
      digitalWrite(ledGreen, HIGH);
      tone(buzzer, soundGreen, ledOnTime);
      break;
    case 3: // Blue
      digitalWrite(ledBlue, HIGH);
      tone(buzzer, soundBlue, ledOnTime);
      break;
    case 4: // Yellow
      digitalWrite(ledYellow, HIGH);
      tone(buzzer, soundYellow, ledOnTime);
      break;
  }
  
  delay(ledOnTime);
  
  // Turn off the LED
  digitalWrite(ledRed, LOW);
  digitalWrite(ledGreen, LOW);
  digitalWrite(ledBlue, LOW);
  digitalWrite(ledYellow, LOW);
}

void handleUserInput() {
  static unsigned long inputStartTime = 0;
  
  if (inputStartTime == 0) {
    inputStartTime = millis();
  }
  
  // Check for timeout
  if (millis() - inputStartTime > inputTimeout) {
    Serial.println("⏰ Input timeout!");
    gameOverSequence();
    return;
  }
  
  // Check button presses
  int buttonPressed = 0;
  
  if (digitalRead(btnRed) == LOW) {
    buttonPressed = 1;
  } else if (digitalRead(btnGreen) == LOW) {
    buttonPressed = 2;
  } else if (digitalRead(btnBlue) == LOW) {
    buttonPressed = 3;
  } else if (digitalRead(btnYellow) == LOW) {
    buttonPressed = 4;
  }
  
  if (buttonPressed > 0) {
    // Debounce
    delay(buttonDebounceTime);
    
    // Light up the pressed button
    lightUpLED(buttonPressed);
    
    // Check if correct
    if (buttonPressed == sequence[inputIndex]) {
      Serial.print("✅ Correct! Step ");
      Serial.print(inputIndex + 1);
      Serial.print("/");
      Serial.println(turn);
      
      inputIndex++;
      
      if (inputIndex >= turn) {
        // Completed this turn
        Serial.println("🎉 Turn completed!");
        
        turn++;
        level++;
        inputIndex = 0;
        waitingForInput = false;
        inputStartTime = 0;
        
        // Check if game is won (reached maximum level)
        if (turn > 20) {
          winGame();
        } else {
          delay(1000);
        }
      }
    } else {
      Serial.println("❌ Wrong sequence!");
      gameOverSequence();
    }
    
    // Wait for button release
    while (digitalRead(btnRed) == LOW || digitalRead(btnGreen) == LOW || 
           digitalRead(btnBlue) == LOW || digitalRead(btnYellow) == LOW) {
      delay(10);
    }
  }
}

void gameOverSequence() {
  gameOver = true;
  int finalScore = (level - 1) * 10;
  
  Serial.print("💀 GAME OVER! Final Score: ");
  Serial.println(finalScore);
  
  // Submit score to Azure server
  submitScore(finalScore);
  
  // Game over visual/audio feedback
  playGameOverSound();
  flashGameOverPattern();
}

void winGame() {
  gameOver = true;
  int finalScore = 200; // Bonus for completing all levels
  
  Serial.print("🏆 YOU WIN! Final Score: ");
  Serial.println(finalScore);
  
  // Submit score to Azure server
  submitScore(finalScore);
  
  // Win visual/audio feedback
  playWinSound();
  flashWinPattern();
}

// Sound and visual feedback functions
void playStartupSound() {
  tone(buzzer, 440, 200);
  delay(300);
  tone(buzzer, 523, 200);
  delay(300);
  tone(buzzer, 659, 200);
}

void playStartGameSound() {
  for (int i = 0; i < 3; i++) {
    tone(buzzer, 523, 100);
    delay(150);
  }
}

void playSuccessSound() {
  tone(buzzer, 659, 200);
  delay(250);
  tone(buzzer, 784, 200);
}

void playErrorSound() {
  tone(buzzer, 147, 500);
}

void playGameOverSound() {
  tone(buzzer, soundLose, 1000);
}

void playWinSound() {
  for (int i = 0; i < 5; i++) {
    tone(buzzer, soundWin, 200);
    delay(250);
  }
}

void flashAllLeds() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(ledRed, HIGH);
    digitalWrite(ledGreen, HIGH);
    digitalWrite(ledBlue, HIGH);
    digitalWrite(ledYellow, HIGH);
    delay(200);
    digitalWrite(ledRed, LOW);
    digitalWrite(ledGreen, LOW);
    digitalWrite(ledBlue, LOW);
    digitalWrite(ledYellow, LOW);
    delay(200);
  }
}

void flashGameOverPattern() {
  for (int i = 0; i < 5; i++) {
    digitalWrite(ledRed, HIGH);
    delay(100);
    digitalWrite(ledRed, LOW);
    delay(100);
  }
}

void flashWinPattern() {
  for (int i = 0; i < 10; i++) {
    digitalWrite(ledRed, HIGH);
    digitalWrite(ledGreen, HIGH);
    digitalWrite(ledBlue, HIGH);
    digitalWrite(ledYellow, HIGH);
    delay(100);
    digitalWrite(ledRed, LOW);
    digitalWrite(ledGreen, LOW);
    digitalWrite(ledBlue, LOW);
    digitalWrite(ledYellow, LOW);
    delay(100);
  }
} 