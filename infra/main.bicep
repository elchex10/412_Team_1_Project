
targetScope = 'resourceGroup'

@description('Azure region')
param location string = 'eastus'

@description('Deployment environment.')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string = 'dev'

@description('Unique team web application name')
param webAppName string = 'hcdd412-team1-${uniqueString(resourceGroup().id)}'

resource hostingPlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: 'hcdd412-team1-free-plan'
  location: location
  kind: 'linux'
  sku: {
    name: 'F1'
    tier: 'Free'
  }
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: hostingPlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|24-lts'
      ftpsState: 'Disabled'
    }
  }
  tags: {
    Project: 'HeartRateCalculator'
    Team: 'HCDD412-Team1'
    Environment: environment
    // Timothy: Added roles responsible for the project
    Roles: 'Timothy: Continuous Integration (Code Integration, improvements, and automatic testing), Eric and Erika: Frontend, Giovanni: Backend, Other roles to complete for the project: Continuous Deployment, Monitoring, Verification, Continuous Improvement'
  }
}

output websiteUrl string = 'https://${webApp.properties.defaultHostName}'
output hostingTier string = hostingPlan.sku.name
