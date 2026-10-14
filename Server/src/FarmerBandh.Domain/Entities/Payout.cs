using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Domain.Entities;

public class Payout
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PayoutNumber { get; set; } = string.Empty;
    public Guid FarmerId { get; set; }
    public decimal Amount { get; set; }
    public PayoutStatus Status { get; set; } = PayoutStatus.Pending;
    public PayoutMethod Method { get; set; } = PayoutMethod.BankTransfer;
    public string BankAccountNameSnapshot { get; set; } = string.Empty;
    public string BankAccountNumberSnapshot { get; set; } = string.Empty;
    public string IfscCodeSnapshot { get; set; } = string.Empty;
    public string? UpiIdSnapshot { get; set; }
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? FailedAt { get; set; }
    public string? FailureReason { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }

    public Farmer Farmer { get; set; } = null!;
}
