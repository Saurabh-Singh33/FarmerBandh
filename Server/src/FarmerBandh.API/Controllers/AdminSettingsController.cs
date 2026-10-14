using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[Route("api/v1/admin/settings")]
public class AdminSettingsController : AdminBaseController
{
    private readonly IAdminSettingsService _settingsService;

    public AdminSettingsController(IAdminSettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    public async Task<ActionResult<AdminPlatformSettingsDto>> GetSettings()
    {
        var settings = await _settingsService.GetSettingsAsync();
        return Ok(settings);
    }

    [HttpPut]
    public async Task<ActionResult> UpdateSettings([FromBody] UpdatePlatformSettingsRequest request)
    {
        var success = await _settingsService.UpdateSettingsAsync(request, GetAdminUserId(), HttpContext);
        if (!success) return BadRequest(new { message = "Failed to update platform settings." });
        return Ok(new { message = "Platform settings updated successfully." });
    }
}
