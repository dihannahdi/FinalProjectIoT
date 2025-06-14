# 🔧 Simon Says IoT - Troubleshooting Guide

## 🚨 **Button Input Issues - FIXED!**

If your buttons weren't working properly with the previous version, the **IMPROVED** version includes major fixes:

### ✅ **What Was Fixed:**
1. **Improved Button Detection** - Better edge detection and state tracking
2. **Immediate Feedback** - LEDs light up instantly when buttons are pressed
3. **Debug Mode** - Built-in testing and monitoring tools
4. **Better Pin Management** - Arrays for easier hardware management

### 🧪 **Built-in Testing Tools**

The improved system includes several testing modes:

#### **1. Automatic Hardware Test**
- Runs automatically on startup
- Tests each LED and button combination
- Shows pin assignments and status

#### **2. Interactive Button Test Mode**
- Hold any button during startup (first 5 seconds) to enter test mode
- 30-second interactive test session
- Real-time feedback for each button press

#### **3. Debug Mode Options**
Configure in the code:
```cpp
#define DEBUG_MODE true              // Enable debug features
#define RUN_HARDWARE_TEST true       // Run startup test
#define ENABLE_BUTTON_DEBUG false    // Continuous monitoring (can be noisy)
```

## 🔌 **Hardware Troubleshooting**

### **Wiring Verification**

**ESP8266 Pin Assignments:**
```
Component    ESP8266 Pin    Arduino Pin
=========    ===========    ===========
LED Red      GPIO14         D5
LED Green    GPIO12         D6  
LED Blue     GPIO13         D7
LED Yellow   GPIO15         D8
Button Red   GPIO5          D1
Button Green GPIO4          D2
Button Blue  GPIO0          D3
Button Yellow GPIO2         D4
Buzzer       GPIO16         D0
```

### **Button Wiring (CRITICAL)**
Each button needs proper pull-up configuration:

**Option 1: Internal Pull-up (Recommended)**
```
Button → ESP8266 Pin
Other side of button → GND
```

**Option 2: External Pull-up**
```
3.3V → 10kΩ resistor → ESP8266 Pin → Button → GND
```

### **LED Wiring**
```
ESP8266 Pin → 220Ω resistor → LED (+) → LED (-) → GND
```

## 🐛 **Common Issues & Solutions**

### **Issue 1: Buttons Not Detected**
**Symptoms:** No response when pressing buttons, no LED feedback

**Solutions:**
1. **Check Wiring**: Verify button connections to correct pins
2. **Test Pull-ups**: Make sure buttons are properly grounded
3. **Use Test Mode**: Hold any button during startup to test
4. **Check Serial Output**: Look for "Button X pressed!" messages

### **Issue 2: LEDs Not Working**
**Symptoms:** No LED lights, no visual feedback

**Solutions:**
1. **Check LED Polarity**: Long leg (anode) to resistor, short leg to GND
2. **Verify Resistors**: Use 220Ω resistors to prevent LED burnout
3. **Test Voltage**: Ensure 3.3V supply is working
4. **Check Serial**: Look for LED test messages during startup

### **Issue 3: WiFi Connection Problems**
**Symptoms:** "WiFi connection lost!" messages

**Solutions:**
1. **Check Network Name**: Verify SSID is correct
2. **Password**: Ensure WiFi password is accurate
3. **Signal Strength**: Move ESP8266 closer to router
4. **Network Type**: Some enterprise networks may require special config

### **Issue 4: Server Communication Errors**
**Symptoms:** "HTTP Error" messages

**Solutions:**
1. **Server Status**: Verify Node.js server is running
2. **Network Access**: Ensure ESP8266 can reach server IP
3. **Firewall**: Check if port 3000 is accessible
4. **Azure Status**: Verify Azure deployment is active

## 🔍 **Diagnostic Tools**

### **Serial Monitor Messages**
Watch for these key messages:

**✅ Good Messages:**
```
✅ Hardware pins initialized successfully
🎮 Game reset - starting new game with unique sequence!
✅ Button 1 test PASSED!
📊 Enhanced Score: player - Score: 245 - Level: 5
```

**❌ Problem Messages:**
```
❌ Button 1 was not tested
HTTP Error: -1
⏱️ Input timeout!
ERROR: Failed to connect to WiFi
```

### **Debug Commands**
Enable detailed logging by setting:
```cpp
#define DEBUG_MODE true
#define ENABLE_BUTTON_DEBUG true  // For continuous monitoring
```

### **Manual Testing**
1. **Open Serial Monitor** (115200 baud)
2. **Reset ESP8266** 
3. **Hold any button** during first 5 seconds for test mode
4. **Watch for messages** and LED/sound feedback

## ⚡ **Performance Optimization**

### **Memory Management**
The improved system shows memory usage:
```
📊 Free Heap Memory: 45234 bytes
```
If memory drops below 20,000 bytes, restart the device.

### **Timing Adjustments**
Adaptive difficulty automatically adjusts timing:
- **Level 1**: 800ms LED time, 8-second timeout
- **Level 10**: 500ms LED time, 6-second timeout  
- **Level 20**: 200ms LED time, 5-second timeout

## 🛠️ **Advanced Troubleshooting**

### **Hardware Issues**
1. **Multimeter Testing**: Verify 3.3V on VCC pins
2. **Continuity Check**: Test button connections
3. **LED Testing**: Apply 3.3V directly to LED + resistor
4. **Pin Testing**: Use digitalWrite/digitalRead tests

### **Software Issues**
1. **Library Versions**: Ensure ArduinoJson 6.x is installed
2. **Board Version**: Use ESP8266 Community version 3.x
3. **Upload Settings**: 
   - Board: NodeMCU 1.0 (ESP-12E Module)
   - Upload Speed: 115200
   - CPU Frequency: 80MHz

### **Network Issues**
1. **Router Settings**: Check for MAC address filtering
2. **DNS Issues**: Try using IP addresses instead of domain names
3. **Proxy Settings**: Corporate networks may block connections
4. **Port Blocking**: Ensure ports 80, 443, and 3000 are open

## 📞 **Getting Help**

### **Information to Provide:**
1. **Hardware Setup**: Photo of wiring
2. **Serial Output**: Copy/paste serial monitor messages
3. **Network Config**: SSID and connection status
4. **Server Status**: Is the Node.js server running?

### **Testing Checklist:**
- [ ] All LEDs light up during hardware test
- [ ] All buttons respond in test mode
- [ ] WiFi connects successfully
- [ ] Server responds to HTTP requests
- [ ] Game sequences play correctly
- [ ] Button presses register immediately
- [ ] Scores submit to leaderboard

## 🎯 **Quick Fix Summary**

| Problem | Quick Fix |
|---------|-----------|
| No button response | Check GND connections |
| LEDs don't light | Verify LED polarity + resistors |
| WiFi fails | Check SSID/password |
| HTTP errors | Restart server |
| Memory issues | Reset ESP8266 |
| Timing problems | Use adaptive difficulty |

The improved system is much more robust and includes comprehensive testing tools. Most issues can be diagnosed using the built-in test modes! 