# 🌐 Azure Deployment Guide - Simon Says IoT

## 📍 **Status Saat Ini**

❌ **Aplikasi belum di-deploy ke Azure** - masih running di localhost:3000  
✅ **Code siap untuk Azure deployment**  
✅ **ESP8266 sudah dikonfigurasi untuk Azure URL**

## 🚀 **Cara Deploy ke Azure Website**

### **Metode 1: GitHub + Azure App Service (Recommended)**

#### 1. **Push ke GitHub Repository**
```bash
# Initialize git jika belum ada
git init

# Add all files
git add .

# Commit
git commit -m "Simon Says IoT - Ready for Azure deployment"

# Add remote repository (ganti dengan repo Anda)
git remote add origin https://github.com/username/simon-says-iot.git

# Push ke GitHub
git push -u origin main
```

#### 2. **Setup Azure App Service**
1. Login ke [Azure Portal](https://portal.azure.com)
2. Create **App Service**:
   - **Name:** `simon-says-iot-[your-name]` 
   - **Runtime:** Node.js 18 LTS
   - **Region:** Canada Central (sesuai konfigurasi ESP8266)
   - **Pricing:** Free F1 tier

#### 3. **Connect GitHub Repository**
1. Di Azure App Service → **Deployment Center**
2. Choose **GitHub** sebagai source
3. Select repository dan branch `main`
4. Azure akan auto-deploy setiap kali ada push

#### 4. **Configure App Settings**
- Set **Node version:** 18.x
- Enable **WebSocket** di Configuration
- Set **Always On:** True (jika tidak Free tier)

### **Metode 2: Azure CLI (Advanced)**

```bash
# Install Azure CLI
npm install -g @azure/cli

# Login
az login

# Create resource group
az group create --name simon-says-rg --location canadacentral

# Create app service plan
az appservice plan create --name simon-says-plan --resource-group simon-says-rg --sku F1

# Create web app
az webapp create --name simon-says-iot-app --resource-group simon-says-rg --plan simon-says-plan --runtime "NODE|18-lts"

# Deploy from local git
az webapp deployment source config-local-git --name simon-says-iot-app --resource-group simon-says-rg

# Push code
git push azure main
```

## ⚙️ **Konfigurasi Azure (Sudah Siap)**

### ✅ **Files yang Sudah Disiapkan:**
- `web.config` - IIS configuration untuk Node.js dan WebSocket
- `.deployment` - Azure deployment configuration  
- `package.json` - Dengan engines specification untuk Azure
- `index.js` - Server code dengan PORT environment variable

### ✅ **ESP8266 Configuration:**
```cpp
// Sudah dikonfigurasi untuk Azure
const char* socket_io_host = "simon-says-exhqaycwc6c0hveg.canadacentral-01.azurewebsites.net";
const uint16_t socket_io_port = 80;
```

## 📝 **Langkah Setelah Deployment**

### 1. **Verify Deployment**
```bash
# Test API endpoint
curl https://your-app-name.azurewebsites.net/api/leaderboard

# Should return: []
```

### 2. **Update ESP8266 (Jika URL Berbeda)**
Jika Azure URL berbeda dari yang dikonfigurasi, update di ESP8266:
```cpp
const char* socket_io_host = "your-actual-app-name.azurewebsites.net";
```

### 3. **Test End-to-End**
1. ✅ Buka `https://your-app-name.azurewebsites.net`
2. ✅ Input nama dan klik "Mulai Permainan" 
3. ✅ ESP8266 harus menerima trigger
4. ✅ Setelah game selesai, leaderboard update

## 🔧 **Troubleshooting Azure**

### **Common Issues:**

1. **WebSocket Connection Failed**
   - Enable WebSocket di Azure Portal
   - Check `web.config` configuration

2. **Static Files Not Served**
   - Verify `public` folder uploaded
   - Check static content MIME types

3. **Application Start Failed**  
   - Check Node.js version compatibility
   - Verify `package.json` start script

4. **Socket.IO Not Working**
   - Enable WebSocket in Azure
   - Check URL rewrite rules in `web.config`

### **Debug Commands:**
```bash
# Check app logs
az webapp log tail --name your-app-name --resource-group your-rg

# Check deployment status  
az webapp deployment list --name your-app-name --resource-group your-rg
```

## 🎯 **Expected URLs After Deployment**

```
Frontend:    https://your-app-name.azurewebsites.net
API:         https://your-app-name.azurewebsites.net/api/leaderboard
WebSocket:   wss://your-app-name.azurewebsites.net/socket.io/
```

## 📊 **Testing Deployment**

### **Manual Test Checklist:**
- [ ] Web interface loads
- [ ] Connection status shows "Connected"  
- [ ] API returns empty leaderboard `[]`
- [ ] Input validation works
- [ ] WebSocket connection established
- [ ] ESP8266 connects to Azure server

### **Automated Test:**
```bash
# Test API
curl https://your-app-name.azurewebsites.net/api/leaderboard

# Test WebSocket (with wscat)
npm install -g wscat
wscat -c wss://your-app-name.azurewebsites.net/socket.io/?transport=websocket
```

## 🔒 **Security Considerations**

- ✅ Input sanitization implemented
- ✅ CORS configured for WebSocket
- ✅ Rate limiting can be added
- ✅ HTTPS enforced by Azure
- ⚠️ Consider authentication for production

## 💰 **Cost Estimation**

- **Free Tier (F1):** $0/month - Limited compute, 60 min/day  
- **Basic (B1):** ~$13/month - Always on, custom domains
- **Standard (S1):** ~$56/month - Auto-scaling, staging slots

## 🏁 **Ready for Deployment**

**Your Simon Says IoT system is READY for Azure deployment!**

1. ✅ All Azure configuration files created
2. ✅ Package.json configured for Azure  
3. ✅ WebSocket and Node.js support enabled
4. ✅ ESP8266 pre-configured for Azure URL
5. ✅ Comprehensive deployment documentation

**Next Step:** Choose deployment method dan push ke Azure! 🚀 