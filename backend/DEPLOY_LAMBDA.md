# Deploying WatchList API to AWS Lambda

Status: **prepped, not live yet.** Cloud Run remains the active deployment; nothing has been created in AWS.

## What's done

- `Program.cs` — `FirestoreDb` now accepts a raw JSON credential via `Firebase:CredentialJson`
  (works as a Lambda env var, since Lambda's filesystem is read-only outside `/tmp`), falling
  back to the existing `Firebase:CredentialPath` file-based flow for local dev. No breaking change.
- `Dockerfile` — added the Lambda Web Adapter extension (`COPY ... /opt/extensions/lambda-adapter`).
  It runs as a Lambda extension alongside the existing Kestrel process — no entrypoint or app code
  changes. Verified locally that the built image still works unmodified as a plain container
  (build, Firestore auth, TMDB proxy, JWT auth all tested live against a running container).
- `deploy-lambda.sh` — idempotent deploy script (see below).
- Fixed a **pre-existing broken build on `main`**, unrelated to this work: `WatchListController.cs`
  and `WatchListRepository.cs` used `Google.Cloud.Firestore.Timestamp` members
  (`new Timestamp(seconds, nanos)`, `.Seconds`, `.Nanoseconds`) that don't exist on that type —
  likely introduced in the pagination/cursor commit. Fixed via the real API
  (`Timestamp.FromProto(...)` / `.ToProto().Seconds`/`.Nanos`). Worth knowing `main` wasn't
  compiling before this.

## What's NOT done

- No ECR repo, IAM role, or Lambda function exists yet in the AWS account.
- `frontend/.env`'s `EXPO_PUBLIC_API_BASE_URL` still points at Cloud Run / local — not switched over.
- No decision on retiring Cloud Run — can run both in parallel during a trial period.

## To go live

1. Have on hand: Firebase project ID, the Firebase Admin SDK service account JSON (currently
   `backend/src/WatchListApi/Watchlist-Web-Firebase-Admin-SDK.json`, gitignored — never commit it),
   and the TMDB API key + read access token.
2. From `backend/`:
   ```bash
   FIREBASE_PROJECT_ID=<your-project-id> \
   FIREBASE_CREDENTIAL_JSON_PATH=./src/WatchListApi/Watchlist-Web-Firebase-Admin-SDK.json \
   TMDB_API_KEY=<key> \
   TMDB_API_READ_ACCESS_TOKEN=<token> \
   ./deploy-lambda.sh
   ```
3. The script prints a Function URL at the end. Smoke test:
   `curl "<function-url>api/movies/trending"`.
4. Once verified, point `frontend/.env`'s `EXPO_PUBLIC_API_BASE_URL` at the Function URL.

Re-running `deploy-lambda.sh` later (e.g. after a code change) rebuilds and updates the existing
function in place rather than failing — safe to re-run.

## Decisions already made

Revisit only if something changed; otherwise treat these as settled so we don't re-litigate:

- **Lambda + Lambda Web Adapter**, chosen over App Runner / Lightsail / EC2, because near-zero
  traffic means Lambda's *permanent* free tier (1M requests + 400,000 GB-seconds/month) likely
  keeps this at $0/month indefinitely. Tradeoff accepted: cold starts (~1-3s) after idle periods.
- **arm64 (Graviton)** architecture — cheaper per-ms than x86_64, no code changes required.
- **Function URL `auth-type NONE`** (publicly reachable), matching the current Cloud Run
  "allow unauthenticated" setting. The app's own JWT check on `WatchListController` is what
  actually protects the watchlist endpoints, same as today.
- **Firebase credential as a Lambda env var** (`Firebase__CredentialJson`), not baked into the
  image and not via Secrets Manager/SSM — kept simple for a low-stakes hobby project. Combined
  env var size should comfortably stay under Lambda's 4KB total limit; re-check if more config
  gets added later.
- **512MB memory / 29s timeout** (Function URLs hard-cap the integration at 30s).

## Cost estimate

~$0-1/month at current (near-zero) traffic.
