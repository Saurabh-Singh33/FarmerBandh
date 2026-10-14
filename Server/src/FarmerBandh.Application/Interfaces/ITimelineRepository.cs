using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface ITimelineRepository
{
    Task AddAsync(OrderStatusHistory history);
    Task<List<OrderStatusHistory>> GetByOrderIdAsync(Guid orderId);
}
