#!/usr/bin/env bash
# Deploys backend/ as a container-image AWS Lambda function fronted by a
# Lambda Function URL. Idempotent: re-running updates the existing
# repo/role/function in place instead of failing.
#
# Prereqs: aws CLI configured, docker running, real Firebase service account
# JSON and TMDB keys available locally (never commit them).
#
# Usage:
#   FIREBASE_PROJECT_ID=... \
#   FIREBASE_CREDENTIAL_JSON_PATH=./src/WatchListApi/Watchlist-Web-Firebase-Admin-SDK.json \
#   TMDB_API_KEY=... \
#   TMDB_API_READ_ACCESS_TOKEN=... \
#   ./deploy-lambda.sh
set -euo pipefail

FUNCTION_NAME="${FUNCTION_NAME:-watchlist-api}"
ECR_REPO_NAME="${ECR_REPO_NAME:-watchlist-api}"
AWS_REGION="${AWS_REGION:-$(aws configure get region)}"
ARCHITECTURE="${ARCHITECTURE:-arm64}"   # arm64 (Graviton) is cheaper per ms than x86_64
MEMORY_MB="${MEMORY_MB:-512}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-29}" # Function URLs hard-cap the integration at 30s

: "${FIREBASE_PROJECT_ID:?Set FIREBASE_PROJECT_ID}"
: "${FIREBASE_CREDENTIAL_JSON_PATH:?Set FIREBASE_CREDENTIAL_JSON_PATH to the service account JSON file}"
: "${TMDB_API_KEY:?Set TMDB_API_KEY}"
: "${TMDB_API_READ_ACCESS_TOKEN:?Set TMDB_API_READ_ACCESS_TOKEN}"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ECR_URI="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"
IMAGE_TAG="$(git rev-parse --short HEAD 2>/dev/null || date +%s)"
ROLE_NAME="${FUNCTION_NAME}-lambda-role"

echo "== Account: ${ACCOUNT_ID}  Region: ${AWS_REGION}  Arch: ${ARCHITECTURE} =="

echo "== Ensuring ECR repo ${ECR_REPO_NAME} =="
aws ecr describe-repositories --repository-names "$ECR_REPO_NAME" --region "$AWS_REGION" >/dev/null 2>&1 \
  || aws ecr create-repository --repository-name "$ECR_REPO_NAME" --region "$AWS_REGION" >/dev/null

aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "== Building ${ARCHITECTURE} image =="
docker buildx build \
  --platform "linux/${ARCHITECTURE}" \
  -t "${ECR_URI}:${IMAGE_TAG}" \
  -t "${ECR_URI}:latest" \
  --push \
  "$(dirname "$0")"

echo "== Ensuring IAM execution role ${ROLE_NAME} =="
if ! aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [{"Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]
    }' >/dev/null
  aws iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  echo "   created role, waiting for IAM propagation..."
  sleep 10
fi
ROLE_ARN="$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)"

FIREBASE_CREDENTIAL_JSON="$(cat "$FIREBASE_CREDENTIAL_JSON_PATH")"
ENV_VARS=$(jq -n \
  --arg pid "$FIREBASE_PROJECT_ID" \
  --arg cred "$FIREBASE_CREDENTIAL_JSON" \
  --arg tmdbkey "$TMDB_API_KEY" \
  --arg tmdbtoken "$TMDB_API_READ_ACCESS_TOKEN" \
  '{Variables: {"Firebase__ProjectId": $pid, "Firebase__CredentialJson": $cred, "Tmdb__ApiKey": $tmdbkey, "Tmdb__ApiReadAccessToken": $tmdbtoken}}')

echo "== Creating/updating Lambda function ${FUNCTION_NAME} =="
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --image-uri "${ECR_URI}:${IMAGE_TAG}" \
    --region "$AWS_REGION" >/dev/null
  aws lambda wait function-updated --function-name "$FUNCTION_NAME" --region "$AWS_REGION"
  aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --environment "$ENV_VARS" \
    --memory-size "$MEMORY_MB" \
    --timeout "$TIMEOUT_SECONDS" \
    --region "$AWS_REGION" >/dev/null
else
  aws lambda create-function \
    --function-name "$FUNCTION_NAME" \
    --package-type Image \
    --code ImageUri="${ECR_URI}:${IMAGE_TAG}" \
    --role "$ROLE_ARN" \
    --architectures "$ARCHITECTURE" \
    --memory-size "$MEMORY_MB" \
    --timeout "$TIMEOUT_SECONDS" \
    --environment "$ENV_VARS" \
    --region "$AWS_REGION" >/dev/null
  aws lambda wait function-active --function-name "$FUNCTION_NAME" --region "$AWS_REGION"
fi

echo "== Ensuring public Function URL =="
if ! aws lambda get-function-url-config --function-name "$FUNCTION_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
  aws lambda create-function-url-config \
    --function-name "$FUNCTION_NAME" \
    --auth-type NONE \
    --region "$AWS_REGION" >/dev/null
  aws lambda add-permission \
    --function-name "$FUNCTION_NAME" \
    --statement-id FunctionURLAllowPublicAccess \
    --action lambda:InvokeFunctionUrl \
    --principal "*" \
    --function-url-auth-type NONE \
    --region "$AWS_REGION" >/dev/null
fi

FUNCTION_URL="$(aws lambda get-function-url-config --function-name "$FUNCTION_NAME" --region "$AWS_REGION" --query FunctionUrl --output text)"
echo ""
echo "Deployed. Function URL: ${FUNCTION_URL}"
echo "Test with: curl \"${FUNCTION_URL}api/movies/trending\""
