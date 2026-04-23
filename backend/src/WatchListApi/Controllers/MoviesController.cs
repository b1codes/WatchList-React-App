using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WatchListApi.Models;
using WatchListApi.Services;

namespace WatchListApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;

        public MoviesController(ITmdbService tmdbService)
        {
            _tmdbService = tmdbService;
        }

        [HttpGet("config")]
        public async Task<IActionResult> GetConfiguration()
        {
            var config = await _tmdbService.GetConfigurationAsync();
            return Ok(ApiResponse<TmdbConfiguration?>.Ok(config));
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchMulti([FromQuery] string query, [FromQuery] int page = 1)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(ApiResponse<string>.Fail("Query is required."));
            }

            var results = await _tmdbService.SearchMultiAsync(query, page);
            return Ok(ApiResponse<PagedResponse<MediaDto>?>.Ok(results));
        }

        [HttpGet("trending")]
        public async Task<IActionResult> GetTrending()
        {
            var results = await _tmdbService.GetTrendingAsync();
            return Ok(ApiResponse<PagedResponse<MediaDto>?>.Ok(results));
        }

        [HttpGet("discover")]
        public async Task<IActionResult> Discover([FromQuery] int page = 1)
        {
            if (page <= 0)
            {
                return BadRequest(ApiResponse<string>.Fail("Page must be greater than zero."));
            }

            var results = await _tmdbService.DiscoverAsync(page);
            return Ok(ApiResponse<PagedResponse<MediaDto>?>.Ok(results));
        }

        [HttpGet("details/{id:int}")]
        public async Task<IActionResult> GetDetails(int id, [FromQuery] string type = "movie")
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse<string>.Fail("Id must be greater than zero."));
            }

            var details = await _tmdbService.GetMediaDetailsAsync(id, type);
            var providers = await _tmdbService.GetWatchProvidersAsync(id, type);
            var response = new MovieDetailsResponse
            {
                Details = details,
                Providers = providers
            };

            return Ok(ApiResponse<MovieDetailsResponse>.Ok(response));
        }

        [HttpGet("similar/{id:int}")]
        public async Task<IActionResult> GetSimilar(int id, [FromQuery] int page = 1, [FromQuery] string type = "movie")
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse<string>.Fail("Id must be greater than zero."));
            }

            var results = await _tmdbService.GetSimilarMoviesAsync(id, page, type);
            return Ok(ApiResponse<PagedResponse<MediaDto>?>.Ok(results));
        }

        [HttpGet("recommendations/{id:int}")]
        public async Task<IActionResult> GetRecommendations(int id, [FromQuery] int page = 1, [FromQuery] string type = "movie")
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse<string>.Fail("Id must be greater than zero."));
            }

            var results = await _tmdbService.GetRecommendedMoviesAsync(id, page, type);
            return Ok(ApiResponse<PagedResponse<MediaDto>?>.Ok(results));
        }
    }
}
