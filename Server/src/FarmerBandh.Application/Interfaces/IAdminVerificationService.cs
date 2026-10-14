using FarmerBandh.Application.DTOs.Admin;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminVerificationService
{
    Task<(IEnumerable<AdminVerificationListItemDto> Items, int TotalCount)> GetVerificationsAsync(AdminVerificationQuery query);
    Task<AdminVerificationDetailDto?> GetVerificationDetailAsync(Guid id);
    Task<bool> ApproveVerificationAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> RejectVerificationAsync(Guid id, RejectVerificationRequest request, Guid currentAdminId, HttpContext? httpContext = null);
}
