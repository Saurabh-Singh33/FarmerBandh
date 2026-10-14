using FarmerBandh.Application.DTOs.Timeline;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Interfaces;

public interface ITimelineService
{
    Task LogStatusChangeAsync(Guid orderId, OrderStatus status, Guid userId, UserRole role, string? note = null);
    Task<List<OrderStatusHistoryDto>> GetTimelineAsync(Guid userId, UserRole role, Guid orderId);
}
