---
name: api-contract-validator
description: Validates and ensures synchronization of API data structures (DTOs) between the .NET backend and React Native frontend. Use when adding or modifying backend models (ApiResponse<T>, WatchListItem, etc.) to ensure the corresponding TypeScript interfaces in frontend/constants/types.ts and API client methods in frontend/api/ are updated accordingly.
---

# API Contract Validator

This skill ensures that the communication between the .NET backend and the React Native frontend remains consistent. It focuses on the `ApiResponse<T>` wrapper and the domain models shared across both projects.

## Core Patterns

### Backend: ApiResponse<T>
All backend responses are wrapped in `WatchListApi.Models.ApiResponse<T>`:
```csharp
public class ApiResponse<T> {
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Error { get; init; }
}
```

### Frontend: types.ts
The frontend equivalent is in `frontend/constants/types.ts`:
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

## Workflow: Syncing a Model Change

1.  **Modify Backend Model**: When updating a file in `backend/src/WatchListApi/Models/`, identify all changed properties.
2.  **Update Frontend Types**: Open `frontend/constants/types.ts` and apply the same property changes (mapping C# types to TypeScript).
    *   `string` -> `string`
    *   `int`/`double`/`float` -> `number`
    *   `DateTime` -> `string` (ISO 8601)
    *   `List<T>` -> `T[]`
    *   `bool` -> `boolean`
3.  **Update API Calls**: Check the relevant service in `frontend/api/` (e.g., `watchlist.ts` or `tmdb.ts`) to ensure the `requestApi<T>` call uses the updated type.
4.  **Verification**: Confirm that the frontend components using this data are not broken by the change.

## Verification Checklist
- [ ] Backend model matches database/TMDB schema.
- [ ] Frontend interface matches backend model exactly (casing depends on JSON serializer settings, usually camelCase for JSON).
- [ ] `requestApi<T>` is using the correct interface.
- [ ] No `any` types used in place of proper model interfaces.
