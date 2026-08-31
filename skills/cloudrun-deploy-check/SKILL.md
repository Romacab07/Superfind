---
name: cloudrun-deploy-check
description: Checklist de validación previa y verificación post-despliegue para servicios en Google Cloud Platform (Cloud Run, Firestore, Secret Manager y Cloud Scheduler).
---

# Cloud Run & GCP Pre-Deploy Checklist Skill

Esta skill proporciona una lista de verificación paso a paso para desplegar **SoundWave** en GCP de forma segura, con costo cero en reposo y sin exponer credenciales.

## 1. Verificación Previa:
- [ ] Proyecto GCP creado y facturación habilitada (dentro del Free Tier).
- [ ] `gcloud` CLI autenticado: `gcloud auth login`.
- [ ] APIs habilitadas: Cloud Run, Firestore, Secret Manager, Cloud Scheduler, Cloud Build.
- [ ] Secretos creados en Secret Manager: `gemini-api-key` y `jamendo-client-id`.

## 2. Parámetros de Cloud Run para Costo Cero:
- [ ] **Min Instances**: `0` (permite scale-to-zero).
- [ ] **Max Instances**: `5` (previene picos accidentales).
- [ ] **Memoria**: `512Mi` (óptimo para el runtime Java 21).
- [ ] **CPU**: `1000m` (1 vCPU).

## 3. Validación Post-Despliegue:
```bash
# 1. Health check
curl https://{SERVICE_URL}/api/health

# 2. Verificar ranking 24h
curl https://{SERVICE_URL}/api/tracks/top-24h

# 3. Probar webhook de sincronización
curl -X POST https://{SERVICE_URL}/api/internal/sync

# 4. Inspeccionar Cloud Logging
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=soundwave-music-discovery" --limit 20
```
