using System.Security.Cryptography;
using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Services;

public class AdminUserService : IAdminUserService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IActivityLogger _activityLogger;

    public AdminUserService(IAdminRepository adminRepository, IActivityLogger activityLogger)
    {
        _adminRepository = adminRepository;
        _activityLogger = activityLogger;
    }

    public async Task<(IEnumerable<AdminUserListItemDto> Items, int TotalCount)> GetUsersAsync(AdminUserQuery query)
    {
        return await _adminRepository.GetUsersAsync(query);
    }

    public async Task<AdminUserDetailDto?> GetUserDetailAsync(Guid id)
    {
        return await _adminRepository.GetUserDetailAsync(id);
    }

    public async Task<bool> SuspendUserAsync(Guid id, SuspendUserRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        if (id == currentAdminId)
        {
            throw new InvalidOperationException("You cannot suspend your own account.");
        }

        var user = await _adminRepository.GetUserByIdAsync(id);
        if (user == null) return false;

        user.Status = UserStatus.Suspended;
        user.UpdatedAt = DateTime.UtcNow;
        await _adminRepository.UpdateUserAsync(user);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "USER_SUSPENDED",
            targetType: "User",
            targetId: user.Id,
            summary: $"Suspended user {user.FullName} ({user.Email}). Reason: {request.Reason}",
            metadata: $"{{\"reason\":\"{request.Reason.Replace("\"", "\\\"")}\",\"previousStatus\":\"Active\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> ReactivateUserAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var user = await _adminRepository.GetUserByIdAsync(id);
        if (user == null) return false;

        user.Status = UserStatus.Active;
        user.UpdatedAt = DateTime.UtcNow;
        await _adminRepository.UpdateUserAsync(user);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "USER_REACTIVATED",
            targetType: "User",
            targetId: user.Id,
            summary: $"Reactivated user {user.FullName} ({user.Email})",
            metadata: $"{{\"previousStatus\":\"Suspended\",\"newStatus\":\"Active\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<ResetPasswordResponse?> ResetPasswordAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        if (id == currentAdminId)
        {
            throw new InvalidOperationException("You cannot reset your own password via admin endpoint.");
        }

        var user = await _adminRepository.GetUserByIdAsync(id);
        if (user == null) return null;

        var tempPassword = "Temp@" + RandomNumberGenerator.GetInt32(100000, 999999);
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _adminRepository.UpdateUserAsync(user);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "USER_PASSWORD_RESET",
            targetType: "User",
            targetId: user.Id,
            summary: $"Generated temporary password for user {user.FullName} ({user.Email})",
            metadata: $"{{\"targetEmail\":\"{user.Email}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return new ResetPasswordResponse
        {
            TemporaryPassword = tempPassword,
            Message = "Temporary password generated. It will only be displayed once."
        };
    }

    public async Task<bool> PromoteUserAsync(Guid id, PromoteUserRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var currentAdmin = await _adminRepository.GetUserByIdAsync(currentAdminId);
        if (currentAdmin == null || !BCrypt.Net.BCrypt.Verify(request.CurrentAdminPassword, currentAdmin.PasswordHash))
        {
            throw new UnauthorizedAccessException("Incorrect admin password confirmation.");
        }

        var user = await _adminRepository.GetUserByIdAsync(id);
        if (user == null) return false;

        if (user.Role == UserRole.Admin)
        {
            throw new InvalidOperationException("User is already an Admin.");
        }

        var oldRole = user.Role.ToString();
        user.Role = UserRole.Admin;
        user.UpdatedAt = DateTime.UtcNow;
        await _adminRepository.UpdateUserAsync(user);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "USER_PROMOTED_ADMIN",
            targetType: "User",
            targetId: user.Id,
            summary: $"Promoted user {user.FullName} ({user.Email}) to Admin",
            metadata: $"{{\"previousRole\":\"{oldRole}\",\"newRole\":\"Admin\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> DemoteUserAsync(Guid id, DemoteUserRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        if (id == currentAdminId)
        {
            throw new InvalidOperationException("You cannot demote yourself.");
        }

        var user = await _adminRepository.GetUserByIdAsync(id);
        if (user == null) return false;

        if (user.Role != UserRole.Admin)
        {
            throw new InvalidOperationException("User is not an Admin.");
        }

        var targetRole = request.Role.ToLower() == "farmer" ? UserRole.Farmer : UserRole.Buyer;
        user.Role = targetRole;
        user.UpdatedAt = DateTime.UtcNow;
        await _adminRepository.UpdateUserAsync(user);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "USER_DEMOTED",
            targetType: "User",
            targetId: user.Id,
            summary: $"Demoted admin user {user.FullName} ({user.Email}) to {targetRole}",
            metadata: $"{{\"previousRole\":\"Admin\",\"newRole\":\"{targetRole}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }
}
