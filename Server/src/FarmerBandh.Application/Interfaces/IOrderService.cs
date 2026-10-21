using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.CartAndOrders;

namespace FarmerBandh.Application.Interfaces;

public interface IOrderService
{
    Task<OrderPlacementResultDto> CreateOrderAsync(Guid userId, CreateOrderRequest request);
    Task<PagedResultDto<OrderSummaryDto>> GetBuyerOrdersAsync(Guid userId, string? status, string? search, int page, int pageSize);
    Task<OrderDetailDto> GetBuyerOrderByIdAsync(Guid userId, Guid orderId);
    Task CancelBuyerOrderAsync(Guid userId, Guid orderId, string? reason);
    Task DeleteBuyerOrderAsync(Guid userId, Guid orderId);
    Task<OrderPlacementResultDto> ReorderAsync(Guid userId, Guid orderId);

    Task<PagedResultDto<OrderSummaryDto>> GetSellerOrdersAsync(Guid userId, string? status, string? search, int page, int pageSize);
    Task<OrderDetailDto> GetSellerOrderByIdAsync(Guid userId, Guid orderId);
    Task<OrderDetailDto> UpdateSellerOrderStatusAsync(Guid userId, Guid orderId, UpdateOrderStatusRequest request);
    Task<OrderDetailDto> RejectSellerOrderAsync(Guid userId, Guid orderId, RejectOrderRequest request);
    Task<OrderDetailDto> RecordOrderPaymentAsync(Guid userId, Guid orderId, RecordPaymentRequest request);
    Task<OrderDetailDto> UpdateSellerOrderPaymentStatusAsync(Guid userId, Guid orderId, UpdatePaymentStatusRequest request);
    Task<PublicSettingsDto> GetPublicSettingsAsync();
}
