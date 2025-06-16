import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import numpy as np

# Set up matplotlib for better rendering
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300

def create_architecture_diagram():
    fig, ax = plt.subplots(1, 1, figsize=(16, 12))
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    
    # Define colors
    device_color = '#ff9999'
    network_color = '#99ccff' 
    app_color = '#99ff99'
    cloud_color = '#ffcc99'
    
    # Device Layer
    device_box = FancyBboxPatch((0.5, 8), 6, 3.5, 
                               boxstyle="round,pad=0.1", 
                               facecolor=device_color, 
                               edgecolor='black', linewidth=2)
    ax.add_patch(device_box)
    ax.text(3.5, 10.8, 'Device Layer', ha='center', va='center', fontsize=14, fontweight='bold')
    ax.text(1, 10.2, '• ESP8266 Microcontroller', ha='left', va='center', fontsize=10)
    ax.text(1, 9.8, '• 4 LED Outputs (R,G,B,Y)', ha='left', va='center', fontsize=10)
    ax.text(1, 9.4, '• 4 Push Buttons', ha='left', va='center', fontsize=10)
    ax.text(1, 9.0, '• Buzzer Audio Output', ha='left', va='center', fontsize=10)
    ax.text(1, 8.6, '• WiFi Module 802.11 b/g/n', ha='left', va='center', fontsize=10)
    
    # Network Layer
    network_box = FancyBboxPatch((8, 8), 6, 3.5,
                                boxstyle="round,pad=0.1",
                                facecolor=network_color,
                                edgecolor='black', linewidth=2)
    ax.add_patch(network_box)
    ax.text(11, 10.8, 'Network Layer', ha='center', va='center', fontsize=14, fontweight='bold')
    ax.text(8.5, 10.2, '• Multi-WiFi Networks', ha='left', va='center', fontsize=10)
    ax.text(8.5, 9.8, '• HTTP/TCP Protocol', ha='left', va='center', fontsize=10)
    ax.text(8.5, 9.4, '• RESTful API Communication', ha='left', va='center', fontsize=10)
    ax.text(8.5, 9.0, '• JSON Data Format', ha='left', va='center', fontsize=10)
    
    # Application Layer
    app_box = FancyBboxPatch((0.5, 4), 6, 3.5,
                            boxstyle="round,pad=0.1",
                            facecolor=app_color,
                            edgecolor='black', linewidth=2)
    ax.add_patch(app_box)
    ax.text(3.5, 6.8, 'Application Layer', ha='center', va='center', fontsize=14, fontweight='bold')
    ax.text(1, 6.2, '• Node.js Backend Server', ha='left', va='center', fontsize=10)
    ax.text(1, 5.8, '• Frontend Web Interface', ha='left', va='center', fontsize=10)
    ax.text(1, 5.4, '• JSON Database Storage', ha='left', va='center', fontsize=10)
    ax.text(1, 5.0, '• Express.js Framework', ha='left', va='center', fontsize=10)
    
    # Cloud Layer
    cloud_box = FancyBboxPatch((8, 4), 6, 3.5,
                              boxstyle="round,pad=0.1",
                              facecolor=cloud_color,
                              edgecolor='black', linewidth=2)
    ax.add_patch(cloud_box)
    ax.text(11, 6.8, 'Cloud Infrastructure', ha='center', va='center', fontsize=14, fontweight='bold')
    ax.text(8.5, 6.2, '• Azure App Service', ha='left', va='center', fontsize=10)
    ax.text(8.5, 5.8, '• Application Insights', ha='left', va='center', fontsize=10)
    ax.text(8.5, 5.4, '• Azure Storage', ha='left', va='center', fontsize=10)
    ax.text(8.5, 5.0, '• Load Balancer', ha='left', va='center', fontsize=10)
    
    # Add arrows
    ax.arrow(6.5, 9.75, 1.3, 0, head_width=0.2, head_length=0.2, fc='black', ec='black')
    ax.arrow(9, 8, -1.8, -1, head_width=0.2, head_length=0.2, fc='black', ec='black')
    ax.arrow(6.5, 5.75, 1.3, 0, head_width=0.2, head_length=0.2, fc='black', ec='black')
    
    ax.set_title('Simon Says IoT - System Architecture', fontsize=18, fontweight='bold', pad=20)
    ax.set_xlim(0, 15)
    ax.set_ylim(3, 12)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('Diagram1_Arsitektur_Sistem_IoT.png', dpi=300, bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    plt.close()
    return "Diagram1_Arsitektur_Sistem_IoT.png"

def create_flowchart_diagram():
    fig, ax = plt.subplots(1, 1, figsize=(12, 14))
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    
    def draw_box(x, y, w, h, text, color='lightblue'):
        box = FancyBboxPatch((x-w/2, y-h/2), w, h,
                            boxstyle="round,pad=0.02",
                            facecolor=color,
                            edgecolor='black', linewidth=1.5)
        ax.add_patch(box)
        ax.text(x, y, text, ha='center', va='center', fontsize=9, fontweight='bold')
    
    def draw_diamond(x, y, size, text, color='yellow'):
        diamond = mpatches.RegularPolygon((x, y), 4, radius=size, 
                                        orientation=np.pi/4,
                                        facecolor=color, 
                                        edgecolor='black', linewidth=1.5)
        ax.add_patch(diamond)
        ax.text(x, y, text, ha='center', va='center', fontsize=8, fontweight='bold')
    
    def draw_oval(x, y, w, h, text, color='lightgreen'):
        oval = mpatches.Ellipse((x, y), w, h, facecolor=color, 
                               edgecolor='black', linewidth=1.5)
        ax.add_patch(oval)
        ax.text(x, y, text, ha='center', va='center', fontsize=9, fontweight='bold')
    
    # Flowchart elements
    draw_oval(6, 13, 2.5, 0.8, 'Game Start', '#90EE90')
    draw_box(6, 11.5, 3, 0.8, 'Initialize\nVariables', 'lightblue')
    draw_box(6, 10, 3, 0.8, 'Generate Random\nSequence', 'lightblue')
    draw_box(6, 8.5, 3, 0.8, 'Display LED\nSequence', 'lightblue')
    draw_box(6, 7, 3, 0.8, 'Wait for\nUser Input', 'lightblue')
    draw_diamond(6, 5.5, 0.8, 'Input\nCorrect?', 'yellow')
    draw_box(9, 4, 2.5, 0.8, 'Level\nComplete', '#87CEEB')
    draw_box(3, 4, 2.5, 0.8, 'Game Over', '#FFB6C1')
    draw_box(3, 2.5, 2.5, 0.8, 'Calculate\nScore', 'lightblue')
    draw_oval(3, 1, 2, 0.8, 'End', '#DDA0DD')
    
    # Arrows
    for i in range(4):
        ax.arrow(6, 12.7-i*1.5, 0, -0.7, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    # Decision arrows
    ax.arrow(6.6, 5.5, 1.8, -1, head_width=0.1, head_length=0.1, fc='green', ec='green')
    ax.text(7.5, 4.8, 'Yes', ha='center', va='center', fontsize=8, color='green')
    
    ax.arrow(5.4, 5.5, -1.8, -1, head_width=0.1, head_length=0.1, fc='red', ec='red')
    ax.text(4.5, 4.8, 'No', ha='center', va='center', fontsize=8, color='red')
    
    # Loop back arrow
    ax.arrow(9, 3.6, 0, -2, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(9, 1.6, -3, 0, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(6, 1.6, 0, 8, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    # Game over flow
    ax.arrow(3, 3.6, 0, -0.7, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(3, 2.1, 0, -0.7, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    ax.set_title('Simon Says Algorithm Flowchart', fontsize=16, fontweight='bold', pad=20)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 14)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('Diagram2_Flowchart_Algoritma.png', dpi=300, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close()
    return "Diagram2_Flowchart_Algoritma.png"

def create_software_diagram():
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    
    # Frontend Box
    frontend_box = FancyBboxPatch((1, 6), 4, 3,
                                 boxstyle="round,pad=0.1",
                                 facecolor='#e1f5fe',
                                 edgecolor='black', linewidth=2)
    ax.add_patch(frontend_box)
    ax.text(3, 8.5, 'Frontend Web Interface', ha='center', va='center', fontsize=12, fontweight='bold')
    ax.text(1.2, 8, '• HTML5 Structure', ha='left', va='center', fontsize=9)
    ax.text(1.2, 7.6, '• CSS3 Responsive', ha='left', va='center', fontsize=9)
    ax.text(1.2, 7.2, '• JavaScript ES6+', ha='left', va='center', fontsize=9)
    ax.text(1.2, 6.8, '• Fetch API', ha='left', va='center', fontsize=9)
    ax.text(1.2, 6.4, '• DOM Manipulation', ha='left', va='center', fontsize=9)
    
    # Backend Box
    backend_box = FancyBboxPatch((6, 6), 4, 3,
                                boxstyle="round,pad=0.1",
                                facecolor='#f3e5f5',
                                edgecolor='black', linewidth=2)
    ax.add_patch(backend_box)
    ax.text(8, 8.5, 'Backend Server', ha='center', va='center', fontsize=12, fontweight='bold')
    ax.text(6.2, 8, '• Node.js Express', ha='left', va='center', fontsize=9)
    ax.text(6.2, 7.6, '• RESTful API', ha='left', va='center', fontsize=9)
    ax.text(6.2, 7.2, '• Game Management', ha='left', va='center', fontsize=9)
    ax.text(6.2, 6.8, '• JSON Database', ha='left', va='center', fontsize=9)
    ax.text(6.2, 6.4, '• Security Middleware', ha='left', va='center', fontsize=9)
    
    # Firmware Box
    firmware_box = FancyBboxPatch((1, 2), 4, 3,
                                 boxstyle="round,pad=0.1",
                                 facecolor='#fff3e0',
                                 edgecolor='black', linewidth=2)
    ax.add_patch(firmware_box)
    ax.text(3, 4.5, 'ESP8266 Firmware', ha='center', va='center', fontsize=12, fontweight='bold')
    ax.text(1.2, 4, '• Arduino C++', ha='left', va='center', fontsize=9)
    ax.text(1.2, 3.6, '• WiFi Management', ha='left', va='center', fontsize=9)
    ax.text(1.2, 3.2, '• Game Logic', ha='left', va='center', fontsize=9)
    ax.text(1.2, 2.8, '• Hardware Control', ha='left', va='center', fontsize=9)
    ax.text(1.2, 2.4, '• HTTP Client', ha='left', va='center', fontsize=9)
    
    # Communication Box
    comm_box = FancyBboxPatch((6, 2), 4, 3,
                             boxstyle="round,pad=0.1",
                             facecolor='#e8f5e8',
                             edgecolor='black', linewidth=2)
    ax.add_patch(comm_box)
    ax.text(8, 4.5, 'Communication', ha='center', va='center', fontsize=12, fontweight='bold')
    ax.text(6.2, 4, '• RESTful API', ha='left', va='center', fontsize=9)
    ax.text(6.2, 3.6, '• JSON Format', ha='left', va='center', fontsize=9)
    ax.text(6.2, 3.2, '• Polling Mechanism', ha='left', va='center', fontsize=9)
    ax.text(6.2, 2.8, '• Status Codes', ha='left', va='center', fontsize=9)
    ax.text(6.2, 2.4, '• Error Handling', ha='left', va='center', fontsize=9)
    
    # Arrows
    ax.arrow(5, 7.5, 0.8, -2.8, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(8, 6, 0, -0.8, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(5, 3.5, 0.8, 0, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    ax.set_title('Software Components Architecture', fontsize=16, fontweight='bold', pad=20)
    ax.set_xlim(0, 11)
    ax.set_ylim(1, 10)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('Diagram3_Software_Components.png', dpi=300, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close()
    return "Diagram3_Software_Components.png"

# Main execution
if __name__ == "__main__":
    print("Creating PNG diagrams...")
    
    files = []
    files.append(create_architecture_diagram())
    files.append(create_flowchart_diagram())
    files.append(create_software_diagram())
    
    print("Successfully created:")
    for file in files:
        print(f"  ✅ {file}") 