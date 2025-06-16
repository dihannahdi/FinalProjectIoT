import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_diagrams():
    # Architecture Diagram
    fig, ax = plt.subplots(figsize=(14, 10))
    fig.patch.set_facecolor('white')
    
    # Device Layer
    device = patches.Rectangle((1, 7), 5, 2.5, facecolor='#ff9999', edgecolor='black', linewidth=2)
    ax.add_patch(device)
    ax.text(3.5, 8.7, 'Device Layer', ha='center', va='center', fontsize=14, fontweight='bold')
    ax.text(1.2, 8.2, '• ESP8266 Microcontroller', ha='left', va='center', fontsize=10)
    ax.text(1.2, 7.8, '• 4 LED Outputs', ha='left', va='center', fontsize=10)
    ax.text(1.2, 7.4, '• 4 Push Buttons', ha='left', va='center', fontsize=10)
    
    # Network Layer  
    network = patches.Rectangle((7, 7), 5, 2.5, facecolor='#99ccff', edgecolor='black', linewidth=2)
    ax.add_patch(network)
    ax.text(9.5, 8.7, 'Network Layer', ha='center', va='center', fontsize=14, fontweight='bold')
    ax.text(7.2, 8.2, '• WiFi Networks', ha='left', va='center', fontsize=10)
    ax.text(7.2, 7.8, '• HTTP Protocol', ha='left', va='center', fontsize=10)
    ax.text(7.2, 7.4, '• RESTful API', ha='left', va='center', fontsize=10)
    
    # Application Layer
    app = patches.Rectangle((1, 4), 5, 2.5, facecolor='#99ff99', edgecolor='black', linewidth=2)
    ax.add_patch(app)
    ax.text(3.5, 5.7, 'Application Layer', ha='center', va='center', fontsize=14, fontweight='bold')
    ax.text(1.2, 5.2, '• Node.js Backend', ha='left', va='center', fontsize=10)
    ax.text(1.2, 4.8, '• Web Interface', ha='left', va='center', fontsize=10)
    ax.text(1.2, 4.4, '• JSON Database', ha='left', va='center', fontsize=10)
    
    # Cloud Layer
    cloud = patches.Rectangle((7, 4), 5, 2.5, facecolor='#ffcc99', edgecolor='black', linewidth=2)
    ax.add_patch(cloud)
    ax.text(9.5, 5.7, 'Cloud Infrastructure', ha='center', va='center', fontsize=14, fontweight='bold')
    ax.text(7.2, 5.2, '• Azure App Service', ha='left', va='center', fontsize=10)
    ax.text(7.2, 4.8, '• Application Insights', ha='left', va='center', fontsize=10)
    ax.text(7.2, 4.4, '• Azure Storage', ha='left', va='center', fontsize=10)
    
    ax.set_title('Simon Says IoT - System Architecture', fontsize=16, fontweight='bold', pad=20)
    ax.set_xlim(0, 13)
    ax.set_ylim(3, 10)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('Diagram1_Architecture.png', dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    return 'Diagram1_Architecture.png'

create_diagrams()
print("PNG diagram created successfully!") 