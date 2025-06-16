# ESP8266 WebSocket Troubleshooting Guide

## 🔧 Enhanced Features Added

Your ESP8266 code now includes advanced debugging and auto-recovery features:

### ✅ New Features:
- **Enhanced Serial Debugging** with emojis and detailed status
- **WiFi Connection Monitoring** with auto-reconnection
- **WebSocket Heartbeat** (ping/pong every 15 seconds)
- **Automatic Connection Diagnostics** after 3 failed attempts
- **Alternative Connection Methods** tried automatically after 5 failures
- **Connection Status Tracking** with attempt counters

## 📊 What the Serial Monitor Will Show

### Successful Connection:
```
=== Simon Says IoT Hardware ===
Version: 2.0 with Enhanced WebSocket
🔌 Connecting to WiFi.........
✅ WiFi connected! IP: 192.168.1.100
📶 Signal strength: -45 dBm
🔗 Setting up WebSocket connection...
Host: simon-says-exhqaycwc6c0hveg.canadacentral-01.azurewebsites.net
Port: 80
Path: /socket.io/?EIO=4&transport=websocket
✅ WebSocket setup complete
🔆 Testing all LEDs...
✅ LED test complete
✅ System ready! Waiting for game trigger...
✅ [WSc] Connected to: /socket.io/?EIO=4&transport=websocket
📤 Message sent successfully: 42["hardware:connected",{}]
📤 Hardware connection notification sent
```

### Connection Problems (Automatic Diagnostics):
```
❌ [WSc] Disconnected! Reason: Connection lost
🔄 Connection attempt #1
🔄 Connection attempt #2
🔄 Connection attempt #3
🔧 Running connection diagnostic...

🔧 CONNECTION DIAGNOSTIC TEST
==============================
WiFi Status: ✅ Connected
IP Address: 192.168.1.100
Gateway: 192.168.1.1
DNS: 8.8.8.8
Signal Strength: -45 dBm
WebSocket Connected: ❌ No
Connection Attempts: 3
==============================

🔄 Connection attempt #4
🔄 Connection attempt #5
🛠️ Multiple connection failures - trying alternative settings...
🔄 Trying alternative connection method...
Attempting connection without EIO version...
```

## 🚨 Common Issues & Solutions

### Issue 1: WiFi Not Connecting
**Symptoms:**
```
❌ WiFi connection failed!
🔄 Please check your WiFi credentials and try again
```

**Solutions:**
1. Verify WiFi credentials in code:
   ```cpp
   const char* ssid = "Your_Actual_WiFi_Name";
   const char* password = "Your_Actual_Password";
   ```
2. Check if WiFi is 2.4GHz (ESP8266 doesn't support 5GHz)
3. Move ESP8266 closer to router
4. Check for special characters in WiFi password

### Issue 2: WebSocket Keeps Disconnecting
**Symptoms:**
```
❌ [WSc] Disconnected! Reason: Connection lost
```

**Auto-Recovery Actions:**
- The code will automatically try alternative connection paths
- After 3 failures: Runs diagnostic test
- After 5 failures: Tries different WebSocket paths:
  1. `/socket.io/?transport=websocket` (without EIO version)
  2. `/socket.io/` (basic path)

### Issue 3: Server Not Reachable
**Check Server Status:**
1. Verify your backend server is running
2. Test server accessibility:
   ```bash
   curl http://simon-says-exhqaycwc6c0hveg.canadacentral-01.azurewebsites.net
   ```
3. Check Azure app service status

### Issue 4: Weak WiFi Signal
**Symptoms:**
```
📶 Signal strength: -80 dBm  // Very weak
```

**Solutions:**
- Move ESP8266 closer to WiFi router
- Signal strength guide:
  - `-30 to -50 dBm`: Excellent
  - `-50 to -60 dBm`: Good  
  - `-60 to -70 dBm`: Fair
  - `-70+ dBm`: Poor (connection issues likely)

## 🛠️ Manual Troubleshooting Commands

You can add these functions to test manually:

### Force Connection Test:
Add this to your `loop()` temporarily:
```cpp
if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    
    if (command == "test") {
        testConnection();
    } else if (command == "alt") {
        tryAlternativeConnection();
    } else if (command == "info") {
        printConnectionInfo();
    }
}
```

Then type in Serial Monitor:
- `test` - Run connection diagnostic
- `alt` - Try alternative connection  
- `info` - Print connection information

## 📈 Success Indicators

### Good Connection:
```
✅ [WSc] Connected to: /socket.io/?EIO=4&transport=websocket
📤 Message sent successfully: 42["hardware:connected",{}]
🏓 [WSc] Received pong
📡 Sending keepalive ping...
```

### Communication Working:
```
📨 [WSc] Received text: 42["server:trigger-game"]
🎯 Event received: server:trigger-game
🎮 Perintah mulai diterima!
```

## 🔄 Recovery Actions

The enhanced code automatically:

1. **Monitors WiFi** - Reconnects if WiFi drops
2. **Tracks Attempts** - Counts failed connection attempts  
3. **Runs Diagnostics** - Shows detailed connection info after 3 failures
4. **Tries Alternatives** - Uses different WebSocket paths after 5 failures
5. **Sends Heartbeats** - Keeps connection alive with ping/pong
6. **Resets Counters** - Prevents infinite failure loops

## 📞 If Still Having Issues

1. **Check Internet Connection** - Ping Google: `ping google.com`
2. **Verify Server is Running** - Check your Node.js backend
3. **Check Firewall/Router** - Ensure WebSocket traffic is allowed
4. **Try Mobile Hotspot** - Rule out router/ISP issues
5. **Monitor Serial Output** - Look for specific error messages

The enhanced code provides much better visibility into what's happening with your connection! 🎯 