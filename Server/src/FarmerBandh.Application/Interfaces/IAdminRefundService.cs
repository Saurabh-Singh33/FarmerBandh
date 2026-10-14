using FarmerBandh.Application.DTOs.Admin;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminRefundService
{
    Task<(IEnumerable<AdminRefundListItemDto> Items, int TotalCount)> GetRefundsAsync(AdminRefundQuery query);
    Task<AdminRefundDetailDto?> GetRefundDetailAsync(Guid id);
    Task<bool> ProcessRefundAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> FailRefundAsync(Guid id, AdminFailRefundRequest request, Guid currentAdminId, HttpContext? httpContext = null);
}
