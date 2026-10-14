using FarmerBandh.Application.DTOs.Admin;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminProfileService
{
    Task<AdminProfileDto?> GetProfileAsync(Guid currentAdminId);
    Task<bool> UpdateProfileAsync(Guid currentAdminId, UpdateAdminProfileRequest request, HttpContext? httpContext = null);
    Task<bool> ChangePasswordAsync(Guid currentAdminId, ChangeAdminPasswordRequest request, HttpContext? httpContext = null);
}
