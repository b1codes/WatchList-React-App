namespace WatchListApi.Models;

public record PagedResponse<T>
{
    public List<T> Items { get; init; } = new();
    public string? NextCursor { get; init; }
    public int TotalCount { get; init; }
}
