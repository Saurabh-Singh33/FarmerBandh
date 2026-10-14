using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Domain.Entities;

public class NegotiationMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid NegotiationId { get; set; }
    public Guid SenderUserId { get; set; }
    public UserRole SenderRole { get; set; }
    public NegotiationMessageType MessageType { get; set; } = NegotiationMessageType.Text;

    public string? Body { get; set; }
    public decimal? OfferPrice { get; set; }
    public decimal? QuantityQuintal { get; set; }
    public string? BundleItemsJson { get; set; }

    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Negotiation? Negotiation { get; set; }
    public User? SenderUser { get; set; }
}
