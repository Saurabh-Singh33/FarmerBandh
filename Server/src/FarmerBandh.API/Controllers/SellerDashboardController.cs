using System.Security.Claims;
using FarmerBandh.Application.DTOs.Seller;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/seller/dashboard")]
[Authorize(Roles = "Farmer")]
public class SellerDashboardController : ControllerBase
{
    private readonly ISellerDashboardService _dashboardService;

    public SellerDashboardController(ISellerDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<ActionResult<SellerDashboardDto>> GetDashboard()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var summary = await _dashboardService.GetDashboardAsync(userId);
            return Ok(summary);
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
