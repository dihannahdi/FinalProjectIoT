# Azure Portal Deployment Steps - Simon Says IoT

Follow these steps to deploy your application through the Azure Portal:

## Step 1: Create Azure Account (if needed)
1. Go to https://azure.microsoft.com/free/
2. Click "Start free" 
3. Sign in with Microsoft account or create new one
4. Complete the verification process

## Step 2: Access Azure Portal
1. Go to https://portal.azure.com
2. Sign in with your Azure account

## Step 3: Create App Service
1. Click **"Create a resource"** (+ icon in top-left)
2. Search for **"App Service"**
3. Click **"App Service"** → **"Create"**

## Step 4: Configure Basic Settings
Fill in these details:
- **Subscription**: Select your subscription
- **Resource Group**: Click "Create new" → Enter `simon-says-rg`
- **Name**: `simon-says-leaderboard` (must be globally unique - if taken, try `simon-says-leaderboard-yourname`)
- **Publish**: Code
- **Runtime stack**: Node 18 LTS
- **Operating System**: Linux
- **Region**: East US (or closest to you)

## Step 5: Configure App Service Plan
- **Linux Plan**: Click "Create new"
- **Name**: `simon-says-plan`
- **Pricing tier**: Click "Change size"
  - For **Free**: Select **F1** (Shared infrastructure, 1GB storage)
  - For **Basic**: Select **B1** (~$13/month, better performance)
- Click **"Apply"**

## Step 6: Review and Create
1. Click **"Review + create"**
2. Verify all settings
3. Click **"Create"**
4. Wait 2-3 minutes for deployment to complete

## Step 7: Deploy Your Code

### Option A: GitHub Integration (Recommended)
1. In your App Service, go to **"Deployment Center"**
2. Choose **"GitHub"** as source
3. Click **"Authorize"** and sign in to GitHub
4. Select your repository and branch (`main`)
5. Click **"Save"**
6. Wait for automatic build and deployment

### Option B: ZIP Upload
1. Create a ZIP file with these files:
   - `server.js`
   - `package.json`
   - `web.config`
   - `.deployment`
   - `deploy.cmd`
   - `public/` folder
2. In Azure Portal, go to your App Service
3. Click **"Advanced Tools"** → **"Go"** (opens Kudu)
4. Click **"Tools"** → **"ZIP Push Deploy"**
5. Drag your ZIP file to the deployment area

### Option C: FTP Upload
1. In your App Service, go to **"Deployment Center"**
2. Click **"FTPS credentials"**
3. Note the FTP endpoint and credentials
4. Use an FTP client to upload your files to `/site/wwwroot/`

## Step 8: Configure Application Settings
1. In your App Service, go to **"Configuration"**
2. Click **"Application settings"**
3. Add these settings:
   - **Name**: `NODE_ENV`, **Value**: `production`
   - **Name**: `WEBSITE_NODE_DEFAULT_VERSION`, **Value**: `18-lts`
4. Click **"Save"**

## Step 9: Test Your Application
1. In your App Service **"Overview"**, find the **URL**
2. Click the URL (it will be like: `https://simon-says-leaderboard.azurewebsites.net`)
3. Your Simon Says leaderboard should load!

## Step 10: Update ESP8266 Firmware
1. Open `simon_says_iot_azure.ino`
2. Update this line with your Azure URL:
   ```cpp
   const char* azureServerURL = "https://your-app-name.azurewebsites.net";
   ```
3. Upload to your ESP8266

## Troubleshooting

### If deployment fails:
1. Go to **"Log stream"** in your App Service
2. Check for error messages
3. Ensure all files are uploaded correctly

### If the app doesn't start:
1. Check **"Application settings"** are correct
2. Verify `package.json` has correct start script
3. Check **"Deployment logs"** for build errors

### If ESP8266 can't connect:
1. Ensure your Azure URL is correct (no trailing slash)
2. Check if HTTPS is enabled
3. Test API endpoints manually in browser

## Success Checklist
- [ ] App Service created
- [ ] Code deployed successfully  
- [ ] Web interface loads at Azure URL
- [ ] ESP8266 firmware updated with Azure URL
- [ ] ESP8266 can connect and submit scores
- [ ] Leaderboard updates in real-time

Your Simon Says IoT system is now running on Azure! 🎉 