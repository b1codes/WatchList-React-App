using System.Threading.Tasks;
using WatchListApi.Models;

namespace WatchListApi.Services
{
    public interface ITmdbService
    {
        Task<TmdbConfiguration?> GetConfigurationAsync();
        Task<TmdbPagedResponse<TmdbSearchResult>?> SearchMultiAsync(string query, int page = 1);
        Task<TmdbPagedResponse<TmdbSearchResult>?> GetTrendingAsync();
        Task<TmdbPagedResponse<TmdbSearchResult>?> DiscoverAsync(int page = 1);
        Task<TmdbMovieDetails?> GetMovieDetailsAsync(int id, string type = "movie");
        Task<TmdbWatchProvidersResponse?> GetWatchProvidersAsync(int id, string type = "movie");
        Task<TmdbPagedResponse<TmdbSearchResult>?> GetSimilarMoviesAsync(int id, int page = 1, string type = "movie");
        Task<TmdbPagedResponse<TmdbSearchResult>?> GetRecommendedMoviesAsync(int id, int page = 1, string type = "movie");
        Task<T> GetCachedAsync<T>(string key, Func<Task<T>> fetchFunction);
    }
}
