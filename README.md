# HCDD 412 – Team 1: Heart Rate Calculator



## Project Overview

Team 1's HCDD 412 project is a web-based medical Heart Rate Calculator. The goal is to develop a simple web application that allows users to calculate their heart rate using relevant input.



## Project Summary

The repository contains a Node.js heart rate calculator and an Azure Bicep template for its hosting environment. The template defines a Linux Azure App Service configured for Node.js 24 LTS with HTTPS-only access.

## Run locally

```text
npm start
```

The application listens on port `8080` locally, or on the port supplied by Azure through the `PORT` environment variable. Use `/health` to verify that the app is running.

If an App Service was manually stopped, start it in Azure Portal before testing the deployment. A stopped App Service returns HTTP 403 even when the deployment package uploaded successfully.
