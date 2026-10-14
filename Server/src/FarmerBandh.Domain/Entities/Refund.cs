using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Domain.Entities;

public class Refund
{
    public Guid Id { get; set; }
    public Guid ReturnRequestId { get; set; }
    public Guid OrderId { get; set; }
    public Guid BuyerId { get; set; }
    public Guid SellerId { get; set; }
    public decimal Amount { get; set; }
    public RefundMethod Method { get; set; } = RefundMethod.OriginalPayment;
    public RefundStatus Status { get; set; } = RefundStatus.Pending;
    public DateTime? ProcessedAt { get; set; }
    public string? Reference { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ReturnRequest? ReturnRequest { get; set; }
    public Order? Order { get; set; }
    public Buyer? Buyer { get; set; }
    public Farmer? Seller { get; set; }
}
