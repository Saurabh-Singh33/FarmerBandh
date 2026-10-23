using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Services;

public class AdminProfileService : IAdminProfileService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IActivityLogger _activityLogger;

    public AdminProfileService(IAdminRepository adminRepository, IActivityLogger activityLogger)
    {
        _adminRepository = adminRepository;
        _activityLogger = activityLogger;
    }

    public async Task<AdminProfileDto?> GetProfileAsync(Guid currentAdminId)
    {
        var user = await _adminRepository.GetUserByIdAsync(currentAdminId);
        if (user == null) return null;

        return new AdminProfileDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = null,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Role = user.Role.ToString(),
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }

    public async Task<bool> UpdateProfileAsync(Guid currentAdminId, UpdateAdminProfileRequest request, HttpContext? httpContext = null)
    {
        var user = await _adminRepository.GetUserByIdAsync(currentAdminId);
        if (user == null) return false;

        user.FullName = request.FullName.Trim();
        if (request.ProfilePictureUrl != null)
        {
            user.ProfilePictureUrl = string.IsNullOrWhiteSpace(request.ProfilePictureUrl) ? null : request.ProfilePictureUrl.Trim();
        }
        user.UpdatedAt = DateTime.UtcNow;
        await _adminRepository.UpdateUserAsync(user);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "ADMIN_PROFILE_UPDATED",
            targetType: "User",
            targetId: user.Id,
            summary: $"Admin updated personal profile name to '{user.FullName}'",
            metadata: $"{{\"fullName\":\"{user.FullName}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> ChangePasswordAsync(Guid currentAdminId, ChangeAdminPasswordRequest request, HttpContext? httpContext = null)
    {
        var user = await _adminRepository.GetUserByIdAsync(currentAdminId);
        if (user == null) return false;

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Current password is incorrect.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _adminRepository.UpdateUserAsync(user);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "ADMIN_PASSWORD_CHANGED",
            targetType: "User",
            targetId: user.Id,
            summary: "Admin changed personal account password",
            metadata: null,
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }
}
