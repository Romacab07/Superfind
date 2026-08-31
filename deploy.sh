#!/bin/bash
set -e

echo "=== Despliegue de SoundWave Music Discovery a GCP Cloud Run ==="

# 1. Parámetros
PROJECT_ID=${1:-"soundwave-music-discovery"}
REGION=${2:-"us-central1"}
SERVICE_NAME="soundwave-music-discovery"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "Proyecto: $PROJECT_ID | Región: $REGION | Servicio: $SERVICE_NAME"

# 2. Configurar gcloud
gcloud config set project "$PROJECT_ID"

# 3. Compilar imagen con Google Cloud Build
echo "--> Compilando contenedor con Cloud Build..."
gcloud builds submit --tag "$IMAGE_NAME" ./backend

# 4. Desplegar a Cloud Run
echo "--> Desplegando servicio en Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_NAME" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars "SPRING_PROFILES_ACTIVE=gcp,GCP_PROJECT_ID=${PROJECT_ID},FIRESTORE_ENABLED=true,SECRET_MANAGER_ENABLED=true"

# 5. Obtener URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --format 'value(status.url)')
echo "=== Despliegue exitoso ==="
echo "URL del Servicio: $SERVICE_URL"
echo "Swagger UI: $SERVICE_URL/swagger-ui.html"
