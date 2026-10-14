using FarmerBandh.Application.DTOs.Admin;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminOrderService
{
    Task<(IEnumerable<AdminOrderListItemDto> Items, int TotalCount)> GetOrdersAsync(AdminOrderQuery query);
    Task<AdminOrderDetailDto?> GetOrderDetailAsync(Guid id);
    Task<bool> RefundOrderAsync(Guid id, AdminOrderRefundRequest request, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> ForceCompleteOrderAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> CancelOrderAsync(Guid id, AdminOrderCancelRequest request, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> OverrideStatusAsync(Guid id, AdminOrderStatusOverrideRequest request, Guid currentAdminId, HttpContext? httpContext = null);
}
