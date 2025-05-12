/*
 * Simon Says Game Firmware for NodeMCU ESP8266
 * 
 * This firmware handles:
 * - Button inputs and LED outputs
 * - Game logic for Simon Says
 * - MQTT communication with server
 * - WiFi connection
 */

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";      // Replace with your WiFi SSID
const char* password = "YOUR_WIFI_PASS";  // Replace with your WiFi password

// MQTT Broker settings
const char* mqtt_server = "YOUR_MQTT_SERVER_IP";  // Replace with your MQTT broker IP
const int mqtt_port = 1883;
const char* mqtt_user = "YOUR_MQTT_USER";         // Replace if your broker requires authentication
const char* mqtt_password = "YOUR_MQTT_PASS";     // Replace if your broker requires authentication

// MQTT Topics
const char* mqtt_topic_game = "simon_says/game";   // Topic to receive game commands
const char* mqtt_topic_score = "simon_says/score"; // Topic to send scores
const char* mqtt_topic_status = "simon_says/status"; // Topic to send device status

// Pin definitions
// Buttons
const int buttonPins[] = {5, 4, 0, 2};  // D1, D2, D3, D4 - GPIO pins for buttons
// LEDs
const int ledPins[] = {14, 12, 13, 15}; // D5, D6, D7, D8 - GPIO pins for LEDs
// Buzzer
const int buzzerPin = 16;               // D0 - GPIO pin for buzzer

// Game variables
const int MAX_LEVEL = 100;             // Maximum game level
int gameSequence[MAX_LEVEL];           // Array to store the game sequence
int playerSequence[MAX_LEVEL];         // Array to store the player's input sequence
int level = 0;                         // Current game level
bool gameActive = false;               // Flag to indicate if a game is in progress
String currentPlayer = "Anonymous";    // Current player name
unsigned long lastButtonPress = 0;     // Time of last button press to debounce
const int debounceTime = 50;           // Debounce time in milliseconds
const int TONE_DURATION = 300;         // Duration of tones in milliseconds

// Buzzer tones for each button (Hz)
const int tones[] = {262, 330, 392, 523}; // C4, E4, G4, C5

// WiFi and MQTT client instances
WiFiClient espClient;
PubSubClient client(espClient);

// Function declarations
void setupWiFi();
void reconnectMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void startGame();
void playSequence();
void playTone(int index, int duration);
void checkButtonPress();
void sendScore();
void gameOver();
void blinkAllLEDs(int times);
int readButtons();

void setup() {
  // Initialize serial
  Serial.begin(115200);
  
  // Initialize button pins as inputs with pull-up resistors
  for (int i = 0; i < 4; i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);
  }
  
  // Initialize LED pins as outputs
  for (int i = 0; i < 4; i++) {
    pinMode(ledPins[i], OUTPUT);
    digitalWrite(ledPins[i], LOW);
  }
  
  // Initialize buzzer pin as output
  pinMode(buzzerPin, OUTPUT);
  
  // Setup WiFi connection
  setupWiFi();
  
  // Setup MQTT client
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);
  
  // Flash LEDs to indicate successful startup
  blinkAllLEDs(3);
}

void loop() {
  // Ensure MQTT connection
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
  
  // Handle game logic
  if (gameActive) {
    checkButtonPress();
  }
  
  // Handle WiFi reconnection if needed
  if (WiFi.status() != WL_CONNECTED) {
    setupWiFi();
  }
}

// Set up WiFi connection
void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("");
    Serial.println("WiFi connection failed");
  }
}

// Connect/reconnect to MQTT broker
void reconnectMQTT() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266-SimonSays-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
      Serial.println("connected");
      
      // Subscribe to game topic
      client.subscribe(mqtt_topic_game);
      
      // Publish device status
      client.publish(mqtt_topic_status, "{\"status\":\"online\"}");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

// Handle MQTT messages
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // Convert payload to string
  char message[length + 1];
  for (unsigned int i = 0; i < length; i++) {
    message[i] = (char)payload[i];
  }
  message[length] = '\0';
  
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  Serial.println(message);
  
  // Handle messages based on topic
  if (String(topic) == mqtt_topic_game) {
    // Parse JSON
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.c_str());
      return;
    }
    
    // Check for command
    if (doc.containsKey("command")) {
      String command = doc["command"];
      
      if (command == "start") {
        // Get player name if provided
        if (doc.containsKey("player")) {
          currentPlayer = doc["player"].as<String>();
        } else {
          currentPlayer = "Anonymous";
        }
        startGame();
      } else if (command == "stop") {
        gameActive = false;
        blinkAllLEDs(2);
      }
    }
    
    // Check for sequence
    if (doc.containsKey("sequence") && !gameActive) {
      // Custom sequence mode could be implemented here
    }
  }
}

// Start a new game
void startGame() {
  Serial.println("Starting new game");
  
  // Reset game variables
  level = 0;
  gameActive = true;
  
  // Generate initial random sequence
  randomSeed(millis());
  for (int i = 0; i < MAX_LEVEL; i++) {
    gameSequence[i] = random(4);  // 0-3 for the four buttons
  }
  
  // Start with level 1
  level = 1;
  
  // Play initial sequence
  delay(1000);
  playSequence();
}

// Play the current sequence for the player to repeat
void playSequence() {
  Serial.print("Playing sequence for level ");
  Serial.println(level);
  
  delay(500);
  
  // Play each tone/light in the sequence
  for (int i = 0; i < level; i++) {
    int button = gameSequence[i];
    
    // Turn on LED
    digitalWrite(ledPins[button], HIGH);
    
    // Play tone
    playTone(button, TONE_DURATION);
    
    // Turn off LED
    digitalWrite(ledPins[button], LOW);
    
    delay(200);  // Pause between notes
  }
}

// Play a tone on the buzzer
void playTone(int index, int duration) {
  // Simple tone generation - we toggle the pin at the frequency
  // This is not ideal but works for simple buzzers
  int frequency = tones[index];
  
  // Calculate period in microseconds
  long period = 1000000L / frequency;
  long numCycles = frequency * duration / 1000;
  
  for (long i = 0; i < numCycles; i++) {
    digitalWrite(buzzerPin, HIGH);
    delayMicroseconds(period / 2);
    digitalWrite(buzzerPin, LOW);
    delayMicroseconds(period / 2);
  }
}

// Check for button presses and validate against sequence
void checkButtonPress() {
  static int currentStep = 0;
  
  // Read button states (returns -1 if no button is pressed)
  int buttonPressed = readButtons();
  
  // If a button was pressed
  if (buttonPressed != -1) {
    unsigned long currentTime = millis();
    
    // Debounce
    if (currentTime - lastButtonPress > debounceTime) {
      lastButtonPress = currentTime;
      
      // Visual feedback - light the LED
      digitalWrite(ledPins[buttonPressed], HIGH);
      
      // Sound feedback - play the tone
      playTone(buttonPressed, TONE_DURATION);
      
      // Turn off the LED
      digitalWrite(ledPins[buttonPressed], LOW);
      
      // Check if this is the correct button in the sequence
      if (buttonPressed == gameSequence[currentStep]) {
        // Correct button!
        currentStep++;
        
        // Check if the sequence is complete
        if (currentStep == level) {
          // Player completed this level
          currentStep = 0;
          level++;
          
          // Send the current score
          sendScore();
          
          // Wait a bit before showing the next sequence
          delay(1000);
          
          // If player reached the max level
          if (level > MAX_LEVEL) {
            // Game won!
            gameActive = false;
            victory();
          } else {
            // Continue to next level
            playSequence();
          }
        }
      } else {
        // Wrong button - game over
        gameOver();
        currentStep = 0;
      }
    }
  }
}

// Read all buttons and return the index of the pressed button
// Returns -1 if no button is pressed
int readButtons() {
  for (int i = 0; i < 4; i++) {
    // Buttons are in pull-up configuration, so they read LOW when pressed
    if (digitalRead(buttonPins[i]) == LOW) {
      return i;
    }
  }
  return -1;
}

// Send the current score to the MQTT server
void sendScore() {
  StaticJsonDocument<128> doc;
  doc["player"] = currentPlayer;
  doc["score"] = level - 1;  // Level is already incremented for the next round
  
  char buffer[128];
  serializeJson(doc, buffer);
  
  client.publish(mqtt_topic_score, buffer);
  Serial.print("Score sent: ");
  Serial.println(buffer);
}

// Game over sequence
void gameOver() {
  Serial.println("Game Over!");
  gameActive = false;
  
  // Play a game over sound and light sequence
  for (int i = 0; i < 3; i++) {
    // Flash all LEDs
    for (int j = 0; j < 4; j++) {
      digitalWrite(ledPins[j], HIGH);
    }
    
    // Play a low buzzer tone
    tone(buzzerPin, 150, 200);
    delay(200);
    
    // Turn off all LEDs
    for (int j = 0; j < 4; j++) {
      digitalWrite(ledPins[j], LOW);
    }
    
    delay(200);
  }
  
  // Send final score
  sendScore();
}

// Victory sequence
void victory() {
  Serial.println("Victory!");
  
  // Play a victory sound and light sequence
  for (int i = 0; i < 3; i++) {
    // Play an ascending scale
    for (int j = 0; j < 4; j++) {
      digitalWrite(ledPins[j], HIGH);
      playTone(j, 150);
      delay(150);
    }
    
    // Turn off all LEDs
    for (int j = 0; j < 4; j++) {
      digitalWrite(ledPins[j], LOW);
    }
    
    delay(200);
  }
  
  // Send final score
  sendScore();
}

// Blink all LEDs a specified number of times
void blinkAllLEDs(int times) {
  for (int i = 0; i < times; i++) {
    // Turn on all LEDs
    for (int j = 0; j < 4; j++) {
      digitalWrite(ledPins[j], HIGH);
    }
    delay(200);
    
    // Turn off all LEDs
    for (int j = 0; j < 4; j++) {
      digitalWrite(ledPins[j], LOW);
    }
    delay(200);
  }
} 