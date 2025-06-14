/*
 * Simon Says IoT Game - ESP8266 Firmware (Azure Version) - ENHANCED
 * Hardware-focused interactive gameplay with extended LED visibility
 * Sends scores to Azure App Service via HTTPS only at game completion
 * 
 * ENHANCEMENTS:
 * - Extended 1-second LED visibility for better user experience
 * - Hardware-interactive gameplay (no server delays during play)
 * - Server communication only at game end (not during sequences)
 * - Dynamic sequence generation per game
 * - Adaptive difficulty progression
 * - Optimized memory management
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>

// ===== WIFI CONFIGURATION =====
const char* ssid = "nahdii";
const char* password = "bismillah2";

// ===== AZURE SERVER CONFIGURATION =====
const char* azureServerURL = "https://simon-says-exhqaycwc6c0hveg.canadacentral-01.azurewebsites.net";
const char* playerName = "fariddihannahdi";

// ===== HARDWARE PIN DEFINITIONS =====
const int ledRed = D5;    
const int ledGreen = D6;  
const int ledBlue = D7;   
const int ledYellow = D8; 
const int btnRed = D1;    
const int btnGreen = D2;  
const int btnBlue = D3;   
const int btnYellow = D4; 
const int buzzer = D0;

// ===== IMPROVED GAME VARIABLES =====
int* sequence = nullptr;       // Dynamic sequence allocation
int* userInput = nullptr;      // User input buffer for local validation
int maxLevel = 20;            // Maximum level (configurable)
int turn = 1;                 // Current turn
int level = 1;                // Current level
int inputIndex = 0;           // Input index
bool gameOver = false;        // Game over status
bool waitingForInput = false; // Waiting for input status
bool sequenceDisplayComplete = false; // Flag for non-blocking sequence display
bool inputValidationComplete = false; // Flag for local input validation
bool gameSessionComplete = false; // Flag for sending final results to server
unsigned long gameStartTime = 0;  // For time-based scoring
unsigned long levelStartTime = 0; // For level timing

// ===== LOCAL VALIDATION VARIABLES =====
int finalLevel = 0;           // Final level reached
int finalScore = 0;           // Final score calculated
bool perfectGame = false;     // Perfect game flag

// ===== INPUT HANDLING VARIABLES =====
unsigned long inputStartTime = 0;  // Moved from static to global for proper reset
bool gameButtonPressed[4] = {false, false, false, false}; // Global button states

// ===== WIFI STATUS VARIABLES =====
bool wifiConnected = false;
unsigned long lastWifiCheck = 0;
const unsigned long wifiCheckInterval = 30000;

// ===== WEB API VARIABLES =====
String currentPlayerName = "Guest";
bool gameStartTriggered = false;
bool waitingForWebTrigger = true;
unsigned long lastWebCheck = 0;
const unsigned long webCheckInterval = 2000;

// ===== CONFIGURATION OPTIONS =====
#define DEBUG_MODE true              // Enable debug output and button testing
#define RUN_HARDWARE_TEST false      // Run hardware test on startup (DISABLED for better responsiveness)
#define ENABLE_BUTTON_DEBUG false    // Enable continuous button monitoring (can be noisy)

// ===== ADAPTIVE TIMING CONSTANTS (EXTENDED FOR BETTER VISIBILITY) =====
const int baseLedOnTime = 1000;     // Base LED duration (ms) - 1 second for better visibility
const int baseLedOffTime = 400;     // Base pause between LEDs (ms)
const int baseInputTimeout = 10000; // Base input timeout (ms) - increased for longer sequences
const int minLedOnTime = 800;       // Minimum LED duration (extended to 800ms minimum)
const int minLedOffTime = 300;      // Minimum pause (increased for visibility)
const int minInputTimeout = 4000;   // Minimum timeout
const int buttonDebounceTime = 50;  // Button debounce

// ===== SOUND FREQUENCIES (Updated) =====
#define NOTE_C3  131
#define NOTE_E4  330
#define NOTE_CS5 554
#define NOTE_E5  659
#define NOTE_B5  988
#define NOTE_G3  196

const int soundRed = NOTE_C3;      // Red button sound
const int soundGreen = NOTE_E4;    // Green button sound  
const int soundBlue = NOTE_CS5;    // Blue button sound
const int soundYellow = NOTE_E5;   // Yellow button sound
const int soundWin = NOTE_B5;      // Win sound
const int soundLose = NOTE_G3;     // Lose sound

// ===== HARDWARE ARRAYS FOR EASIER MANAGEMENT =====
int led[] = {D5, D6, D7, D8};           // LED pins
int button[] = {D1, D2, D3, D4};        // Button pins  
int buzzpin = D0;                       // Buzzer pin
int notes[] = {NOTE_C3, NOTE_E4, NOTE_CS5, NOTE_E5}; // Button notes

// ===== FUNCTION DECLARATIONS =====
void initializeHardware();
void connectToWiFi();
void checkWiFiConnection();
void checkWebTrigger();
void submitScore(int finalScore, bool isPerfectGame);
void resetGame();
void resetForNextGame();
void showSequence();
void lightUpLED(int color);
void handleUserInput();
void provideButttonFeedback(int buttonNumber);
void gameOverSequence();
void winGame();
void testAllHardware();
void runButtonTest();
void checkButtonsDebugMode();
void flashAllLeds();
void flashGameOverPattern();
void flashWinPattern();
void playStartupSound();
void playStartGameSound();
void playSuccessSound();
void playErrorSound();
void playGameOverSound();
void playWinSound();
void playNewRecordSound();
void generateNewSequence();
void handleContinuousButtonFeedback();
void lightUpLEDNonBlocking(int color, unsigned long startTime);
bool isSequenceDisplayComplete();
bool validateLocalSequence();
void localGameOver();
void localGameWin();
int calculateLedOnTime(int currentLevel);
int calculateLedOffTime(int currentLevel);
int calculateInputTimeout(int currentLevel);
int calculateScore(int completedLevel, unsigned long gameTime, bool perfectGame);

// ===== ADAPTIVE DIFFICULTY FUNCTIONS (EXTENDED VISIBILITY) =====
int calculateLedOnTime(int currentLevel) {
  // Very gentle decrease in LED time for better visibility - starts at 1 second
  int adaptiveTime = baseLedOnTime - (currentLevel * 10); // Only 10ms reduction per level
  return max(minLedOnTime, adaptiveTime); // Minimum 800ms, ensures good visibility
}

int calculateLedOffTime(int currentLevel) {
  // Very gentle decrease in pause time for better visibility
  int adaptiveTime = baseLedOffTime - (currentLevel * 5); // Only 5ms reduction per level
  return max(minLedOffTime, adaptiveTime); // Minimum 300ms pause between LEDs
}

int calculateInputTimeout(int currentLevel) {
  // Adjust timeout based on sequence length and difficulty
  int baseTimeout = baseInputTimeout + (currentLevel * 300); // More time for longer sequences
  int difficultyReduction = currentLevel * 200; // But less time per move as difficulty increases
  int finalTimeout = baseTimeout - difficultyReduction;
  return max(minInputTimeout + (currentLevel * 200), finalTimeout);
}

// ===== IMPROVED SCORING SYSTEM =====
int calculateScore(int completedLevel, unsigned long gameTime, bool perfectGame) {
  // Quadratic base score for better progression
  int baseScore = completedLevel * completedLevel * 5;
  
  // Time bonus (faster completion = higher score)
  int timeBonus = 0;
  if (gameTime > 0) {
    unsigned long expectedTime = completedLevel * 3000; // 3 seconds per level expected
    if (gameTime < expectedTime) {
      timeBonus = (expectedTime - gameTime) / 100; // Bonus for speed
    }
    timeBonus = max(0, min(timeBonus, completedLevel * 20)); // Cap the bonus
  }
  
  // Perfect game bonus (scaled to level achieved)
  int perfectBonus = perfectGame ? (completedLevel * 50) : 0;
  
  // Level milestone bonuses
  int milestoneBonus = 0;
  if (completedLevel >= 5) milestoneBonus += 50;
  if (completedLevel >= 10) milestoneBonus += 100;
  if (completedLevel >= 15) milestoneBonus += 200;
  if (completedLevel >= 20) milestoneBonus += 500;
  
  return baseScore + timeBonus + perfectBonus + milestoneBonus;
}

void generateNewSequence() {
  // Free existing sequence if allocated
  if (sequence != nullptr) {
    delete[] sequence;
  }
  
  // Allocate memory for new sequence
  sequence = new int[maxLevel];
  
  // Generate random sequence
  for (int i = 0; i < maxLevel; i++) {
    sequence[i] = random(1, 5);
  }
  
  Serial.println("🎲 New unique sequence generated!");
  Serial.print("First 10 moves: ");
  for (int i = 0; i < min(10, maxLevel); i++) {
    Serial.print(sequence[i]);
    if (i < min(9, maxLevel - 1)) Serial.print("-");
  }
    Serial.println();
}

// ===== LOCAL VALIDATION FUNCTIONS =====
bool validateLocalSequence() {
  Serial.println("💾 Validating sequence locally...");
  
  for (int i = 0; i < turn - 1; i++) { // turn-1 because turn was already incremented
    if (userInput[i] != sequence[i]) {
      Serial.print("❌ Validation failed at step ");
      Serial.print(i + 1);
      Serial.print(": expected ");
      Serial.print(sequence[i]);
      Serial.print(", got ");
      Serial.println(userInput[i]);
      return false;
    }
  }
  
  Serial.println("✅ Local sequence validation PASSED!");
  return true;
}

void localGameOver() {
  Serial.println("💀 === GAME OVER (LOCAL) ===");
  
  // Calculate final results locally
  unsigned long gameTime = millis() - gameStartTime;
  finalLevel = level - 1;
  finalScore = calculateScore(finalLevel, gameTime, false);
  perfectGame = false;
  
  Serial.print("🎯 Final Score: ");
  Serial.println(finalScore);
  Serial.print("📊 Level Reached: ");
  Serial.println(finalLevel);
  Serial.print("⏱️  Total Game Time: ");
  Serial.print(gameTime / 1000.0);
  Serial.println(" seconds");
  Serial.println("💾 Results saved locally - will sync to server!");
  
  // Mark game as complete for server sync
  gameOver = true;
  gameSessionComplete = true;
  
  // Play game over feedback
  playGameOverSound();
  flashGameOverPattern();
}

void localGameWin() {
  Serial.println("🏆 === PERFECT GAME! YOU WIN! (LOCAL) ===");
  
  // Calculate final results locally
  unsigned long gameTime = millis() - gameStartTime;
  finalLevel = maxLevel;
  finalScore = calculateScore(maxLevel, gameTime, true);
  perfectGame = true;
  
  Serial.print("🎯 Final Score: ");
  Serial.println(finalScore);
  Serial.print("📊 All Levels Completed: ");
  Serial.println(maxLevel);
  Serial.print("⏱️  Total Game Time: ");
  Serial.print(gameTime / 1000.0);
  Serial.println(" seconds");
  Serial.println("🎉 Perfect Game Bonus Applied!");
  Serial.println("💾 Results saved locally - will sync to server!");
  
  // Mark game as complete for server sync
  gameOver = true;
  gameSessionComplete = true;
  
  // Play win feedback
  playWinSound();
  flashWinPattern();
}

// ===== CONTINUOUS BUTTON FEEDBACK =====
void handleContinuousButtonFeedback() {
  static bool lastButtonState[4] = {false, false, false, false};
  
  // Ultra-fast button polling for continuous LED feedback
  for (int i = 0; i < 4; i++) {
    bool currentState = (digitalRead(button[i]) == LOW);
    
    // Always control LED based on current button state (OVERRIDE any other LED control)
    if (currentState) {
      // Button is pressed - turn on LED immediately
      digitalWrite(led[i], HIGH);
      
      // Only play sound on initial press (not continuous)
      if (!lastButtonState[i]) {
        tone(buzzpin, notes[i], 150);
        Serial.print("💡 Button ");
        Serial.print(i + 1);
        Serial.println(" pressed - LED ON");
      }
    } else {
      // Button is not pressed - turn off LED
      digitalWrite(led[i], LOW);
      
      // Only print message on release
      if (lastButtonState[i]) {
        Serial.print("⚫ Button ");
        Serial.print(i + 1);
        Serial.println(" released - LED OFF");
      }
    }
    
    lastButtonState[i] = currentState;
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("=== Simon Says IoT Game Starting (ENHANCED VERSION) ===");
  Serial.println("🚀 Enhanced with 1-second LED visibility and hardware-focused gameplay!");
  
  // Initialize hardware pins
  initializeHardware();
  
  // Start WiFi connection (NON-BLOCKING)
  Serial.println("🔄 Starting WiFi connection in background...");
  WiFi.begin(ssid, password);
  wifiConnected = false; // Will be checked in main loop
  
  // Generate random seed
  randomSeed(analogRead(A0) + millis());
  
  // Initialize for web-triggered mode
  waitingForWebTrigger = true;
  gameStartTriggered = false;
  
  Serial.println("WEB-TRIGGERED MODE ACTIVE (Azure Enhanced)!");
  Serial.println("Hardware ready with adaptive difficulty!");
  Serial.println("🎮 BUTTONS ARE RESPONSIVE IMMEDIATELY!");
  Serial.println("📶 WiFi connecting in background...");
  Serial.println("Go to your Azure web interface to start games");
  Serial.print("Azure Server: ");
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
  
  // ALWAYS handle button feedback - buttons turn on LEDs in ALL states
  handleContinuousButtonFeedback();
  
  if (waitingForWebTrigger) {
    // Waiting for web trigger to start game
    // Show idle status with blinking blue LED
    static unsigned long lastBlink = 0;
    static bool ledState = false;
    
    if (millis() - lastBlink > 1000) {
      ledState = !ledState;
      digitalWrite(led[2], ledState ? HIGH : LOW); // Blue LED (index 2)
      lastBlink = millis();
      
      // Print status every 10 seconds
      static unsigned long lastStatus = 0;
      if (millis() - lastStatus > 10000) {
        Serial.println("💤 Waiting for game start from Azure website...");
        Serial.println("🌐 Go to your Azure web interface to start a new game!");
        Serial.print("📊 Free Heap: ");
        Serial.print(ESP.getFreeHeap());
        Serial.println(" bytes");
        lastStatus = millis();
      }
    }
    
    // Debug mode: Check for any button presses while waiting
    if (ENABLE_BUTTON_DEBUG) {
      checkButtonsDebugMode();
    }
  } else if (!gameOver) {
    digitalWrite(led[2], LOW); // Turn off waiting LED (blue)
    
    if (!waitingForInput) {
      // Show sequence to player (non-blocking)
      static bool sequenceComplete = false;
      showSequence();
      
      // Check if sequence display is complete
      if (isSequenceDisplayComplete()) {
        waitingForInput = true;
        inputIndex = 0;
      }
    } else {
      // Wait for user input with ultra-fast response
      handleUserInput();
    }
  } else {
    // Game over - handle server sync and reset
    static unsigned long gameOverStartTime = 0;
    static bool serverSyncSent = false;
    digitalWrite(led[2], LOW); // Turn off blue LED
    
    if (gameOverStartTime == 0) {
      gameOverStartTime = millis();
      serverSyncSent = false;
    }
    
    // Send results to server (non-blocking attempt)
    if (!serverSyncSent && gameSessionComplete && wifiConnected) {
      Serial.println("📡 Syncing final results to Azure server...");
      submitScore(finalScore, perfectGame);
      serverSyncSent = true;
    }
    
    // Show server sync status
    static unsigned long lastSyncStatus = 0;
    if (millis() - lastSyncStatus > 2000) {
      if (!serverSyncSent && !wifiConnected) {
        Serial.println("⚠️  Waiting for WiFi to sync results...");
      } else if (serverSyncSent) {
        Serial.println("✅ Results synced! Game complete.");
      }
      lastSyncStatus = millis();
    }
    
    // Non-blocking 5-second delay - allow time for server sync
    if (millis() - gameOverStartTime > 5000) {
      resetForNextGame();
      gameOverStartTime = 0;
      serverSyncSent = false;
    }
  }
  
  // Minimal delay for ultra-responsive button handling
  if (waitingForInput) {
    delay(1); // Ultra-responsive during button interaction
  } else {
    delay(10); // Normal delay during other operations
  }
}

void initializeHardware() {
  Serial.println("🔧 Initializing hardware...");
  
  // Setup LED pins as outputs using array
  for (int i = 0; i < 4; i++) {
    pinMode(led[i], OUTPUT);
    digitalWrite(led[i], LOW); // Turn off initially
    Serial.print("LED ");
    Serial.print(i + 1);
    Serial.print(" (Pin D");
    Serial.print(led[i]);
    Serial.println(") initialized");
  }
  
  // Setup button pins as inputs with pull-up resistors using array
  for (int i = 0; i < 4; i++) {
    pinMode(button[i], INPUT_PULLUP);
    Serial.print("Button ");
    Serial.print(i + 1);
    Serial.print(" (Pin D");
    Serial.print(button[i]);
    Serial.println(") initialized with pull-up");
  }
  
  // Setup buzzer pin
  pinMode(buzzpin, OUTPUT);
  Serial.print("Buzzer (Pin D");
  Serial.print(buzzpin);
  Serial.println(") initialized");
  
  Serial.println("✅ Hardware pins initialized successfully");
  
  // Test all LEDs and buttons to verify hardware
  if (RUN_HARDWARE_TEST) {
    testAllHardware();
    
    // Offer button test mode
    if (DEBUG_MODE) {
      Serial.println();
      Serial.println("🛠️  === DEBUG OPTIONS ===");
      Serial.println("🔧 During the next 5 seconds, press and hold any button to enter test mode");
      Serial.println("🔧 Or wait to continue with normal operation");
      
      unsigned long testWaitStart = millis();
      bool enterTestMode = false;
      
      while (millis() - testWaitStart < 5000) {
        for (int i = 0; i < 4; i++) {
          if (digitalRead(button[i]) == LOW) {
            Serial.println("🧪 Entering button test mode...");
            enterTestMode = true;
            break;
          }
        }
        if (enterTestMode) break;
        delay(100);
      }
      
      if (enterTestMode) {
        runButtonTest();
        Serial.println("🔄 Continuing with normal operation after test...");
        delay(2000);
      } else {
        Serial.println("⏭️  Continuing with normal operation...");
      }
    }
  }
}

void testAllHardware() {
  Serial.println("🧪 Testing all hardware components...");
  
  // Test each LED and corresponding button
  String colors[] = {"RED", "GREEN", "BLUE", "YELLOW"};
  
  for (int i = 0; i < 4; i++) {
    Serial.print("Testing ");
    Serial.print(colors[i]);
    Serial.print(" LED (Pin D");
    Serial.print(led[i]);
    Serial.print(") and Button (Pin D");
    Serial.print(button[i]);
    Serial.println(")");
    
    // Turn on LED and play sound (FAST TEST - no delays)
    digitalWrite(led[i], HIGH);
    tone(buzzpin, notes[i], 100);
    delay(150); // Minimal delay for visibility
    digitalWrite(led[i], LOW);
    
    // Check button state
    bool buttonState = digitalRead(button[i]) == LOW;
    Serial.print("Button ");
    Serial.print(i + 1);
    Serial.print(" state: ");
    Serial.println(buttonState ? "PRESSED" : "NOT PRESSED");
  }
  
  // Test buzzer with a melody (FAST)
  Serial.println("🎵 Testing buzzer with melody...");
  for (int i = 0; i < 4; i++) {
    tone(buzzpin, notes[i], 50);
    delay(80); // Much faster
  }
  
  Serial.println("✅ Hardware test complete!");
  Serial.println("📌 If buttons don't work, check wiring and pull-up resistors");
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  // Disconnect any previous connection
  WiFi.disconnect();
  delay(1000);
  
  // Start connection
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  int maxAttempts = 60; // 60 attempts = 30 seconds (500ms each)
  
  Serial.println("Waiting for connection (this may take up to 30 seconds)...");
  
  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(500);
    Serial.print(".");
    attempts++;
    
    // Print progress every 10 attempts (5 seconds)
    if (attempts % 10 == 0) {
      Serial.print(" [");
      Serial.print(attempts * 500 / 1000);
      Serial.print("s] ");
    }
    
    // Try reconnecting every 20 attempts (10 seconds)
    if (attempts % 20 == 0 && attempts < maxAttempts) {
      Serial.println();
      Serial.println("Retrying connection...");
      WiFi.disconnect();
      delay(1000);
      WiFi.begin(ssid, password);
    }
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println();
    Serial.println("SUCCESS: Connected to WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("MAC Address: ");
    Serial.println(WiFi.macAddress());
    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    wifiConnected = false;
    Serial.println();
    Serial.println("ERROR: Failed to connect to WiFi after 30 seconds!");
    Serial.println("Please check:");
    Serial.println("- WiFi network name (SSID): nahdii");
    Serial.println("- WiFi password");
    Serial.println("- WiFi signal strength");
    Serial.println("- ESP8266 is within range");
  }
}

void checkWiFiConnection() {
  static bool firstConnection = true;
  
  if (WiFi.status() == WL_CONNECTED) {
    if (!wifiConnected || firstConnection) {
      // Just connected!
      wifiConnected = true;
      if (firstConnection) {
        Serial.println();
        Serial.println("✅ SUCCESS: Connected to WiFi!");
        Serial.print("📡 IP Address: ");
        Serial.println(WiFi.localIP());
        Serial.print("📶 Signal Strength: ");
        Serial.print(WiFi.RSSI());
        Serial.println(" dBm");
        firstConnection = false;
      } else {
        Serial.println("🔄 WiFi reconnected!");
      }
    }
  } else {
    if (wifiConnected) {
      Serial.println("⚠️  WiFi connection lost! Attempting to reconnect...");
      wifiConnected = false;
    }
    
    // Non-blocking reconnection attempt - just restart WiFi, don't wait
    static unsigned long lastReconnectAttempt = 0;
    if (millis() - lastReconnectAttempt > 5000) { // Try every 5 seconds
      WiFi.disconnect();
      WiFi.begin(ssid, password);
      Serial.println("🔄 WiFi reconnection attempt (non-blocking)...");
      lastReconnectAttempt = millis();
    }
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
      
      Serial.println("GAME START TRIGGERED FROM AZURE WEB!");
      Serial.print("Player: ");
      Serial.println(currentPlayerName);
      
      // Start the game
      waitingForWebTrigger = false;
      gameStartTriggered = true;
      gameStartTime = millis(); // Record game start time
      resetGame();
      
      // Visual feedback
      playStartGameSound();
      flashAllLeds();
    }
  } else {
    Serial.print("HTTP Error checking trigger: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

void submitScore(int finalScore, bool isPerfectGame) {
  if (!wifiConnected) {
    Serial.println("Cannot submit score - no WiFi connection");
    return;
  }
  
  Serial.println("📡 Submitting enhanced score data to Azure server...");
  
  WiFiClientSecure client;
  client.setInsecure(); // For testing - in production, use proper certificate validation
  
  HTTPClient http;
  
  String submitURL = String(azureServerURL) + "/submit-score";
  http.begin(client, submitURL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("device-id", "ESP8266-" + WiFi.macAddress());
  
  // Create enhanced JSON payload
  unsigned long gameTime = millis() - gameStartTime;
  DynamicJsonDocument doc(1536); // Increased size for enhanced data
  doc["name"] = currentPlayerName;
  doc["score"] = finalScore;
  doc["level"] = level - 1; // Completed level
  doc["gameTime"] = gameTime;
  doc["perfectGame"] = isPerfectGame;
  doc["network"] = ssid;
  doc["deviceId"] = "ESP8266-" + WiFi.macAddress();
  doc["timestamp"] = millis();
  
  // Add gameplay statistics
  doc["stats"]["maxLevel"] = maxLevel;
  doc["stats"]["gameVersion"] = "improved_v1.0";
  doc["stats"]["adaptiveDifficulty"] = true;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.print("📊 Sending enhanced data: ");
  Serial.println(jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("Server response (");
    Serial.print(httpResponseCode);
    Serial.print("): ");
    Serial.println(response);
    
    // Parse enhanced response
    DynamicJsonDocument responseDoc(1536);
    deserializeJson(responseDoc, response);
    
    if (responseDoc["success"]) {
      int position = responseDoc["position"];
      int personalBest = responseDoc["analytics"]["personalBest"];
      int gamesPlayed = responseDoc["analytics"]["gamesPlayed"];
      String improvement = responseDoc["analytics"]["improvement"];
      
      Serial.println("🏆 === GAME RESULTS ===");
      Serial.print("🎯 Final Score: ");
      Serial.println(finalScore);
      Serial.print("📈 Leaderboard Position: #");
      Serial.println(position);
      Serial.print("🥇 Personal Best: ");
      Serial.println(personalBest);
      Serial.print("🎮 Games Played: ");
      Serial.println(gamesPlayed);
      
      if (improvement == "new_record") {
        Serial.println("🎉 NEW PERSONAL RECORD! 🎉");
        playNewRecordSound();
      } else {
        Serial.println("👍 Score submitted successfully!");
        playSuccessSound();
      }
    }
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(httpResponseCode);
    playErrorSound();
  }
  
  http.end();
}

void resetGame() {
  turn = 1;
  level = 1;
  inputIndex = 0;
  gameOver = false;
  waitingForInput = false;
  inputValidationComplete = false;
  gameSessionComplete = false;
  levelStartTime = millis();
  
  // Reset input timing
  inputStartTime = 0;
  for (int i = 0; i < 4; i++) {
    gameButtonPressed[i] = false;
  }
  
  // Initialize user input buffer
  if (userInput != nullptr) {
    delete[] userInput;
  }
  userInput = new int[maxLevel];
  for (int i = 0; i < maxLevel; i++) {
    userInput[i] = 0;
  }
  
  // Turn off all LEDs
  for (int i = 0; i < 4; i++) {
    digitalWrite(led[i], LOW);
  }
  
  // Generate unique sequence for this game session
  generateNewSequence();
  
  Serial.println("🎮 Game reset - starting new game with LOCAL VALIDATION!");
  Serial.println("💾 User input buffer allocated!");
  Serial.println("📊 Enhanced scoring system active!");
  Serial.println("⚡ Adaptive difficulty enabled!");
  Serial.println("🚀 Ultra-responsive button handling enabled!");
}

void resetForNextGame() {
  // Clean up dynamic memory
  if (sequence != nullptr) {
    delete[] sequence;
    sequence = nullptr;
  }
  
  if (userInput != nullptr) {
    delete[] userInput;
    userInput = nullptr;
  }
  
  // Reset all game state variables
  waitingForWebTrigger = true;
  gameStartTriggered = false;
  gameSessionComplete = false;
  inputValidationComplete = false;
  currentPlayerName = "Guest";
  gameStartTime = 0;
  levelStartTime = 0;
  finalLevel = 0;
  finalScore = 0;
  perfectGame = false;
  
  // Reset input handling variables
  inputStartTime = 0;
  for (int i = 0; i < 4; i++) {
    gameButtonPressed[i] = false;
  }
  
  // Turn off all LEDs
  for (int i = 0; i < 4; i++) {
    digitalWrite(led[i], LOW);
  }
  
  Serial.println("🔄 Memory cleaned up and ready for next game!");
  Serial.println("💾 Local validation system reset!");
  Serial.println("💡 Go to Azure web interface to start a new game");
  Serial.println("🚀 Ultra-responsive button handling ready!");
  
  // Show available memory
  Serial.print("📊 Free Heap Memory: ");
  Serial.print(ESP.getFreeHeap());
  Serial.println(" bytes");
}

void showSequence() {
  static unsigned long sequenceStartTime = 0;
  static int currentStep = -1; // -1 = initial delay, 0+ = showing steps
  static unsigned long stepStartTime = 0;
  
  // Initialize sequence display
  if (sequenceStartTime == 0) {
    sequenceStartTime = millis();
    currentStep = -1;
    sequenceDisplayComplete = false; // Reset completion flag
    
    Serial.print("🎯 Level ");
    Serial.print(level);
    Serial.print(" - Showing sequence of ");
    Serial.print(turn);
    Serial.println(" steps");
    
    // Show adaptive timing info with extended visibility
    Serial.print("⏱️  LED Time: ");
    Serial.print(calculateLedOnTime(level));
    Serial.print("ms (1 second base), Pause: ");
    Serial.print(calculateLedOffTime(level));
    Serial.print("ms, Input Timeout: ");
    Serial.print(calculateInputTimeout(level));
    Serial.println("ms");
    
    // Show the sequence numbers for debugging
    Serial.print("Sequence: ");
    for (int i = 0; i < turn; i++) {
      Serial.print(sequence[i]);
      if (i < turn - 1) Serial.print("-");
    }
    Serial.println();
  }
  
  // Non-blocking initial delay
  if (currentStep == -1) {
    if (millis() - sequenceStartTime > 1000) {
      currentStep = 0;
      stepStartTime = millis();
    }
    return; // Still in initial delay, return to handle button feedback
  }
  
  // Show sequence steps with non-blocking delays
  if (currentStep < turn) {
    lightUpLEDNonBlocking(sequence[currentStep], stepStartTime);
    
    // Check if current step is complete
    if (millis() - stepStartTime > (calculateLedOnTime(level) + calculateLedOffTime(level))) {
      currentStep++;
      stepStartTime = millis();
    }
    return; // Still showing sequence, return to handle button feedback
  }
  
  // Sequence complete
  Serial.println("⏰ Your turn! Repeat the sequence...");
  levelStartTime = millis(); // Reset level timing for input phase
  
  // Mark sequence as complete and reset for next sequence
  sequenceDisplayComplete = true;
  sequenceStartTime = 0;
  currentStep = -1;
}

// Helper function to check if sequence display is complete
bool isSequenceDisplayComplete() {
  return sequenceDisplayComplete;
}

void lightUpLED(int color) {
  // Turn off all LEDs first
  for (int i = 0; i < 4; i++) {
    digitalWrite(led[i], LOW);
  }
  
  // Small delay to ensure LEDs are off
  delay(50);
  
  // Validate color input
  if (color < 1 || color > 4) {
    Serial.print("  -> Invalid color: ");
    Serial.println(color);
    return;
  }
  
  // Convert to 0-based index
  int ledIndex = color - 1;
  
  // Light up the specified LED and play sound
  String colors[] = {"RED", "GREEN", "BLUE", "YELLOW"};
  digitalWrite(led[ledIndex], HIGH);
  tone(buzzpin, notes[ledIndex], calculateLedOnTime(level));
  
  Serial.print("  -> Lighting ");
  Serial.print(colors[ledIndex]);
  Serial.print(" LED (Pin D");
  Serial.print(led[ledIndex]);
  Serial.print(") with note ");
  Serial.println(notes[ledIndex]);
  
  // Keep LED on for the specified duration
  delay(calculateLedOnTime(level));
  
  // Turn off all LEDs
  for (int i = 0; i < 4; i++) {
    digitalWrite(led[i], LOW);
  }
}

// Non-blocking version for sequence display
void lightUpLEDNonBlocking(int color, unsigned long startTime) {
  static int lastColor = 0;
  static bool ledOn = false;
  static bool soundPlayed = false;
  
  // Validate color input
  if (color < 1 || color > 4) {
    Serial.print("  -> Invalid color: ");
    Serial.println(color);
    return;
  }
  
  // New color - reset state
  if (color != lastColor) {
    lastColor = color;
    ledOn = false;
    soundPlayed = false;
    
    // Turn off all LEDs first (but only if not waiting for user input)
    if (!waitingForInput) {
      for (int i = 0; i < 4; i++) {
        digitalWrite(led[i], LOW);
      }
    }
  }
  
  unsigned long elapsed = millis() - startTime;
  int ledOnTime = calculateLedOnTime(level);
  
  // Turn on LED and play sound at start
  if (!ledOn && elapsed >= 50) { // 50ms delay to ensure LEDs are off
    int ledIndex = color - 1;
    String colors[] = {"RED", "GREEN", "BLUE", "YELLOW"};
    
    digitalWrite(led[ledIndex], HIGH);
    if (!soundPlayed) {
      tone(buzzpin, notes[ledIndex], ledOnTime);
      soundPlayed = true;
      
      Serial.print("  -> Lighting ");
      Serial.print(colors[ledIndex]);
      Serial.print(" LED (Pin D");
      Serial.print(led[ledIndex]);
      Serial.print(") with note ");
      Serial.println(notes[ledIndex]);
    }
    ledOn = true;
  }
  
  // Turn off LED after duration (but only if not waiting for user input)
  if (ledOn && elapsed >= (50 + ledOnTime)) {
    if (!waitingForInput) {
      for (int i = 0; i < 4; i++) {
        digitalWrite(led[i], LOW);
      }
    }
    ledOn = false;
  }
}

void handleUserInput() {
  // Initialize input timing on first call
  if (inputStartTime == 0) {
    inputStartTime = millis();
    int timeoutMs = calculateInputTimeout(level);
    Serial.print("⏰ Waiting for input (timeout in ");
    Serial.print(timeoutMs / 1000);
    Serial.println(" seconds)...");
    Serial.println("🎯 Enter your sequence now!");
    Serial.println("💾 Local validation enabled - immediate feedback!");
    
    // Debug timing information
    Serial.print("🔧 DEBUG - Current level: ");
    Serial.print(level);
    Serial.print(", Timeout: ");
    Serial.print(timeoutMs);
    Serial.print("ms, Started at: ");
    Serial.println(inputStartTime);
  }
  
  // Check for timeout with debug info
  unsigned long currentTime = millis();
  unsigned long elapsed = currentTime - inputStartTime;
  unsigned long timeoutLimit = calculateInputTimeout(level);
  
  // Show timeout countdown every 2 seconds for debugging
  static unsigned long lastCountdown = 0;
  if (millis() - lastCountdown > 2000) {
    Serial.print("⏳ Countdown: ");
    Serial.print((timeoutLimit - elapsed) / 1000);
    Serial.println(" seconds remaining...");
    lastCountdown = millis();
  }
  
  if (elapsed > timeoutLimit) {
    Serial.print("⏱️ Input timeout! Elapsed: ");
    Serial.print(elapsed);
    Serial.print("ms, Limit: ");
    Serial.print(timeoutLimit);
    Serial.println("ms");
    
    // Reset the input timer for next time
    inputStartTime = 0;
    localGameOver();
    return;
  }
  
  // Check for game input (button press detection for game logic)
  for (int i = 0; i < 4; i++) {
    bool currentButtonState = (digitalRead(button[i]) == LOW);
    
    // Detect button press (transition from not pressed to pressed) for game input
    if (currentButtonState && !gameButtonPressed[i]) {
      gameButtonPressed[i] = true;
      
      Serial.print("🎮 BUTTON DETECTED - Pin D");
      Serial.print(button[i]);
      Serial.print(" = ");
      Serial.println(currentButtonState ? "LOW (PRESSED)" : "HIGH (NOT PRESSED)");
      
      // Store input locally for validation
      userInput[inputIndex] = i + 1;
      
      // Play game input sound (different from continuous feedback)
      tone(buzzpin, notes[i], 200);
      
      Serial.print("💾 LOCAL INPUT - Button ");
      Serial.print(i + 1);
      Serial.print(" saved to memory [");
      Serial.print(inputIndex + 1);
      Serial.print("/");
      Serial.print(turn);
      Serial.println("]");
      
      // Immediate local validation
      if (userInput[inputIndex] == sequence[inputIndex]) {
        Serial.print("✅ CORRECT! Step ");
        Serial.print(inputIndex + 1);
        Serial.print("/");
        Serial.println(turn);
        
        inputIndex++;
        
        if (inputIndex >= turn) {
          // Completed this turn - validate entire sequence locally
          bool sequenceCorrect = validateLocalSequence();
          
          if (sequenceCorrect) {
            unsigned long levelTime = millis() - levelStartTime;
            Serial.print("🎉 LEVEL COMPLETED in ");
            Serial.print(levelTime);
            Serial.println("ms!");
            Serial.println("💾 Sequence validated locally - no server delay!");
            
            // Progress to next level
            turn++;
            level++;
            inputIndex = 0;
            waitingForInput = false;
            
            // Reset input variables for next level
            inputStartTime = 0;
            for (int j = 0; j < 4; j++) {
              gameButtonPressed[j] = false;
            }
            
            Serial.println("🔧 DEBUG - Input variables reset for next level");
            
            // Show current score progress (calculated locally)
            unsigned long gameTime = millis() - gameStartTime;
            int currentScore = calculateScore(level - 1, gameTime, false);
            Serial.print("📊 Current Score: ");
            Serial.println(currentScore);
            
            // Check if game is won (reached maximum level)
            if (turn > maxLevel) {
              localGameWin();
            }
            return;
          } else {
            Serial.println("❌ Sequence validation failed!");
            localGameOver();
            return;
          }
        }
      } else {
        Serial.print("❌ WRONG! Expected ");
        Serial.print(sequence[inputIndex]);
        Serial.print(", got ");
        Serial.println(i + 1);
        Serial.println("💾 Local validation - immediate feedback!");
        localGameOver();
        return;
      }
    }
    
    // Detect button release for game input tracking
    if (!currentButtonState && gameButtonPressed[i]) {
      gameButtonPressed[i] = false;
    }
  }
}

// New function to provide immediate button feedback
void provideButttonFeedback(int buttonNumber) {
  int ledIndex = buttonNumber - 1; // Convert to 0-based index
  
  // Turn on the corresponding LED immediately
  digitalWrite(led[ledIndex], HIGH);
  
  // Play the corresponding note
  tone(buzzpin, notes[ledIndex], 200);
  
  Serial.print("💡 LED ");
  Serial.print(buttonNumber);
  Serial.print(" ON, playing note ");
  Serial.println(notes[ledIndex]);
}

void gameOverSequence() {
  gameOver = true;
  unsigned long gameTime = millis() - gameStartTime;
  int finalScore = calculateScore(level - 1, gameTime, false);
  
  Serial.println("💀 === GAME OVER ===");
  Serial.print("🎯 Final Score: ");
  Serial.println(finalScore);
  Serial.print("📊 Level Reached: ");
  Serial.println(level - 1);
  Serial.print("⏱️  Total Game Time: ");
  Serial.print(gameTime / 1000.0);
  Serial.println(" seconds");
  
  // Submit score to Azure server
  submitScore(finalScore, false);
  
  // Game over visual/audio feedback
  playGameOverSound();
  flashGameOverPattern();
}

void winGame() {
  gameOver = true;
  unsigned long gameTime = millis() - gameStartTime;
  int finalScore = calculateScore(maxLevel, gameTime, true);
  
  Serial.println("🏆 === PERFECT GAME! YOU WIN! ===");
  Serial.print("🎯 Final Score: ");
  Serial.println(finalScore);
  Serial.print("📊 All Levels Completed: ");
  Serial.println(maxLevel);
  Serial.print("⏱️  Total Game Time: ");
  Serial.print(gameTime / 1000.0);
  Serial.println(" seconds");
  Serial.println("🎉 Perfect Game Bonus Applied!");
  
  // Submit score to Azure server
  submitScore(finalScore, true);
  
  // Win visual/audio feedback
  playWinSound();
  flashWinPattern();
}

// Sound and visual feedback functions (NON-BLOCKING)
void playStartupSound() {
  tone(buzzer, 440, 200); // Single tone, no delays
}

void playStartGameSound() {
  tone(buzzer, 523, 300); // Single longer tone instead of loop
}

void playSuccessSound() {
  tone(buzzer, 659, 300); // Single tone, no delays
}

void playErrorSound() {
  tone(buzzer, 147, 500);
}

void playGameOverSound() {
  tone(buzzer, soundLose, 1000);
}

void playWinSound() {
  tone(buzzer, soundWin, 500); // Single longer tone instead of loop
}

void playNewRecordSound() {
  // Special fanfare for new personal record (NON-BLOCKING)
  tone(buzzpin, 1047, 600); // Single high note celebration
}

// ===== DEBUG AND TESTING FUNCTIONS =====

void checkButtonsDebugMode() {
  static unsigned long lastDebugCheck = 0;
  
  // Check buttons every 100ms for debug feedback
  if (millis() - lastDebugCheck > 100) {
    bool anyButtonPressed = false;
    
    for (int i = 0; i < 4; i++) {
      bool buttonState = digitalRead(button[i]) == LOW;
      if (buttonState) {
        if (!anyButtonPressed) {
          Serial.println("🔧 DEBUG MODE - Button Detection:");
        }
        anyButtonPressed = true;
        
        Serial.print("  Button ");
        Serial.print(i + 1);
        Serial.print(" (Pin D");
        Serial.print(button[i]);
        Serial.println(") is PRESSED");
        
        // Provide immediate feedback (NO DELAY)
        digitalWrite(led[i], HIGH);
        tone(buzzpin, notes[i], 100);
        // No delay - LED will be turned off by continuous feedback
        digitalWrite(led[i], LOW);
      }
    }
    
    lastDebugCheck = millis();
  }
}

void runButtonTest() {
  Serial.println("🧪 === BUTTON TEST MODE ===");
  Serial.println("Press any button to test. Test will run for 30 seconds.");
  Serial.println("Each button press should light the corresponding LED and play a sound.");
  
  unsigned long testStartTime = millis();
  bool testButtonStates[4] = {false, false, false, false};
  
  while (millis() - testStartTime < 30000) { // 30 second test
    for (int i = 0; i < 4; i++) {
      bool currentState = digitalRead(button[i]) == LOW;
      
      // Detect button press (transition)
      if (currentState && !testButtonStates[i]) {
        testButtonStates[i] = true;
        
        Serial.print("✅ Button ");
        Serial.print(i + 1);
        Serial.println(" test PASSED!");
        
        // Light up LED and play sound (FAST)
        digitalWrite(led[i], HIGH);
        tone(buzzpin, notes[i], 100);
        delay(100); // Minimal delay
        digitalWrite(led[i], LOW);
      }
      
      // Detect button release
      if (!currentState && testButtonStates[i]) {
        testButtonStates[i] = false;
      }
    }
    
    delay(10);
  }
  
  Serial.println("🏁 Button test complete!");
  
  // Show test results
  bool allTestsPassed = true;
  for (int i = 0; i < 4; i++) {
    if (!testButtonStates[i]) {
      Serial.print("❌ Button ");
      Serial.print(i + 1);
      Serial.println(" was not tested");
      allTestsPassed = false;
    }
  }
  
  if (allTestsPassed) {
    Serial.println("🎉 All buttons working correctly!");
    flashAllLeds();
  } else {
    Serial.println("⚠️  Some buttons may have wiring issues. Check connections.");
  }
}

void flashAllLeds() {
  Serial.println("✨ Flashing all LEDs...");
  // Instant flash - NO BLOCKING DELAYS
  for (int j = 0; j < 4; j++) {
    digitalWrite(led[j], HIGH);
  }
  // LEDs will be turned off by continuous button feedback or next game state
}

void flashGameOverPattern() {
  Serial.println("😵 Game over LED pattern...");
  // Instant flash - NO BLOCKING DELAYS
  digitalWrite(led[0], HIGH); // Red LED for game over
  tone(buzzpin, NOTE_G3, 200);
  // LED will be turned off by continuous button feedback or next game state
}

void flashWinPattern() {
  Serial.println("🏆 Victory LED pattern...");
  // Instant flash - NO BLOCKING DELAYS  
  for (int j = 0; j < 4; j++) {
    digitalWrite(led[j], HIGH);
  }
  tone(buzzpin, NOTE_B5, 500);
  // LEDs will be turned off by continuous button feedback or next game state
} 