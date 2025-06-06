# IoT-Based Simon Says Game

An interactive Simon Says game built with NodeMCU (ESP8266), Node-RED, and a web interface. This project features physical hardware interaction through buttons and LEDs, game state management via MQTT, and a web-based leaderboard.

## Features

- Physical interaction through buttons, LEDs, and buzzer
- Random pattern generation for gameplay
- Real-time communication via MQTT
- Web-based leaderboard
- User registration and authentication
- Responsive and attractive UI/UX

## Components

### Hardware
- NodeMCU ESP8266
- 4 Buttons (for user input)
- 4 LEDs (for visual feedback)
- Buzzer (for audio feedback)
- Power supply
- Breadboard and jumper wires

### Software
- NodeMCU Firmware (Arduino code)
- Node-RED for IoT communication
- Backend server (Node.js, Express)
- MongoDB for data storage
- React.js frontend
- MQTT for communication protocol

## Setup Instructions

### Hardware Setup
1. Connect components according to the schematic in `/docs/schematic.md`
2. Flash the NodeMCU with the firmware in `/firmware/simon_says.ino`
3. Configure WiFi settings in the firmware

### Server Setup
1. Set up a VPS with Ubuntu 20.04
2. Install Node.js, MongoDB, and Mosquitto MQTT broker
3. Clone this repository to your server
4. Run `npm install` in both `/backend` and `/frontend` directories
5. Configure environment variables according to `.env.example`
6. Start the backend with `npm start` in the `/backend` directory
7. Build and deploy the frontend with instructions in `/frontend/README.md`

### Node-RED Setup
1. Install Node-RED on your server
2. Import the flow from `/nodered/flows.json`
3. Configure MQTT nodes to connect to your broker

## VPS Deployment Guide

This guide walks through the complete deployment process of the Simon Says IoT Game on a fresh Ubuntu server.

### 1. Initial Server Setup

1. Log in to your Ubuntu VPS:
   ```
   ssh username@your-vps-ip
   ```

2. Update the system packages:
   ```
   sudo apt update && sudo apt upgrade -y
   ```

3. Set up a basic firewall:
   ```
   sudo apt install -y ufw
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw allow 1883  # MQTT
   sudo ufw allow 1880  # Node-RED
   sudo ufw enable
   ```

4. Create a non-root user (optional if not already set up):
   ```
   sudo adduser simon_user
   sudo usermod -aG sudo simon_user
   ```

### 2. Install Required Software

1. Install Node.js:
   ```
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. Install MongoDB:
   ```
   sudo apt install -y mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

3. Install Mosquitto MQTT broker:
   ```
   sudo apt install -y mosquitto mosquitto-clients
   ```

4. Configure Mosquitto to accept connections:
   ```
   echo "listener 1883" | sudo tee /etc/mosquitto/conf.d/default.conf
   echo "allow_anonymous true" | sudo tee -a /etc/mosquitto/conf.d/default.conf
   sudo systemctl restart mosquitto
   ```

5. Install Node-RED:
   ```
   sudo npm install -g node-red
   ```

6. Create a systemd service for Node-RED:
   ```
   sudo nano /etc/systemd/system/nodered.service
   ```

7. Add the following content:
   ```
   [Unit]
   Description=Node-RED
   After=network.target

   [Service]
   ExecStart=/usr/bin/node-red-pi
   Restart=on-failure
   User=your-username
   Group=your-username
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

8. Start and enable Node-RED:
   ```
   sudo systemctl daemon-reload
   sudo systemctl enable nodered.service
   sudo systemctl start nodered.service
   ```

9. Install other dependencies:
   ```
   sudo apt install -y git build-essential nginx
   ```

### 3. Deploy the Backend

1. Clone or upload the repository to your server:
   ```
   cd ~
   git clone https://github.com/your-username/simon-says-iot.git
   # or upload files via SCP/SFTP
   ```

2. Set up the backend:
   ```
   cd ~/simon-says-iot/backend
   cp env.example .env
   nano .env
   ```

3. Modify the .env file with your server settings:
   ```
   PORT=3000
   NODE_ENV=production
   MONGO_URI=mongodb://localhost:27017/simon_says
   JWT_SECRET=your_secure_random_string
   JWT_EXPIRES_IN=7d
   MQTT_BROKER=mqtt://localhost:1883
   MQTT_CLIENT_ID=simon_says_backend_prod
   CORS_ORIGIN=http://your-domain-or-ip
   ```

4. Install dependencies and start the backend:
   ```
   npm install
   sudo npm install -g pm2
   pm2 start src/index.js --name simon-says-backend
   pm2 save
   pm2 startup
   ```

### 4. Deploy the Frontend

1. Navigate to the frontend directory:
   ```
   cd ~/simon-says-iot/frontend
   ```

2. Install dependencies and build the production version:
   ```
   npm install
   npm run build
   ```

3. Configure Nginx to serve the frontend and proxy API requests:
   ```
   sudo nano /etc/nginx/sites-available/simon-says
   ```

4. Add the following configuration:
   ```
   server {
       listen 80;
       server_name your-domain-or-ip;

       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location / {
           root /home/your-username/simon-says-iot/frontend/build;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

5. Enable the site and restart Nginx:
   ```
   sudo ln -s /etc/nginx/sites-available/simon-says /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### 5. Set Up Node-RED Flows

1. Access Node-RED at `http://your-vps-ip:1880`

2. Import the flows from the `nodered/flows.json` file:
   - Click the menu in the top-right corner
   - Select "Import"
   - Paste the contents of the flows.json file
   - Click "Import"

3. Configure the MQTT nodes to connect to your local broker:
   - Double-click on each MQTT node
   - Ensure the server is set to "localhost:1883"
   - Click "Update" and "Done"

4. Deploy the flows by clicking the "Deploy" button

### 6. Configure HTTPS with Let's Encrypt (Optional)

1. Install Certbot:
   ```
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. Obtain and configure SSL certificates:
   ```
   sudo certbot --nginx -d your-domain.com
   ```

3. Follow the prompts to complete the setup

### 7. Configure IoT Device

1. Update the firmware with your server's information:
   - Open the `firmware/simon_says.ino` file
   - Update the WiFi and MQTT settings:
   ```
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASS";
   const char* mqtt_server = "YOUR_VPS_IP";
   ```

2. Flash the firmware to your NodeMCU ESP8266

### 8. Testing the Deployment

1. Visit your website in a browser: `http://your-domain-or-ip`
2. Create a user account
3. Navigate to the Game page
4. Check device connection status
5. Start a game and verify that the device receives the command

### 9. Monitoring and Maintenance

1. Monitor the backend with PM2:
   ```
   pm2 monit
   pm2 logs simon-says-backend
   ```

2. Check Node-RED logs:
   ```
   sudo journalctl -u nodered -f
   ```

3. View Nginx access logs:
   ```
   sudo tail -f /var/log/nginx/access.log
   ```

## Usage

1. Register a new user on the web interface
2. Start a new game
3. Follow the LED pattern by pressing the corresponding physical buttons
4. Your score will be updated on the leaderboard

## Directory Structure

- `/firmware`: Arduino code for NodeMCU
- `/backend`: Node.js server and API
- `/frontend`: React.js web application
- `/nodered`: Node-RED flows
- `/docs`: Documentation and schematics

## License

MIT

## Contributors

Your Name - Project Developer
