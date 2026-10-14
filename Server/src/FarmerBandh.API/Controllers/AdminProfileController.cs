using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[Route("api/v1/admin/profile")]
public class AdminProfileController : AdminBaseController
{
    private readonly IAdminProfileService _profileService;

    public AdminProfileController(IAdminProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet]
    public async Task<ActionResult<AdminProfileDto>> GetProfile()
    {
        var profile = await _profileService.GetProfileAsync(GetAdminUserId());
        if (profile == null) return NotFound(new { message = "Admin profile not found." });
        return Ok(profile);
    }

    [HttpPut]
    public async Task<ActionResult> UpdateProfile([FromBody] UpdateAdminProfileRequest request)
    {
        var success = await _profileService.UpdateProfileAsync(GetAdminUserId(), request, HttpContext);
        if (!success) return BadRequest(new { message = "Failed to update profile." });
        return Ok(new { message = "Profile updated successfully." });
    }

    [HttpPut("password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangeAdminPasswordRequest request)
    {
        try
        {
            var success = await _profileService.ChangePasswordAsync(GetAdminUserId(), request, HttpContext);
            if (!success) return BadRequest(new { message = "Failed to change password." });
            return Ok(new { message = "Password changed successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
