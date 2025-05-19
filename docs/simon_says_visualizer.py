#!/usr/bin/env python3
"""
Simon Says Breadboard Visualizer
--------------------------------
This script generates a clear visual representation of the Simon Says game
breadboard layout using matplotlib.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.path import Path
import numpy as np

# Define colors
RED = '#FF0000'
GREEN = '#00CC00'
BLUE = '#0000FF'
YELLOW = '#FFCC00'
BLACK = '#000000'
ORANGE = '#FF6600'
PURPLE = '#9900CC'
GRAY = '#666666'
BROWN = '#996633'
PINK = '#FF66CC'
WHITE = '#FFFFFF'

# Set up the figure and axis
fig, ax = plt.subplots(figsize=(12, 15))
ax.set_xlim(0, 60)
ax.set_ylim(0, 75)
ax.set_aspect('equal')
ax.axis('off')

# Function to draw a breadboard
def draw_breadboard():
    # Main breadboard body
    breadboard = patches.Rectangle((5, 5), 50, 65, fill=True, color='#F5F5F5', 
                                   ec='#CCCCCC', lw=1, zorder=1)
    ax.add_patch(breadboard)
    
    # Draw power rails
    pos_rail_top = patches.Rectangle((5, 68), 50, 2, fill=True, color='#FF0000', alpha=0.3, zorder=2)
    neg_rail_top = patches.Rectangle((5, 65), 50, 2, fill=True, color='#0000FF', alpha=0.3, zorder=2)
    pos_rail_bottom = patches.Rectangle((5, 8), 50, 2, fill=True, color='#FF0000', alpha=0.3, zorder=2)
    neg_rail_bottom = patches.Rectangle((5, 5), 50, 2, fill=True, color='#0000FF', alpha=0.3, zorder=2)
    
    ax.add_patch(pos_rail_top)
    ax.add_patch(neg_rail_top)
    ax.add_patch(pos_rail_bottom)
    ax.add_patch(neg_rail_bottom)
    
    # Add labels for power rails
    ax.text(3, 69, '+', fontsize=12, ha='center', va='center', color='#FF0000', weight='bold')
    ax.text(3, 66, '-', fontsize=12, ha='center', va='center', color='#0000FF', weight='bold')
    ax.text(3, 9, '+', fontsize=12, ha='center', va='center', color='#FF0000', weight='bold')
    ax.text(3, 6, '-', fontsize=12, ha='center', va='center', color='#0000FF', weight='bold')
    
    # Draw the center gap
    center_gap = patches.Rectangle((5, 35), 50, 3, fill=True, color='#FFFFFF', ec='#CCCCCC', lw=1, zorder=2)
    ax.add_patch(center_gap)
    
    # Draw pin rows
    for i in range(30):
        y_top = 38 + i
        y_bottom = 35 - i
        
        # Top pins (A-E)
        for j in range(5):
            x = 8 + j * 2.5
            pin = patches.Circle((x, y_top), 0.5, fill=True, ec='#AAAAAA', color='#DDDDDD', zorder=2)
            ax.add_patch(pin)
        
        # Top pins (F-J)
        for j in range(5):
            x = 30 + j * 2.5
            pin = patches.Circle((x, y_top), 0.5, fill=True, ec='#AAAAAA', color='#DDDDDD', zorder=2)
            ax.add_patch(pin)
        
        # Bottom pins (A-E)
        for j in range(5):
            x = 8 + j * 2.5
            pin = patches.Circle((x, y_bottom), 0.5, fill=True, ec='#AAAAAA', color='#DDDDDD', zorder=2)
            ax.add_patch(pin)
        
        # Bottom pins (F-J)
        for j in range(5):
            x = 30 + j * 2.5
            pin = patches.Circle((x, y_bottom), 0.5, fill=True, ec='#AAAAAA', color='#DDDDDD', zorder=2)
            ax.add_patch(pin)
    
    # Add column labels
    cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    for i, col in enumerate(cols):
        x = 8 + (i % 5) * 2.5 if i < 5 else 30 + (i % 5) * 2.5
        ax.text(x, 71, col, fontsize=8, ha='center', va='center')
    
    # Add row labels
    for i in range(30):
        row_num = 30 - i
        y_pos = 38 + i
        ax.text(3, y_pos, str(row_num), fontsize=6, ha='center', va='center')
        ax.text(55, y_pos, str(row_num), fontsize=6, ha='center', va='center')

# Function to draw the NodeMCU ESP8266
def draw_nodemcu():
    # NodeMCU board
    nodemcu = patches.Rectangle((15, 38), 20, 24, fill=True, color='#000080', ec='#000000', lw=1, zorder=3)
    ax.add_patch(nodemcu)
    
    # Add pin labels
    pins_left = ['A0', 'RSV', '3V3', 'GND', 'D0', 'D1', 'D2', 'D3', 'D4']
    pins_right = ['D5', 'D6', 'D7', 'D8', 'TX', 'RX', 'RSV', 'RSV', 'GND']
    
    for i, pin in enumerate(pins_left):
        y = 61 - i * 2.4
        ax.text(14, y, pin, fontsize=6, ha='right', va='center', color='white')
    
    for i, pin in enumerate(pins_right):
        y = 61 - i * 2.4
        ax.text(36, y, pin, fontsize=6, ha='left', va='center', color='white')
    
    # Board label
    ax.text(25, 50, 'NodeMCU\nESP8266', fontsize=7, ha='center', va='center', color='white')

# Function to draw a button
def draw_button(position, color, button_num):
    x, y = position
    button = patches.Rectangle((x-2, y-1), 4, 2, fill=True, color='#444444', ec='#000000', lw=1, zorder=3)
    ax.add_patch(button)
    
    # Draw terminals
    term1 = patches.Circle((x-1, y), 0.5, fill=True, ec='#000000', color='#CCCCCC', zorder=4)
    term2 = patches.Circle((x+1, y), 0.5, fill=True, ec='#000000', color='#CCCCCC', zorder=4)
    ax.add_patch(term1)
    ax.add_patch(term2)
    
    # Add label
    ax.text(x, y-2, f"Button {button_num}\n({color})", fontsize=6, ha='center', va='center')

# Function to draw an LED
def draw_led(position, color, led_num):
    x, y = position
    body_color = {'RED': RED, 'GREEN': GREEN, 'BLUE': BLUE, 'YELLOW': YELLOW}[color]
    
    # LED body
    led_body = patches.Circle((x, y), 1, fill=True, color=body_color, ec='#000000', lw=1, alpha=0.7, zorder=3)
    
    # LED legs
    leg1 = patches.Rectangle((x-0.2, y-2), 0.4, 2, fill=True, color='#CCCCCC', ec='#000000', lw=0.5, zorder=3)
    leg2 = patches.Rectangle((x-0.2, y), 0.4, 2, fill=True, color='#CCCCCC', ec='#000000', lw=0.5, zorder=3)
    
    ax.add_patch(led_body)
    ax.add_patch(leg1)
    ax.add_patch(leg2)
    
    # Add label
    ax.text(x, y-3.5, f"LED {led_num}\n({color})", fontsize=6, ha='center', va='center')

# Function to draw a resistor
def draw_resistor(start, end, value, label):
    x1, y1 = start
    x2, y2 = end
    
    # Resistor body
    dx = x2 - x1
    dy = y2 - y1
    length = np.sqrt(dx**2 + dy**2)
    angle = np.arctan2(dy, dx) * 180 / np.pi
    
    if abs(angle) < 45 or abs(angle) > 135:  # Horizontal resistor
        resistor = patches.Rectangle((x1, y1-0.5), length, 1, fill=True, color='#D2B48C', 
                                     ec='#000000', lw=1, zorder=3, angle=angle)
    else:  # Vertical resistor
        resistor = patches.Rectangle((x1-0.5, y1), 1, length, fill=True, color='#D2B48C', 
                                     ec='#000000', lw=1, zorder=3, angle=angle-90)
    
    ax.add_patch(resistor)
    
    # Add label
    mid_x = (x1 + x2) / 2
    mid_y = (y1 + y2) / 2
    ax.text(mid_x, mid_y + 1, f"{value}Ω\n({label})", fontsize=6, ha='center', va='center')

# Function to draw the buzzer
def draw_buzzer(position):
    x, y = position
    
    # Buzzer body
    buzzer_body = patches.Circle((x, y), 2, fill=True, color='#000000', ec='#444444', lw=1, zorder=3)
    ax.add_patch(buzzer_body)
    
    # Buzzer terminals
    term1 = patches.Rectangle((x-0.2, y-3), 0.4, 1, fill=True, color='#CCCCCC', ec='#000000', lw=0.5, zorder=3)
    term2 = patches.Rectangle((x-0.2, y+2), 0.4, 1, fill=True, color='#CCCCCC', ec='#000000', lw=0.5, zorder=3)
    ax.add_patch(term1)
    ax.add_patch(term2)
    
    # Add label
    ax.text(x, y, "+", fontsize=8, ha='center', va='center', color='white')
    ax.text(x, y-4, "Buzzer", fontsize=6, ha='center', va='center')

# Function to draw a wire
def draw_wire(start, end, color):
    x1, y1 = start
    x2, y2 = end
    
    # Create curved wire path
    if abs(x2 - x1) > abs(y2 - y1):  # Mostly horizontal wire
        mid_x = (x1 + x2) / 2
        verts = [
            (x1, y1),
            (mid_x, y1),
            (mid_x, y2),
            (x2, y2)
        ]
    else:  # Mostly vertical wire
        mid_y = (y1 + y2) / 2
        verts = [
            (x1, y1),
            (x1, mid_y),
            (x2, mid_y),
            (x2, y2)
        ]
    
    codes = [Path.MOVETO, Path.CURVE4, Path.CURVE4, Path.CURVE4]
    path = Path(verts, codes)
    
    wire = patches.PathPatch(path, facecolor='none', edgecolor=color, lw=1.5, zorder=5)
    ax.add_patch(wire)

# Main function to draw everything
def draw_simon_says_layout():
    draw_breadboard()
    draw_nodemcu()
    
    # Draw buttons
    buttons = [
        ((8, 60), 'RED', 1),     # Button 1 (Red)
        ((8, 55), 'GREEN', 2),   # Button 2 (Green)
        ((8, 50), 'BLUE', 3),    # Button 3 (Blue)
        ((8, 45), 'YELLOW', 4)   # Button 4 (Yellow)
    ]
    
    for pos, color, num in buttons:
        draw_button(pos, color, num)
    
    # Draw LEDs
    leds = [
        ((40, 60), 'RED', 1),     # LED 1 (Red)
        ((40, 55), 'GREEN', 2),   # LED 2 (Green)
        ((40, 50), 'BLUE', 3),    # LED 3 (Blue)
        ((40, 45), 'YELLOW', 4)   # LED 4 (Yellow)
    ]
    
    for pos, color, num in leds:
        draw_led(pos, color, num)
    
    # Draw resistors for LEDs (220Ω)
    led_resistors = [
        ((35, 60), (38, 60), '220', 'R1'),  # R1
        ((35, 55), (38, 55), '220', 'R2'),  # R2
        ((35, 50), (38, 50), '220', 'R3'),  # R3
        ((35, 45), (38, 45), '220', 'R4')   # R4
    ]
    
    for start, end, value, label in led_resistors:
        draw_resistor(start, end, value, label)
    
    # Draw pull-down resistors for buttons (10kΩ)
    button_resistors = [
        ((10, 60), (10, 66), '10k', 'Pull-down 1'),  # Pull-down 1
        ((10, 55), (10, 66), '10k', 'Pull-down 2'),  # Pull-down 2
        ((10, 50), (10, 66), '10k', 'Pull-down 3'),  # Pull-down 3
        ((10, 45), (10, 66), '10k', 'Pull-down 4')   # Pull-down 4
    ]
    
    for start, end, value, label in button_resistors:
        draw_resistor(start, end, value, label)
    
    # Draw buzzer
    draw_buzzer((25, 20))
    
    # Draw wires
    # Power connections
    draw_wire((15, 59.4), (5, 69), RED)        # 3V3 to Positive rail
    draw_wire((15, 57), (5, 66), BLACK)        # GND to Negative rail
    
    # Button connections
    draw_wire((7, 60), (15, 54.6), YELLOW)     # Button 1 to D1
    draw_wire((7, 55), (15, 52.2), GREEN)      # Button 2 to D2
    draw_wire((7, 50), (15, 49.8), BLUE)       # Button 3 to D3
    draw_wire((7, 45), (15, 47.4), WHITE)      # Button 4 to D4
    
    # Button ground connections through resistors
    draw_wire((10, 66), (5, 66), BLACK)        # Pull-down resistors to Negative rail
    
    # LED connections
    draw_wire((35, 60.6), (42, 60.6), RED)     # LED 1 Cathode to Negative rail
    draw_wire((35, 55.6), (42, 55.6), RED)     # LED 2 Cathode to Negative rail
    draw_wire((35, 50.6), (42, 50.6), RED)     # LED 3 Cathode to Negative rail
    draw_wire((35, 45.6), (42, 45.6), RED)     # LED 4 Cathode to Negative rail
    
    draw_wire((35, 61.2), (55, 66), BLACK)     # LED Cathodes to Negative rail
    
    # NodeMCU to LED Resistors
    draw_wire((35, 60), (34, 60), ORANGE)      # D5 to R1
    draw_wire((35, 55), (34, 55), PURPLE)      # D6 to R2
    draw_wire((35, 50), (34, 50), GRAY)        # D7 to R3
    draw_wire((35, 45), (34, 45), BROWN)       # D8 to R4
    
    # Buzzer connections
    draw_wire((25, 17), (15, 45), PINK)        # Buzzer to D0
    draw_wire((25, 23), (5, 66), BLACK)        # Buzzer to Negative rail
    
    # Add title
    ax.text(30, 74, "Simon Says Game - Breadboard Layout", fontsize=14, ha='center', va='center', weight='bold')
    
    # Add legend
    legend_items = [
        (RED, "3.3V Power"),
        (BLACK, "Ground (GND)"),
        (YELLOW, "Button 1 to D1"),
        (GREEN, "Button 2 to D2"),
        (BLUE, "Button 3 to D3"),
        (WHITE, "Button 4 to D4"),
        (ORANGE, "D5 to Red LED"),
        (PURPLE, "D6 to Green LED"),
        (GRAY, "D7 to Blue LED"),
        (BROWN, "D8 to Yellow LED"),
        (PINK, "D0 to Buzzer")
    ]
    
    legend_x = 60
    for i, (color, label) in enumerate(legend_items):
        y = 65 - i * 2
        ax.plot([legend_x], [y], marker='o', color=color, markersize=5)
        ax.text(legend_x + 1, y, label, fontsize=6, va='center')

# Generate the visualization
draw_simon_says_layout()

# Add a note about how to use this script
ax.text(30, 2, "To generate the PNG: Run this script and use plt.savefig('simon_says_schematic.png', dpi=300)", 
        fontsize=8, ha='center', va='center', style='italic')

plt.tight_layout()
plt.savefig('simon_says_schematic.png', dpi=300, bbox_inches='tight')
print("Schematic saved as 'simon_says_schematic.png'")

# Uncomment to display the plot interactively
# plt.show() 