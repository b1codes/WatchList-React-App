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
