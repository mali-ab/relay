#!/usr/bin/env bash

# Exit immediately if any command fails
set -e

CONTAINER_NAME="relay-frontend-app"
IMAGE_NAME="relay-frontend"
PORT="3001"

echo "🚀 Starting redeployment process..."

# 1. Stop and remove existing container (ignores error if container doesn't exist)
if [ "$(docker ps -aq -f name=^/${CONTAINER_NAME}$)" ]; then
    echo "⏹️  Stopping running container '${CONTAINER_NAME}'..."
    docker stop "${CONTAINER_NAME}" > /dev/null

    echo "🗑️  Removing container '${CONTAINER_NAME}'..."
    docker rm "${CONTAINER_NAME}" > /dev/null
else
    echo "ℹ️  No existing container named '${CONTAINER_NAME}' found. Skipping stop/rm."
fi

# 2. Rebuild the image
echo "🔨 Building Docker image '${IMAGE_NAME}'..."
docker build -t "${IMAGE_NAME}" .

# 3. Run the new container
echo "▶️  Starting new container on port ${PORT}..."
docker run -d -p "${PORT}:${PORT}" --name "${CONTAINER_NAME}" "${IMAGE_NAME}"

echo "✅ Deployment successful! App is running at http://localhost:${PORT}"