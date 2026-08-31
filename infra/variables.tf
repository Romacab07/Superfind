variable "project_id" {
  type        = string
  description = "ID del proyecto en Google Cloud Platform"
  default     = "soundwave-music-discovery"
}

variable "region" {
  type        = string
  description = "Región de despliegue en GCP (ej. us-central1)"
  default     = "us-central1"
}

variable "container_image" {
  type        = string
  description = "URI de la imagen del contenedor en Google Artifact Registry o Container Registry"
  default     = "gcr.io/soundwave-music-discovery/backend:latest"
}
