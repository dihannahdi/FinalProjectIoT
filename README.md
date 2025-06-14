# Simon Says IoT Leaderboard System

Sistem IoT lengkap untuk game Simon Says dengan leaderboard real-time yang berjalan di VPS Ubuntu dan perangkat ESP8266.

## 🎯 Overview

Proyek ini terdiri dari dua komponen utama:
1. **Server Aplikasi** - Backend Node.js + Frontend web yang berjalan di VPS
2. **Firmware Perangkat** - Kode Arduino untuk ESP8266 yang mengirim skor ke server

## 📋 Daftar File

```
simon-says-iot/
├── server.js           # Server Express.js
├── package.json        # Dependencies Node.js
├── public/
│   ├── index.html     # Frontend leaderboard
│   └── style.css      # Styling responsif
├── simon_says_iot.ino # Firmware ESP8266
└── README.md          # Panduan ini
```

## 🚀 Setup Server di VPS Ubuntu

### 1. Prasyarat System

Pastikan VPS Ubuntu 22.04 sudah siap dan Anda memiliki akses SSH.

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install curl dan tools lainnya
sudo apt install curl git ufw -y
```

### 2. Install Node.js dan NPM

```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verifikasi instalasi
node --version    # Should output v18.x.x
npm --version     # Should output 9.x.x
```

### 3. Install PM2 untuk Process Management

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verifikasi instalasi
pm2 --version
```

### 4. Deploy Aplikasi

#### Option A: Upload Manual dengan SCP

```bash
# Dari komputer lokal, upload file ke server
scp -r simon-says-iot/ username@10.33.102.140:/home/username/

# SSH ke server
ssh username@10.33.102.140

# Masuk ke direktori proyek
cd /home/username/simon-says-iot/
```

#### Option B: Clone dari Git Repository

```bash
# SSH ke server
ssh username@10.33.102.140

# Clone repository (jika sudah di upload ke Git)
git clone <your-repository-url> simon-says-iot
cd simon-says-iot/
```

### 5. Install Dependencies

```bash
# Install package dependencies
npm install

# Jika ada error permission, gunakan:
sudo npm install --unsafe-perm=true --allow-root
```

### 6. Konfigurasi Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH (port 22)
sudo ufw allow ssh

# Allow HTTP (port 80)
sudo ufw allow 80/tcp

# Allow port 3000 untuk aplikasi
sudo ufw allow 3000/tcp

# Allow HTTPS (optional)
sudo ufw allow 443/tcp

# Check firewall status
sudo ufw status
```

### 7. Jalankan Aplikasi

```bash
# Test run aplikasi
npm start

# Jika berhasil, stop dengan Ctrl+C dan jalankan dengan PM2
pm2 start server.js --name "simon-says-leaderboard"

# Save PM2 configuration
pm2 save

# Setup PM2 untuk auto-start saat reboot
pm2 startup
# Ikuti instruksi yang diberikan PM2
```

### 8. Monitoring dan Maintenance

```bash
# Check status aplikasi
pm2 status

# View logs
pm2 logs simon-says-leaderboard

# Restart aplikasi
pm2 restart simon-says-leaderboard

# Stop aplikasi
pm2 stop simon-says-leaderboard

# Delete aplikasi dari PM2
pm2 delete simon-says-leaderboard
```

### 9. Setup Nginx (Optional - untuk domain)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/simon-says

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com;  # Ganti dengan domain Anda

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/simon-says /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🔧 Setup Perangkat Keras (ESP8266)

### 1. Install Arduino IDE

1. Download Arduino IDE dari [arduino.cc](https://www.arduino.cc/en/software)
2. Install dan jalankan Arduino IDE

### 2. Setup ESP8266 Board Manager

1. Buka **File → Preferences**
2. Di "Additional Board Manager URLs", tambahkan:
   ```
   http://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
3. Buka **Tools → Board → Boards Manager**
4. Search "ESP8266" dan install **ESP8266 by ESP8266 Community**

### 3. Install Library yang Diperlukan

1. Buka **Tools → Manage Libraries**
2. Install library berikut:
   - **ArduinoJson** by Benoit Blanchon (versi 6.x)
   - **ESP8266WiFi** (biasanya sudah terinstall dengan ESP8266 board)
   - **ESP8266HTTPClient** (biasanya sudah terinstall dengan ESP8266 board)

### 4. Wiring Diagram

```
ESP8266 (NodeMCU)    Component
==================   ===============
D1                   LED Red (+ 220Ω resistor)
D2                   LED Green (+ 220Ω resistor)
D3                   LED Blue (+ 220Ω resistor)
D4                   LED Yellow (+ 220Ω resistor)
D5                   Button Red (+ 10kΩ pull-up)
D6                   Button Green (+ 10kΩ pull-up)
D7                   Button Blue (+ 10kΩ pull-up)
D8                   Button Yellow (+ 10kΩ pull-up)
D0                   Buzzer (+ 220Ω resistor)
GND                  Common Ground
3V3                  Common VCC (3.3V)
```

### 5. Konfigurasi dan Upload Kode

1. Buka file `simon_says_iot.ino` di Arduino IDE
2. Edit konfigurasi WiFi di bagian atas file:
   ```cpp
   const char* ssid = "NAMA_WIFI_ANDA";
   const char* password = "PASSWORD_WIFI_ANDA";
   ```
3. Pastikan IP server sudah benar:
   ```cpp
   const char* serverIp = "10.33.102.140";
   const int serverPort = 3000;
   ```
4. Pilih board: **Tools → Board → ESP8266 Boards → NodeMCU 1.0**
5. Pilih port: **Tools → Port → COMx** (sesuai dengan port ESP8266)
6. Upload kode: **Sketch → Upload**

### 6. Testing dan Debugging

1. Buka **Tools → Serial Monitor**
2. Set baud rate ke **115200**
3. Reset ESP8266 untuk melihat log startup
4. Pastikan WiFi terkoneksi dan server dapat dihubungi

## 🌐 Pengujian System

### 1. Test Server

```bash
# Test health endpoint
curl http://10.33.102.140:3000/health

# Test submit score endpoint
curl -X POST http://10.33.102.140:3000/submit-score \
  -H "Content-Type: application/json" \
  -d '{"name":"test","score":5}'

# Test get leaderboard
curl http://10.33.102.140:3000/api/leaderboard
```

### 2. Test Frontend

Buka browser dan akses: `http://10.33.102.140:3000`

Halaman leaderboard harus menampilkan:
- Tabel leaderboard (kosong jika belum ada data)
- Auto-refresh setiap 20 detik
- Statistik game

### 3. Test Perangkat ESP8266

1. Pastikan Serial Monitor terbuka
2. Reset perangkat dan tunggu koneksi WiFi
3. Mainkan game Simon Says
4. Saat game over, skor akan dikirim ke server
5. Refresh halaman leaderboard untuk melihat skor baru

## 🛠️ Troubleshooting

### Server Issues

**Port sudah digunakan:**
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

**Permission errors:**
```bash
# Fix ownership
sudo chown -R $USER:$USER /home/username/simon-says-iot/

# Fix permissions
chmod 755 /home/username/simon-says-iot/
```

**Firewall blocking connections:**
```bash
# Check if port is open
sudo ufw status
sudo netstat -tlnp | grep 3000
```

### ESP8266 Issues

**WiFi tidak terkoneksi:**
- Pastikan SSID dan password benar
- Cek jangkauan WiFi
- Reset ESP8266 dan coba lagi

**Upload gagal:**
- Pastikan driver ESP8266 terinstall
- Cek kabel USB
- Pastikan port COM benar
- Tekan tombol FLASH saat upload jika perlu

**Tidak bisa kirim data ke server:**
- Cek koneksi WiFi
- Pastikan server berjalan
- Cek firewall server
- Lihat Serial Monitor untuk error logs

### Frontend Issues

**Halaman tidak load:**
- Cek server status: `pm2 status`
- Cek logs: `pm2 logs simon-says-leaderboard`
- Pastikan port 3000 terbuka

**Auto-refresh tidak berjalan:**
- Check JavaScript console di browser
- Pastikan endpoint `/api/leaderboard` accessible

## 📊 Monitoring dan Logs

### Server Logs

```bash
# View real-time logs
pm2 logs simon-says-leaderboard --lines 100

# View error logs only
pm2 logs simon-says-leaderboard --err

# Monitor server resources
pm2 monit
```

### ESP8266 Logs

Gunakan Serial Monitor di Arduino IDE dengan baud rate 115200 untuk melihat:
- Status koneksi WiFi
- Game events
- HTTP request/response
- Error messages

## 🔒 Keamanan

### Server Security

```bash
# Update system regularly
sudo apt update && sudo apt upgrade

# Configure fail2ban (optional)
sudo apt install fail2ban

# Limit access to specific IPs (if needed)
sudo ufw allow from 192.168.1.0/24 to any port 3000
```

### ESP8266 Security

- Jangan hardcode password WiFi dalam kode yang di-share
- Gunakan WPA2/WPA3 untuk WiFi
- Monitor koneksi tidak biasa melalui logs

## 📈 Pengembangan Lanjutan

### Fitur yang bisa ditambahkan:

1. **Database Integration**
   - Ganti JSON file dengan MongoDB/PostgreSQL
   - Backup otomatis data

2. **User Authentication**
   - Login system
   - Personal score tracking

3. **Real-time Updates**
   - WebSocket untuk update realtime
   - Live game notifications

4. **Multiple Devices**
   - Support multiple ESP8266
   - Device identification

5. **Analytics**
   - Game statistics
   - Performance metrics
   - Player behavior analysis

## 📞 Support

Jika mengalami masalah:

1. Cek logs server: `pm2 logs simon-says-leaderboard`
2. Cek Serial Monitor ESP8266
3. Test konektivitas network
4. Verifikasi konfigurasi firewall

---

**© 2024 Simon Says IoT Leaderboard - Praktikum IoT Final Project** 