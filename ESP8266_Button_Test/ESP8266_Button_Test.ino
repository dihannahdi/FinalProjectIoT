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
const char* ssid = "Bapakmu Ijo";  // Same network as your computer
const char* password = "irengputeh";   // Password for main WiFi

// ===== SERVER CONFIGURATION =====
// Updated to use your actual Azure deployment
// const char* serverURL = "http://192.168.1.6:3000";  // Local testing server (commented out)
const char* serverURL = "https://simon-says-eqhqgycwcothveg.canadacentral-01.azurewebsites.net";  // Your actual Azure server URL

// ===== HARDWARE PINS =====
// Updated to match your actual wiring based on test results
const int button[] = {D1, D4, D0, D2};    // Buttons based on your actual connections
const int led[] = {D5, D6, D7, D8};       // Red, Green, Blue, Yellow LEDs
const int buzzer = -1;                     // Buzzer disabled - set to actual pin if you want sounds

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
  if (buzzer >= 0) pinMode(buzzer, OUTPUT);
  
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
  Serial.println("📌 PIN MAPPING VERIFICATION:");
  Serial.println("Expected: Button1=D1, Button2=D2, Button3=D3, Button4=D4");
  Serial.println("Expected: LED1=D5, LED2=D6, LED3=D7, LED4=D8, Buzzer=D0");
  Serial.println();
  
  for (int i = 0; i < 4; i++) {
    Serial.print("Array[");
    Serial.print(i);
    Serial.print("] Button ");
    Serial.print(i + 1);
    Serial.print(" → Pin D");
    Serial.print(button[i]);
    Serial.print(", LED ");
    Serial.print(i + 1);
    Serial.print(" → Pin D");
    Serial.print(led[i]);
    Serial.println();
    
    // Test LED
    digitalWrite(led[i], HIGH);
    if (buzzer >= 0) tone(buzzer, 440 + (i * 100), 100);
    delay(200);
    digitalWrite(led[i], LOW);
    
    // Test button reading
    bool buttonState = digitalRead(button[i]) == LOW;
    Serial.print("  Current state: ");
    Serial.println(buttonState ? "PRESSED" : "NOT PRESSED");
  }
  
  Serial.println();
  Serial.println("🔍 WIRING CHECK:");
  Serial.println("If pin numbers don't match your physical wiring,");
  Serial.println("either update the code or rewire your buttons!");
  
  Serial.println();
  Serial.println("🔊 BUZZER TEST - Testing all possible pins:");
  Serial.println("Listen for buzzer sound on each pin test...");
  
  // Test buzzer on different pins to find where it's actually connected
  int testPins[] = {D3, D5, D6, D7, D8}; // Test pins that aren't D0,D1,D2,D4 (buttons)
  for (int i = 0; i < 5; i++) {
    Serial.print("Testing buzzer on pin D");
    Serial.println(testPins[i]);
    
    pinMode(testPins[i], OUTPUT);
    tone(testPins[i], 1000, 300); // 1000Hz for 300ms
    delay(500);
    
    Serial.println("Did you hear a sound? (Note this pin if yes)");
    delay(1000);
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
      if (buzzer >= 0) tone(buzzer, 440 + (i * 200), 150);
      
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
  
  String url = String(serverURL) + "/check-game-trigger";
  
  Serial.print("🌐 Attempting connection to: ");
  Serial.println(url);
  
  http.begin(client, url);
  http.addHeader("device-id", "ESP8266-Test");
  http.setTimeout(5000); // 5 second timeout
  
  Serial.println("📡 Sending HTTP GET request...");
  int httpCode = http.GET();
  
  Serial.print("📊 HTTP Response Code: ");
  Serial.println(httpCode);
  
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
      if (buzzer >= 0) tone(buzzer, 880, 500);
      
    } else if (!startGame && gameActive) {
      gameActive = false;
      Serial.println("🏁 Game ended");
    }
    
  } else {
    Serial.print("⚠️ Server check failed: HTTP ");
    Serial.println(httpCode);
    
    // Detailed error diagnosis
    if (httpCode == -1) {
      Serial.println("🔥 ERROR: Connection failed - possible causes:");
      Serial.println("   • Firewall blocking connection");
      Serial.println("   • Server not responding");
      Serial.println("   • Network routing issue");
      Serial.println("   • Wrong IP address");
    } else if (httpCode == -11) {
      Serial.println("🕒 ERROR: Connection timeout");
    } else if (httpCode > 0) {
      Serial.print("📄 Server response: ");
      Serial.println(http.getString());
    }
    
    // Network diagnostics
    Serial.println("🔍 Network Diagnostics:");
    Serial.print("   • ESP8266 IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("   • Gateway: ");
    Serial.println(WiFi.gatewayIP());
    Serial.print("   • Server IP: ");
    Serial.println("192.168.1.6");
    Serial.println("   • If IPs are on same network (192.168.1.x), likely firewall issue");
    Serial.println("   • Try disabling Windows Firewall temporarily");
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