/**
 * Azure Infrastructure — Main Bicep Template
 * 
 * Provisions all Azure resources for the M365 AI Integration Platform:
 * - App Service (web portal hosting)
 * - Azure AI Search (knowledge base / RAG)
 * - Cosmos DB (interaction logging)
 * - Storage Account (templates, generated docs)
 * 
 * Usage:
 *   az deployment group create \
 *     --resource-group rg-meridian-ai \
 *     --template-file main.bicep \
 *     --parameters appName=meridian-ai
 */

targetScope = 'resourceGroup'

@description('Base name for all resources')
param appName string = 'meridian-ai'

@description('Azure region')
param location string = resourceGroup().location

@description('App Service SKU')
param appServiceSku string = 'B1'

@description('Node.js version')
param nodeVersion string = '~22'

// ─── App Service Plan ──────────────────────────────────────────

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: appServiceSku
    tier: 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// ─── App Service (Web App) ─────────────────────────────────────

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: '${appName}-app'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|${nodeVersion}'
      appCommandLine: 'node server.js'
      alwaysOn: true
      http20Enabled: true
      minTlsVersion: '1.2'
      appSettings: [
        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: nodeVersion }
        { name: 'AZURE_SEARCH_ENDPOINT', value: 'https://${searchService.name}.search.windows.net' }
        { name: 'AZURE_COSMOS_CONNECTION_STRING', value: cosmosAccount.listConnectionStrings().connectionStrings[0].connectionString }
        { name: 'AZURE_STORAGE_CONNECTION_STRING', value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value}' }
      ]
    }
  }
}

// ─── Azure AI Search ───────────────────────────────────────────

resource searchService 'Microsoft.Search/searchServices@2023-11-01' = {
  name: '${appName}-search'
  location: location
  sku: {
    name: 'basic'
  }
  properties: {
    replicaCount: 1
    partitionCount: 1
    hostingMode: 'default'
  }
}

// ─── Cosmos DB (Serverless) ────────────────────────────────────

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-11-15' = {
  name: '${appName}-cosmos'
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    capabilities: [
      { name: 'EnableServerless' }
    ]
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
  }
}

resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-11-15' = {
  parent: cosmosAccount
  name: 'm365-ai-platform'
  properties: {
    resource: {
      id: 'm365-ai-platform'
    }
  }
}

resource interactionsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-11-15' = {
  parent: cosmosDatabase
  name: 'interactions'
  properties: {
    resource: {
      id: 'interactions'
      partitionKey: {
        paths: ['/userId']
        kind: 'Hash'
      }
      indexingPolicy: {
        automatic: true
        indexingMode: 'consistent'
      }
    }
  }
}

resource usersContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-11-15' = {
  parent: cosmosDatabase
  name: 'users'
  properties: {
    resource: {
      id: 'users'
      partitionKey: {
        paths: ['/id']
        kind: 'Hash'
      }
    }
  }
}

// ─── Storage Account ───────────────────────────────────────────

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: replace('${appName}storage', '-', '')
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource templatesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'templates'
  properties: {
    publicAccess: 'None'
  }
}

resource generatedDocsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'generated-docs'
  properties: {
    publicAccess: 'None'
  }
}

// ─── Outputs ───────────────────────────────────────────────────

output appServiceUrl string = 'https://${webApp.properties.defaultHostName}'
output searchEndpoint string = 'https://${searchService.name}.search.windows.net'
output cosmosEndpoint string = cosmosAccount.properties.documentEndpoint
output storageAccountName string = storageAccount.name
output managedIdentityPrincipalId string = webApp.identity.principalId
