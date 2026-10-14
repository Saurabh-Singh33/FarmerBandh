using System.Security.Claims;
using FarmerBandh.Application.DTOs.Seller;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/seller/analytics")]
[Authorize(Roles = "Farmer")]
public class SellerAnalyticsController : ControllerBase
{
    private readonly ISellerAnalyticsService _analyticsService;

    public SellerAnalyticsController(ISellerAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<AnalyticsOverviewDto>> GetOverview([FromQuery] string? range)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var (from, to, _) = ResolveRange(range);
        try
        {
            var result = await _analyticsService.GetOverviewAsync(userId, from, to);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpGet("revenue")]
    public async Task<ActionResult<List<RevenueTimeSeriesPointDto>>> GetRevenue([FromQuery] string? range)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var (from, to, gran) = ResolveRange(range);
        try
        {
            var result = await _analyticsService.GetRevenueTimeSeriesAsync(userId, gran, from, to);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    private static (DateTime from, DateTime to, string granularity) ResolveRange(string? range)
    {
        var to = DateTime.UtcNow;
        return (range?.ToLowerInvariant()) switch
        {
            "7d" => (to.AddDays(-7), to, "day"),
            "90d" => (to.AddDays(-90), to, "week"),
            "1y" => (to.AddYears(-1), to, "month"),
            _ => (to.AddDays(-30), to, "day")
        };
    }

    [HttpGet("top-products")]
    public async Task<ActionResult<List<TopProductDto>>> GetTopProducts([FromQuery] int limit = 5)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _analyticsService.GetTopProductsAsync(userId, limit);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpGet("categories")]
    public async Task<ActionResult<List<CategoryBreakdownDto>>> GetCategories()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _analyticsService.GetCategoryBreakdownAsync(userId);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpGet("buyer-locations")]
    public async Task<ActionResult<List<BuyerLocationDto>>> GetBuyerLocations()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _analyticsService.GetBuyerLocationsAsync(userId);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpGet("order-status")]
    public async Task<ActionResult<OrderStatusDistributionDto>> GetOrderStatus()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _analyticsService.GetOrderStatusDistributionAsync(userId);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    private Guid GetUserId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(subClaim, out var userId) ? userId : Guid.Empty;
    }
}
