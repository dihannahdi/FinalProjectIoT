# 🔧 Azure Deployment Troubleshooting Guide

## Problem: 404 Error from Azure Health Check

When you see this error:
```
curl: (22) The requested URL returned error: 404
Error: Process completed with exit code 1.
```

It means the Azure deployment is having issues. Here's how to fix it:

## 🔍 **Step 1: Check if Azure App Service Exists**

1. **Login to Azure Portal**: https://portal.azure.com
2. **Search for App Services** in the search bar
3. **Look for your app**: `simon-says-iot` (or your custom name)

If you **DON'T see the app**, you need to create it first:

### Creating Azure App Service

1. **In Azure Portal**, click **"Create a resource"**
2. **Search for "Web App"** and select it
3. **Fill in the details**:
   - **Resource Group**: Create new or use existing
   - **Name**: `simon-says-iot` (must be globally unique)
   - **Runtime Stack**: Node.js 18 LTS
   - **Operating System**: Linux
   - **Region**: Choose closest to your location
   - **Pricing Plan**: F1 (Free) for testing

4. **Click "Review + Create"** then **"Create"**

## 🔍 **Step 2: Verify GitHub Secrets**

Your GitHub repository needs these secrets for deployment:

### Required Secrets:
1. Go to your **GitHub repository**
2. Click **Settings** → **Secrets and variables** → **Actions**
3. **Check these secrets exist**:

   - `AZURE_CREDENTIALS` - Service Principal credentials
   - `AZURE_APP_NAME` - Your app name (e.g., `simon-says-iot`)

### Creating AZURE_CREDENTIALS:

1. **Install Azure CLI** if not installed
2. **Run this command** (replace with your details):
   ```bash
   az ad sp create-for-rbac --name "simon-says-iot-sp" --role contributor --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group-name} --sdk-auth
   ```
3. **Copy the JSON output** and add it as `AZURE_CREDENTIALS` secret

### Creating AZURE_APP_NAME:
- **Add secret** `AZURE_APP_NAME` with value: `simon-says-iot`

## 🔍 **Step 3: Check Deployment Status**

1. **GitHub Repository** → **Actions** tab
2. **Look for latest workflow run**
3. **Check if it's successful** (green checkmark)

If deployment **failed**:
- **Click on the failed run**
- **Check the logs** for error messages
- **Common issues**:
  - Missing secrets
  - App name conflicts
  - Resource group issues

## 🔍 **Step 4: Manual Testing**

Test your local setup first:

```bash
# Test deployment readiness
npm run test:deployment

# Test only local server
npm run test:local

# Test only Azure (after deployment)
npm run test:azure
```

## 🔍 **Step 5: Manual Deployment (Alternative)**

If GitHub Actions fails, deploy manually:

```bash
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account set --subscription "your-subscription-id"

# Create resource group (if needed)
az group create --name simon-says-iot-rg --location "East US"

# Create App Service plan (if needed)
az appservice plan create --name simon-says-iot-plan --resource-group simon-says-iot-rg --sku F1 --is-linux

# Create Web App
az webapp create --resource-group simon-says-iot-rg --plan simon-says-iot-plan --name simon-says-iot --runtime "NODE|18-lts"

# Deploy from local Git (optional)
az webapp deployment source config-local-git --name simon-says-iot --resource-group simon-says-iot-rg
```

## 🔍 **Step 6: Configure App Settings**

Set required environment variables in Azure:

1. **Azure Portal** → **Your App Service** → **Configuration**
2. **Add these Application Settings**:
   - `NODE_ENV`: `production`
   - `WEBSITE_NODE_DEFAULT_VERSION`: `18.17.0`
   - `SCM_DO_BUILD_DURING_DEPLOYMENT`: `1`

## 🔍 **Step 7: Test Health Endpoint**

After deployment, test manually:

```bash
# Replace with your actual app name
curl https://your-app-name.azurewebsites.net/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "uptime": 123
# }
```

## 🔍 **Step 8: Check Common Issues**

### Issue: App Name Conflicts
- **Error**: "The app name 'simon-says-iot' is not available"
- **Solution**: Use a unique name like `simon-says-iot-yourname`

### Issue: Subscription Issues
- **Error**: "No subscriptions found"
- **Solution**: Ensure you have an active Azure subscription

### Issue: Resource Group Permission
- **Error**: "Authorization failed"
- **Solution**: Ensure you have Contributor role on the resource group

### Issue: Build Failures
- **Error**: "npm install failed"
- **Solution**: Check package.json dependencies and Node.js version

### Issue: Runtime Errors
- **Error**: Application not starting
- **Solution**: Check Application Logs in Azure Portal

## 🔍 **Step 9: Monitor Deployment**

### In Azure Portal:
1. **App Service** → **Deployment Center**
2. **Check deployment history**
3. **View build logs**

### In GitHub:
1. **Actions** tab
2. **Check workflow run details**
3. **Download logs** if needed

## 🆘 **Quick Fix Commands**

```bash
# Test everything
npm run test:deployment

# Check only Azure connection
npm run test:azure

# Start local server for comparison
npm start

# Check if health endpoint works locally
curl http://localhost:3000/health
```

## 📞 **Getting Help**

If you're still having issues:

1. **Check GitHub Actions logs** for detailed error messages
2. **Check Azure App Service logs** in the portal
3. **Verify all secrets** are set correctly
4. **Ensure app name is unique** globally
5. **Try deploying to a different region**

## ✅ **Success Indicators**

You'll know it's working when:
- ✅ GitHub Actions workflow shows green checkmark
- ✅ Azure App Service shows "Running" status
- ✅ Health endpoint returns 200 OK
- ✅ You can access the web interface

---

**Need immediate help?** Run: `npm run test:deployment` for a comprehensive diagnostic. 