# MVP Polish: Pagination, Type Safety, and Error Boundaries Design

**Date:** 2026-04-22
**Status:** Approved by User

## 1. Objective
Enhance the WatchList application's scalability and reliability through cursor-based pagination, refined DTOs for consistent data structures, and React Error Boundaries for robust error handling.

## 2. Architecture: Backend-Driven Simplification

### 2.1 Watchlist Pagination
Implement cursor-based pagination in the `.NET` backend using Google Cloud Firestore's native capabilities.

- **Repository Change (`WatchListRepository.cs`):**
    - `GetWatchlistByUserIdAsync` will support `pageSize` (default 20) and `lastAddedDate` (optional `Timestamp`).
    - Query: `collection.WhereEqualTo("UserId", userId).OrderBy("AddedDate", Direction.Descending).Limit(pageSize)`.
    - If `lastAddedDate` exists: `.StartAfter(lastAddedDate)`.
- **Controller Change (`WatchListController.cs`):**
    - Update `Get` endpoint to accept query parameters: `int pageSize = 20`, `long? lastAddedDateSeconds = null`, `int? lastAddedDateNanos = null`.
- **DTO Change (`PagedResponse.cs`):**
    - Return `List<T> Items` and `string? NextCursor` (Base64 encoded timestamp or similar).

### 2.2 DTO Refinement (Standardized Media Types)
Standardize heterogeneous TMDB responses into unified "Media" DTOs to simplify frontend consumption and improve type safety.

- **`MediaDto` (Standardized List Item):**
    - `Id` (int)
    - `Title` (string - mapped from `title` or `name`)
    - `MediaType` (enum/string: `movie`, `tv`)
    - `ReleaseDate` (string - mapped from `release_date` or `first_air_date`)
    - `PosterPath` (string?)
- **`MediaDetailsDto` (Standardized Details):**
    - Unified fields for runtime, genres, and credits.
    - Removes the need for the frontend to handle `TmdbMovieDetails` vs `TmdbSearchResult` ambiguity.
- **Frontend Sync:**
    - Update `frontend/constants/types.ts` to reflect the new `MediaDto` and `MediaDetailsDto`.

### 2.3 Error Boundaries
Implement hierarchical error handling in the React Native frontend using `react-error-boundary`.

- **Component:** Create `components/ErrorBoundary.tsx` with a themed fallback UI (Retry button, clear error message).
- **Placement:**
    - **Global:** Wrap `app/_layout.tsx` for catastrophic failures.
    - **Feature-Level:** Wrap `app/(tabs)/index.tsx` (Explore) and `app/(tabs)/watchlist.tsx` to isolate failures between major screens.
- **Async Errors:** Use `useQuery` error states in conjunction with boundaries for a seamless user experience.

## 3. Implementation Plan Tasks

### Task 1: Backend Pagination & DTOs
- [ ] Create `MediaDto` and `MediaDetailsDto` in `Models/`.
- [ ] Update `ITmdbService` and `TmdbService` to map raw results to standardized DTOs.
- [ ] Update `WatchListRepository` to support cursor pagination.
- [ ] Update `WatchListController` and `MoviesController` endpoints.

### Task 2: Frontend API & Types
- [ ] Update `frontend/constants/types.ts` with new standardized models.
- [ ] Update `frontend/api/watchlist.ts` and `frontend/api/tmdb.ts` to handle paginated responses.
- [ ] Refactor `MediaCard.tsx` and screens to use `MediaDto`.

### Task 3: Error Boundaries & Polish
- [ ] Install `react-error-boundary`.
- [ ] Implement `components/ErrorBoundary.tsx`.
- [ ] Wrap layouts and screens with error boundaries.
- [ ] Final validation of pagination and error states.

## 4. Success Criteria
- Watchlist loads incrementally via infinite scroll/pagination.
- Frontend components no longer need complex conditional logic for movie vs. TV titles/dates.
- A crash in one tab (e.g., Explore) does not prevent the user from using other tabs (e.g., Watchlist).
