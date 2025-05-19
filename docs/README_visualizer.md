# Simon Says Python Visualizer

This Python script creates a high-quality, visual representation of the Simon Says breadboard schematic. The visualizer generates a clear, colorful PNG image showing all components and connections on a standard breadboard.

## Requirements

To run the Python visualizer, you'll need:

1. Python 3.6 or newer
2. Matplotlib library
3. NumPy library

## Installation

If you don't have the required libraries, install them using pip:

```bash
pip install matplotlib numpy
```

## Running the Visualizer

1. Make sure you're in the docs directory
2. Run the Python script:

```bash
python simon_says_visualizer.py
```

3. The script will automatically generate a PNG file named `simon_says_schematic.png` in the current directory

## What the Visualizer Creates

The script generates a professional-quality breadboard schematic with:

- Detailed breadboard with labeled pins and power rails
- Color-coded NodeMCU ESP8266 with labeled pins
- Properly positioned buttons, LEDs, resistors, and buzzer
- Color-coded wires matching the wiring chart
- Complete legend explaining all connections
- High-resolution output (300 DPI)

## How It Works

The visualizer uses matplotlib to draw each component programmatically:

1. First, it creates a realistic breadboard layout with proper dimensions
2. It adds the NodeMCU ESP8266 in the center position
3. It precisely places each button, LED, resistor and the buzzer
4. It draws color-coded wires showing all the connections
5. It adds labels and a detailed legend
6. Finally, it exports everything as a high-resolution PNG image

## Advantages Over ASCII Diagrams

This Python-based approach offers several advantages:

1. **Visual clarity**: Shows actual component shapes and wire routing
2. **Color-coding**: Uses color to make connections easier to understand
3. **Precision**: Places components at exact coordinates
4. **Professional appearance**: Creates a publication-quality diagram
5. **Consistency**: Ensures all components are properly proportioned

## Customizing the Output

If you want to customize the schematic:

1. Open `simon_says_visualizer.py` in a text editor
2. Modify component positions, colors, or connections as needed
3. Run the script again to generate a new PNG

## Viewing Interactively

If you want to view the schematic interactively:

1. Uncomment the last line of the script (`plt.show()`)
2. Run the script
3. A window will open with the schematic
4. You can zoom, pan, and explore the schematic in detail

---

This Python visualizer creates the clearest possible representation of your Simon Says breadboard layout, making it easy to understand and build the circuit. 