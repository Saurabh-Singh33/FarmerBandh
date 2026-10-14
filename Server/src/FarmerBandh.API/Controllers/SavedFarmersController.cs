using System.Security.Claims;
using FarmerBandh.Application.DTOs.SavedFarmers;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/saved-farmers")]
[Route("api/saved-farmers")]
[Route("saved-farmers")]
[Authorize(Roles = "Buyer,buyer")]
public class SavedFarmersController : ControllerBase
{
    private readonly ISavedFarmerService _savedFarmerService;

    public SavedFarmersController(ISavedFarmerService savedFarmerService)
    {
        _savedFarmerService = savedFarmerService;
    }

    // 14. GET /saved-farmers - List buyer's saved farmers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SavedFarmerDto>>> GetSavedFarmers()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var list = await _savedFarmerService.GetSavedFarmersAsync(userId);
        return Ok(list);
    }

    // 15. POST /saved-farmers - Save or update note (idempotent)
    [HttpPost]
    public async Task<ActionResult<SavedFarmerDto>> SaveFarmer([FromBody] SaveFarmerRequestDto request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _savedFarmerService.SaveFarmerAsync(userId, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message, statusCode = 404 });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message, statusCode = 403 });
        }
    }

    // 16. DELETE /saved-farmers/{farmerId} - Removes bookmark
    [HttpDelete("{farmerId:guid}")]
    public async Task<IActionResult> RemoveSavedFarmer(Guid farmerId)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            await _savedFarmerService.RemoveSavedFarmerAsync(userId, farmerId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message, statusCode = 404 });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message, statusCode = 403 });
        }
    }

    // 17. GET /saved-farmers/check/{farmerId} - Check bookmark status
    [HttpGet("check/{farmerId:guid}")]
    public async Task<ActionResult<SavedFarmerCheckDto>> CheckSavedFarmer(Guid farmerId)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var result = await _savedFarmerService.CheckIsSavedAsync(userId, farmerId);
        return Ok(result);
    }

    private Guid GetUserId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(subClaim, out var userId) ? userId : Guid.Empty;
    }
}
