# 🚀 Azure Deployment Checklist

## 📋 Pre-Deployment Checklist

### ✅ **Code Preparation**
- [ ] All code committed to main branch
- [ ] No sensitive data in code (API keys, passwords)
- [ ] Environment variables configured in `azure.env.example`
- [ ] Production configuration file created
- [ ] Error handling implemented
- [ ] Logging properly configured

### ✅ **Azure Requirements**
- [ ] Azure subscription active
- [ ] Resource group created
- [ ] App Service plan selected (Free F1 or higher)
- [ ] GitHub repository connected to Azure
- [ ] GitHub secrets configured:
  - [ ] `AZURE_CREDENTIALS`
  - [ ] `AZURE_APP_NAME`

### ✅ **Azure App Service Configuration**
Required settings in Azure Portal → App Service → Configuration:

#### Application Settings:
```bash
NODE_ENV=production
WEBSITE_NODE_DEFAULT_VERSION=~18
WEBSITE_NPM_DEFAULT_VERSION=8.19.2
PORT=8080
LOG_LEVEL=info
ALLOWED_ORIGINS=https://your-app-name.azurewebsites.net
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
MEMORY_ALERT_THRESHOLD_MB=400
HEAP_USAGE_ALERT_PERCENTAGE=85
SCM_DO_BUILD_DURING_DEPLOYMENT=true
WEBSITE_DYNAMIC_CACHE=0
```

#### General Settings:
- [ ] **Platform**: 64 Bit
- [ ] **Node version**: 18.x
- [ ] **Always On**: Enabled (if not Free tier)
- [ ] **WebSocket**: Enabled
- [ ] **HTTP Version**: 2.0
- [ ] **HTTPS Only**: Enabled

### ✅ **Security Configuration**
- [ ] HTTPS enforcement enabled
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented

### ✅ **Files Verification**
Required files for Azure deployment:
- [ ] `package.json` with proper scripts
- [ ] `web.config` for IIS configuration
- [ ] `.deployment` for Azure settings
- [ ] `Dockerfile` (for container deployment)
- [ ] `.dockerignore`
- [ ] GitHub Actions workflow (`.github/workflows/main.yml`)
- [ ] Setup script (`scripts/setup.js`)
- [ ] Production config (`config/production.js`)

### ✅ **ESP8266 Configuration**
Update ESP8266 code with Azure URL:
```cpp
const char* socket_io_host = "your-app-name.azurewebsites.net";
const uint16_t socket_io_port = 80; // or 443 for HTTPS
```

## 🚀 Deployment Steps

### 1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for Azure deployment"
git push origin main
```

### 2. **Monitor Deployment**
- [ ] GitHub Actions workflow runs successfully
- [ ] Azure deployment completes without errors
- [ ] Application starts properly

### 3. **Post-Deployment Verification**
- [ ] Health check endpoint accessible: `/health`
- [ ] API endpoint working: `/api/leaderboard`
- [ ] Frontend loads correctly
- [ ] WebSocket connection established
- [ ] ESP8266 can connect to Azure server

## 🧪 Testing Checklist

### **Manual Testing**
- [ ] Open `https://your-app-name.azurewebsites.net`
- [ ] Connection status shows "Connected"
- [ ] Can input player name
- [ ] "Start Game" button works
- [ ] ESP8266 receives trigger signal
- [ ] Game completion updates leaderboard
- [ ] Complex scoring system working

### **API Testing**
```bash
# Test health endpoint
curl https://your-app-name.azurewebsites.net/health

# Test leaderboard API
curl https://your-app-name.azurewebsites.net/api/leaderboard

# Test metrics (if enabled)
curl https://your-app-name.azurewebsites.net/api/metrics
```

### **WebSocket Testing**
```bash
# Install wscat if needed
npm install -g wscat

# Test WebSocket connection
wscat -c wss://your-app-name.azurewebsites.net/socket.io/?transport=websocket
```

## 🔧 Troubleshooting Guide

### **Common Issues & Solutions**

#### 1. **Application won't start**
- Check Node.js version in Azure (should be 18.x)
- Verify `package.json` start script
- Check Azure logs for error details

#### 2. **WebSocket connection fails**
- Ensure WebSocket is enabled in Azure Portal
- Verify `web.config` WebSocket configuration
- Check CORS settings

#### 3. **Static files not loading**
- Verify `public` folder is included in deployment
- Check `web.config` static content settings
- Ensure file paths are correct

#### 4. **ESP8266 can't connect**
- Verify Azure URL in ESP8266 code
- Check if hardware WebSocket path is accessible
- Test with HTTP before HTTPS

### **Azure Logs Commands**
```bash
# Stream live logs
az webapp log tail --name your-app-name --resource-group your-rg

# Download logs
az webapp log download --name your-app-name --resource-group your-rg
```

## 📊 Performance Monitoring

### **Key Metrics to Monitor**
- [ ] Response time < 2 seconds
- [ ] Memory usage < 400MB
- [ ] CPU usage < 80%
- [ ] Error rate < 1%
- [ ] WebSocket connection stability

### **Azure Monitoring Tools**
- [ ] Application Insights enabled
- [ ] Log Analytics configured
- [ ] Alerts set up for critical metrics
- [ ] Dashboard created for monitoring

## 🔒 Security Best Practices

### **Production Security**
- [ ] All secrets stored in Azure Key Vault or App Settings
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection protection (if using database)
- [ ] XSS protection enabled

### **Regular Maintenance**
- [ ] Dependencies updated regularly
- [ ] Security patches applied
- [ ] Logs monitored for suspicious activity
- [ ] Backup strategy implemented

## ✅ Final Verification

Before marking deployment as complete:
- [ ] All checklist items verified
- [ ] End-to-end testing passed
- [ ] ESP8266 hardware integration working
- [ ] Performance metrics acceptable
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] Team notified of deployment

## 🎯 Success Criteria

Deployment is successful when:
- ✅ Web interface loads without errors
- ✅ Real-time communication works (WebSocket)
- ✅ ESP8266 hardware connects successfully
- ✅ Game flow works end-to-end
- ✅ Complex scoring system functional
- ✅ Leaderboard updates in real-time
- ✅ All security measures active
- ✅ Performance meets requirements

---

**🎉 Congratulations! Your Simon Says IoT system is now live on Azure!** 