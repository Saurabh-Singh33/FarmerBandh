namespace FarmerBandh.Application.DTOs.Seller;

public class PayoutSummaryDto
{
    public decimal TotalEarned { get; set; }
    public decimal TotalPaidOut { get; set; }
    public decimal PendingPayoutAmount { get; set; }
    public decimal AvailableForPayout { get; set; }
    public decimal MinimumPayoutAmount { get; set; } = 500m;
    public DateTime? NextScheduledPayoutAt { get; set; }
    public DateTime? LastPayoutAt { get; set; }
    public decimal? LastPayoutAmount { get; set; }
}

public class PayoutItemDto
{
    public Guid Id { get; set; }
    public string PayoutNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Pending";
    public string Method { get; set; } = "BankTransfer";
    public DateTime RequestedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Reference { get; set; }
    public string MaskedBankAccount { get; set; } = string.Empty;
    public string? MaskedUpiId { get; set; }
    public string? Notes { get; set; }
    public string? FailureReason { get; set; }
}

public class RequestPayoutDto
{
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
}

public class PayoutQueryParams
{
    public string? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
