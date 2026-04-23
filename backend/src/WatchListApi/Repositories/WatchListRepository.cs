using Google.Cloud.Firestore;
using WatchListApi.Models;

namespace WatchListApi.Repositories;

public class WatchListRepository
{
    private readonly FirestoreDb _firestoreDb;
    private const string CollectionName = "watchlist";

    public WatchListRepository(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    public async Task<PagedResponse<WatchListItem>> GetWatchlistByUserIdAsync(string userId, int pageSize = 20, Timestamp? lastAddedDate = null)
    {
        CollectionReference collection = _firestoreDb.Collection(CollectionName);
        Query query = collection.WhereEqualTo("UserId", userId)
                              .OrderByDescending("AddedDate")
                              .Limit(pageSize + 1); // Get one extra to check for next page

        if (lastAddedDate != null)
        {
            query = query.StartAfter(lastAddedDate);
        }

        QuerySnapshot snapshot = await query.GetSnapshotAsync();
        var items = snapshot.Documents.Select(d => d.ConvertTo<WatchListItem>()).ToList();

        bool hasNext = items.Count > pageSize;
        if (hasNext) items.RemoveAt(pageSize);

        string? nextCursor = hasNext ? $"{items.Last().AddedDate?.Seconds}.{items.Last().AddedDate?.Nanoseconds}" : null;

        return new PagedResponse<WatchListItem>
        {
            Items = items,
            NextCursor = nextCursor
        };
    }

    public async Task AddToWatchlistAsync(string userId, CreateWatchListItemRequest newItem)
    {
        CollectionReference collection = _firestoreDb.Collection(CollectionName);

        var item = new WatchListItem
        {
            UserId = userId,
            TmdbId = newItem.TmdbId,
            Title = newItem.Title,
            Type = newItem.Type,
            PosterPath = newItem.PosterPath,
            ReleaseYear = newItem.ReleaseYear,
            AddedDate = Timestamp.GetCurrentTimestamp()
        };

        await collection.AddAsync(item);
    }

    public async Task RemoveFromWatchlistAsync(string userId, int tmdbId)
    {
        CollectionReference collection = _firestoreDb.Collection(CollectionName);
        Query query = collection.WhereEqualTo("UserId", userId).WhereEqualTo("TmdbId", tmdbId);
        QuerySnapshot snapshot = await query.GetSnapshotAsync();

        foreach (DocumentSnapshot document in snapshot.Documents)
        {
            await document.Reference.DeleteAsync();
        }
    }
}
