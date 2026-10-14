using FarmerBandh.Application.DTOs.Admin;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminDisputeService
{
    Task<(IEnumerable<AdminDisputeListItemDto> Items, int TotalCount)> GetDisputesAsync(AdminDisputeQuery query);
    Task<AdminDisputeDetailDto?> GetDisputeDetailAsync(Guid id);
    Task<bool> EscalateDisputeAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> ResolveDisputeAsync(Guid id, AdminResolveDisputeRequest request, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> CloseDisputeAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> PostMessageAsync(Guid id, AdminPostDisputeMessageRequest request, Guid currentAdminId, HttpContext? httpContext = null);
}
