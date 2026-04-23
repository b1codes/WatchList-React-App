using System.Threading.Tasks;
using WatchListApi.Models;

namespace WatchListApi.Services
{
    public interface ITmdbService
    {
        Task<TmdbConfiguration?> GetConfigurationAsync();
        Task<PagedResponse<MediaDto>?> SearchMultiAsync(string query, int page = 1);
        Task<PagedResponse<MediaDto>?> GetTrendingAsync();
        Task<PagedResponse<MediaDto>?> DiscoverAsync(int page = 1);
        Task<MediaDetailsDto?> GetMediaDetailsAsync(int id, string type = "movie");
        Task<TmdbWatchProvidersResponse?> GetWatchProvidersAsync(int id, string type = "movie");
        Task<PagedResponse<MediaDto>?> GetSimilarMoviesAsync(int id, int page = 1, string type = "movie");
        Task<PagedResponse<MediaDto>?> GetRecommendedMoviesAsync(int id, int page = 1, string type = "movie");
        Task<T> GetCachedAsync<T>(string key, Func<Task<T>> fetchFunction);
    }
}
