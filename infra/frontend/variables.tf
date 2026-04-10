variable "aws_region" {
  description = "The AWS region to deploy to"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "The globally unique name for the S3 bucket"
  type        = string
  # IMPORTANT: You must change this default to something globally unique
  default     = "watchlist-react-app-frontend-hosting"
}
