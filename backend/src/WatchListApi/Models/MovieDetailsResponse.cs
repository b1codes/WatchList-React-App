namespace WatchListApi.Models;

public class MovieDetailsResponse
{
    public MediaDetailsDto? Details { get; init; }
    public TmdbWatchProvidersResponse? Providers { get; init; }
}
