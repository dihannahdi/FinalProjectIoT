# Simon Says Game Breadboard Layout

## Components Placement

### Central Components
- Place the NodeMCU ESP8266 in the center of the breadboard, straddling the center divide
- The breadboard's power rails (+) and ground rails (-) should run along both sides

### Button Section (Left Side)
- Place the 4 push buttons on the left side of the breadboard
- Each button should bridge the gap in the middle of the breadboard
- Leave a few rows between each button for wiring space

### LED Section (Right Side)
- Place the 4 LEDs on the right side of the breadboard
- Position each LED so the anode (longer leg) faces toward the center
- The cathode (shorter leg) should connect toward the ground rail

### Buzzer Placement
- Place the piezo buzzer at the bottom of the breadboard

## Detailed Wiring Instructions

### Power Supply
1. Connect the NodeMCU's 3V3 pin to the positive power rail (+)
2. Connect the NodeMCU's GND pin to the negative power rail (-)
3. Connect the power rails on both sides to ensure power distribution

### Button Connections
For each button (using the breadboard's tie points):
1. Connect one terminal to the corresponding NodeMCU pin:
   - Button 1 (Red): D1 (GPIO 5)
   - Button 2 (Green): D2 (GPIO 4)
   - Button 3 (Blue): D3 (GPIO 0)
   - Button 4 (Yellow): D4 (GPIO 2)
2. Connect the other terminal to ground through a 10kΩ resistor (pull-down)

### LED Connections
For each LED:
1. Insert the LED with the anode (longer leg) facing the center
2. Connect the anode to the corresponding NodeMCU pin through a 220Ω resistor:
   - LED 1 (Red): D5 (GPIO 14)
   - LED 2 (Green): D6 (GPIO 12)
   - LED 3 (Blue): D7 (GPIO 13)
   - LED 4 (Yellow): D8 (GPIO 15)
3. Connect the cathode (shorter leg) to the ground rail

### Buzzer Connection
1. Connect the positive terminal to D0 (GPIO 16)
2. Connect the negative terminal to the ground rail

## Breadboard Diagram

```
    +-------------------------------------------------------------------------+
    |                                                                         |
    |  +-+                                                 +-+                |
    |  |+|                                                 |+|                |
GND |  |-|                                                 |-|                | GND
    |  | |                                                 | |                |
3V3 |  |+|                                                 |+|                | 3V3
    |  | |                                                 | |                |
    |  | |   B1  B1                   +--------+      R1  | |  LED1          |
    |  | |   o---o                    |        |      o---o   o              |
    |  | |   |   |                    |        |      |       |              |
    |  | |   o   o---[10kΩ]---o       | NodeMCU|      |       |              |
    |  | |       |           |        |        |      |       |              |
    |  | |       |           |        |        |      |       |              |
    |  | |   B2  B2          |        |        |      R2  LED2               |
    |  | |   o---o           |        |        |      o---o                  |
    |  | |   |   |           |        |        |      |   |                  |
    |  | |   o   o---[10kΩ]--+        |        |      |   |                  |
    |  | |       |           |        |        |      |   |                  |
    |  | |       |           |        |        |      |   |                  |
    |  | |   B3  B3          |        |        |      R3  LED3               |
    |  | |   o---o           |        |        |      o---o                  |
    |  | |   |   |           |        |        |      |   |                  |
    |  | |   o   o---[10kΩ]--+        |        |      |   |                  |
    |  | |       |           |        |        |      |   |                  |
    |  | |       |           |        |        |      |   |                  |
    |  | |   B4  B4          |        |        |      R4  LED4               |
    |  | |   o---o           |        |        |      o---o                  |
    |  | |   |   |           |        |        |      |   |                  |
    |  | |   o   o---[10kΩ]--+        |        |      |   |                  |
    |  | |       |           |        +--------+      |   |                  |
    |  | |       |           |                        |   |                  |
    |  | |       |           |                        |   |                  |
    |  | |       |      BUZZER                        |   |                  |
    |  | |       |       o---o                        |   |                  |
    |  | |       |       |   |                        |   |                  |
    |  | |       +-------+   |                        |   |                  |
    |  | |                   |                        |   |                  |
    |  | |                   |                        |   |                  |
    |  | |                   |                        |   |                  |
    |  | |                   |                        |   |                  |
    |  |-|-------------------+------------------------+---+                  |
    |  |+|                                                                   |
    |  | |                                                                   |
    +-------------------------------------------------------------------------+
```

## Wiring Legend
- B1, B2, B3, B4: Push buttons (Red, Green, Blue, Yellow)
- R1, R2, R3, R4: 220Ω resistors for LEDs
- [10kΩ]: Pull-down resistors for buttons
- LED1, LED2, LED3, LED4: LEDs (Red, Green, Blue, Yellow)

## Connection Table

| Component      | NodeMCU Pin  | Breadboard Connection                       |
|----------------|--------------|---------------------------------------------|
| Button 1 (Red) | D1 (GPIO 5)  | One terminal to D1, other to GND via 10kΩ   |
| Button 2 (Green)| D2 (GPIO 4) | One terminal to D2, other to GND via 10kΩ   |
| Button 3 (Blue)| D3 (GPIO 0)  | One terminal to D3, other to GND via 10kΩ   |
| Button 4 (Yellow)| D4 (GPIO 2)| One terminal to D4, other to GND via 10kΩ   |
| LED 1 (Red)    | D5 (GPIO 14) | Anode to D5 via 220Ω, cathode to GND        |
| LED 2 (Green)  | D6 (GPIO 12) | Anode to D6 via 220Ω, cathode to GND        |
| LED 3 (Blue)   | D7 (GPIO 13) | Anode to D7 via 220Ω, cathode to GND        |
| LED 4 (Yellow) | D8 (GPIO 15) | Anode to D8 via 220Ω, cathode to GND        |
| Buzzer         | D0 (GPIO 16) | Positive to D0, negative to GND             |

## Tips for Breadboard Construction
1. Use different colored jumper wires to keep track of connections:
   - Red for power connections (3.3V)
   - Black for ground connections
   - Other colors for signal connections
2. Test each component individually before connecting everything
3. Double-check all connections before powering on
4. Keep wires neat and organized for easier troubleshooting
5. You can use a half-size breadboard if space is limited

## Power Options
1. Power the NodeMCU via micro USB from a computer or power bank
2. For standalone operation, connect a 3.3V battery pack to the breadboard power rails
   - Ensure the battery can provide at least 500mA of current 