using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using WatchListApi.Models;

namespace WatchListApi.Services
{
    public class TmdbService : ITmdbService
    {
        private readonly HttpClient _httpClient;
        private readonly TmdbSettings _tmdbSettings;
        private readonly IMemoryCache _cache;
        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        public TmdbService(HttpClient httpClient, IOptions<TmdbSettings> tmdbSettings, IMemoryCache cache)
        {
            _httpClient = httpClient;
            _tmdbSettings = tmdbSettings.Value;
            _cache = cache;
        }

        public Task<TmdbConfiguration?> GetConfigurationAsync()
        {
            return GetCachedAsync(
                $"tmdb:config",
                () => GetAsync<TmdbConfiguration>($"{_tmdbSettings.BaseUrl}/configuration?api_key={_tmdbSettings.ApiKey}"));
        }

        public Task<TmdbPagedResponse<TmdbSearchResult>?> SearchMultiAsync(string query, int page = 1)
        {
            var url = $"{_tmdbSettings.BaseUrl}/search/multi?api_key={_tmdbSettings.ApiKey}&query={Uri.EscapeDataString(query)}&page={page}";
            return GetAsync<TmdbPagedResponse<TmdbSearchResult>>(url);
        }

        public Task<TmdbPagedResponse<TmdbSearchResult>?> GetTrendingAsync()
        {
            return GetCachedAsync(
                "tmdb:trending",
                () => GetAsync<TmdbPagedResponse<TmdbSearchResult>>($"{_tmdbSettings.BaseUrl}/trending/all/day?api_key={_tmdbSettings.ApiKey}"));
        }

        public Task<TmdbPagedResponse<TmdbSearchResult>?> DiscoverAsync(int page = 1)
        {
            var url = $"{_tmdbSettings.BaseUrl}/discover/movie?api_key={_tmdbSettings.ApiKey}&page={page}&sort_by=popularity.desc";
            return GetCachedAsync(
                $"tmdb:discover:{page}",
                () => GetAsync<TmdbPagedResponse<TmdbSearchResult>>(url));
        }

        public Task<TmdbMovieDetails?> GetMovieDetailsAsync(int id)
        {
            var url = $"{_tmdbSettings.BaseUrl}/movie/{id}?api_key={_tmdbSettings.ApiKey}&append_to_response=credits,videos";
            return GetAsync<TmdbMovieDetails>(url);
        }

        public Task<TmdbWatchProvidersResponse?> GetWatchProvidersAsync(int id)
        {
            var url = $"{_tmdbSettings.BaseUrl}/movie/{id}/watch/providers?api_key={_tmdbSettings.ApiKey}";
            return GetAsync<TmdbWatchProvidersResponse>(url);
        }

        public Task<TmdbPagedResponse<TmdbSearchResult>?> GetSimilarMoviesAsync(int id, int page = 1)
        {
            var url = $"{_tmdbSettings.BaseUrl}/movie/{id}/similar?api_key={_tmdbSettings.ApiKey}&page={page}";
            return GetCachedAsync(
                $"tmdb:similar:{id}:{page}",
                () => GetAsync<TmdbPagedResponse<TmdbSearchResult>>(url));
        }

        public Task<TmdbPagedResponse<TmdbSearchResult>?> GetRecommendedMoviesAsync(int id, int page = 1)
        {
            var url = $"{_tmdbSettings.BaseUrl}/movie/{id}/recommendations?api_key={_tmdbSettings.ApiKey}&page={page}";
            return GetCachedAsync(
                $"tmdb:recommendations:{id}:{page}",
                () => GetAsync<TmdbPagedResponse<TmdbSearchResult>>(url));
        }

        public Task<T> GetCachedAsync<T>(string key, Func<Task<T>> fetchFunction)
        {
            return _cache.GetOrCreateAsync(key, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_tmdbSettings.CacheMinutes);
                return await fetchFunction();
            })!;
        }

        private async Task<T?> GetAsync<T>(string url)
        {
            using var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            await using var stream = await response.Content.ReadAsStreamAsync();
            return await JsonSerializer.DeserializeAsync<T>(stream, _jsonOptions);
        }
    }
}
