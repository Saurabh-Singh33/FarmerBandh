using FarmerBandh.Application.DTOs.Timeline;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class TimelineService : ITimelineService
{
    private readonly ITimelineRepository _timelineRepository;
    private readonly IOrderRepository _orderRepository;

    public TimelineService(ITimelineRepository timelineRepository, IOrderRepository orderRepository)
    {
        _timelineRepository = timelineRepository;
        _orderRepository = orderRepository;
    }

    public async Task LogStatusChangeAsync(Guid orderId, OrderStatus status, Guid userId, UserRole role, string? note = null)
    {
        var history = new OrderStatusHistory
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            Status = status,
            ChangedByUserId = userId,
            ChangedByRole = role,
            Note = note,
            CreatedAt = DateTime.UtcNow
        };
        await _timelineRepository.AddAsync(history);
    }

    public async Task<List<OrderStatusHistoryDto>> GetTimelineAsync(Guid userId, UserRole role, Guid orderId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null)
        {
            throw new KeyNotFoundException("Order not found.");
        }

        // Access check: Buyer must own order, or Seller must own order, or Admin
        if (role == UserRole.Buyer && order.Buyer.UserId != userId)
        {
            throw new UnauthorizedAccessException("Access denied.");
        }
        if (role == UserRole.Farmer && order.Seller.UserId != userId)
        {
            throw new UnauthorizedAccessException("Access denied.");
        }

        var historyList = await _timelineRepository.GetByOrderIdAsync(orderId);
        return historyList.Select(h => new OrderStatusHistoryDto
        {
            Id = h.Id,
            OrderId = h.OrderId,
            Status = (int)h.Status,
            StatusLabel = h.Status.ToString(),
            ChangedByRole = h.ChangedByRole.ToString(),
            ChangedByName = h.ChangedByUser?.FullName ?? "System",
            Note = h.Note,
            CreatedAt = h.CreatedAt
        }).ToList();
    }
}
