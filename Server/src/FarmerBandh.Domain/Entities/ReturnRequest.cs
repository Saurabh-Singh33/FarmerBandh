using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Domain.Entities;

public class ReturnRequest
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid BuyerId { get; set; }
    public Guid SellerId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public ReturnReasonCategory ReasonCategory { get; set; }
    public ReturnStatus Status { get; set; } = ReturnStatus.Requested;
    public string? SellerResponse { get; set; }
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RespondedAt { get; set; }
    public DateTime? RefundedAt { get; set; }

    // Navigation
    public Order? Order { get; set; }
    public Buyer? Buyer { get; set; }
    public Farmer? Seller { get; set; }
    public ICollection<ReturnItem> Items { get; set; } = new List<ReturnItem>();
    public ICollection<ReturnMessage> Messages { get; set; } = new List<ReturnMessage>();
    public Refund? Refund { get; set; }
}
