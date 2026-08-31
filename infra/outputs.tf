output "cloud_run_url" {
  value       = google_cloud_run_v2_service.soundwave_app.uri
  description = "URL pública del servicio Cloud Run"
}

output "service_account_email" {
  value       = google_service_account.cloud_run_sa.email
  description = "Email de la Service Account creada para Cloud Run"
}

output "scheduler_job_id" {
  value       = google_cloud_scheduler_job.sync_scheduler.id
  description = "ID del job programado en Cloud Scheduler"
}
