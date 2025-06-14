# Azure Deployment Guide - Simon Says IoT Leaderboard

This guide provides step-by-step instructions to deploy your Simon Says IoT Leaderboard System to Microsoft Azure.

## 🏗️ Architecture Overview

Your project will be deployed with:
- **Azure App Service**: Hosts the Node.js web application
- **Azure Storage**: Stores the leaderboard.json file persistently
- **Application Insights**: Monitors application performance (optional)

## 📋 Prerequisites

1. **Azure Account**: Create a free account at [azure.microsoft.com](https://azure.microsoft.com/free/)
2. **Azure CLI**: Install from [docs.microsoft.com/cli/azure/install-azure-cli](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
3. **Git**: Your project should be in a Git repository

## 🚀 Deployment Methods

### Method 1: Azure Portal (Recommended for Beginners)

#### Step 1: Create Azure App Service

1. **Login to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure account

2. **Create App Service**
   ```
   • Click "Create a resource"
   • Search for "App Service"
   • Click "Create"
   ```

3. **Configure Basic Settings**
   ```
   Resource Group: Create new "simon-says-rg"
   Name: simon-says-leaderboard (must be globally unique)
   Publish: Code
   Runtime stack: Node 18 LTS
   Operating System: Linux
   Region: East US (or closest to your location)
   Pricing plan: F1 (Free tier for testing)
   ```

4. **Click "Review + Create" → "Create"**

#### Step 2: Deploy Your Code

**Option A: GitHub Integration**
1. Go to your App Service in Azure Portal
2. Navigate to "Deployment Center"
3. Choose "GitHub" as source
4. Authorize Azure to access your GitHub
5. Select your repository and branch
6. Azure will automatically build and deploy

**Option B: Local Git Deployment**
1. In Azure Portal, go to your App Service
2. Navigate to "Deployment Center"
3. Choose "Local Git"
4. Copy the Git URL provided
5. In your local project:
   ```bash
   git remote add azure <your-git-url>
   git push azure main
   ```

**Option C: ZIP Deploy**
1. Create a ZIP file of your project (exclude node_modules)
2. Use Azure CLI:
   ```bash
   az webapp deployment source config-zip \
     --resource-group simon-says-rg \
     --name simon-says-leaderboard \
     --src project.zip
   ```

#### Step 3: Configure Environment Variables

1. In Azure Portal, go to your App Service
2. Navigate to "Configuration" → "Application settings"
3. Add the following settings:
   ```
   NODE_ENV = production
   WEBSITE_NODE_DEFAULT_VERSION = 18-lts
   PORT = 8080
   ```

#### Step 4: Access Your Application

Your app will be available at:
`https://simon-says-leaderboard.azurewebsites.net`

### Method 2: Azure CLI (Advanced)

#### Step 1: Login and Setup

```bash
# Login to Azure
az login

# Create resource group
az group create --name simon-says-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name simon-says-plan \
  --resource-group simon-says-rg \
  --sku F1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group simon-says-rg \
  --plan simon-says-plan \
  --name simon-says-leaderboard \
  --runtime "NODE|18-lts" \
  --deployment-local-git
```

#### Step 2: Deploy Code

```bash
# Add Azure remote
az webapp deployment source config-local-git \
  --name simon-says-leaderboard \
  --resource-group simon-says-rg

# Get deployment URL
az webapp deployment list-publishing-credentials \
  --name simon-says-leaderboard \
  --resource-group simon-says-rg

# Deploy
git remote add azure <deployment-url>
git push azure main
```

#### Step 3: Configure Settings

```bash
# Set Node.js version
az webapp config appsettings set \
  --resource-group simon-says-rg \
  --name simon-says-leaderboard \
  --settings NODE_ENV=production WEBSITE_NODE_DEFAULT_VERSION=18-lts
```

## 🔧 Production Enhancements

### 1. Persistent Storage for Leaderboard

By default, Azure App Service has ephemeral storage. For persistent leaderboard data:

#### Option A: Azure File Share

```bash
# Create storage account
az storage account create \
  --name simonsaysstg \
  --resource-group simon-says-rg \
  --sku Standard_LRS

# Create file share
az storage share create \
  --name leaderboard-data \
  --account-name simonsaysstg

# Mount to App Service
az webapp config storage-account add \
  --resource-group simon-says-rg \
  --name simon-says-leaderboard \
  --custom-id leaderboard \
  --storage-type AzureFiles \
  --share-name leaderboard-data \
  --account-name simonsaysstg \
  --mount-path /data
```

Then update your `server.js`:
```javascript
const LEADERBOARD_FILE = process.env.NODE_ENV === 'production' 
  ? '/data/leaderboard.json' 
  : './leaderboard.json';
```

#### Option B: Azure Database for PostgreSQL (Recommended)

Update your application to use a proper database instead of JSON files.

### 2. Custom Domain and SSL

```bash
# Add custom domain (after DNS configuration)
az webapp config hostname add \
  --webapp-name simon-says-leaderboard \
  --resource-group simon-says-rg \
  --hostname yourdomain.com

# Enable SSL
az webapp config ssl bind \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI \
  --name simon-says-leaderboard \
  --resource-group simon-says-rg
```

### 3. Application Insights (Monitoring)

```bash
# Create Application Insights
az monitor app-insights component create \
  --app simon-says-insights \
  --location eastus \
  --resource-group simon-says-rg

# Get instrumentation key
az monitor app-insights component show \
  --app simon-says-insights \
  --resource-group simon-says-rg \
  --query instrumentationKey
```

Add to your `server.js`:
```javascript
// At the top of server.js
const appInsights = require('applicationinsights');
if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    appInsights.setup().start();
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check logs: `az webapp log tail --name simon-says-leaderboard --resource-group simon-says-rg`
   - Ensure package.json has correct start script
   - Verify Node.js version compatibility

2. **File Permission Issues**
   - Use persistent storage for writable files
   - Check file paths in production environment

3. **ESP8266 Connection Issues**
   - Update ESP8266 firmware with Azure URL
   - Ensure HTTPS endpoints if using custom domain
   - Check CORS settings if needed

### Useful Commands

```bash
# View application logs
az webapp log tail --name simon-says-leaderboard --resource-group simon-says-rg

# Restart application
az webapp restart --name simon-says-leaderboard --resource-group simon-says-rg

# Scale up/down
az appservice plan update --name simon-says-plan --resource-group simon-says-rg --sku B1

# Delete everything
az group delete --name simon-says-rg --yes
```

## 📱 ESP8266 Configuration Update

After deployment, update your ESP8266 firmware:

```cpp
// In simon_says_iot.ino, update server URL
const char* serverURL = "https://simon-says-leaderboard.azurewebsites.net";
```

## 💰 Cost Estimation

- **Free Tier**: F1 plan costs $0/month (limited CPU and bandwidth)
- **Basic Tier**: B1 plan costs ~$13/month (better performance)
- **Storage**: Azure Files ~$0.06/GB/month
- **Bandwidth**: First 5GB free, then ~$0.087/GB

## 🔐 Security Best Practices

1. **Enable HTTPS only**
2. **Configure authentication** if needed
3. **Set up proper CORS** for ESP8266 requests
4. **Use Application Insights** for monitoring
5. **Regular security updates**

## 📚 Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Node.js on Azure](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)

---

## Next Steps

1. Choose your deployment method (Portal recommended for first time)
2. Deploy your application
3. Test the web interface
4. Update ESP8266 firmware with new Azure URL
5. Test end-to-end functionality
6. Consider production enhancements based on usage

Your Simon Says IoT Leaderboard will be globally accessible and scalable on Azure! 🚀 