namespace WatchListApi.Models;

public record MediaDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string MediaType { get; init; } = string.Empty; // "movie" or "tv"
    public string? ReleaseDate { get; init; }
    public string? PosterPath { get; init; }
}
