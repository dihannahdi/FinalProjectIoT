/*
 * Simon Says IoT Game - ESP8266 Firmware (Azure Version) - IMPROVED
 * Enhanced with better game logic, adaptive difficulty, and optimized memory
 * Sends scores to Azure App Service via HTTPS
 * 
 * IMPROVEMENTS:
 * - Dynamic sequence generation per game
 * - Adaptive difficulty progression
 * - Balanced scoring system
 * - Memory optimization
 * - Better timing algorithms
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
int maxLevel = 20;            // Maximum level (configurable)
int turn = 1;                 // Current turn
int level = 1;                // Current level
int inputIndex = 0;           // Input index
bool gameOver = false;        // Game over status
bool waitingForInput = false; // Waiting for input status
unsigned long gameStartTime = 0;  // For time-based scoring
unsigned long levelStartTime = 0; // For level timing

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

// ===== ADAPTIVE TIMING CONSTANTS =====
const int baseLedOnTime = 800;      // Base LED duration (ms)
const int baseLedOffTime = 300;     // Base pause between LEDs (ms)
const int baseInputTimeout = 8000;  // Base input timeout (ms)
const int minLedOnTime = 200;       // Minimum LED duration
const int minLedOffTime = 100;      // Minimum pause
const int minInputTimeout = 3000;   // Minimum timeout
const int buttonDebounceTime = 50;  // Button debounce

// ===== SOUND FREQUENCIES =====
const int soundRed = 220;      // A3
const int soundGreen = 277;    // C#4
const int soundBlue = 330;     // E4
const int soundYellow = 415;   // G#4
const int soundWin = 523;      // C5
const int soundLose = 147;     // D3

// ===== ADAPTIVE DIFFICULTY FUNCTIONS =====
int calculateLedOnTime(int currentLevel) {
  // Decrease LED time as level increases (adaptive difficulty)
  int adaptiveTime = baseLedOnTime - (currentLevel * 30);
  return max(minLedOnTime, adaptiveTime);
}

int calculateLedOffTime(int currentLevel) {
  // Decrease pause time as level increases
  int adaptiveTime = baseLedOffTime - (currentLevel * 15);
  return max(minLedOffTime, adaptiveTime);
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

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("=== Simon Says IoT Game Starting (IMPROVED VERSION) ===");
  Serial.println("🚀 Enhanced with adaptive difficulty and better scoring!");
  
  // Initialize hardware pins
  initializeHardware();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Generate random seed
  randomSeed(analogRead(A0) + millis());
  
  // Initialize for web-triggered mode
  waitingForWebTrigger = true;
  gameStartTriggered = false;
  
  Serial.println("WEB-TRIGGERED MODE ACTIVE (Azure Enhanced)!");
  Serial.println("Hardware ready with adaptive difficulty!");
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
        Serial.println("Waiting for game start from Azure website...");
        Serial.println("Go to your Azure web interface to start a new game!");
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
  
  // Setup buzzer pin
  pinMode(buzzer, OUTPUT);
  
  // Turn off all LEDs initially
  digitalWrite(ledRed, LOW);
  digitalWrite(ledGreen, LOW);
  digitalWrite(ledBlue, LOW);
  digitalWrite(ledYellow, LOW);
  
  Serial.println("Hardware pins initialized");
  
  // Test all LEDs to verify hardware
  testAllLEDs();
}

void testAllLEDs() {
  Serial.println("Testing all LEDs...");
  
  Serial.println("Testing RED LED (D5)");
  digitalWrite(ledRed, HIGH);
  delay(500);
  digitalWrite(ledRed, LOW);
  delay(200);
  
  Serial.println("Testing GREEN LED (D6)");
  digitalWrite(ledGreen, HIGH);
  delay(500);
  digitalWrite(ledGreen, LOW);
  delay(200);
  
  Serial.println("Testing BLUE LED (D7)");
  digitalWrite(ledBlue, HIGH);
  delay(500);
  digitalWrite(ledBlue, LOW);
  delay(200);
  
  Serial.println("Testing YELLOW LED (D8)");
  digitalWrite(ledYellow, HIGH);
  delay(500);
  digitalWrite(ledYellow, LOW);
  delay(200);
  
  Serial.println("LED test complete!");
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
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WARNING: WiFi connection lost! Attempting to reconnect...");
    wifiConnected = false;
    connectToWiFi();
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
  levelStartTime = millis();
  
  // Generate unique sequence for this game session
  generateNewSequence();
  
  Serial.println("🎮 Game reset - starting new game with unique sequence!");
  Serial.println("📊 Enhanced scoring system active!");
  Serial.println("⚡ Adaptive difficulty enabled!");
}

void resetForNextGame() {
  // Clean up dynamic memory
  if (sequence != nullptr) {
    delete[] sequence;
    sequence = nullptr;
  }
  
  waitingForWebTrigger = true;
  gameStartTriggered = false;
  currentPlayerName = "Guest";
  gameStartTime = 0;
  levelStartTime = 0;
  
  Serial.println("🔄 Memory cleaned up and ready for next game!");
  Serial.println("💡 Go to Azure web interface to start a new game");
  
  // Show available memory
  Serial.print("📊 Free Heap Memory: ");
  Serial.print(ESP.getFreeHeap());
  Serial.println(" bytes");
}

void showSequence() {
  Serial.print("🎯 Level ");
  Serial.print(level);
  Serial.print(" - Showing sequence of ");
  Serial.print(turn);
  Serial.println(" steps");
  
  // Show adaptive timing info
  Serial.print("⏱️  LED Time: ");
  Serial.print(calculateLedOnTime(level));
  Serial.print("ms, Pause: ");
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
  
  delay(1000);
  
  for (int i = 0; i < turn; i++) {
    Serial.print("Step ");
    Serial.print(i + 1);
    Serial.print("/");
    Serial.print(turn);
    Serial.print(" - Color ");
    Serial.println(sequence[i]);
    
    lightUpLED(sequence[i]);
    delay(calculateLedOffTime(level)); // Brief pause between LEDs
  }
  
  Serial.println("⏰ Your turn! Repeat the sequence...");
  levelStartTime = millis(); // Reset level timing for input phase
}

void lightUpLED(int color) {
  // Turn off all LEDs first
  digitalWrite(ledRed, LOW);
  digitalWrite(ledGreen, LOW);
  digitalWrite(ledBlue, LOW);
  digitalWrite(ledYellow, LOW);
  
  // Small delay to ensure LEDs are off
  delay(50);
  
  // Light up the specified LED and play sound
  switch(color) {
    case 1: // Red
      digitalWrite(ledRed, HIGH);
      tone(buzzer, soundRed, calculateLedOnTime(level));
      Serial.println("  -> Lighting RED LED");
      break;
    case 2: // Green
      digitalWrite(ledGreen, HIGH);
      tone(buzzer, soundGreen, calculateLedOnTime(level));
      Serial.println("  -> Lighting GREEN LED");
      break;
    case 3: // Blue
      digitalWrite(ledBlue, HIGH);
      tone(buzzer, soundBlue, calculateLedOnTime(level));
      Serial.println("  -> Lighting BLUE LED");
      break;
    case 4: // Yellow
      digitalWrite(ledYellow, HIGH);
      tone(buzzer, soundYellow, calculateLedOnTime(level));
      Serial.println("  -> Lighting YELLOW LED");
      break;
    default:
      Serial.print("  -> Invalid color: ");
      Serial.println(color);
      return;
  }
  
  // Keep LED on for the specified duration
  delay(calculateLedOnTime(level));
  
  // Turn off the LED
  digitalWrite(ledRed, LOW);
  digitalWrite(ledGreen, LOW);
  digitalWrite(ledBlue, LOW);
  digitalWrite(ledYellow, LOW);
  
  Serial.println("  -> LED turned off");
}

void handleUserInput() {
  static unsigned long inputStartTime = 0;
  
  if (inputStartTime == 0) {
    inputStartTime = millis();
  }
  
  // Check for timeout
  if (millis() - inputStartTime > calculateInputTimeout(level)) {
    Serial.println("Input timeout!");
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
      Serial.print("Correct! Step ");
      Serial.print(inputIndex + 1);
      Serial.print("/");
      Serial.println(turn);
      
      inputIndex++;
      
      if (inputIndex >= turn) {
        // Completed this turn
        unsigned long levelTime = millis() - levelStartTime;
        Serial.print("✅ Turn completed in ");
        Serial.print(levelTime);
        Serial.println("ms!");
        
        turn++;
        level++;
        inputIndex = 0;
        waitingForInput = false;
        inputStartTime = 0;
        
        // Show current score progress
        unsigned long gameTime = millis() - gameStartTime;
        int currentScore = calculateScore(level - 1, gameTime, false);
        Serial.print("📊 Current Score: ");
        Serial.println(currentScore);
        
        // Check if game is won (reached maximum level)
        if (turn > maxLevel) {
          winGame();
        } else {
          delay(1000);
        }
      }
    } else {
      Serial.println("Wrong sequence!");
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

void playNewRecordSound() {
  // Special fanfare for new personal record
  int melody[] = {523, 659, 784, 1047}; // C5, E5, G5, C6
  for (int i = 0; i < 4; i++) {
    tone(buzzer, melody[i], 300);
    delay(350);
  }
  // Repeat twice for emphasis
  for (int i = 0; i < 4; i++) {
    tone(buzzer, melody[i], 150);
    delay(200);
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