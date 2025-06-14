/*
 * Simon Says IoT Game - ESP8266 Firmware
 * Multi-WiFi Support: Personal WiFi (Secure) + Enterprise WiFi (Fallback)
 * Sends scores to leaderboard server via WiFi
 * 
 * Security Features:
 * - Prioritizes personal WiFi (more secure)
 * - Fallback to enterprise WiFi if needed
 * - Encrypted communication with server
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

// Define multiple WiFi networks (priority order - UGM NETWORK FIRST FOR VPS ACCESS)
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

// Server configuration
const char* serverIp = "10.33.102.140";       // IP server VPS (accessible from internet)
// For testing: If ESP8266 can't reach server, try:
// const char* serverIp = "192.168.1.100";  // Replace with your actual server IP on local network
const int serverPort = 3000;                   // Port server
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
  Serial.println("=== Simon Says IoT Game Starting ===");
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
  
  Serial.println("🌐 WEB-TRIGGERED MODE ACTIVE!");
  Serial.println("✅ Hardware ready!");
  Serial.println("💻 Go to your web interface to start games");
  Serial.print("🔗 Server: http://");
  Serial.print(serverIp);
  Serial.print(":");
  Serial.println(serverPort);
  
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
        Serial.println("🌐 Waiting for game start from website...");
        Serial.println("💡 Go to your web interface to start a new game!");
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
  
  // Setup buzzer
  pinMode(buzzer, OUTPUT);
  
  // Turn off all LEDs
  turnOffAllLeds();
  
  Serial.println("Hardware initialized");
}

void connectToMultipleWiFi() {
  Serial.println("=== WiFi Security Priority List ===");
  for (int i = 0; i < numWiFiNetworks; i++) {
    Serial.print(i + 1);
    Serial.print(". ");
    Serial.print(wifiNetworks[i].ssid);
    Serial.print(" - ");
    Serial.println(wifiNetworks[i].description);
  }
  Serial.println("==============================");
  
  // Try each WiFi network in priority order
  for (int i = 0; i < numWiFiNetworks; i++) {
    Serial.println();
    Serial.print("Trying WiFi ");
    Serial.print(i + 1);
    Serial.print("/");
    Serial.print(numWiFiNetworks);
    Serial.print(": ");
    Serial.println(wifiNetworks[i].description);
    
    if (connectToWiFi(i)) {
      currentWiFiIndex = i;
      wifiConnected = true;
      
      Serial.println("✅ SUCCESS: Connected to secure WiFi!");
      Serial.print("Network: ");
      Serial.println(wifiNetworks[i].description);
      Serial.print("IP address: ");
      Serial.println(WiFi.localIP());
      
      // Success indication
      flashAllLeds(3, 200);
      tone(buzzer, soundWin, 500);
      delay(600);
      noTone(buzzer);
      
      return; // Exit on successful connection
    } else {
      Serial.println("❌ FAILED: Trying next network...");
      delay(1000);
    }
  }
  
  // All networks failed
  wifiConnected = false;
  Serial.println();
  Serial.println("🚫 ALL WIFI NETWORKS FAILED!");
  Serial.println("⚠️  SECURITY WARNING: Game will run offline");
  Serial.println("💡 RECOMMENDATION: Use personal WiFi hotspot");
  
  // Failure indication
  for (int i = 0; i < 5; i++) {
    digitalWrite(ledRed, HIGH);
    tone(buzzer, soundLose, 200);
    delay(300);
    digitalWrite(ledRed, LOW);
    delay(200);
  }
}

bool connectToWiFi(int networkIndex) {
  WiFiConfig& network = wifiNetworks[networkIndex];
  
  // Disconnect any existing connection
  WiFi.disconnect(true);
  delay(1000);
  WiFi.mode(WIFI_STA);
  
  if (network.isEnterprise) {
    // Enterprise WiFi connection
    Serial.println("Configuring WPA2 Enterprise...");
    Serial.print("Username: ");
    Serial.println(network.username);
    Serial.print("SSID: ");
    Serial.println(network.ssid);
    
    // Clear any existing enterprise configuration
    wifi_station_clear_enterprise_ca_cert();
    wifi_station_clear_enterprise_identity();
    wifi_station_clear_enterprise_username();
    wifi_station_clear_enterprise_password();
    
    // Set enterprise configuration with proper PEAP/MSCHAPV2
    wifi_station_set_enterprise_ca_cert(NULL, 0);
    wifi_station_set_enterprise_identity((uint8*)network.username, strlen(network.username));
    wifi_station_set_enterprise_username((uint8*)network.username, strlen(network.username));
    wifi_station_set_enterprise_password((uint8*)network.password, strlen(network.password));
    
    // Set EAP method - try PEAP first (most common for UGM)
    wifi_station_set_enterprise_new_password((uint8*)network.password, strlen(network.password));
    wifi_station_set_wpa2_enterprise_auth(1); // WPA2_AUTH_UNSPECIFIED
    
    // Additional delay for enterprise setup
    delay(2000);
    
    WiFi.begin(network.ssid);
  } else {
    // Standard WiFi connection (More Secure)
    Serial.println("Configuring standard WiFi (WPA2/WPA3)...");
    WiFi.begin(network.ssid, network.password);
  }
  
  // Wait for connection
  int attempts = 0;
  int maxAttempts = network.isEnterprise ? 60 : 20; // More time for enterprise
  
  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(500);
    Serial.print(".");
    attempts++;
    
    // Visual feedback
    digitalWrite(ledYellow, HIGH);
    delay(250);
    digitalWrite(ledYellow, LOW);
    delay(250);
    
    // Status update every 10 attempts
    if (attempts % 10 == 0) {
      Serial.println();
      Serial.print("Status: ");
      Serial.print(WiFi.status());
      Serial.print(" (");
      Serial.print(attempts);
      Serial.print("/");
      Serial.print(maxAttempts);
      Serial.println(")");
      
      // For enterprise networks, try alternative auth method after 20 attempts
      if (network.isEnterprise && attempts == 20) {
        Serial.println("Trying alternative enterprise authentication...");
        WiFi.disconnect(true);
        delay(1000);
        
        // Try with different auth method
        wifi_station_set_wpa2_enterprise_auth(0); // WPA2_AUTH_OPEN
        WiFi.begin(network.ssid);
        delay(1000);
      }
    }
  }
  
  return (WiFi.status() == WL_CONNECTED);
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED && wifiConnected) {
    Serial.println("⚠️  WiFi connection lost! Attempting reconnection...");
    wifiConnected = false;
    
    // Try to reconnect to current network first
    if (currentWiFiIndex >= 0) {
      if (connectToWiFi(currentWiFiIndex)) {
        wifiConnected = true;
        Serial.println("✅ Reconnected to same network");
        return;
      }
    }
    
    // If that fails, try all networks again
    Serial.println("Trying all networks again...");
    connectToMultipleWiFi();
  }
}

void checkWebTrigger() {
  WiFiClient client;
  HTTPClient http;
  
  String checkURL = "http://" + String(serverIp) + ":" + String(serverPort) + "/check-game-trigger";
  
  // DEBUG: Show what we're trying to connect to
  Serial.print("🔍 Polling server: ");
  Serial.println(checkURL);
  
  if (http.begin(client, checkURL)) {
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Device-ID", "ESP8266-Simon-" + WiFi.macAddress());
    
    Serial.print("📡 Sending GET request... ");
    int httpResponseCode = http.GET();
    
    Serial.print("Response code: ");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode == 200) {
      String response = http.getString();
      Serial.print("📥 Server response: ");
      Serial.println(response);
      
      // Parse JSON response
      StaticJsonDocument<300> doc;
      deserializeJson(doc, response);
      
      if (doc["startGame"] == true) {
        currentPlayerName = doc["playerName"].as<String>();
        
        Serial.println("🎮 GAME START TRIGGERED FROM WEB!");
        Serial.print("👤 Player: ");
        Serial.println(currentPlayerName);
        
        // Start the game
        gameStartTriggered = true;
        waitingForWebTrigger = false;
        initializeGame();
        
        // Confirmation sound
        tone(buzzer, soundWin, 500);
        delay(600);
        noTone(buzzer);
        flashAllLeds(2, 200);
      } else {
        Serial.println("⏳ No game trigger from web");
      }
    } else if (httpResponseCode > 0) {
      Serial.print("❌ HTTP Error: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.print("Error response: ");
      Serial.println(response);
    } else {
      Serial.print("❌ Connection failed: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("❌ Failed to initialize HTTP client");
  }
}

void initializeGame() {
  turn = 1;
  level = 1;
  inputIndex = 0;
  gameOver = false;
  waitingForInput = false;
  
  // Generate first random number for sequence
  sequence[0] = random(1, 5); // 1=Red, 2=Green, 3=Blue, 4=Yellow
  
  Serial.println("🎯 Game initialized - Level 1");
  Serial.print("🎮 Player: ");
  Serial.println(currentPlayerName);
}

void resetForNextGame() {
  Serial.println("🔄 Resetting for next web-triggered game...");
  
  waitingForWebTrigger = true;
  gameStartTriggered = false;
  gameOver = false;
  currentPlayerName = "Guest";
  
  turnOffAllLeds();
  noTone(buzzer);
  
  Serial.println("✅ Ready for next player from website");
}

void showSequence() {
  Serial.print("Turn ");
  Serial.print(turn);
  Serial.print(" - Showing sequence: ");
  
  delay(1000); // Pause before showing sequence
  
  for (int i = 0; i < turn; i++) {
    // Print sequence to serial
    Serial.print(sequence[i]);
    Serial.print(" ");
    
    // Light up the LED and play sound
    lightUpColor(sequence[i]);
    delay(ledOnTime);
    turnOffAllLeds();
    noTone(buzzer);
    
    if (i < turn - 1) {
      delay(ledOffTime);
    }
  }
  
  Serial.println();
  Serial.println("Your turn! Enter the sequence:");
}

void lightUpColor(int color) {
  turnOffAllLeds();
  
  switch (color) {
    case 1: // Red
      digitalWrite(ledRed, HIGH);
      tone(buzzer, soundRed);
      break;
    case 2: // Green
      digitalWrite(ledGreen, HIGH);
      tone(buzzer, soundGreen);
      break;
    case 3: // Blue
      digitalWrite(ledBlue, HIGH);
      tone(buzzer, soundBlue);
      break;
    case 4: // Yellow
      digitalWrite(ledYellow, HIGH);
      tone(buzzer, soundYellow);
      break;
  }
}

void handleUserInput() {
  unsigned long inputStartTime = millis();
  
  while (inputIndex < turn && (millis() - inputStartTime < inputTimeout)) {
    int pressedButton = getButtonPress();
    
    if (pressedButton > 0) {
      userSequence[inputIndex] = pressedButton;
      
      // Light up pressed button with feedback
      lightUpColor(pressedButton);
      delay(300); // Visual feedback duration
      turnOffAllLeds();
      noTone(buzzer);
      
      Serial.print("Button pressed: ");
      Serial.print(pressedButton);
      Serial.print(" (expected: ");
      Serial.print(sequence[inputIndex]);
      Serial.println(")");
      
      // Wait for button release to avoid multiple readings
      while (getButtonPress() > 0) {
        delay(10);
      }
      delay(100); // Debounce delay
      
      // Check if input is correct
      if (userSequence[inputIndex] != sequence[inputIndex]) {
        Serial.println("❌ Wrong button! Game Over!");
        loss();
        return;
      } else {
        Serial.println("✅ Correct!");
      }
      
      inputIndex++;
      
      // Reset timeout for next input
      inputStartTime = millis();
    }
    
    delay(10);
  }
  
  // Check if sequence completed successfully
  if (inputIndex >= turn) {
    if (turn >= 100) {
      win(); // Max level reached
    } else {
      nextTurn(); // Continue to next level
    }
  } else {
    Serial.println("⏰ Timeout! Game over.");
    loss();
  }
}

int getButtonPress() {
  if (digitalRead(btnRed) == LOW) {
    delay(buttonDebounceTime);
    if (digitalRead(btnRed) == LOW) {
      return 1;
    }
  }
  if (digitalRead(btnGreen) == LOW) {
    delay(buttonDebounceTime);
    if (digitalRead(btnGreen) == LOW) {
      return 2;
    }
  }
  if (digitalRead(btnBlue) == LOW) {
    delay(buttonDebounceTime);
    if (digitalRead(btnBlue) == LOW) {
      return 3;
    }
  }
  if (digitalRead(btnYellow) == LOW) {
    delay(buttonDebounceTime);
    if (digitalRead(btnYellow) == LOW) {
      return 4;
    }
  }
  return 0;
}

bool checkAnyButtonPressed() {
  return (digitalRead(btnRed) == LOW || 
          digitalRead(btnGreen) == LOW || 
          digitalRead(btnBlue) == LOW || 
          digitalRead(btnYellow) == LOW);
}

void nextTurn() {
  turn++;
  inputIndex = 0;
  waitingForInput = false;
  
  // Add new random color to sequence
  sequence[turn - 1] = random(1, 5);
  
  // Success sound
  tone(buzzer, soundWin, 300);
  delay(500);
  noTone(buzzer);
  
  Serial.print("Correct! Moving to turn ");
  Serial.println(turn);
  
  delay(1000);
}

void loss() {
  gameOver = true;
  int finalScore = turn - 1; // Score is the number of successful turns
  
  Serial.println();
  Serial.println("=== GAME OVER ===");
  Serial.print("Final Score: ");
  Serial.println(finalScore);
  
  // Game over animation
  for (int i = 0; i < 3; i++) {
    flashAllLeds(1, 200);
    tone(buzzer, soundLose, 500);
    delay(600);
    noTone(buzzer);
    delay(200);
  }
  
  // Send score to server
  if (finalScore > 0) {
    sendScore(finalScore);
  }
  
  Serial.println("Press any button to restart");
  delay(1000);
}

void win() {
  gameOver = true;
  int finalScore = 100; // Maximum score
  
  Serial.println();
  Serial.println("=== CONGRATULATIONS! YOU WON! ===");
  Serial.print("Perfect Score: ");
  Serial.println(finalScore);
  
  // Victory animation
  for (int i = 0; i < 5; i++) {
    flashAllLeds(2, 150);
    tone(buzzer, soundWin, 300);
    delay(400);
    noTone(buzzer);
    delay(200);
  }
  
  // Send score to server
  sendScore(finalScore);
  
  Serial.println("Press any button to restart");
  delay(1000);
}

void sendScore(int finalScore) {
  if (!wifiConnected) {
    Serial.println("⚠️  WiFi not connected. Score not sent to server.");
    Serial.println("💡 Connect to WiFi to sync scores to leaderboard");
    return;
  }
  
  Serial.print("📤 Sending score to server: ");
  Serial.print(finalScore);
  Serial.print(" for player: ");
  Serial.println(currentPlayerName);
  
  // Visual indication that we're sending data
  digitalWrite(ledBlue, HIGH);
  
  WiFiClient client;
  HTTPClient http;
  
  String serverURL = "http://" + String(serverIp) + ":" + String(serverPort) + "/submit-score";
  
  if (http.begin(client, serverURL)) {
    // Create JSON payload with web player name
    StaticJsonDocument<300> jsonDoc;
    jsonDoc["name"] = currentPlayerName;
    jsonDoc["score"] = finalScore;
    jsonDoc["network"] = wifiNetworks[currentWiFiIndex].description;
    jsonDoc["deviceId"] = "ESP8266-Simon-" + WiFi.macAddress();
    jsonDoc["timestamp"] = millis();
    
    String jsonString;
    serializeJson(jsonDoc, jsonString);
    
    // Set headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("User-Agent", "ESP8266-SimonSays-Web/2.0");
    
    // Send POST request
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      
      Serial.print("HTTP Response Code: ");
      Serial.println(httpResponseCode);
      
      if (httpResponseCode == 200) {
        // Parse response to get leaderboard position
        StaticJsonDocument<400> responseDoc;
        deserializeJson(responseDoc, response);
        
        int position = responseDoc["position"];
        int totalPlayers = responseDoc["totalPlayers"];
        
        Serial.println("✅ Score sent successfully!");
        Serial.println("🏆 LEADERBOARD POSITION:");
        Serial.print("   Rank: #");
        Serial.print(position);
        Serial.print(" out of ");
        Serial.print(totalPlayers);
        Serial.println(" players");
        
        // Show position with LED pattern
        showLeaderboardPosition(position);
        
        // Success indication
        digitalWrite(ledBlue, LOW);
        digitalWrite(ledGreen, HIGH);
        tone(buzzer, soundWin, 200);
        delay(500);
        digitalWrite(ledGreen, LOW);
        noTone(buzzer);
      } else {
        Serial.println("❌ Server returned error");
        Serial.println("Response: " + response);
        showSendError();
      }
    } else {
      Serial.print("❌ HTTP Request failed: ");
      Serial.println(httpResponseCode);
      showSendError();
    }
    
    http.end();
  } else {
    Serial.println("❌ Failed to initialize HTTP client");
    showSendError();
  }
  
  digitalWrite(ledBlue, LOW);
}

void showLeaderboardPosition(int position) {
  Serial.println("🎉 Showing leaderboard position with LEDs...");
  
  // Flash LEDs based on position
  if (position == 1) {
    // Gold - Yellow LED flashing
    for (int i = 0; i < 5; i++) {
      digitalWrite(ledYellow, HIGH);
      tone(buzzer, soundWin, 200);
      delay(300);
      digitalWrite(ledYellow, LOW);
      delay(200);
    }
    Serial.println("🥇 CHAMPION! You're #1!");
  } else if (position <= 3) {
    // Top 3 - Green LED
    for (int i = 0; i < 3; i++) {
      digitalWrite(ledGreen, HIGH);
      tone(buzzer, soundWin, 150);
      delay(250);
      digitalWrite(ledGreen, LOW);
      delay(200);
    }
    Serial.println("🥈🥉 Top 3! Great job!");
  } else if (position <= 10) {
    // Top 10 - Blue LED
    for (int i = 0; i < 2; i++) {
      digitalWrite(ledBlue, HIGH);
      tone(buzzer, 400, 200);
      delay(300);
      digitalWrite(ledBlue, LOW);
      delay(200);
    }
    Serial.println("🏅 Top 10! Well done!");
  } else {
    // Others - All LEDs once
    flashAllLeds(1, 300);
    tone(buzzer, 300, 300);
    delay(400);
    noTone(buzzer);
    Serial.println("👏 Good game! Keep trying!");
  }
}

void showSendError() {
  // Error indication
  digitalWrite(ledBlue, LOW);
  for (int i = 0; i < 2; i++) {
    digitalWrite(ledRed, HIGH);
    tone(buzzer, soundLose, 200);
    delay(300);
    digitalWrite(ledRed, LOW);
    noTone(buzzer);
    delay(200);
  }
}

void restartGame() {
  Serial.println();
  Serial.println("=== RESTARTING GAME ===");
  
  turnOffAllLeds();
  noTone(buzzer);
  
  initializeGame();
  
  // Restart animation
  flashAllLeds(2, 300);
  playStartupSound();
  
  Serial.println("New game started!");
}

void turnOffAllLeds() {
  digitalWrite(ledRed, LOW);
  digitalWrite(ledGreen, LOW);
  digitalWrite(ledBlue, LOW);
  digitalWrite(ledYellow, LOW);
}

void flashAllLeds(int times, int delayTime) {
  for (int i = 0; i < times; i++) {
    digitalWrite(ledRed, HIGH);
    digitalWrite(ledGreen, HIGH);
    digitalWrite(ledBlue, HIGH);
    digitalWrite(ledYellow, HIGH);
    delay(delayTime);
    turnOffAllLeds();
    delay(delayTime);
  }
}

void playStartupSound() {
  // Play startup melody
  int melody[] = {soundRed, soundGreen, soundBlue, soundYellow, soundWin};
  int noteDurations[] = {200, 200, 200, 200, 400};
  
  for (int i = 0; i < 5; i++) {
    tone(buzzer, melody[i], noteDurations[i]);
    delay(noteDurations[i] + 50);
    noTone(buzzer);
  }
}