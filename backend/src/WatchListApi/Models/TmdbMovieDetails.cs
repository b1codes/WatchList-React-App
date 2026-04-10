using System.Text.Json.Serialization;

namespace WatchListApi.Models;

public class TmdbMovieDetails
{
    [JsonPropertyName("id")]
    public int Id { get; init; }

    [JsonPropertyName("title")]
    public string? Title { get; init; }

    [JsonPropertyName("overview")]
    public string? Overview { get; init; }

    [JsonPropertyName("tagline")]
    public string? Tagline { get; init; }

    [JsonPropertyName("poster_path")]
    public string? PosterPath { get; init; }

    [JsonPropertyName("release_date")]
    public string? ReleaseDate { get; init; }

    [JsonPropertyName("runtime")]
    public int? Runtime { get; init; }

    [JsonPropertyName("name")]
    public string? Name { get; init; }

    [JsonPropertyName("first_air_date")]
    public string? FirstAirDate { get; init; }

    [JsonPropertyName("number_of_seasons")]
    public int? NumberOfSeasons { get; init; }

    [JsonPropertyName("number_of_episodes")]
    public int? NumberOfEpisodes { get; init; }

    [JsonPropertyName("episode_run_time")]
    public List<int>? EpisodeRunTime { get; init; }

    [JsonPropertyName("genres")]
    public List<TmdbGenre> Genres { get; init; } = new();

    [JsonPropertyName("credits")]
    public TmdbCredits? Credits { get; init; }

    [JsonPropertyName("videos")]
    public TmdbVideoGroup? Videos { get; init; }
}

public class TmdbGenre
{
    [JsonPropertyName("id")]
    public int Id { get; init; }

    [JsonPropertyName("name")]
    public string? Name { get; init; }
}

public class TmdbCredits
{
    [JsonPropertyName("cast")]
    public List<TmdbCastMember> Cast { get; init; } = new();

    [JsonPropertyName("crew")]
    public List<TmdbCrewMember> Crew { get; init; } = new();
}

public class TmdbCastMember
{
    [JsonPropertyName("id")]
    public int Id { get; init; }

    [JsonPropertyName("name")]
    public string? Name { get; init; }

    [JsonPropertyName("character")]
    public string? Character { get; init; }

    [JsonPropertyName("profile_path")]
    public string? ProfilePath { get; init; }

    [JsonPropertyName("order")]
    public int Order { get; init; }
}

public class TmdbCrewMember
{
    [JsonPropertyName("id")]
    public int Id { get; init; }

    [JsonPropertyName("name")]
    public string? Name { get; init; }

    [JsonPropertyName("job")]
    public string? Job { get; init; }

    [JsonPropertyName("department")]
    public string? Department { get; init; }
}

public class TmdbVideoGroup
{
    [JsonPropertyName("results")]
    public List<TmdbVideo> Results { get; init; } = new();
}

public class TmdbVideo
{
    [JsonPropertyName("id")]
    public string? Id { get; init; }

    [JsonPropertyName("name")]
    public string? Name { get; init; }

    [JsonPropertyName("site")]
    public string? Site { get; init; }

    [JsonPropertyName("key")]
    public string? Key { get; init; }

    [JsonPropertyName("type")]
    public string? Type { get; init; }
}
