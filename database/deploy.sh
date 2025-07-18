
#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

echo "\nInstalling server dependencies..."
cd server
npm ci

# Build and start server
echo "\nBuilding and starting server..."
NODE_ENV=production npm run build
pm2 startOrRestart ecosystem.config.js

echo "\nInstalling client dependencies..."
cd ../client
npm ci

# Build client
echo "\nBuilding client..."
NODE_ENV=production npm run build:prod

# Copy build to server public directory
echo "\nCopying client build to server..."
cp -r dist ../server/public/

echo "\nDeployment complete!"
