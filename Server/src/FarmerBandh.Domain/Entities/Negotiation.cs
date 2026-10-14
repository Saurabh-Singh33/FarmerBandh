using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Domain.Entities;

public class Negotiation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BuyerId { get; set; }
    public Guid FarmerId { get; set; }
    public Guid ProductId { get; set; }

    public decimal InitialPricePerQuintal { get; set; }
    public decimal CurrentOfferPrice { get; set; }
    public Guid CurrentOfferByUserId { get; set; }
    public UserRole CurrentOfferByRole { get; set; }
    public decimal? LastCounterPrice { get; set; }

    public NegotiationStatus Status { get; set; } = NegotiationStatus.Open;
    public decimal? AgreedPricePerQuintal { get; set; }
    public decimal? QuantityQuintal { get; set; }

    public bool IsBundle { get; set; } = false;
    public string? BundleItemsJson { get; set; }

    public DateTime OpenedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(48);

    public DateTime? AcceptedAt { get; set; }
    public DateTime? RejectedAt { get; set; }
    public DateTime? ExpiredAt { get; set; }
    public DateTime? WithdrawnAt { get; set; }
    public string? RejectionReason { get; set; }

    // Navigation properties
    public Buyer? Buyer { get; set; }
    public Farmer? Farmer { get; set; }
    public Product? Product { get; set; }
    public User? CurrentOfferByUser { get; set; }
    public ICollection<NegotiationMessage> Messages { get; set; } = new List<NegotiationMessage>();
}
