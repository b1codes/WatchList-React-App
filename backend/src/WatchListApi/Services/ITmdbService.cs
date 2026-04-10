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
        Task<TmdbMovieDetails?> GetMovieDetailsAsync(int id);
        Task<TmdbWatchProvidersResponse?> GetWatchProvidersAsync(int id);
        Task<TmdbPagedResponse<TmdbSearchResult>?> GetSimilarMoviesAsync(int id, int page = 1);
        Task<TmdbPagedResponse<TmdbSearchResult>?> GetRecommendedMoviesAsync(int id, int page = 1);
        Task<T> GetCachedAsync<T>(string key, Func<Task<T>> fetchFunction);
    }
}
