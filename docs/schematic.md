# Simon Says Game Hardware Schematic

## Components Required

- NodeMCU ESP8266 development board
- 4 Push buttons
- 4 LEDs (different colors recommended: red, green, blue, yellow)
- 1 Piezo buzzer
- 4 Resistors (220Ω) for LEDs
- 4 Resistors (10kΩ) for buttons (pull-down)
- Breadboard
- Jumper wires
- Power supply (USB or 3.3V battery)

## Pin Connections

### Buttons
- Button 1 (Red): Connected to D1 (GPIO 5)
- Button 2 (Green): Connected to D2 (GPIO 4)
- Button 3 (Blue): Connected to D3 (GPIO 0)
- Button 4 (Yellow): Connected to D4 (GPIO 2)

### LEDs
- LED 1 (Red): Connected to D5 (GPIO 14) through a 220Ω resistor
- LED 2 (Green): Connected to D6 (GPIO 12) through a 220Ω resistor
- LED 3 (Blue): Connected to D7 (GPIO 13) through a 220Ω resistor
- LED 4 (Yellow): Connected to D8 (GPIO 15) through a 220Ω resistor

### Buzzer
- Buzzer: Connected to D0 (GPIO 16)

## Wiring Diagram

### Button Connections
Each button should be connected as follows:
- One terminal to GND through a 10kΩ resistor (pull-down configuration)
- One terminal to the respective GPIO pin
- Both terminals connected across the button

### LED Connections
Each LED should be connected as follows:
- Anode (longer leg) to the respective GPIO pin through a 220Ω resistor
- Cathode (shorter leg) to GND

### Buzzer Connection
- Positive terminal to D0 (GPIO 16)
- Negative terminal to GND

## Schematic Diagram

```
                        NodeMCU ESP8266
                      +----------------+
                      |                |
                      |                |
         +------------+ 3V3        D0 +------------+
         |            |            (16)|            |
         |            |                |            |
     +---+---+        |                |        +-----------+
     |POWER  |        |                |        |   BUZZER  |
     +-------+        |                |        +-----------+
                      |                |
Button 1 +------------+ D1(5)          |
         |            |                |
         +--[10kΩ]--GND                |
                      |                |
Button 2 +------------+ D2(4)          |
         |            |                |
         +--[10kΩ]--GND                |
                      |                |
Button 3 +------------+ D3(0)          |
         |            |                |
         +--[10kΩ]--GND                |
                      |                |
Button 4 +------------+ D4(2)          |
         |            |                |
         +--[10kΩ]--GND                |
                      |                |
LED 1    +--[220Ω]----+ D5(14)         |
         |            |                |
         +----------GND                |
                      |                |
LED 2    +--[220Ω]----+ D6(12)         |
         |            |                |
         +----------GND                |
                      |                |
LED 3    +--[220Ω]----+ D7(13)         |
         |            |                |
         +----------GND                |
                      |                |
LED 4    +--[220Ω]----+ D8(15)         |
         |            |                |
         +----------GND                |
                      |                |
                      +----------------+
```

## Power Considerations

- The NodeMCU can be powered via USB from a computer or power bank
- For a standalone setup, use a 3.3V battery pack
- Ensure the power supply can provide at least 500mA of current

## Notes
- Make sure all GND connections are connected to the NodeMCU's GND pin
- Verify all connections before powering on the circuit
- Test each component individually before running the full Simon Says game firmware
- The exact GPIO pin numbers are used in the firmware, so ensure connections match exactly as specified 