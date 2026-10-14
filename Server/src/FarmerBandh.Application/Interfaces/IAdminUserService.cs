using FarmerBandh.Application.DTOs.Admin;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminUserService
{
    Task<(IEnumerable<AdminUserListItemDto> Items, int TotalCount)> GetUsersAsync(AdminUserQuery query);
    Task<AdminUserDetailDto?> GetUserDetailAsync(Guid id);
    Task<bool> SuspendUserAsync(Guid id, SuspendUserRequest request, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> ReactivateUserAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<ResetPasswordResponse?> ResetPasswordAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> PromoteUserAsync(Guid id, PromoteUserRequest request, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> DemoteUserAsync(Guid id, DemoteUserRequest request, Guid currentAdminId, HttpContext? httpContext = null);
}
