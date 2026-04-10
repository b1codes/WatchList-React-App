variable "project_id" {
  description = "The Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "The Google Cloud region to deploy to"
  type        = string
  default     = "us-central1"
}

variable "image_name" {
  description = "The name of the Docker image"
  type        = string
  default     = "watchlist-api"
}

variable "image_tag" {
  description = "The tag of the Docker image"
  type        = string
  default     = "latest"
}
