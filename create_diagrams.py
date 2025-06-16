import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, Rectangle
import numpy as np

def create_architecture_diagram():
    # Create figure with white background
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
    
    # User Interaction
    user_box = FancyBboxPatch((4, 0.5), 6, 2.5,
                             boxstyle="round,pad=0.1",
                             facecolor='#e8f5e8',
                             edgecolor='black', linewidth=2)
    ax.add_patch(user_box)
    ax.text(7, 2.3, 'User Interaction', ha='center', va='center', fontsize=14, fontweight='bold')
    ax.text(4.5, 1.8, '• Web Browser Interface', ha='left', va='center', fontsize=10)
    ax.text(4.5, 1.4, '• Hardware Game Device', ha='left', va='center', fontsize=10)
    ax.text(4.5, 1.0, '• Real-time Leaderboard', ha='left', va='center', fontsize=10)
    
    # Add arrows to show flow
    # Device to Network
    ax.arrow(6.5, 9.75, 1.3, 0, head_width=0.2, head_length=0.2, fc='black', ec='black')
    
    # Network to Application  
    ax.arrow(9, 8, -1.8, -1, head_width=0.2, head_length=0.2, fc='black', ec='black')
    
    # Application to Cloud
    ax.arrow(6.5, 5.75, 1.3, 0, head_width=0.2, head_length=0.2, fc='black', ec='black')
    
    # Application to User
    ax.arrow(5, 4, 1, -1, head_width=0.2, head_length=0.2, fc='black', ec='black')
    
    # Cloud to User
    ax.arrow(9, 4, -1, -1, head_width=0.2, head_length=0.2, fc='black', ec='black')
    
    # Set title
    ax.set_title('Simon Says IoT - System Architecture', fontsize=18, fontweight='bold', pad=20)
    
    # Remove axes
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 12)
    ax.axis('off')
    
    # Save as PNG with white background
    plt.tight_layout()
    plt.savefig('Diagram1_Arsitektur_Sistem_IoT.png', dpi=300, bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    plt.close()
    
    print("✅ Diagram 1: Arsitektur Sistem IoT - Created successfully!")

def create_flowchart_diagram():
    # Create figure for flowchart
    fig, ax = plt.subplots(1, 1, figsize=(14, 16))
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    
    # Define positions and create flowchart elements
    def draw_rounded_box(x, y, w, h, text, color='lightblue'):
        box = FancyBboxPatch((x-w/2, y-h/2), w, h,
                            boxstyle="round,pad=0.02",
                            facecolor=color,
                            edgecolor='black', linewidth=1.5)
        ax.add_patch(box)
        ax.text(x, y, text, ha='center', va='center', fontsize=9, fontweight='bold')
    
    def draw_diamond(x, y, w, h, text, color='yellow'):
        # Create diamond shape for decision points
        diamond = mpatches.RegularPolygon((x, y), 4, radius=w/2, 
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
    
    def draw_arrow(x1, y1, x2, y2):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                   arrowprops=dict(arrowstyle='->', lw=1.5, color='black'))
    
    # Start
    draw_oval(7, 15, 2, 0.8, 'Game Start\nTrigger', '#90EE90')
    
    # Initialize
    draw_rounded_box(7, 13.5, 3, 0.8, 'Initialize Variables\nsequence[], turn=1', 'lightblue')
    draw_arrow(7, 14.6, 7, 13.9)
    
    # Generate Sequence
    draw_rounded_box(7, 12, 3, 0.8, 'Generate Random\n1-4 sequence[turn-1]', 'lightblue')
    draw_arrow(7, 13.1, 7, 12.4)
    
    # Display Sequence
    draw_rounded_box(7, 10.5, 3, 0.8, 'Display LED\nSequence', 'lightblue')
    draw_arrow(7, 11.6, 7, 10.9)
    
    # Wait Input
    draw_rounded_box(7, 9, 3, 0.8, 'Wait for\nUser Input', 'lightblue')
    draw_arrow(7, 10.1, 7, 9.4)
    
    # Input Check
    draw_diamond(7, 7.5, 2, 1, 'Input\nCorrect?', 'yellow')
    draw_arrow(7, 8.6, 7, 8.2)
    
    # Correct path
    draw_rounded_box(10, 6, 2.5, 0.8, 'Level\nComplete', '#87CEEB')
    draw_arrow(8, 7.5, 9.2, 6.3)
    ax.text(8.5, 6.8, 'Yes', ha='center', va='center', fontsize=8, color='green')
    
    # Back to generate (level up)
    draw_arrow(10, 5.6, 10, 2)
    draw_arrow(10, 2, 7, 2)
    draw_arrow(7, 2, 7, 11.6)
    
    # Wrong path - Game Over
    draw_rounded_box(4, 6, 2.5, 0.8, 'Game Over\nCalculate Score', '#FFB6C1')
    draw_arrow(6, 7.5, 4.8, 6.3)
    ax.text(5.5, 6.8, 'No', ha='center', va='center', fontsize=8, color='red')
    
    # Send Score
    draw_rounded_box(4, 4.5, 2.5, 0.8, 'Send Score\nto Server', 'lightblue')
    draw_arrow(4, 5.6, 4, 4.9)
    
    # End
    draw_oval(4, 3, 2, 0.8, 'End', '#DDA0DD')
    draw_arrow(4, 4.1, 4, 3.4)
    
    # Set title
    ax.set_title('Simon Says IoT - Game Algorithm Flowchart', fontsize=16, fontweight='bold', pad=20)
    
    # Remove axes
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 16)
    ax.axis('off')
    
    # Save as PNG
    plt.tight_layout()
    plt.savefig('Diagram2_Flowchart_Algoritma_Simon_Says.png', dpi=300, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close()
    
    print("✅ Diagram 2: Flowchart Algoritma Simon Says - Created successfully!")

def create_software_components_diagram():
    # Create figure for software components
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
    ax.text(1.2, 7.6, '• CSS3 Responsive Design', ha='left', va='center', fontsize=9)
    ax.text(1.2, 7.2, '• JavaScript (ES6+)', ha='left', va='center', fontsize=9)
    ax.text(1.2, 6.8, '• Fetch API', ha='left', va='center', fontsize=9)
    ax.text(1.2, 6.4, '• DOM Manipulation', ha='left', va='center', fontsize=9)
    
    # Backend Box
    backend_box = FancyBboxPatch((6, 6), 4, 3,
                                boxstyle="round,pad=0.1",
                                facecolor='#f3e5f5',
                                edgecolor='black', linewidth=2)
    ax.add_patch(backend_box)
    ax.text(8, 8.5, 'Backend Server (Node.js)', ha='center', va='center', fontsize=12, fontweight='bold')
    ax.text(6.2, 8, '• Express.js Framework', ha='left', va='center', fontsize=9)
    ax.text(6.2, 7.6, '• RESTful API Endpoints', ha='left', va='center', fontsize=9)
    ax.text(6.2, 7.2, '• Game Management Logic', ha='left', va='center', fontsize=9)
    ax.text(6.2, 6.8, '• JSON Data Persistence', ha='left', va='center', fontsize=9)
    ax.text(6.2, 6.4, '• Security Middleware', ha='left', va='center', fontsize=9)
    
    # Firmware Box
    firmware_box = FancyBboxPatch((1, 2), 4, 3,
                                 boxstyle="round,pad=0.1",
                                 facecolor='#fff3e0',
                                 edgecolor='black', linewidth=2)
    ax.add_patch(firmware_box)
    ax.text(3, 4.5, 'ESP8266 Firmware (C++)', ha='center', va='center', fontsize=12, fontweight='bold')
    ax.text(1.2, 4, '• Arduino Framework', ha='left', va='center', fontsize=9)
    ax.text(1.2, 3.6, '• WiFi Management', ha='left', va='center', fontsize=9)
    ax.text(1.2, 3.2, '• Game Logic Implementation', ha='left', va='center', fontsize=9)
    ax.text(1.2, 2.8, '• Hardware Control (LED/Button)', ha='left', va='center', fontsize=9)
    ax.text(1.2, 2.4, '• HTTP Client Communication', ha='left', va='center', fontsize=9)
    
    # Communication Protocol Box
    comm_box = FancyBboxPatch((6, 2), 4, 3,
                             boxstyle="round,pad=0.1",
                             facecolor='#e8f5e8',
                             edgecolor='black', linewidth=2)
    ax.add_patch(comm_box)
    ax.text(8, 4.5, 'Communication Protocols', ha='center', va='center', fontsize=12, fontweight='bold')
    ax.text(6.2, 4, '• RESTful API (HTTP/HTTPS)', ha='left', va='center', fontsize=9)
    ax.text(6.2, 3.6, '• JSON Data Format', ha='left', va='center', fontsize=9)
    ax.text(6.2, 3.2, '• Polling Mechanism', ha='left', va='center', fontsize=9)
    ax.text(6.2, 2.8, '• Status Codes (200,400,500)', ha='left', va='center', fontsize=9)
    ax.text(6.2, 2.4, '• Error Handling', ha='left', va='center', fontsize=9)
    
    # Add arrows to show communication flow
    # Frontend to Communication
    ax.arrow(5, 7.5, 0.8, -2.8, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    # Backend to Communication
    ax.arrow(8, 6, 0, -0.8, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    # Firmware to Communication
    ax.arrow(5, 3.5, 0.8, 0, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    # Set title
    ax.set_title('Simon Says IoT - Software Components Architecture', fontsize=16, fontweight='bold', pad=20)
    
    # Remove axes and set limits
    ax.set_xlim(0, 11)
    ax.set_ylim(1, 10)
    ax.axis('off')
    
    # Save as PNG
    plt.tight_layout()
    plt.savefig('Diagram3_Komponen_Software.png', dpi=300, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close()
    
    print("✅ Diagram 3: Komponen Software - Created successfully!")

if __name__ == "__main__":
    print("🚀 Creating PNG diagrams for Simon Says IoT Project...")
    print("=" * 60)
    
    create_architecture_diagram()
    create_flowchart_diagram() 
    create_software_components_diagram()
    
    print("=" * 60)
    print("🎉 All diagrams created successfully!")
    print("📁 Files created:")
    print("   • Diagram1_Arsitektur_Sistem_IoT.png")
    print("   • Diagram2_Flowchart_Algoritma_Simon_Says.png") 
    print("   • Diagram3_Komponen_Software.png") 