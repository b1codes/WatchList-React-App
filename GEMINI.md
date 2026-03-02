# WatchList React App - GEMINI Context

This project is a full-stack movie discovery and watchlist management application. It consists of a modern React Native (Expo) frontend and an ASP.NET Core Web API backend.

## Project Overview

- **Frontend**: A cross-platform mobile app built with **Expo (SDK 54)** and **TypeScript**. It uses **Expo Router** for file-based navigation and **TanStack Query (React Query)** for efficient data fetching and caching.
- **Backend**: A robust **.NET 10.0 Web API** that integrates with **The Movie Database (TMDB)** for movie data and **Google Cloud Firestore** for user-specific watchlist storage.
- **Authentication**: Client-side authentication is handled by **Firebase Auth**, with the backend performing JWT validation via the Firebase Admin SDK.

## Project Structure

### Backend (`/backend`)
- **Controllers**: Located in `src/WatchListApi/Controllers/`, handling `Movies` (TMDB proxy) and `WatchList` (Firestore operations).
- **Models**: DTOs and domain models in `src/WatchListApi/Models/`.
- **Services**: Business logic, including `TmdbService` for TMDB API integration.
- **Repositories**: `WatchListRepository` handles all interactions with Google Cloud Firestore.
- **Configuration**: Uses `appsettings.json` and environment variables for Firebase Project ID and TMDB API keys.

### Frontend (`/frontend`)
- **App/Routing**: Uses `expo-router` in the `app/` directory (Tabs and Movie details).
- **API Client**: Centralized fetch wrapper in `api/client.ts`. API modules for `tmdb` and `watchlist` are in the `api/` folder.
- **Components**: Reusable UI components in `components/`, including `MediaCard` and themed UI elements.
- **State Management**: React Query hooks for fetching movie data and managing watchlist state.
- **Constants**: Shared types and theme definitions in `constants/`.

## Building and Running

### Backend
1. **Navigate**: `cd backend/src/WatchListApi`
2. **Setup**: Create `appsettings.Development.json` with your `Firebase:ProjectId`, `Firebase:CredentialPath`, and `Tmdb:ApiKey`.
3. **Restore & Run**:
   ```bash
   dotnet restore
   dotnet run
   ```
4. **Swagger**: Documentation is available at `/swagger` when running in development.

### Frontend
1. **Navigate**: `cd frontend`
2. **Install**: `npm install`
3. **Environment**: Configure `EXPO_PUBLIC_API_BASE_URL` in an `.env` file or use the default `http://localhost:5223`.
4. **Run**:
   ```bash
   npx expo start
   ```
   Press `a` for Android, `i` for iOS, or `w` for Web.

## Development Conventions

- **Frontend**: 
  - Prefer functional components and hooks.
  - Use **Expo Themed Components** for consistent dark/light mode support.
  - All API calls should go through `api/client.ts` to ensure consistent error handling and base URL management.
  - Use `constants/types.ts` for shared TypeScript interfaces.
- **Backend**:
  - Follow standard ASP.NET Core patterns (Controllers -> Services -> Repositories).
  - Use `ApiResponse<T>` for all API responses to maintain a consistent frontend-backend contract.
  - Firestore operations are encapsulated in `WatchListRepository`.
  - External API interactions (TMDB) are handled by `ITmdbService`.
- **API Contract**:
  - Responses follow the structure: `{ success: boolean, data: T, error?: string }`.
  - Watchlist operations often require an `X-User-Id` header (currently defaults to `test-user-1` for development).

## Key Files
- `backend/src/WatchListApi/Program.cs`: Backend entry point and dependency injection.
- `frontend/api/client.ts`: Frontend base API configuration.
- `frontend/app/(tabs)/index.tsx`: Main discovery screen.
- `backend/src/WatchListApi/Repositories/WatchListRepository.cs`: Firestore data access layer.
