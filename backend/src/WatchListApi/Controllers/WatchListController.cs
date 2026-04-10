using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WatchListApi.Models;
using WatchListApi.Repositories;

namespace WatchListApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WatchListController : ControllerBase
{
    private readonly WatchListRepository _watchListRepository;

    public WatchListController(WatchListRepository watchListRepository)
    {
        _watchListRepository = watchListRepository;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Missing user context."));
        }

        var items = await _watchListRepository.GetWatchlistByUserIdAsync(userId);
        return Ok(ApiResponse<List<WatchListItem>>.Ok(items));
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateWatchListItemRequest newItem)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Missing user context."));
        }

        if (newItem.TmdbId <= 0 || string.IsNullOrWhiteSpace(newItem.Title) || string.IsNullOrWhiteSpace(newItem.Type))
        {
            return BadRequest(ApiResponse<string>.Fail("TmdbId, Title, and Type are required."));
        }

        await _watchListRepository.AddToWatchlistAsync(userId, newItem);
        return Ok(ApiResponse<string>.Ok("Added."));
    }

    [HttpDelete("{tmdbId:int}")]
    public async Task<IActionResult> Delete(int tmdbId)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Missing user context."));
        }

        await _watchListRepository.RemoveFromWatchlistAsync(userId, tmdbId);
        return Ok(ApiResponse<string>.Ok("Removed."));
    }

    private string? GetUserId()
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            return User.FindFirstValue("user_id")
                   ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? User.FindFirstValue("sub");
        }

        return null;
    }
}
