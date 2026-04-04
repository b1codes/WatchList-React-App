# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WatchList is a movie/TV tracking app with two separate workspaces:
- `frontend/` — React Native (Expo) mobile/web app
- `backend/` — ASP.NET Core Web API (.NET 10)

## Commands

### Frontend (run from `frontend/`)
```bash
npm install          # install dependencies
npm run start        # start Expo dev server (press i/a/w for iOS/Android/Web)
npm run ios          # open in iOS simulator
npm run android      # open in Android emulator
npm run web          # open in browser at http://localhost:8081
npm run lint         # lint with ESLint
```

### Backend (run from `backend/src/WatchListApi/`)
```bash
dotnet run           # start API at http://localhost:5223
dotnet build         # build only
dotnet watch         # run with hot reload
```

Swagger UI is available at `http://localhost:5223/swagger` in development.

## Configuration

### Backend
Copy `backend/src/WatchListApi/sample.appsettings.json` to `appsettings.json` and fill in:
- `Firebase:ProjectId` — Firebase project ID
- `Firebase:CredentialPath` — path to Firebase Admin SDK service account JSON
- `Tmdb:ApiKey` — TMDB API key
- `Tmdb:ApiReadAccessToken` — TMDB read access token

### Frontend
Create `frontend/.env` with:
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:5223
EXPO_PUBLIC_USER_ID=your-test-user-id   # optional, defaults to "test-user-1"
```

## Architecture

### Frontend
File-based routing via Expo Router. The root layout (`app/_layout.tsx`) wraps the app with `QueryClientProvider` (TanStack Query) and React Navigation theming.

Tabs (`app/(tabs)/`): Home, Search (`explore.tsx`), Watchlist, Settings. The movie detail page lives at `app/movie/[id].tsx` as a stack screen.

**API layer** (`frontend/api/`):
- `client.ts` — base `requestApi<T>()` wrapper that reads `EXPO_PUBLIC_API_BASE_URL` and unwraps the `ApiResponse<T>` envelope
- `tmdb.ts` — calls unauthenticated `/api/movies/*` endpoints
- `watchlist.ts` — calls authenticated `/api/watchlist` endpoints, attaching `X-User-Id` header

**Shared types** are in `frontend/constants/types.ts`. Theme constants (colors, fonts) are in `frontend/constants/theme.ts`.

### Backend
Standard ASP.NET Core layered architecture:

- **Controllers** — `MoviesController` (unauthenticated, proxies TMDB) and `WatchListController` (requires auth, scoped to the authenticated user)
- **Services** — `TmdbService` wraps TMDB HTTP calls with `IMemoryCache` (30-min TTL by default). Configured via `TmdbSettings` bound from `appsettings.json`
- **Repositories** — `WatchListRepository` reads/writes the Firestore `watchlist` collection, filtered by `UserId`

**Auth**: Firebase JWT Bearer tokens validated against `https://securetoken.google.com/{projectId}`. In development, the `WatchListController` falls back to an `X-User-Id` request header if the JWT is absent.

**API response envelope**: All endpoints return `ApiResponse<T>` with `{ success, data, error }`. The frontend `requestApi` unwraps this automatically.

**CORS**: Backend allows requests from `http://localhost:8081` (Expo web dev server).
