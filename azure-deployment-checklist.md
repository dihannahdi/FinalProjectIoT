# Azure Deployment Checklist - Simon Says IoT

## ✅ **Pre-Deployment Fixes (COMPLETED)**

- [x] **Environment Detection**: Added Azure environment detection in startup.js
- [x] **CORS Security**: Improved CORS settings for production
- [x] **Health Check**: Enhanced `/health` endpoint for Azure monitoring
- [x] **Storage Handling**: Added fallback storage for Azure App Service
- [x] **Web.config**: Optimized for Azure IIS integration
- [x] **Package.json**: Added Azure-specific scripts

## 🚀 **Azure App Service Configuration**

### 1. **Application Settings** (Set these in Azure Portal)
```
NODE_ENV = production
WEBSITE_NODE_DEFAULT_VERSION = 18-lts
PORT = 8080
NODE_OPTIONS = --max-old-space-size=512
CORS_ORIGIN = https://*.azurewebsites.net
TRUST_PROXY = true
```

### 2. **Optional: Persistent Storage Setup**
For persistent leaderboard data, configure Azure File Share:
```
AZURE_STORAGE_PATH = /home/data
```

### 3. **Required Azure Configuration**
- **Runtime Stack**: Node.js 18 LTS
- **Operating System**: Linux (recommended) or Windows
- **Pricing Tier**: B1 Basic or higher for production
- **Always On**: Enabled (prevents cold starts)

## 📋 **Deployment Steps**

### Method 1: GitHub Actions (Recommended)
1. Push code to GitHub repository
2. In Azure Portal → App Service → Deployment Center
3. Choose "GitHub" as source
4. Select repository and branch
5. Azure will auto-deploy on commits

### Method 2: Local Git
```bash
az webapp deployment source config-local-git \
  --name simon-says-leaderboard \
  --resource-group simon-says-rg

git remote add azure <deployment-url>
git push azure main
```

### Method 3: ZIP Deploy
```bash
az webapp deployment source config-zip \
  --resource-group simon-says-rg \
  --name simon-says-leaderboard \
  --src deployment.zip
```

## ⚠️ **Known Limitations & Workarounds**

### 1. **File Storage Issue**
- **Problem**: leaderboard.json won't persist across app restarts
- **Short-term**: Use in-memory storage (data lost on restart)
- **Long-term**: Migrate to Azure Database or Azure Storage

### 2. **ESP8266 CORS**
- **Issue**: IoT devices may have CORS issues
- **Solution**: Devices should include proper headers
- **Fallback**: Use server-side proxy for device calls

### 3. **Cold Start**
- **Issue**: First request may be slow
- **Solution**: Enable "Always On" in Azure App Service

## 🔧 **Post-Deployment Verification**

### Health Check
```bash
curl https://your-app.azurewebsites.net/health
```

### API Endpoints Test
```bash
# Test game trigger
curl -X POST https://your-app.azurewebsites.net/start-game \
  -H "Content-Type: application/json" \
  -d '{"playerName":"TestPlayer"}'

# Check leaderboard
curl https://your-app.azurewebsites.net/leaderboard
```

## 📊 **Monitoring Setup**

1. **Application Insights**: Enable in Azure Portal
2. **Log Stream**: Monitor real-time logs
3. **Metrics**: Set up alerts for response time and errors

## 🔄 **Future Improvements**

1. **Database Migration**: Replace JSON file with Azure SQL/CosmosDB
2. **Redis Cache**: Add caching for better performance
3. **CDN**: Use Azure CDN for static assets
4. **Auto-scaling**: Configure based on load
5. **SSL Certificate**: Add custom domain with SSL

## 🚨 **Security Checklist**

- [x] CORS properly configured
- [x] Security headers added
- [x] Environment variables for sensitive data
- [ ] Rate limiting (consider adding)
- [ ] API authentication (for admin features)
- [ ] Input validation enhancement

## 📞 **Troubleshooting**

### App Won't Start
1. Check Application Logs in Azure Portal
2. Verify Node.js version compatibility
3. Check package.json start script

### ESP8266 Connection Issues
1. Verify CORS settings
2. Check network connectivity
3. Test with curl first

### Data Loss
1. Implement backup strategy
2. Consider database migration
3. Use Azure Storage for persistence 