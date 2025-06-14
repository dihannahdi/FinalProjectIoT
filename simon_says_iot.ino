/*
 * Simon Says IoT Game - ESP8266 Firmware
 * Sends scores to leaderboard server via WiFi
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

// ===== NETWORK CONFIGURATION =====
const char* ssid = "YOUR_WIFI_SSID";        // Ganti dengan nama WiFi Anda
const char* password = "YOUR_WIFI_PASSWORD"; // Ganti dengan password WiFi Anda
const char* serverIp = "10.33.102.140";     // IP server VPS
const int serverPort = 3000;                 // Port server
const char* playerName = "ubuntu123";        // Nama pemain default

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
  
  // Initialize hardware pins
  initializeHardware();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Generate random seed
  randomSeed(analogRead(A0));
  
  // Initialize game
  initializeGame();
  
  Serial.println("Game ready! Press any button to start.");
  playStartupSound();
}

void loop() {
  // Check WiFi connection periodically
  if (millis() - lastWifiCheck > wifiCheckInterval) {
    checkWiFiConnection();
    lastWifiCheck = millis();
  }
  
  if (!gameOver) {
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
    // Game over - wait for restart
    if (checkAnyButtonPressed()) {
      delay(buttonDebounceTime);
      if (checkAnyButtonPressed()) {
        restartGame();
      }
    }
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

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
    
    // Visual feedback during connection
    digitalWrite(ledYellow, HIGH);
    delay(250);
    digitalWrite(ledYellow, LOW);
    delay(250);
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println();
    Serial.println("WiFi connected successfully!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Server: http://");
    Serial.print(serverIp);
    Serial.print(":");
    Serial.println(serverPort);
    
    // Success indication
    flashAllLeds(3, 200);
  } else {
    wifiConnected = false;
    Serial.println();
    Serial.println("WiFi connection failed!");
    Serial.println("Game will continue offline. Scores won't be sent to server.");
    
    // Failure indication
    for (int i = 0; i < 5; i++) {
      digitalWrite(ledRed, HIGH);
      tone(buzzer, soundLose, 200);
      delay(300);
      digitalWrite(ledRed, LOW);
      delay(200);
    }
  }
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    if (wifiConnected) {
      Serial.println("WiFi connection lost! Attempting to reconnect...");
      wifiConnected = false;
    }
    
    WiFi.reconnect();
    delay(1000);
    
    if (WiFi.status() == WL_CONNECTED) {
      wifiConnected = true;
      Serial.println("WiFi reconnected!");
    }
  } else {
    wifiConnected = true;
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
  
  Serial.println("Game initialized - Level 1");
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
  bool inputReceived = false;
  
  while (!inputReceived && (millis() - inputStartTime < inputTimeout)) {
    int pressedButton = getButtonPress();
    
    if (pressedButton > 0) {
      inputReceived = true;
      userSequence[inputIndex] = pressedButton;
      
      // Light up pressed button
      lightUpColor(pressedButton);
      
      Serial.print("Button pressed: ");
      Serial.println(pressedButton);
      
      // Wait for button release
      while (getButtonPress() > 0) {
        delay(10);
      }
      
      turnOffAllLeds();
      noTone(buzzer);
      
      // Check if input is correct
      if (userSequence[inputIndex] != sequence[inputIndex]) {
        // Wrong input - game over
        loss();
        return;
      }
      
      inputIndex++;
      
      // Check if sequence is complete
      if (inputIndex >= turn) {
        // Sequence completed correctly
        if (turn >= 100) {
          // Max level reached - win!
          win();
        } else {
          // Next turn
          nextTurn();
        }
      }
    }
    
    delay(10);
  }
  
  if (!inputReceived) {
    // Timeout - game over
    Serial.println("Timeout! Game over.");
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
    Serial.println("WiFi not connected. Score not sent to server.");
    return;
  }
  
  Serial.print("Sending score to server: ");
  Serial.println(finalScore);
  
  // Visual indication that we're sending data
  digitalWrite(ledBlue, HIGH);
  
  WiFiClient client;
  HTTPClient http;
  
  String serverURL = "http://" + String(serverIp) + ":" + String(serverPort) + "/submit-score";
  
  if (http.begin(client, serverURL)) {
    // Create JSON payload
    StaticJsonDocument<200> jsonDoc;
    jsonDoc["name"] = playerName;
    jsonDoc["score"] = finalScore;
    
    String jsonString;
    serializeJson(jsonDoc, jsonString);
    
    // Set headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("User-Agent", "ESP8266-SimonSays/1.0");
    
    // Send POST request
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      
      Serial.print("HTTP Response Code: ");
      Serial.println(httpResponseCode);
      Serial.print("Server Response: ");
      Serial.println(response);
      
      if (httpResponseCode == 200) {
        Serial.println("Score sent successfully!");
        
        // Success indication
        digitalWrite(ledBlue, LOW);
        digitalWrite(ledGreen, HIGH);
        tone(buzzer, soundWin, 200);
        delay(500);
        digitalWrite(ledGreen, LOW);
        noTone(buzzer);
      } else {
        Serial.println("Server returned error");
        showSendError();
      }
    } else {
      Serial.print("HTTP Request failed: ");
      Serial.println(httpResponseCode);
      showSendError();
    }
    
    http.end();
  } else {
    Serial.println("Failed to initialize HTTP client");
    showSendError();
  }
  
  digitalWrite(ledBlue, LOW);
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