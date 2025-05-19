# Simon Says Game - Clear Design Schematic Guide

## Component Layout & Precise Positioning

### Breadboard Setup
- Use a standard 830-point breadboard with 63 rows
- Power rails on both sides (red +, blue -)
- Connect both sides of power rails (top and bottom jumpers)

### NodeMCU Placement (Central Position)
- Position: Rows 15-30, straddling the center divide
- Orientation: USB port facing upward
- Pin 1 (A0) should be at row 15
- Pin 30 (GND) should be at row 30

### Button Placement (Left Side)
- **Button 1 (Red)**
  - Position: Rows 15-16, columns A-D
  - One terminal at B15, other at C15
  
- **Button 2 (Green)**
  - Position: Rows 20-21, columns A-D
  - One terminal at B20, other at C20
  
- **Button 3 (Blue)**
  - Position: Rows 25-26, columns A-D
  - One terminal at B25, other at C25
  
- **Button 4 (Yellow)**
  - Position: Rows 30-31, columns A-D
  - One terminal at B30, other at C30

### LED Placement (Right Side)
- **LED 1 (Red)**
  - Position: Row 15, columns I-J
  - Anode (longer leg) at I15
  - Cathode (shorter leg) at J15
  
- **LED 2 (Green)**
  - Position: Row 20, columns I-J
  - Anode at I20
  - Cathode at J20
  
- **LED 3 (Blue)**
  - Position: Row 25, columns I-J
  - Anode at I25
  - Cathode at J25
  
- **LED 4 (Yellow)**
  - Position: Row 30, columns I-J
  - Anode at I30
  - Cathode at J30

### Buzzer Placement (Bottom)
- Position: Rows 40-42, columns E-G
- Positive terminal at F40
- Negative terminal at F42

### Resistor Placement
- **220Ω Resistors for LEDs:**
  - R1: From H15 to I15 (for Red LED)
  - R2: From H20 to I20 (for Green LED)
  - R3: From H25 to I25 (for Blue LED)
  - R4: From H30 to I30 (for Yellow LED)
  
- **10kΩ Resistors for Buttons (Pull-down):**
  - From C15 to negative rail (for Button 1)
  - From C20 to negative rail (for Button 2)
  - From C25 to negative rail (for Button 3)
  - From C30 to negative rail (for Button 4)

## Clear Wiring Instructions

### Power Connections
```
NodeMCU 3V3 (Pin 3) ------> Positive rail (+)
NodeMCU GND (Pin 4) ------> Negative rail (-)
```

### Button Connections
```
Button 1: B15 ------> NodeMCU D1 (Pin 16)
Button 2: B20 ------> NodeMCU D2 (Pin 17)
Button 3: B25 ------> NodeMCU D3 (Pin 18)
Button 4: B30 ------> NodeMCU D4 (Pin 19)
```

### LED Connections
```
NodeMCU D5 (Pin 20) ------> R1 ------> LED 1 Anode (I15)
NodeMCU D6 (Pin 21) ------> R2 ------> LED 2 Anode (I20)
NodeMCU D7 (Pin 22) ------> R3 ------> LED 3 Anode (I25)
NodeMCU D8 (Pin 23) ------> R4 ------> LED 4 Anode (I30)

LED 1 Cathode (J15) ------> Negative rail (-)
LED 2 Cathode (J20) ------> Negative rail (-)
LED 3 Cathode (J25) ------> Negative rail (-)
LED 4 Cathode (J30) ------> Negative rail (-)
```

### Buzzer Connections
```
NodeMCU D0 (Pin 15) ------> Buzzer positive terminal (F40)
Buzzer negative terminal (F42) ------> Negative rail (-)
```

## Wire Color Coding

For maximum clarity, use these specific wire colors:
- **Red wires**: All 3.3V power connections
- **Black wires**: All ground connections
- **Yellow wire**: Button 1 to D1
- **Green wire**: Button 2 to D2
- **Blue wire**: Button 3 to D3
- **White wire**: Button 4 to D4
- **Orange wire**: D5 to Red LED resistor
- **Purple wire**: D6 to Green LED resistor
- **Gray wire**: D7 to Blue LED resistor
- **Brown wire**: D8 to Yellow LED resistor
- **Pink wire**: D0 to Buzzer

## Step-by-Step Fritzing Assembly Guide

1. **Start a new project in Fritzing**
   - File → New

2. **Add and position the breadboard**
   - Drag a breadboard to the center of the workspace

3. **Add the NodeMCU ESP8266**
   - Import the NodeMCU part from the Resources document
   - Position it in the center of the breadboard (rows 15-30)

4. **Add buttons**
   - Place each button at the specified positions
   - Ensure they bridge the center gap of the breadboard

5. **Add LEDs**
   - Place each LED at its position, paying attention to polarity
   - The anode (longer leg) should connect toward the NodeMCU
   - The cathode (shorter leg) should connect toward the right side

6. **Add resistors**
   - Place 220Ω resistors for the LEDs
   - Place 10kΩ resistors for the buttons

7. **Add the buzzer**
   - Position the buzzer at the bottom section

8. **Connect power rails**
   - Add red wire from NodeMCU 3V3 to the positive rail
   - Add black wire from NodeMCU GND to the negative rail
   - Add jumpers connecting power rails across the breadboard

9. **Wire buttons**
   - Connect each button to its corresponding NodeMCU pin
   - Connect pull-down resistors from buttons to ground rail

10. **Wire LEDs**
    - Connect NodeMCU pins to LED anodes through resistors
    - Connect all LED cathodes to the ground rail

11. **Wire buzzer**
    - Connect NodeMCU D0 to buzzer positive terminal
    - Connect buzzer negative terminal to ground rail

12. **Add labels**
    - Use the Text tool to add labels for major components
    - Label each button, LED, and the buzzer

13. **Export as high-resolution PNG**
    - File → Export → As Image → PNG
    - Set resolution to 600 DPI for maximum clarity
    - Check "Include background color" option
    - Save as "simon_says_clear_design.png"

## Example Grid Diagram for Visual Reference

```
    +-------------------------------------------------------------------------+
    |  + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +  |
    |  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  |
    |                                                                         |
    |    A   B   C   D   E   F   G   H   I   J                                |
    | 15 o---B1--o---o---N---N---N---R1--LED1-o---o BUTTON 1 (RED)           |
    | 16 o---o---o---o---O---O---O---o---o---o---o                           |
    | 17 o---o---o---o---D---D---D---o---o---o---o                           |
    | 18 o---o---o---o---E---E---E---o---o---o---o                           |
    | 19 o---o---o---o---M---M---M---o---o---o---o                           |
    | 20 o---B2--o---o---C---C---C---R2--LED2-o---o BUTTON 2 (GREEN)         |
    | 21 o---o---o---o---U---U---U---o---o---o---o                           |
    | 22 o---o---o---o---|---|---|---o---o---o---o                           |
    | 23 o---o---o---o---E---E---E---o---o---o---o                           |
    | 24 o---o---o---o---S---S---S---o---o---o---o                           |
    | 25 o---B3--o---o---P---P---P---R3--LED3-o---o BUTTON 3 (BLUE)          |
    | 26 o---o---o---o---8---8---8---o---o---o---o                           |
    | 27 o---o---o---o---2---2---2---o---o---o---o                           |
    | 28 o---o---o---o---6---6---6---o---o---o---o                           |
    | 29 o---o---o---o---6---6---6---o---o---o---o                           |
    | 30 o---B4--o---o---|---|---|---R4--LED4-o---o BUTTON 4 (YELLOW)        |
    |                                                                         |
    | 40 o---o---o---o---o---BZ+-o---o---o---o---o BUZZER                    |
    | 41 o---o---o---o---o---o---o---o---o---o---o                           |
    | 42 o---o---o---o---o---BZ--o---o---o---o---o                           |
    |                                                                         |
    |  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  |
    |  + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +  |
    +-------------------------------------------------------------------------+
```

## Legend for the Grid Diagram
- B1, B2, B3, B4: Push buttons
- LED1, LED2, LED3, LED4: LEDs
- R1, R2, R3, R4: 220Ω resistors
- BZ+, BZ-: Buzzer terminals
- N, O, D, E, M, C, U: NodeMCU pins
- +: Positive power rail
- -: Negative power rail (ground)

## Final Checks Before Export
- Verify all connections match the wiring diagram
- Ensure all components are correctly oriented
- Check that all ground connections go to the negative rail
- Verify that resistors have the correct values
- Test connectivity in Fritzing using the "View → Routing Status" 