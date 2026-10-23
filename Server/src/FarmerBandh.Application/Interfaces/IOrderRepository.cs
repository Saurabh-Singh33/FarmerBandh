using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface IOrderRepository
{
    Task<Order> CreateOrderAsync(Order order);
    Task<Order?> GetByIdAsync(Guid orderId);
    Task<(IEnumerable<Order> Items, int TotalCount)> GetBuyerOrdersAsync(Guid buyerId, string? status, string? search, int page, int pageSize);
    Task<(IEnumerable<Order> Items, int TotalCount)> GetSellerOrdersAsync(Guid sellerId, string? status, string? search, int page, int pageSize);
    Task UpdateOrderAsync(Order order);
    Task DeleteOrderAsync(Order order);
    Task<int> GetActiveBuyerOrdersCountAsync(Guid buyerId);
}

