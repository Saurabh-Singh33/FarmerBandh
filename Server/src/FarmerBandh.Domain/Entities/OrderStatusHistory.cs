using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Domain.Entities;

public class OrderStatusHistory
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public OrderStatus Status { get; set; }
    public Guid ChangedByUserId { get; set; }
    public UserRole ChangedByRole { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Order? Order { get; set; }
    public User? ChangedByUser { get; set; }
}
