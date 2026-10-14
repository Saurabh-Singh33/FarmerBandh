using FarmerBandh.Application.DTOs.Admin;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminSettingsService
{
    Task<AdminPlatformSettingsDto> GetSettingsAsync();
    Task<bool> UpdateSettingsAsync(UpdatePlatformSettingsRequest request, Guid currentAdminId, HttpContext? httpContext = null);
}
