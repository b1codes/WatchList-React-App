---
name: firestore-repository-manager
description: Specialist in Google Cloud Firestore data access and management for the WatchList app. Use for modifying the WatchListRepository.cs, updating Firestore models, or handling database queries and indexing in the .NET backend.
---

# Firestore Repository Manager

This skill manages the interaction between the .NET backend and Google Cloud Firestore.

## Data Layer (backend/src/WatchListApi/Repositories/)
- **WatchListRepository.cs**: The primary repository for watchlist data.
- **Collection Name**: The default collection is `"watchlist"`.
- **Indexing**: Firestore requires indexes for certain multiple-field queries; check if a new query needs an index in the Firebase Console.

## Workflow: Modifying the Watchlist Data Model

1.  **Update Model**: Modify `WatchListApi.Models.WatchListItem` with the new properties.
2.  **Add Converter Logic**: If necessary, ensure that Firestore can correctly serialize/deserialize the new property (e.g., using `FirestoreProperty` or `Timestamp` mapping).
3.  **Update Repository Methods**: Modify `AddToWatchlistAsync` or `GetWatchlistByUserIdAsync` to handle the new data.
4.  **Test Queries**: Verify that existing queries (like filtering by `UserId` and `TmdbId`) still work efficiently.

## Best Practices for Firestore
- **Document IDs**: Currently, we use auto-generated document IDs; if a deterministic ID is needed, ensure it's set in the `AddAsync` call.
- **Batched Writes**: For bulk operations (e.g., clearing a watchlist), use Firestore's `WriteBatch` to minimize network overhead and ensure atomicity.
- **Sub-collections**: If the watchlist needs to be more hierarchical (e.g., separate collections for "Seen" and "Want to Watch"), consider using sub-collections under the user document.
- **Offline Support**: The frontend React Native app uses Firestore through the backend; however, if client-side Firestore is introduced, ensure that the data model remains consistent with the backend's repository.
