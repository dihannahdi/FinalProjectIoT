import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

def create_architecture():
    fig, ax = plt.subplots(figsize=(14, 10))
    fig.patch.set_facecolor('white')
    
    # Device Layer
    device = patches.FancyBboxPatch((1, 7), 5, 2.5, boxstyle="round,pad=0.1", 
                                   facecolor='#ff9999', edgecolor='black', linewidth=2)
    ax.add_patch(device)
    ax.text(3.5, 8.7, 'Device Layer', ha='center', va='center', fontsize=14, fontweight='bold')
    ax.text(1.2, 8.2, '• ESP8266 Microcontroller', ha='left', va='center', fontsize=10)
    ax.text(1.2, 7.8, '• 4 LED Outputs', ha='left', va='center', fontsize=10)
    ax.text(1.2, 7.4, '• 4 Push Buttons', ha='left', va='center', fontsize=10)
    
    # Network Layer  
    network = patches.FancyBboxPatch((7, 7), 5, 2.5, boxstyle="round,pad=0.1",
                                    facecolor='#99ccff', edgecolor='black', linewidth=2)
    ax.add_patch(network)
    ax.text(9.5, 8.7, 'Network Layer', ha='center', va='center', fontsize=14, fontweight='bold')
    ax.text(7.2, 8.2, '• WiFi Networks', ha='left', va='center', fontsize=10)
    ax.text(7.2, 7.8, '• HTTP Protocol', ha='left', va='center', fontsize=10)
    ax.text(7.2, 7.4, '• RESTful API', ha='left', va='center', fontsize=10)
    
    # Application Layer
    app = patches.FancyBboxPatch((1, 4), 5, 2.5, boxstyle="round,pad=0.1",
                                facecolor='#99ff99', edgecolor='black', linewidth=2)
    ax.add_patch(app)
    ax.text(3.5, 5.7, 'Application Layer', ha='center', va='center', fontsize=14, fontweight='bold')
    ax.text(1.2, 5.2, '• Node.js Backend', ha='left', va='center', fontsize=10)
    ax.text(1.2, 4.8, '• Web Interface', ha='left', va='center', fontsize=10)
    ax.text(1.2, 4.4, '• JSON Database', ha='left', va='center', fontsize=10)
    
    # Cloud Layer
    cloud = patches.FancyBboxPatch((7, 4), 5, 2.5, boxstyle="round,pad=0.1",
                                  facecolor='#ffcc99', edgecolor='black', linewidth=2)
    ax.add_patch(cloud)
    ax.text(9.5, 5.7, 'Cloud Infrastructure', ha='center', va='center', fontsize=14, fontweight='bold')
    ax.text(7.2, 5.2, '• Azure App Service', ha='left', va='center', fontsize=10)
    ax.text(7.2, 4.8, '• Application Insights', ha='left', va='center', fontsize=10)
    ax.text(7.2, 4.4, '• Azure Storage', ha='left', va='center', fontsize=10)
    
    # Arrows
    ax.arrow(6, 8.2, 0.8, 0, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(8, 7, -1.5, -0.8, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(6, 5.2, 0.8, 0, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    ax.set_title('Simon Says IoT - System Architecture', fontsize=16, fontweight='bold', pad=20)
    ax.set_xlim(0, 13)
    ax.set_ylim(3, 10)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('Diagram1_Architecture.png', dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
def create_flowchart():
    fig, ax = plt.subplots(figsize=(10, 12))
    fig.patch.set_facecolor('white')
    
    # Start
    start = patches.Ellipse((5, 11), 2, 0.8, facecolor='#90EE90', edgecolor='black')
    ax.add_patch(start)
    ax.text(5, 11, 'Start Game', ha='center', va='center', fontsize=10, fontweight='bold')
    
    # Initialize
    init = patches.FancyBboxPatch((3.5, 9.6), 3, 0.8, boxstyle="round,pad=0.05",
                                 facecolor='lightblue', edgecolor='black')
    ax.add_patch(init)
    ax.text(5, 10, 'Initialize Variables', ha='center', va='center', fontsize=9, fontweight='bold')
    
    # Generate Sequence
    gen = patches.FancyBboxPatch((3.5, 8.2), 3, 0.8, boxstyle="round,pad=0.05",
                                facecolor='lightblue', edgecolor='black')
    ax.add_patch(gen)
    ax.text(5, 8.6, 'Generate Sequence', ha='center', va='center', fontsize=9, fontweight='bold')
    
    # Display
    display = patches.FancyBboxPatch((3.5, 6.8), 3, 0.8, boxstyle="round,pad=0.05",
                                    facecolor='lightblue', edgecolor='black')
    ax.add_patch(display)
    ax.text(5, 7.2, 'Display LEDs', ha='center', va='center', fontsize=9, fontweight='bold')
    
    # Wait Input
    wait = patches.FancyBboxPatch((3.5, 5.4), 3, 0.8, boxstyle="round,pad=0.05",
                                 facecolor='lightblue', edgecolor='black')
    ax.add_patch(wait)
    ax.text(5, 5.8, 'Wait for Input', ha='center', va='center', fontsize=9, fontweight='bold')
    
    # Decision Diamond
    decision_points = np.array([[5, 4.8], [5.8, 4], [5, 3.2], [4.2, 4]])
    decision = patches.Polygon(decision_points, facecolor='yellow', edgecolor='black')
    ax.add_patch(decision)
    ax.text(5, 4, 'Correct?', ha='center', va='center', fontsize=9, fontweight='bold')
    
    # Game Over
    gameover = patches.FancyBboxPatch((1, 1.6), 2.5, 0.8, boxstyle="round,pad=0.05",
                                     facecolor='#FFB6C1', edgecolor='black')
    ax.add_patch(gameover)
    ax.text(2.25, 2, 'Game Over', ha='center', va='center', fontsize=9, fontweight='bold')
    
    # Level Complete
    level = patches.FancyBboxPatch((6.5, 1.6), 2.5, 0.8, boxstyle="round,pad=0.05",
                                  facecolor='#87CEEB', edgecolor='black')
    ax.add_patch(level)
    ax.text(7.75, 2, 'Level Complete', ha='center', va='center', fontsize=9, fontweight='bold')
    
    # End
    end = patches.Ellipse((2.25, 0.5), 1.5, 0.6, facecolor='#DDA0DD', edgecolor='black')
    ax.add_patch(end)
    ax.text(2.25, 0.5, 'End', ha='center', va='center', fontsize=9, fontweight='bold')
    
    # Arrows
    ax.arrow(5, 10.6, 0, -0.4, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(5, 9.2, 0, -0.4, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(5, 7.8, 0, -0.4, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(5, 6.4, 0, -0.4, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(5, 5.0, 0, -0.4, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    # Decision arrows
    ax.arrow(4.2, 3.5, -1.5, -1, head_width=0.1, head_length=0.1, fc='red', ec='red')
    ax.text(3.2, 2.8, 'No', ha='center', va='center', fontsize=8, color='red')
    
    ax.arrow(5.8, 3.5, 1.5, -1, head_width=0.1, head_length=0.1, fc='green', ec='green')
    ax.text(6.8, 2.8, 'Yes', ha='center', va='center', fontsize=8, color='green')
    
    # Loop back
    ax.arrow(7.75, 1.6, 0, -0.8, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(7.75, 0.8, -2.75, 0, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(5, 0.8, 0, 7.4, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    # End arrow
    ax.arrow(2.25, 1.6, 0, -0.6, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    ax.set_title('Simon Says Algorithm Flowchart', fontsize=14, fontweight='bold', pad=20)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 12)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('Diagram2_Flowchart.png', dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

def create_software():
    fig, ax = plt.subplots(figsize=(12, 8))
    fig.patch.set_facecolor('white')
    
    # Frontend
    frontend = patches.FancyBboxPatch((1, 5), 3.5, 2.5, boxstyle="round,pad=0.1",
                                     facecolor='#e1f5fe', edgecolor='black', linewidth=2)
    ax.add_patch(frontend)
    ax.text(2.75, 6.7, 'Frontend', ha='center', va='center', fontsize=12, fontweight='bold')
    ax.text(1.2, 6.2, '• HTML5/CSS3', ha='left', va='center', fontsize=9)
    ax.text(1.2, 5.8, '• JavaScript ES6+', ha='left', va='center', fontsize=9)
    ax.text(1.2, 5.4, '• Responsive Design', ha='left', va='center', fontsize=9)
    
    # Backend
    backend = patches.FancyBboxPatch((5.5, 5), 3.5, 2.5, boxstyle="round,pad=0.1",
                                    facecolor='#f3e5f5', edgecolor='black', linewidth=2)
    ax.add_patch(backend)
    ax.text(7.25, 6.7, 'Backend', ha='center', va='center', fontsize=12, fontweight='bold')
    ax.text(5.7, 6.2, '• Node.js Express', ha='left', va='center', fontsize=9)
    ax.text(5.7, 5.8, '• RESTful API', ha='left', va='center', fontsize=9)
    ax.text(5.7, 5.4, '• JSON Database', ha='left', va='center', fontsize=9)
    
    # Firmware
    firmware = patches.FancyBboxPatch((1, 1.5), 3.5, 2.5, boxstyle="round,pad=0.1",
                                     facecolor='#fff3e0', edgecolor='black', linewidth=2)
    ax.add_patch(firmware)
    ax.text(2.75, 3.2, 'ESP8266 Firmware', ha='center', va='center', fontsize=12, fontweight='bold')
    ax.text(1.2, 2.7, '• Arduino C++', ha='left', va='center', fontsize=9)
    ax.text(1.2, 2.3, '• WiFi Management', ha='left', va='center', fontsize=9)
    ax.text(1.2, 1.9, '• Hardware Control', ha='left', va='center', fontsize=9)
    
    # Communication
    comm = patches.FancyBboxPatch((5.5, 1.5), 3.5, 2.5, boxstyle="round,pad=0.1",
                                 facecolor='#e8f5e8', edgecolor='black', linewidth=2)
    ax.add_patch(comm)
    ax.text(7.25, 3.2, 'Communication', ha='center', va='center', fontsize=12, fontweight='bold')
    ax.text(5.7, 2.7, '• HTTP/HTTPS', ha='left', va='center', fontsize=9)
    ax.text(5.7, 2.3, '• JSON Format', ha='left', va='center', fontsize=9)
    ax.text(5.7, 1.9, '• Polling Mechanism', ha='left', va='center', fontsize=9)
    
    # Arrows
    ax.arrow(4.5, 6.2, 0.8, 0, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(6.5, 5, -1.5, -1.2, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(4.5, 2.7, 0.8, 0, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    ax.set_title('Software Components Architecture', fontsize=14, fontweight='bold', pad=20)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('Diagram3_Software.png', dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

if __name__ == "__main__":
    print("Creating diagrams...")
    create_architecture()
    print("✅ Architecture diagram created")
    create_flowchart() 
    print("✅ Flowchart diagram created")
    create_software()
    print("✅ Software components diagram created")
    print("All PNG files created successfully!") 