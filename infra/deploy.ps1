<#
.SYNOPSIS
    Deploy the M365 AI Integration Platform to Azure.

.DESCRIPTION
    One-command deployment of all Azure infrastructure using Bicep templates.
    Prerequisites: Azure CLI installed and logged in (az login).

.PARAMETER ResourceGroup
    Name of the Azure resource group (created if it doesn't exist).

.PARAMETER AppName
    Base name for all Azure resources.

.PARAMETER Location
    Azure region (default: eastus).

.EXAMPLE
    .\deploy.ps1 -ResourceGroup "rg-meridian-ai" -AppName "meridian-ai" -Location "eastus"
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ResourceGroup,

    [Parameter(Mandatory = $true)]
    [string]$AppName,

    [string]$Location = "eastus"
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== Meridian AI Platform — Azure Deployment ===" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroup"
Write-Host "App Name:       $AppName"
Write-Host "Location:       $Location`n"

# 1. Create resource group if it doesn't exist
Write-Host "[1/4] Creating resource group..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output none

# 2. Deploy infrastructure
Write-Host "[2/4] Deploying Azure infrastructure (Bicep)..." -ForegroundColor Yellow
$deployResult = az deployment group create `
    --resource-group $ResourceGroup `
    --template-file "$PSScriptRoot\main.bicep" `
    --parameters appName=$AppName `
    --output json | ConvertFrom-Json

$appUrl = $deployResult.properties.outputs.appServiceUrl.value
$searchEndpoint = $deployResult.properties.outputs.searchEndpoint.value

Write-Host "  App URL:         $appUrl" -ForegroundColor Green
Write-Host "  Search Endpoint: $searchEndpoint" -ForegroundColor Green

# 3. Build the Next.js app
Write-Host "[3/4] Building Next.js application..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot\.."
npm run build
Pop-Location

# 4. Deploy to App Service
Write-Host "[4/4] Deploying to App Service..." -ForegroundColor Yellow
$appServiceName = "$AppName-app"
Push-Location "$PSScriptRoot\.."
az webapp deploy `
    --resource-group $ResourceGroup `
    --name $appServiceName `
    --src-path ".next\standalone" `
    --type zip
Pop-Location

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Portal URL: $appUrl"
Write-Host "Search:     $searchEndpoint`n"
