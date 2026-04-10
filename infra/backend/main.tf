terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required services
resource "google_project_service" "cloud_run" {
  service = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifact_registry" {
  service = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

# Create an Artifact Registry repository for Docker images
resource "google_artifact_registry_repository" "backend_repo" {
  repository_id = "watchlist-backend"
  location      = var.region
  format        = "DOCKER"
  depends_on    = [google_project_service.artifact_registry]
}

# Cloud Run Service
resource "google_cloud_run_v2_service" "backend" {
  name     = "watchlist-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      # This image needs to be built and pushed to the registry before applying this resource.
      # Because Terraform will fail if the image doesn't exist, a common pattern 
      # is to push a dummy image manually or via CI/CD before running Terraform.
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.backend_repo.name}/${var.image_name}:${var.image_tag}"
      ports {
        container_port = 8080
      }
      
      env {
        name  = "ASPNETCORE_ENVIRONMENT"
        value = "Production"
      }
      
      # The credentials path is normally handled by mounting a secret or using default compute service account.
      # Since we are using Firestore/Firebase Admin SDK, if the Cloud Run service account has the right IAM roles, 
      # we do not need to provide a credential file explicitly.
      env {
        name  = "Firebase__ProjectId"
        value = var.project_id
      }
    }
  }
  
  depends_on = [google_project_service.cloud_run]
}

# Allow unauthenticated invocations (Assuming the API handles JWT validation via Firebase Admin SDK)
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = google_cloud_run_v2_service.backend.project
  location = google_cloud_run_v2_service.backend.location
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "cloud_run_url" {
  value = google_cloud_run_v2_service.backend.uri
}
