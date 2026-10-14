using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Domain.Entities;

public class Dispute
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid RaisedByUserId { get; set; }
    public UserRole RaisedByRole { get; set; }
    public Guid AgainstUserId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public DisputeCategory Category { get; set; }
    public DisputeStatus Status { get; set; } = DisputeStatus.Open;
    public DateTime OpenedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
    public string? ResolutionNote { get; set; }

    // Navigation
    public Order? Order { get; set; }
    public User? RaisedByUser { get; set; }
    public User? AgainstUser { get; set; }
    public ICollection<DisputeMessage> Messages { get; set; } = new List<DisputeMessage>();
}
