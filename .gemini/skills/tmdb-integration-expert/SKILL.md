---
name: tmdb-integration-expert
description: Specialized in The Movie Database (TMDB) API integration for the WatchList app. Use for adding new TMDB endpoints, modifying data mappings, and ensuring consistent movie data across the C# backend (TmdbService.cs) and the Expo frontend.
---

# TMDB Integration Expert

This skill handles all things related to fetching and mapping movie/TV data from the TMDB API.

## Core Services

### Backend: TmdbService.cs
- **ITmdbService**: Defines the methods for fetching movie details, search results, and trending media.
- **TmdbService.cs**: The concrete implementation that uses `HttpClient` to communicate with the TMDB API.
- **Caching**: Uses a simple internal cache to reduce redundant API calls.

### Backend: Models
Key models in `backend/src/WatchListApi/Models/` related to TMDB:
- `TmdbSearchResult`: General media object from search/trending.
- `TmdbMovieDetails`: Deep object for single movie details.
- `TmdbPagedResponse<T>`: Wrapper for any list of items (trending, search).

## Workflow: Adding a New TMDB Endpoint

1.  **Determine Endpoint**: Consult the official TMDB API documentation (api.themoviedb.org/3/...) to find the path and parameters.
2.  **Define Backend DTO**: Create a new class in `Models/` that matches the JSON response structure.
3.  **Update ITmdbService**: Add a new `Task<T?>` method for the endpoint.
4.  **Implement in TmdbService**: Add the `HttpClient` call and mapping logic.
5.  **Expose via MoviesController**: Create a corresponding controller action in `MoviesController.cs` that returns the `ApiResponse<T>`.
6.  **Sync Frontend**: Update `frontend/api/tmdb.ts` to add a matching function.

## Tips for TMDB Data
- **Image URLs**: Use the `TmdbConfiguration` to construct full image URLs (e.g., `https://image.tmdb.org/t/p/w500/[file_path]`).
- **Media Types**: Pay attention to `media_type` ('movie' vs 'tv') in search results.
- **Date Parsing**: TMDB uses `YYYY-MM-DD` strings; map these to `DateTime?` in C# and `string` in TypeScript.
