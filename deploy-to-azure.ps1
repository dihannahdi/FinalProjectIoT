# Azure Deployment Script for Simon Says IoT Leaderboard
# This script automates the deployment process to Azure App Service

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "simon-says-rg",
    
    [Parameter(Mandatory=$false)]
    [string]$AppServiceName = "simon-says-leaderboard",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "East US",
    
    [Parameter(Mandatory=$false)]
    [string]$PricingTier = "F1",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipLogin
)

Write-Host "Azure Deployment Script for Simon Says IoT Leaderboard" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

# Function to check if Azure CLI is installed
function Test-AzureCLI {
    try {
        $null = az --version
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if user is logged in to Azure
function Test-AzureLogin {
    try {
        $account = az account show --output json 2>$null | ConvertFrom-Json
        return $account -ne $null
    }
    catch {
        return $false
    }
}

# Main deployment logic
try {
    # Check prerequisites
    Write-Host "Checking prerequisites..." -ForegroundColor Cyan
    
    if (-not (Test-AzureCLI)) {
        Write-Host "ERROR: Azure CLI is not installed!" -ForegroundColor Red
        Write-Host "Please install Azure CLI from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "SUCCESS: Azure CLI is installed" -ForegroundColor Green
    
    # Login to Azure if not already logged in
    if (-not $SkipLogin -and -not (Test-AzureLogin)) {
        Write-Host "Logging in to Azure..." -ForegroundColor Cyan
        az login
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to login to Azure!" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "SUCCESS: Azure login verified" -ForegroundColor Green
    
    # Create Resource Group
    Write-Host "Creating resource group '$ResourceGroupName'..." -ForegroundColor Cyan
    $rgResult = az group create --name $ResourceGroupName --location $Location --output json | ConvertFrom-Json
    
    if ($rgResult.properties.provisioningState -eq "Succeeded") {
        Write-Host "SUCCESS: Resource group created successfully" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Resource group might already exist" -ForegroundColor Yellow
    }
    
    # Create App Service Plan
    Write-Host "Creating App Service plan..." -ForegroundColor Cyan
    $planName = "$AppServiceName-plan"
    az appservice plan create --name $planName --resource-group $ResourceGroupName --sku $PricingTier --is-linux --output none
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: App Service plan created successfully" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to create App Service plan" -ForegroundColor Red
        exit 1
    }
    
    # Create Web App
    Write-Host "Creating web app '$AppServiceName'..." -ForegroundColor Cyan
    az webapp create --resource-group $ResourceGroupName --plan $planName --name $AppServiceName --runtime "NODE:18-lts" --output none
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Web app created successfully" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to create web app" -ForegroundColor Red
        exit 1
    }
    
    # Configure app settings
    Write-Host "Configuring application settings..." -ForegroundColor Cyan
    az webapp config appsettings set --resource-group $ResourceGroupName --name $AppServiceName --settings NODE_ENV=production WEBSITE_NODE_DEFAULT_VERSION=18-lts --output none
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Application settings configured" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Failed to configure some settings" -ForegroundColor Yellow
    }
    
    # Deploy code (using ZIP deployment)
    Write-Host "Preparing code for deployment..." -ForegroundColor Cyan
    
    # Create deployment package
    $excludePatterns = @(
        "node_modules",
        ".git",
        "*.md",
        "simon_says_iot.ino",
        "deploy-to-azure.ps1",
        ".gitignore"
    )
    
    $zipFile = "deployment.zip"
    
    # Remove old zip if exists
    if (Test-Path $zipFile) {
        Remove-Item $zipFile -Force
    }
    
    # Create zip file with required files
    Write-Host "Creating deployment package..." -ForegroundColor Cyan
    
    # Use PowerShell's Compress-Archive
    $filesToInclude = @(
        "server.js",
        "package.json",
        "web.config",
        ".deployment",
        "deploy.cmd",
        "public"
    )
    
    $tempDir = "temp_deploy"
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $tempDir | Out-Null
    
    foreach ($file in $filesToInclude) {
        if (Test-Path $file) {
            Copy-Item $file $tempDir -Recurse -Force
        }
    }
    
    Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force
    Remove-Item $tempDir -Recurse -Force
    
    Write-Host "SUCCESS: Deployment package created: $zipFile" -ForegroundColor Green
    
    # Deploy the zip file
    Write-Host "Deploying to Azure..." -ForegroundColor Cyan
    az webapp deployment source config-zip --resource-group $ResourceGroupName --name $AppServiceName --src $zipFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Deployment completed successfully!" -ForegroundColor Green
        
        # Clean up
        Remove-Item $zipFile -Force
        
        # Get the app URL
        $appUrl = "https://$AppServiceName.azurewebsites.net"
        
        Write-Host "" -ForegroundColor Green
        Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Your app is now available at:" -ForegroundColor Cyan
        Write-Host "   $appUrl" -ForegroundColor White
        Write-Host "" -ForegroundColor Green
        Write-Host "Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Test your web application at the URL above" -ForegroundColor White
        Write-Host "2. Update your ESP8266 firmware with the new Azure URL:" -ForegroundColor White
        Write-Host "   const char* azureServerURL = `"$appUrl`";" -ForegroundColor Yellow
        Write-Host "3. Upload the updated firmware to your ESP8266" -ForegroundColor White
        Write-Host "4. Test the complete IoT system" -ForegroundColor White
        Write-Host "" -ForegroundColor Green
        Write-Host "Azure Resources Created:" -ForegroundColor Cyan
        Write-Host "* Resource Group: $ResourceGroupName" -ForegroundColor White
        Write-Host "* App Service Plan: $planName" -ForegroundColor White
        Write-Host "* App Service: $AppServiceName" -ForegroundColor White
        Write-Host "" -ForegroundColor Green
        
    } else {
        Write-Host "ERROR: Deployment failed!" -ForegroundColor Red
        exit 1
    }
    
}
catch {
    Write-Host "ERROR: An error occurred during deployment:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "Deployment script completed!" -ForegroundColor Green 