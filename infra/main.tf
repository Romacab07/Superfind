terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.15"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Habilitar APIs necesarias de Google Cloud
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "firestore.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudscheduler.googleapis.com",
    "iam.googleapis.com",
    "logging.googleapis.com"
  ])
  service            = each.key
  disable_on_destroy = false
}

# 2. Service Account para Cloud Run con Principio de Menor Privilegio
resource "google_service_account" "cloud_run_sa" {
  account_id   = "soundwave-cloud-run-sa"
  display_name = "SoundWave Cloud Run Execution Service Account"
  depends_on   = [google_project_service.apis]
}

# 3. Secret Manager para Credenciales
resource "google_secret_manager_secret" "gemini_key" {
  secret_id = "gemini-api-key"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret" "jamendo_key" {
  secret_id = "jamendo-client-id"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

# Permisos para que la Service Account lea los secretos
resource "google_secret_manager_secret_iam_member" "sa_gemini_secret_accessor" {
  secret_id = google_secret_manager_secret.gemini_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "sa_jamendo_secret_accessor" {
  secret_id = google_secret_manager_secret.jamendo_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Permisos para que la Service Account use Firestore
resource "google_project_iam_member" "sa_firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# 4. Servicio Cloud Run (Monolito Modular - Scale to Zero)
resource "google_cloud_run_v2_service" "soundwave_app" {
  name     = "soundwave-music-discovery"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloud_run_sa.email

    scaling {
      min_instance_count = 0  # Escala a 0 para Costo Cero ($0.00) en reposo
      max_instance_count = 5
    }

    containers {
      image = var.container_image

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      env {
        name  = "SPRING_PROFILES_ACTIVE"
        value = "gcp"
      }
      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "FIRESTORE_ENABLED"
        value = "true"
      }
      env {
        name  = "SECRET_MANAGER_ENABLED"
        value = "true"
      }

      # Inyección segura de secretos desde Secret Manager
      env {
        name = "GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.gemini_key.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "JAMENDO_CLIENT_ID"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jamendo_key.secret_id
            version = "latest"
          }
        }
      }

      startup_probe {
        http_get {
          path = "/api/health"
          port = 8080
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 3
      }
    }
  }

  depends_on = [
    google_project_service.apis,
    google_secret_manager_secret_iam_member.sa_gemini_secret_accessor,
    google_project_iam_member.sa_firestore_user
  ]
}

# Permitir acceso público no autenticado a la API de Cloud Run
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.soundwave_app.location
  service  = google_cloud_run_v2_service.soundwave_app.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# 5. Cloud Scheduler Job (Sincronización cada 10 minutos)
resource "google_cloud_scheduler_job" "sync_scheduler" {
  name             = "soundwave-catalog-sync-trigger"
  description      = "Trigger automático de sincronización multi-proveedor cada 10 minutos"
  schedule         = "*/10 * * * *"
  time_zone        = "UTC"
  attempt_deadline = "320s"

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_v2_service.soundwave_app.uri}/api/internal/sync"

    oidc_token {
      service_account_email = google_service_account.cloud_run_sa.email
    }
  }

  depends_on = [google_cloud_run_v2_service.soundwave_app]
}
