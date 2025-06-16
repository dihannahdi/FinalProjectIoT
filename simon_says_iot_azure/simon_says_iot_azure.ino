/*
 * ESP8266 Simple Button Test - Web Interaction Diagnostic
 * SIMPLIFIED version for troubleshooting button-to-web communication
 * Upload this first to isolate and fix connectivity issues
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

// ===== WIFI CONFIGURATION =====
const char* ssid = "Bapakmu Ijo-5G";  // UPDATE with your WiFi name
const char* password = "irengputeh";   // UPDATE with your WiFi password

// ===== SERVER CONFIGURATION =====
// Test local server first, then switch to Azure
const char* serverURL = "http://192.168.1.6:3000";  // Your computer's actual IP address
// const char* serverURL = "https://simon-says-exhqaycwc6c0hveg.canadacentral-01.azurewebsites.net";  // Azure server (switch to this after local testing works)

// ===== HARDWARE PINS =====
const int button[] = {D1, D2, D3, D4};    // Red, Green, Blue, Yellow buttons
const int led[] = {D5, D6, D7, D8};       // Red, Green, Blue, Yellow LEDs
const int buzzer = D0;

// ===== GAME VARIABLES =====
bool gameActive = false;
String playerName = "";
bool buttonPressed[4] = {false, false, false, false};
unsigned long lastButtonTime[4] = {0, 0, 0, 0};
const unsigned long debounceDelay = 150;

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== ESP8266 Simple Button Test ===");
  
  // Initialize hardware
  for (int i = 0; i < 4; i++) {
    pinMode(button[i], INPUT_PULLUP);
    pinMode(led[i], OUTPUT);
    digitalWrite(led[i], LOW);
  }
  pinMode(buzzer, OUTPUT);
  
  // Test hardware
  testHardware();
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("✅ Setup complete! Ready for button testing.");
  Serial.println("📌 Press buttons to test hardware feedback");
  Serial.println("🌐 Checking for web triggers...");
}

void loop() {
  // Always handle button feedback
  handleButtons();
  
  // Check for web game triggers
  if (WiFi.status() == WL_CONNECTED) {
    static unsigned long lastCheck = 0;
    if (millis() - lastCheck > 2000) {  // Check every 2 seconds
      checkWebTrigger();
      lastCheck = millis();
    }
  }
  
  delay(10);
}

void testHardware() {
  Serial.println("🔧 Testing hardware...");
  
  for (int i = 0; i < 4; i++) {
    Serial.print("Testing button ");
    Serial.print(i + 1);
    Serial.print(" (Pin D");
    Serial.print(button[i]);
    Serial.print(") and LED (Pin D");
    Serial.print(led[i]);
    Serial.println(")");
    
    // Test LED
    digitalWrite(led[i], HIGH);
    tone(buzzer, 440 + (i * 100), 100);
    delay(200);
    digitalWrite(led[i], LOW);
    
    // Test button reading
    bool buttonState = digitalRead(button[i]) == LOW;
    Serial.print("Button state: ");
    Serial.println(buttonState ? "PRESSED" : "NOT PRESSED");
  }
  
  Serial.println("✅ Hardware test complete!");
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n❌ WiFi connection failed!");
    Serial.println("Check SSID, password, and network availability");
  }
}

void handleButtons() {
  for (int i = 0; i < 4; i++) {
    bool currentState = digitalRead(button[i]) == LOW;
    unsigned long currentTime = millis();
    
    // Always provide LED feedback
    digitalWrite(led[i], currentState ? HIGH : LOW);
    
    // Detect button press with debouncing
    if (currentState && !buttonPressed[i] && 
        (currentTime - lastButtonTime[i] > debounceDelay)) {
      
      buttonPressed[i] = true;
      lastButtonTime[i] = currentTime;
      
      // Immediate feedback
      tone(buzzer, 440 + (i * 200), 150);
      
      Serial.println("🔴🟢🔵🟡 BUTTON PRESS DETECTED!");
      Serial.print("Button ");
      Serial.print(i + 1);
      Serial.print(" (Pin D");
      Serial.print(button[i]);
      Serial.println(") pressed");
      
      // If game is active, send button press to server
      if (gameActive) {
        sendButtonPress(i + 1);
      } else {
        Serial.println("💤 No active game - button press logged only");
      }
    }
    
    // Detect button release
    if (!currentState && buttonPressed[i]) {
      buttonPressed[i] = false;
      Serial.print("Button ");
      Serial.print(i + 1);
      Serial.println(" released");
    }
  }
}

void checkWebTrigger() {
  HTTPClient http;
  WiFiClient client;
  
  http.begin(client, String(serverURL) + "/check-game-trigger");
  http.addHeader("device-id", "ESP8266-Test");
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    
    bool startGame = doc["startGame"];
    
    if (startGame && !gameActive) {
      gameActive = true;
      playerName = doc["playerName"].as<String>();
      
      Serial.println("🎮 === GAME STARTED FROM WEB! ===");
      Serial.print("Player: ");
      Serial.println(playerName);
      Serial.println("Press buttons to send data to web!");
      
      // Visual feedback
      for (int i = 0; i < 4; i++) {
        digitalWrite(led[i], HIGH);
        delay(100);
        digitalWrite(led[i], LOW);
      }
      tone(buzzer, 880, 500);
      
    } else if (!startGame && gameActive) {
      gameActive = false;
      Serial.println("🏁 Game ended");
    }
    
  } else {
    Serial.print("⚠️ Server check failed: HTTP ");
    Serial.println(httpCode);
    if (httpCode > 0) {
      Serial.println(http.getString());
    }
  }
  
  http.end();
}

void sendButtonPress(int buttonNumber) {
  HTTPClient http;
  WiFiClient client;
  
  http.begin(client, String(serverURL) + "/button-press");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("device-id", "ESP8266-Test");
  
  DynamicJsonDocument doc(1024);
  doc["playerName"] = playerName;
  doc["buttonNumber"] = buttonNumber;
  doc["timestamp"] = millis();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode == 200) {
    Serial.print("✅ Button press sent to web: Button ");
    Serial.println(buttonNumber);
  } else {
    Serial.print("❌ Failed to send button press: HTTP ");
    Serial.println(httpCode);
    if (httpCode > 0) {
      Serial.println(http.getString());
    }
  }
  
  http.end();
} 