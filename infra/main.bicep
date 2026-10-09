
targetScope = 'resourceGroup'

@description('Azure region')
param location string = 'eastus'

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
    Environment: 'Development'
    Roles: 'Continuous Integration (Code Integration), Continuous Deployment, Monitoring, Verification, Continuous Improvement'
  }
}

output websiteUrl string = 'https://${webApp.properties.defaultHostName}'
output hostingTier string = hostingPlan.sku.name
