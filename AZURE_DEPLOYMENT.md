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

# 🚀 Azure Deployment Instructions

## 📋 Prerequisites

1. **Azure Account** with active subscription
2. **GitHub Repository** with your code
3. **Azure CLI** installed (optional, for manual setup)

## 🔧 Step 1: Create Azure App Service

### Option A: Using Azure Portal

1. **Go to Azure Portal** → Create a resource → Web App
2. **Configure Basic Settings:**
   - **Subscription:** Your Azure subscription
   - **Resource Group:** Create new or use existing
   - **Name:** `simon-says-iot` (or your preferred name)
   - **Publish:** Code
   - **Runtime Stack:** Node 22 LTS
   - **Operating System:** Linux
   - **Region:** Choose closest to your users

3. **Review + Create** → Create

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name simon-says-rg --location "East US"

# Create App Service plan
az appservice plan create --name simon-says-plan --resource-group simon-says-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group simon-says-rg --plan simon-says-plan --name simon-says-iot --runtime "NODE:22-lts"
```

## 🔐 Step 2: Set up GitHub Actions Secrets

### Required Secrets:

1. **AZURE_CREDENTIALS** - Service Principal JSON
2. **AZURE_APP_NAME** - Your Azure app name

### Creating AZURE_CREDENTIALS:

```bash
# Create service principal
az ad sp create-for-rbac --name "simon-says-deploy" --role contributor --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} --sdk-auth
```

Copy the JSON output and add it as `AZURE_CREDENTIALS` secret in GitHub.

### Adding Secrets to GitHub:

1. Go to your **GitHub Repository**
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret:**
   - Name: `AZURE_CREDENTIALS`
   - Value: The JSON from service principal creation
4. **New repository secret:**
   - Name: `AZURE_APP_NAME`
   - Value: `simon-says-iot` (your app name)

## ⚙️ Step 3: Configure Azure App Service

### Environment Variables:

Go to Azure Portal → Your App Service → **Configuration** → **Application settings**

Add these variables:

```
NODE_ENV=production
WEBSITE_NODE_DEFAULT_VERSION=~22
WEBSITE_NPM_DEFAULT_VERSION=8.19.2
PORT=8080
LOG_LEVEL=info
ALLOWED_ORIGINS=https://your-app-name.azurewebsites.net
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
SCM_DO_BUILD_DURING_DEPLOYMENT=true
WEBSITE_DYNAMIC_CACHE=0
```

Replace `your-app-name` with your actual Azure app name.

## 🌐 Step 4: Enable WebSocket Support

1. Go to Azure Portal → Your App Service
2. **Configuration** → **General settings**
3. **Web sockets:** ON
4. **Save**

## 📦 Step 5: Deploy

### Automatic Deployment (Recommended):

1. **Commit and push** your code to main branch:

```bash
git add .
git commit -m "Add monitoring system and fix Azure deployment"
git push origin main
```

2. **Check GitHub Actions** tab in your repository
3. **Monitor deployment** progress
4. **Visit your app** at `https://your-app-name.azurewebsites.net`

### Manual Deployment:

1. Go to **GitHub Repository** → **Actions**
2. Select **Deploy to Azure App Service** workflow
3. Click **Run workflow** → **Run workflow**

## 🔍 Step 6: Verify Deployment

Test these endpoints:

- **Main App:** `https://your-app-name.azurewebsites.net`
- **Health Check:** `https://your-app-name.azurewebsites.net/health`
- **Metrics:** `https://your-app-name.azurewebsites.net/api/metrics`
- **Leaderboard:** `https://your-app-name.azurewebsites.net/api/leaderboard`

## 🐛 Troubleshooting

### Common Issues:

#### 1. **Application Error / 500 Error**
- Check **Azure Portal** → **App Service** → **Log stream**
- Verify all environment variables are set
- Check if Node.js version is correct

#### 2. **Build Fails in GitHub Actions**
- Verify `AZURE_CREDENTIALS` secret is correct
- Check if service principal has proper permissions
- Ensure `AZURE_APP_NAME` matches your app name

#### 3. **WebSocket Not Working**
- Enable WebSockets in Azure App Service configuration
- Check if port is correctly set to `8080`
- Verify CORS settings allow your domain

### Debug Commands:

```bash
# Check Azure app logs
az webapp log tail --name simon-says-iot --resource-group simon-says-rg

# Restart the app
az webapp restart --name simon-says-iot --resource-group simon-says-rg

# Check app status
az webapp show --name simon-says-iot --resource-group simon-says-rg --query state
```

## 📊 Monitoring

Your app includes comprehensive monitoring:

- **Structured Logs:** Available in Azure Log Analytics
- **Health Endpoint:** `/health` for uptime monitoring
- **Metrics Endpoint:** `/api/metrics` for performance data
- **Error Tracking:** Automatic error logging and alerting

## 🔄 Updates

To deploy updates:

1. Make your changes locally
2. Test thoroughly
3. Commit and push to main branch
4. GitHub Actions will automatically deploy

## 📞 Support

If deployment fails:

1. **Check GitHub Actions logs** for build errors
2. **Check Azure App Service logs** for runtime errors
3. **Verify all secrets and environment variables**
4. **Ensure WebSocket support is enabled**

## 🎉 Success!

Once deployed successfully, your Simon Says IoT system will be live at:
`https://your-app-name.azurewebsites.net`

The system includes:
- ✅ Real-time WebSocket communication
- ✅ Comprehensive monitoring and logging
- ✅ Health checks and metrics
- ✅ Rate limiting and security
- ✅ Automatic error tracking 