using System.Security.Claims;
using FarmerBandh.Application.DTOs.Timeline;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/orders/{id:guid}/timeline")]
[Authorize]
public class TimelineController : ControllerBase
{
    private readonly ITimelineService _timelineService;

    public TimelineController(ITimelineService timelineService)
    {
        _timelineService = timelineService;
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderStatusHistoryDto>>> GetTimeline(Guid id)
    {
        var userId = GetUserId();
        var role = GetUserRole();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var timeline = await _timelineService.GetTimelineAsync(userId, role, id);
            return Ok(timeline);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    private Guid GetUserId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(subClaim, out var userId) ? userId : Guid.Empty;
    }

    private UserRole GetUserRole()
    {
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        if (Enum.TryParse<UserRole>(roleClaim, true, out var role))
        {
            return role;
        }
        return UserRole.Buyer;
    }
}
