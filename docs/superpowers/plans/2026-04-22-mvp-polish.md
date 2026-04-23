# MVP Polish: Pagination, Type Safety, and Error Boundaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement cursor-based pagination for the watchlist, standardize TMDB DTOs into a unified "Media" model, and add React Error Boundaries to the frontend.

**Architecture:** A backend-driven simplification approach where the .NET API maps heterogeneous TMDB data into consistent DTOs and provides cursor-based pagination for the Firestore-backed watchlist. The frontend uses `react-error-boundary` for graceful failure handling.

**Tech Stack:** ASP.NET Core 10.0, Google Cloud Firestore, React Native (Expo SDK 54), TypeScript, TanStack Query.

---

### Task 1: Backend Standardized DTOs (Models)

**Files:**
- Create: `backend/src/WatchListApi/Models/MediaDto.cs`
- Create: `backend/src/WatchListApi/Models/MediaDetailsDto.cs`
- Create: `backend/src/WatchListApi/Models/PagedResponse.cs`

- [ ] **Step 1: Create `MediaDto` for list items**

```csharp
namespace WatchListApi.Models;

public record MediaDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string MediaType { get; init; } = string.Empty; // "movie" or "tv"
    public string? ReleaseDate { get; init; }
    public string? PosterPath { get; init; }
}
```

- [ ] **Step 2: Create `MediaDetailsDto` for full details**

```csharp
namespace WatchListApi.Models;

public record MediaDetailsDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Overview { get; init; }
    public string? Tagline { get; init; }
    public string? PosterPath { get; init; }
    public string? ReleaseDate { get; init; }
    public int? Runtime { get; init; }
    public List<string> Genres { get; init; } = new();
    public List<CastMemberDto> Cast { get; init; } = new();
}

public record CastMemberDto(int Id, string Name, string? Character, string? ProfilePath);
```

- [ ] **Step 3: Create `PagedResponse` for paginated results**

```csharp
namespace WatchListApi.Models;

public record PagedResponse<T>
{
    public List<T> Items { get; init; } = new();
    public string? NextCursor { get; init; }
    public int TotalCount { get; init; }
}
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/WatchListApi/Models/MediaDto.cs backend/src/WatchListApi/Models/MediaDetailsDto.cs backend/src/WatchListApi/Models/PagedResponse.cs
git commit -m "backend: add standardized media and paged response DTOs"
```

### Task 2: Backend Service Refinement (Mapping)

**Files:**
- Modify: `backend/src/WatchListApi/Services/ITmdbService.cs`
- Modify: `backend/src/WatchListApi/Services/TmdbService.cs`

- [ ] **Step 1: Update `ITmdbService` interface**

Change signatures to use `MediaDto` and `MediaDetailsDto`.

```csharp
public interface ITmdbService
{
    Task<TmdbConfiguration?> GetConfigurationAsync();
    Task<PagedResponse<MediaDto>?> SearchMultiAsync(string query, int page);
    Task<PagedResponse<MediaDto>?> GetTrendingAsync();
    Task<PagedResponse<MediaDto>?> DiscoverAsync(int page);
    Task<MediaDetailsDto?> GetMediaDetailsAsync(int id, string type);
    // ... keep others but update return types where applicable
}
```

- [ ] **Step 2: Implement mapping logic in `TmdbService.cs`**

Add private mapping methods:

```csharp
private MediaDto MapToMediaDto(TmdbSearchResult result) => new()
{
    Id = result.Id,
    Title = result.Title ?? result.Name ?? "Unknown",
    MediaType = result.MediaType ?? "movie",
    ReleaseDate = result.ReleaseDate ?? result.FirstAirDate,
    PosterPath = result.PosterPath
};

private MediaDetailsDto MapToMediaDetailsDto(TmdbMovieDetails details) => new()
{
    Id = details.Id,
    Title = details.Title ?? details.Name ?? "Unknown",
    Overview = details.Overview,
    Tagline = details.Tagline,
    PosterPath = details.PosterPath,
    ReleaseDate = details.ReleaseDate ?? details.FirstAirDate,
    Runtime = details.Runtime ?? (details.EpisodeRunTime?.FirstOrDefault()),
    Genres = details.Genres.Select(g => g.Name ?? "").Where(n => !string.IsNullOrEmpty(n)).ToList(),
    Cast = details.Credits?.Cast.Take(10).Select(c => new CastMemberDto(c.Id, c.Name ?? "", c.Character, c.ProfilePath)).ToList() ?? new()
};
```

- [ ] **Step 3: Update `TmdbService` methods to use mapping**

- [ ] **Step 4: Commit**

```bash
git add backend/src/WatchListApi/Services/ITmdbService.cs backend/src/WatchListApi/Services/TmdbService.cs
git commit -m "backend: implement standardized media mapping in TmdbService"
```

### Task 3: Backend Watchlist Pagination (Repository)

**Files:**
- Modify: `backend/src/WatchListApi/Repositories/WatchListRepository.cs`

- [ ] **Step 1: Update `GetWatchlistByUserIdAsync` for pagination**

```csharp
public async Task<PagedResponse<WatchListItem>> GetWatchlistByUserIdAsync(string userId, int pageSize = 20, Timestamp? lastAddedDate = null)
{
    CollectionReference collection = _firestoreDb.Collection(CollectionName);
    Query query = collection.WhereEqualTo("UserId", userId)
                          .OrderBy("AddedDate", Direction.Descending)
                          .Limit(pageSize + 1); // Get one extra to check for next page

    if (lastAddedDate != null)
    {
        query = query.StartAfter(lastAddedDate);
    }

    QuerySnapshot snapshot = await query.GetSnapshotAsync();
    var items = snapshot.Documents.Select(d => d.ConvertTo<WatchListItem>()).ToList();

    bool hasNext = items.Count > pageSize;
    if (hasNext) items.RemoveAt(pageSize);

    string? nextCursor = hasNext ? items.Last().AddedDate?.ToDateTime().Ticks.ToString() : null;

    return new PagedResponse<WatchListItem>
    {
        Items = items,
        NextCursor = nextCursor
    };
}
```

- [ ] **Step 2: Update `WatchListController.cs` to handle pagination params**

- [ ] **Step 3: Commit**

```bash
git add backend/src/WatchListApi/Repositories/WatchListRepository.cs backend/src/WatchListApi/Controllers/WatchListController.cs
git commit -m "backend: implement cursor-based pagination in WatchListRepository"
```

### Task 4: Frontend Type Sync & API Refactoring

**Files:**
- Modify: `frontend/constants/types.ts`
- Modify: `frontend/api/tmdb.ts`
- Modify: `frontend/api/watchlist.ts`

- [ ] **Step 1: Update `types.ts` with standardized DTOs**

```typescript
export type MediaDto = {
  id: number;
  title: string;
  mediaType: string;
  releaseDate?: string | null;
  posterPath?: string | null;
};

export type PagedResponse<T> = {
  items: T[];
  nextCursor?: string | null;
  totalCount?: number;
};
```

- [ ] **Step 2: Update API functions in `tmdb.ts` and `watchlist.ts`**

- [ ] **Step 3: Commit**

```bash
git add frontend/constants/types.ts frontend/api/tmdb.ts frontend/api/watchlist.ts
git commit -m "frontend: sync types and api with standardized backend DTOs"
```

### Task 5: Frontend Error Boundaries

**Files:**
- Create: `frontend/components/ErrorBoundary.tsx`
- Modify: `frontend/app/_layout.tsx`

- [ ] **Step 1: Install `react-error-boundary`**

Run: `cd frontend && npm install react-error-boundary`

- [ ] **Step 2: Create `ErrorBoundary.tsx` component**

- [ ] **Step 3: Wrap root layout in `_layout.tsx`**

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/components/ErrorBoundary.tsx frontend/app/_layout.tsx
git commit -m "frontend: integrate react-error-boundary for robust error handling"
```

### Task 6: UI Refactor & Pagination Implementation

**Files:**
- Modify: `frontend/app/(tabs)/watchlist.tsx`
- Modify: `frontend/components/MediaCard.tsx`

- [ ] **Step 1: Update `MediaCard` to use `MediaDto`**
- [ ] **Step 2: Implement infinite scroll/pagination in `watchlist.tsx` using `useInfiniteQuery`**
- [ ] **Step 3: Commit**

```bash
git add frontend/app/(tabs)/watchlist.tsx frontend/components/MediaCard.tsx
git commit -m "frontend: implement infinite scroll for watchlist and refactor UI components"
```
