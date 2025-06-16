/*
 * Simon Says IoT - Complete Azure Integration
 * Full-featured IoT Simon Says game with Azure server communication
 * Upload this to ESP8266 via Arduino IDE for complete functionality
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

// ===== WIFI CONFIGURATION =====
const char* ssid = "Bapakmu Ijo";        // Your WiFi network name
const char* password = "irengputeh";      // Your WiFi password

// ===== SERVER CONFIGURATION =====
const char* serverURL = "https://simon-says-eqhqgycwcothveg.canadacentral-01.azurewebsites.net";

// ===== HARDWARE PINS =====
const int led[] = {D5, D6, D7, D8};      // Red, Green, Blue, Yellow LEDs
const int button[] = {D1, D2, D3, D4};   // Buttons 1-4
const int buzzpin = D0;                  // Buzzer pin

// ===== MUSICAL NOTES =====
#define NOTE_C3  131
#define NOTE_E4  330
#define NOTE_CS5 554
#define NOTE_E5  659
#define NOTE_B5  988
#define NOTE_G3  196
int notes[] = {NOTE_C3, NOTE_E4, NOTE_CS5, NOTE_E5};

// ===== GAME VARIABLES =====
int gameSequence[50];                    // Game sequence array
int userSequence[50];                    // User input sequence
int sequenceLength = 0;                  // Current sequence length
int userPosition = 0;                    // Current user position in sequence
int gameLevel = 1;                       // Current game level
bool gameActive = false;                 // Game state
bool waitingForUser = false;             // Waiting for user input
String playerName = "";                  // Current player name
unsigned long gameStartTime = 0;         // Game start timestamp
unsigned long levelStartTime = 0;        // Level start timestamp
bool perfectGame = true;                 // Perfect game tracker
int totalScore = 0;                      // Total game score

// ===== BUTTON DEBOUNCING =====
bool buttonPressed[4] = {false, false, false, false};
unsigned long lastButtonTime[4] = {0, 0, 0, 0};
const unsigned long debounceDelay = 200;

// ===== TIMING VARIABLES =====
unsigned long lastServerCheck = 0;
const unsigned long serverCheckInterval = 2000;  // Check server every 2 seconds
unsigned long userTimeout = 5000;               // 5 second timeout for user input
unsigned long lastUserAction = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== Simon Says IoT - Azure Edition ===");
  
  // Initialize hardware
  initializeHardware();
  
  // Test hardware
  testHardware();
  
  // Connect to WiFi
  connectWiFi();
  
  // Generate initial sequence
  randomSeed(analogRead(A0));
  
  Serial.println("✅ Setup complete!");
  Serial.println("🎮 Waiting for game trigger from web interface...");
  showReadyState();
}

void loop() {
  // Check for server game triggers
  if (WiFi.status() == WL_CONNECTED && !gameActive) {
    if (millis() - lastServerCheck > serverCheckInterval) {
      checkForGameTrigger();
      lastServerCheck = millis();
    }
  }
  
  // Handle active game
  if (gameActive) {
    handleGameLogic();
  }
  
  // Always handle button feedback
  handleButtonFeedback();
  
  delay(50);
}

void initializeHardware() {
  // Initialize LEDs
  for (int i = 0; i < 4; i++) {
    pinMode(led[i], OUTPUT);
    digitalWrite(led[i], LOW);
  }
  
  // Initialize buttons
  for (int i = 0; i < 4; i++) {
    pinMode(button[i], INPUT_PULLUP);
  }
  
  // Initialize buzzer
  pinMode(buzzpin, OUTPUT);
  
  Serial.println("🔧 Hardware initialized");
}

void testHardware() {
  Serial.println("🧪 Testing hardware...");
  
  // Test each LED and button
  for (int i = 0; i < 4; i++) {
    Serial.print("Testing LED ");
    Serial.print(i + 1);
    Serial.print(" and Button ");
    Serial.println(i + 1);
    
    digitalWrite(led[i], HIGH);
    tone(buzzpin, notes[i], 200);
    delay(200);
    digitalWrite(led[i], LOW);
    noTone(buzzpin);
    delay(100);
  }
  
  Serial.println("✅ Hardware test complete");
}

void connectWiFi() {
  Serial.print("🌐 Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
    
    // Visual feedback during connection
    digitalWrite(led[attempts % 4], HIGH);
    delay(100);
    digitalWrite(led[attempts % 4], LOW);
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.print("📱 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    
    // Success animation
    successAnimation();
  } else {
    Serial.println("\n❌ WiFi connection failed!");
    errorAnimation();
  }
}

void checkForGameTrigger() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  WiFiClientSecure client;
  client.setInsecure();  // Skip SSL verification for simplicity
  HTTPClient http;
  
  String url = String(serverURL) + "/check-game-trigger";
  http.begin(client, url);
  http.addHeader("device-id", "ESP8266-SimonSays");
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    Serial.print("📡 Server response: ");
    Serial.println(response);
    
    // Parse JSON response
    DynamicJsonDocument doc(512);
    deserializeJson(doc, response);
    
    if (doc["startGame"].as<bool>()) {
      playerName = doc["playerName"].as<String>();
      Serial.print("🎮 Game triggered for player: ");
      Serial.println(playerName);
      
      startNewGame();
    }
  } else if (httpCode > 0) {
    Serial.print("⚠️ HTTP Error: ");
    Serial.println(httpCode);
  }
  
  http.end();
}

void startNewGame() {
  Serial.println("🚀 Starting new Simon Says game!");
  
  // Reset game variables
  gameActive = true;
  gameLevel = 1;
  sequenceLength = 0;
  userPosition = 0;
  perfectGame = true;
  totalScore = 0;
  gameStartTime = millis();
  
  // Game start animation
  gameStartAnimation();
  
  // Start first level
  startNewLevel();
}

void startNewLevel() {
  Serial.print("🎯 Starting Level ");
  Serial.println(gameLevel);
  
  levelStartTime = millis();
  sequenceLength = gameLevel + 2;  // Level 1 = 3 steps, Level 2 = 4 steps, etc.
  userPosition = 0;
  waitingForUser = false;
  
  // Generate new sequence for this level
  generateSequence();
  
  // Show level number
  showLevelNumber(gameLevel);
  
  delay(1000);
  
  // Play the sequence
  playSequence();
  
  // Start waiting for user input
  waitingForUser = true;
  lastUserAction = millis();
  
  Serial.print("⏱️ Waiting for user input (");
  Serial.print(sequenceLength);
  Serial.println(" steps)...");
}

void generateSequence() {
  for (int i = 0; i < sequenceLength; i++) {
    gameSequence[i] = random(0, 4);
  }
  
  Serial.print("🎲 Generated sequence: ");
  for (int i = 0; i < sequenceLength; i++) {
    Serial.print(gameSequence[i]);
    Serial.print(" ");
  }
  Serial.println();
}

void playSequence() {
  Serial.println("🎵 Playing sequence...");
  
  for (int i = 0; i < sequenceLength; i++) {
    int ledIndex = gameSequence[i];
    
    // Light up LED and play sound
    digitalWrite(led[ledIndex], HIGH);
    tone(buzzpin, notes[ledIndex], 400);
    delay(400);
    
    // Turn off LED and sound
    digitalWrite(led[ledIndex], LOW);
    noTone(buzzpin);
    delay(250);
  }
  
  Serial.println("✅ Sequence played. Your turn!");
}

void handleGameLogic() {
  if (!waitingForUser) return;
  
  // Check for timeout
  if (millis() - lastUserAction > userTimeout) {
    Serial.println("⏰ Timeout! Game over.");
    gameOver(false);
    return;
  }
  
  // Check if user completed the sequence
  if (userPosition >= sequenceLength) {
    levelComplete();
  }
}

void handleButtonFeedback() {
  for (int i = 0; i < 4; i++) {
    bool currentState = digitalRead(button[i]) == LOW;
    unsigned long currentTime = millis();
    
    // Provide visual feedback for any button press
    digitalWrite(led[i], currentState ? HIGH : LOW);
    
    // Detect new button press with debouncing
    if (currentState && !buttonPressed[i] && 
        (currentTime - lastButtonTime[i] > debounceDelay)) {
      
      buttonPressed[i] = true;
      lastButtonTime[i] = currentTime;
      lastUserAction = currentTime;
      
      // Play sound feedback
      tone(buzzpin, notes[i], 200);
      
      Serial.print("🔘 Button ");
      Serial.print(i + 1);
      Serial.println(" pressed");
      
      // If game is active and waiting for user input
      if (gameActive && waitingForUser) {
        processUserInput(i);
      }
    }
    
    // Detect button release
    if (!currentState && buttonPressed[i]) {
      buttonPressed[i] = false;
      noTone(buzzpin);
    }
  }
}

void processUserInput(int buttonIndex) {
  userSequence[userPosition] = buttonIndex;
  
  Serial.print("✋ User input: ");
  Serial.print(buttonIndex);
  Serial.print(" (Expected: ");
  Serial.print(gameSequence[userPosition]);
  Serial.println(")");
  
  // Check if input matches sequence
  if (userSequence[userPosition] == gameSequence[userPosition]) {
    Serial.println("✅ Correct!");
    userPosition++;
    
    // Add score for correct input
    totalScore += 10 * gameLevel;
    
    // Flash LED to confirm correct input
    flashLED(buttonIndex, true);
    
  } else {
    Serial.println("❌ Wrong! Game over.");
    perfectGame = false;
    gameOver(false);
  }
}

void levelComplete() {
  Serial.print("🎉 Level ");
  Serial.print(gameLevel);
  Serial.println(" completed!");
  
  // Calculate level bonus
  unsigned long levelTime = millis() - levelStartTime;
  int timeBonus = max(0, (10000 - (int)levelTime) / 100);  // Bonus for fast completion
  totalScore += timeBonus + (gameLevel * 50);
  
  Serial.print("💯 Level score: ");
  Serial.print(timeBonus + (gameLevel * 50));
  Serial.print(", Total score: ");
  Serial.println(totalScore);
  
  // Success animation
  levelCompleteAnimation();
  
  gameLevel++;
  
  // Check if game should continue or end
  if (gameLevel > 10) {  // Maximum 10 levels
    gameOver(true);
  } else {
    delay(1000);
    startNewLevel();
  }
}

void gameOver(bool victory) {
  waitingForUser = false;
  
  if (victory) {
    Serial.println("🏆 VICTORY! All levels completed!");
    victoryAnimation();
    totalScore += 1000;  // Victory bonus
  } else {
    Serial.println("💀 GAME OVER!");
    gameOverAnimation();
  }
  
  // Calculate final statistics
  unsigned long totalGameTime = millis() - gameStartTime;
  
  Serial.println("\n📊 GAME STATISTICS:");
  Serial.print("Player: ");
  Serial.println(playerName);
  Serial.print("Final Score: ");
  Serial.println(totalScore);
  Serial.print("Levels Completed: ");
  Serial.println(gameLevel - 1);
  Serial.print("Total Time: ");
  Serial.print(totalGameTime / 1000);
  Serial.println(" seconds");
  Serial.print("Perfect Game: ");
  Serial.println(perfectGame ? "YES" : "NO");
  
  // Submit score to server
  submitScore();
  
  // Reset for next game
  gameActive = false;
  showReadyState();
}

void submitScore() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ No WiFi - cannot submit score");
    return;
  }
  
  Serial.println("📡 Submitting score to server...");
  
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  
  String url = String(serverURL) + "/submit-score";
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("device-id", "ESP8266-SimonSays");
  
  // Create JSON payload
  DynamicJsonDocument doc(512);
  doc["name"] = playerName;
  doc["score"] = totalScore;
  doc["level"] = gameLevel - 1;
  doc["gameTime"] = (millis() - gameStartTime) / 1000;
  doc["perfectGame"] = perfectGame;
  doc["network"] = WiFi.SSID();
  doc["deviceId"] = "ESP8266-SimonSays";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.print("📤 Sending: ");
  Serial.println(jsonString);
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("✅ Score submitted successfully!");
    Serial.print("📨 Server response: ");
    Serial.println(response);
    
    // Success feedback
    scoreSubmittedAnimation();
  } else {
    Serial.print("❌ Score submission failed. HTTP Code: ");
    Serial.println(httpCode);
    
    // Error feedback
    errorAnimation();
  }
  
  http.end();
}

// ===== ANIMATION FUNCTIONS =====

void showReadyState() {
  Serial.println("💤 Ready state - waiting for game trigger...");
  // Gentle breathing effect on all LEDs
  for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 4; j++) {
      digitalWrite(led[j], HIGH);
    }
    delay(100);
    for (int j = 0; j < 4; j++) {
      digitalWrite(led[j], LOW);
    }
    delay(100);
  }
}

void successAnimation() {
  for (int i = 0; i < 2; i++) {
    for (int j = 0; j < 4; j++) {
      digitalWrite(led[j], HIGH);
      tone(buzzpin, notes[j], 100);
      delay(100);
      digitalWrite(led[j], LOW);
      noTone(buzzpin);
    }
  }
}

void errorAnimation() {
  for (int i = 0; i < 4; i++) {
    digitalWrite(led[i], HIGH);
  }
  for (int i = 0; i < 3; i++) {
    tone(buzzpin, NOTE_B5, 200);
    delay(200);
    tone(buzzpin, NOTE_G3, 200);
    delay(200);
  }
  noTone(buzzpin);
  for (int i = 0; i < 4; i++) {
    digitalWrite(led[i], LOW);
  }
}

void gameStartAnimation() {
  Serial.println("🎬 Game start animation");
  for (int i = 0; i < 2; i++) {
    for (int j = 0; j < 4; j++) {
      digitalWrite(led[j], HIGH);
      tone(buzzpin, notes[j] * 2, 150);
      delay(150);
      digitalWrite(led[j], LOW);
      noTone(buzzpin);
    }
  }
}

void levelCompleteAnimation() {
  for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 4; j++) {
      digitalWrite(led[j], HIGH);
    }
    tone(buzzpin, NOTE_E5, 200);
    delay(200);
    for (int j = 0; j < 4; j++) {
      digitalWrite(led[j], LOW);
    }
    noTone(buzzpin);
    delay(100);
  }
}

void victoryAnimation() {
  for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 4; j++) {
      digitalWrite(led[j], HIGH);
      tone(buzzpin, notes[j] + 200, 100);
      delay(100);
      digitalWrite(led[j], LOW);
      noTone(buzzpin);
    }
  }
}

void gameOverAnimation() {
  // Flash all LEDs red-style
  for (int i = 0; i < 4; i++) {
    digitalWrite(led[i], HIGH);
  }
  for (int i = 0; i < 4; i++) {
    tone(buzzpin, NOTE_G3, 300);
    delay(300);
    noTone(buzzpin);
    delay(100);
  }
  for (int i = 0; i < 4; i++) {
    digitalWrite(led[i], LOW);
  }
}

void scoreSubmittedAnimation() {
  // Quick success flash
  for (int i = 0; i < 2; i++) {
    for (int j = 0; j < 4; j++) {
      digitalWrite(led[j], HIGH);
    }
    tone(buzzpin, NOTE_E5, 100);
    delay(100);
    for (int j = 0; j < 4; j++) {
      digitalWrite(led[j], LOW);
    }
    noTone(buzzpin);
    delay(100);
  }
}

void showLevelNumber(int level) {
  // Flash LEDs to show level number
  for (int i = 0; i < level && i < 4; i++) {
    digitalWrite(led[i], HIGH);
    tone(buzzpin, NOTE_C3 + (i * 100), 200);
    delay(200);
    digitalWrite(led[i], LOW);
    noTone(buzzpin);
    delay(100);
  }
}

void flashLED(int ledIndex, bool success) {
  if (success) {
    // Quick green-style flash for correct input
    digitalWrite(led[ledIndex], HIGH);
    tone(buzzpin, notes[ledIndex] + 100, 100);
    delay(100);
    digitalWrite(led[ledIndex], LOW);
    noTone(buzzpin);
  } else {
    // Red-style flash for incorrect input
    digitalWrite(led[ledIndex], HIGH);
    tone(buzzpin, NOTE_G3, 200);
    delay(200);
    digitalWrite(led[ledIndex], LOW);
    noTone(buzzpin);
  }
} 