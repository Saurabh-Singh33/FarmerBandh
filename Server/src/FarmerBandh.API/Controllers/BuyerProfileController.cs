using System.Security.Claims;
using FarmerBandh.Application.DTOs.Buyer;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/buyer/profile")]
[Authorize]
public class BuyerProfileController : ControllerBase
{
    private readonly IBuyerProfileService _profileService;

    public BuyerProfileController(IBuyerProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet]
    public async Task<ActionResult<BuyerProfileDto>> GetProfile()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var profile = await _profileService.GetProfileAsync(userId);
            return Ok(profile);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpPut]
    public async Task<ActionResult<BuyerProfileDto>> UpdateProfile([FromBody] UpdateBuyerProfileRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var updated = await _profileService.UpdateProfileAsync(userId, request);
            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangeBuyerPasswordRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            await _profileService.ChangePasswordAsync(userId, request);
            return Ok(new { message = "Password updated successfully." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
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
