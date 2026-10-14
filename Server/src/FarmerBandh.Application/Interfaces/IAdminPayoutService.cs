using FarmerBandh.Application.DTOs.Admin;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminPayoutService
{
    Task<(IEnumerable<AdminPayoutListItemDto> Items, int TotalCount)> GetPayoutsAsync(AdminPayoutQuery query);
    Task<AdminPayoutDetailDto?> GetPayoutDetailAsync(Guid id);
    Task<bool> ProcessPayoutAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> MarkFailedAsync(Guid id, AdminMarkPayoutFailedRequest request, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> RetryPayoutAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<int> BulkProcessPayoutsAsync(AdminBulkProcessPayoutRequest request, Guid currentAdminId, HttpContext? httpContext = null);
}
