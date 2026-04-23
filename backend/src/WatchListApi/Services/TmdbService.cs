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

        public async Task<PagedResponse<MediaDto>?> SearchMultiAsync(string query, int page = 1)
        {
            var url = $"{_tmdbSettings.BaseUrl}/search/multi?api_key={_tmdbSettings.ApiKey}&query={Uri.EscapeDataString(query)}&page={page}";
            var response = await GetAsync<TmdbPagedResponse<TmdbSearchResult>>(url);
            return MapToPagedResponse(response);
        }

        public async Task<PagedResponse<MediaDto>?> GetTrendingAsync()
        {
            return await GetCachedAsync(
                "tmdb:trending",
                async () =>
                {
                    var response = await GetAsync<TmdbPagedResponse<TmdbSearchResult>>($"{_tmdbSettings.BaseUrl}/trending/all/day?api_key={_tmdbSettings.ApiKey}");
                    return MapToPagedResponse(response);
                });
        }

        public async Task<PagedResponse<MediaDto>?> DiscoverAsync(int page = 1)
        {
            var url = $"{_tmdbSettings.BaseUrl}/discover/movie?api_key={_tmdbSettings.ApiKey}&page={page}&sort_by=popularity.desc";
            return await GetCachedAsync(
                $"tmdb:discover:{page}",
                async () =>
                {
                    var response = await GetAsync<TmdbPagedResponse<TmdbSearchResult>>(url);
                    return MapToPagedResponse(response);
                });
        }

        public async Task<MediaDetailsDto?> GetMediaDetailsAsync(int id, string type = "movie")
        {
            var url = $"{_tmdbSettings.BaseUrl}/{type}/{id}?api_key={_tmdbSettings.ApiKey}&append_to_response=credits,videos";
            var details = await GetAsync<TmdbMovieDetails>(url);
            return details != null ? MapToMediaDetailsDto(details) : null;
        }

        public Task<TmdbWatchProvidersResponse?> GetWatchProvidersAsync(int id, string type = "movie")
        {
            var url = $"{_tmdbSettings.BaseUrl}/{type}/{id}/watch/providers?api_key={_tmdbSettings.ApiKey}";
            return GetAsync<TmdbWatchProvidersResponse>(url);
        }

        public async Task<PagedResponse<MediaDto>?> GetSimilarMoviesAsync(int id, int page = 1, string type = "movie")
        {
            var url = $"{_tmdbSettings.BaseUrl}/{type}/{id}/similar?api_key={_tmdbSettings.ApiKey}&page={page}";
            return await GetCachedAsync(
                $"tmdb:similar:{type}:{id}:{page}",
                async () =>
                {
                    var response = await GetAsync<TmdbPagedResponse<TmdbSearchResult>>(url);
                    return MapToPagedResponse(response);
                });
        }

        public async Task<PagedResponse<MediaDto>?> GetRecommendedMoviesAsync(int id, int page = 1, string type = "movie")
        {
            var url = $"{_tmdbSettings.BaseUrl}/{type}/{id}/recommendations?api_key={_tmdbSettings.ApiKey}&page={page}";
            return await GetCachedAsync(
                $"tmdb:recommendations:{type}:{id}:{page}",
                async () =>
                {
                    var response = await GetAsync<TmdbPagedResponse<TmdbSearchResult>>(url);
                    return MapToPagedResponse(response);
                });
        }

        private MediaDto MapToMediaDto(TmdbSearchResult result) => new()
        {
            Id = result.Id,
            Title = result.Title ?? result.Name ?? "Unknown",
            MediaType = result.MediaType ?? "movie",
            ReleaseDate = result.ReleaseDate ?? result.FirstAirDate,
            PosterPath = result.PosterPath
        };

        private MediaDetailsDto MapToMediaDetailsDto(TmdbMovieDetails details) => new()
        {
            Id = details.Id,
            Title = details.Title ?? details.Name ?? "Unknown",
            Overview = details.Overview,
            Tagline = details.Tagline,
            PosterPath = details.PosterPath,
            ReleaseDate = details.ReleaseDate ?? details.FirstAirDate,
            Runtime = details.Runtime ?? (details.EpisodeRunTime?.FirstOrDefault()),
            Genres = details.Genres.Select(g => g.Name ?? "").Where(n => !string.IsNullOrEmpty(n)).ToList(),
            Cast = details.Credits?.Cast.Take(10).Select(c => new CastMemberDto(c.Id, c.Name ?? "", c.Character, c.ProfilePath)).ToList() ?? new()
        };

        private PagedResponse<MediaDto>? MapToPagedResponse(TmdbPagedResponse<TmdbSearchResult>? response)
        {
            if (response == null) return null;

            return new PagedResponse<MediaDto>
            {
                Items = response.Results.Select(MapToMediaDto).ToList(),
                TotalCount = response.TotalResults,
                NextCursor = response.Page < response.TotalPages ? (response.Page + 1).ToString() : null
            };
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
