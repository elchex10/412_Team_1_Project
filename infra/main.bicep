// Giovanni: Initial Azure infrastructure setup for our Heart Rate Calculator.

targetScope = 'resourceGroup'

@description('Azure region')
param location string = 'eastus'

// Timothy Added Deployment Environment Parameter 
@description('Deployment environment.')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string = 'dev'

// Giovanni: Added a unique web app name to avoid conflicts with other Azure resources.
@description('Unique team web application name')
param webAppName string = 'hcdd412-team1-${uniqueString(resourceGroup().id)}'

// Giovanni: Set up the Linux hosting plan using the F1 free tier.
// We chose this to keep costs down while working on our project.
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

// Giovanni: Created our web app and connected it to the hosting plan.
// HTTPS is enabled, and FTP access is disabled.
resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: hostingPlan.id
    httpsOnly: true
    siteConfig: {
      //Erika added a application environment setting
      appSettings: [ //add a setting that automatically configures the application environment
        {
          name: 'NODE_ENV' // name of the setting is NODE_ENV
          value: 'development' //used for automatically configures the application environment
        }
      ]

      linuxFxVersion: 'NODE|24-lts'
      ftpsState: 'Disabled'
    }
  }

  // Giovanni: Added tags so we can easily identify our resources in Azure.
  tags: {
    Project: 'HeartRateCalculator'
    Team: 'HCDD412-Team1'
    Environment: environment
    // Timothy: Added roles responsible for the project
    Roles: 'Timothy: Continuous Integration (Code Integration, improvements, and automatic testing), Eric and Erika: Frontend, Giovanni: Backend, Other roles to complete for the project: Continuous Deployment, Monitoring, Verification, Continuous Improvement'
    // Eric: Added resource governance & tracking metadata
    ManagedBy: 'Bicep'
    CreatedBy: 'Team1'
    DeployedDate: '2026-10-09'

  }
}

// Giovanni: Added outputs so our team can check the website URL and hosting tier.
output websiteUrl string = 'https://${webApp.properties.defaultHostName}'
output hostingTier string = hostingPlan.sku.name
