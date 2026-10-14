namespace FarmerBandh.Application.DTOs.Admin;

public class AdminPayoutQuery
{
    public string? Status { get; set; }
    public string? Search { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class AdminPayoutListItemDto
{
    public Guid Id { get; set; }
    public string PayoutNumber { get; set; } = string.Empty;
    public Guid FarmerId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public string FarmName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Method { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Reference { get; set; }
}

public class AdminPayoutDetailDto
{
    public Guid Id { get; set; }
    public string PayoutNumber { get; set; } = string.Empty;
    public Guid FarmerId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public string FarmName { get; set; } = string.Empty;
    public string FarmerEmail { get; set; } = string.Empty;
    public string FarmerPhone { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Method { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? BankAccountNameSnapshot { get; set; }
    public string? BankAccountNumberSnapshot { get; set; }
    public string? IfscCodeSnapshot { get; set; }
    public string? UpiIdSnapshot { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Reference { get; set; }
    public string? FailureReason { get; set; }
    public string? Notes { get; set; }

    public List<AdminPayoutListItemDto> FarmerPayoutHistory { get; set; } = new();
}

public class AdminMarkPayoutFailedRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class AdminBulkProcessPayoutRequest
{
    public List<Guid> Ids { get; set; } = new();
}
