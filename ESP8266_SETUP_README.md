# ESP8266 Simon Says Setup Guide

## Required Libraries

To compile the ESP8266 code successfully, you need to install the following libraries in Arduino IDE:

### 1. ESP8266 Board Package
- Open Arduino IDE
- Go to File → Preferences
- Add this URL to "Additional Board Manager URLs":
  ```
  http://arduino.esp8266.com/stable/package_esp8266com_index.json
  ```
- Go to Tools → Board → Board Manager
- Search for "ESP8266" and install "ESP8266 by ESP8266 Community"

### 2. WebSocketsClient Library
- Go to Sketch → Include Library → Manage Libraries
- Search for "WebSockets"
- Install "WebSockets by Markus Sattler" (version 2.3.0 or newer)

### 3. ArduinoJson Library  
- In Library Manager, search for "ArduinoJson"
- Install "ArduinoJson by Benoit Blanchon" (version 6.x recommended)

## Hardware Connections

### LED Connections (Active HIGH)
- Red LED → Pin D5
- Green LED → Pin D6  
- Blue LED → Pin D7
- Yellow LED → Pin D8

### Button Connections (Active LOW with internal pullup)
- Red Button → Pin D1
- Green Button → Pin D2
- Blue Button → Pin D3
- Yellow Button → Pin D4

### Buzzer Connection
- Buzzer → Pin D0

## WiFi Configuration

Edit these lines in the code with your WiFi credentials:
```cpp
const char* ssid = "Your_WiFi_Name";
const char* password = "Your_WiFi_Password";
```

## Upload Instructions

1. Connect your ESP8266 to your computer via USB
2. Select the correct board (e.g., "NodeMCU 1.0" or "Wemos D1 Mini")
3. Select the correct COM port
4. Click Upload

## Troubleshooting

### Common Issues:

1. **Compilation Error: WebSocketsClient.h not found**
   - Make sure you installed the WebSockets library by Markus Sattler
   - Restart Arduino IDE after installation

2. **ESP8266 board not found**
   - Check that you added the ESP8266 board manager URL
   - Restart Arduino IDE and check Board Manager

3. **Upload failed**
   - Check COM port selection
   - Try holding the FLASH button during upload (on some boards)
   - Check USB cable connection

4. **WiFi connection issues**
   - Verify WiFi credentials
   - Check if your WiFi network is 2.4GHz (ESP8266 doesn't support 5GHz)
   - Make sure ESP8266 is in range of your router

## Testing

1. Open Serial Monitor (115200 baud rate)
2. Reset the ESP8266
3. You should see:
   - WiFi connection success
   - WebSocket connection to server
   - LED test sequence
   - "System ready!" message

The ESP8266 will now wait for game trigger commands from the web interface. 