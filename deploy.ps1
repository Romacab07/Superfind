param (
    [string]$ProjectId = "soundwave-music-discovery",
    [string]$Region = "us-central1",
    [string]$ServiceName = "soundwave-music-discovery"
)

$ErrorActionPreference = "Stop"
Write-Host "=== Despliegue de SoundWave Music Discovery a GCP Cloud Run ===" -ForegroundColor Cyan
Write-Host "Proyecto: $ProjectId | Region: $Region | Servicio: $ServiceName"

$ImageName = "gcr.io/$ProjectId/${ServiceName}:latest"

Write-Host "--> Compilando contenedor con Cloud Build..." -ForegroundColor Yellow
gcloud builds submit --tag $ImageName ./backend

Write-Host "--> Desplegando en Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
    --image $ImageName `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --min-instances 0 `
    --max-instances 5 `
    --set-env-vars "SPRING_PROFILES_ACTIVE=gcp,GCP_PROJECT_ID=$ProjectId,FIRESTORE_ENABLED=true,SECRET_MANAGER_ENABLED=true"

$ServiceUrl = gcloud run services describe $ServiceName --platform managed --region $Region --format 'value(status.url)'
Write-Host "=== Despliegue exitoso ===" -ForegroundColor Green
Write-Host "URL: $ServiceUrl"
Write-Host "Swagger UI: $ServiceUrl/swagger-ui.html"
