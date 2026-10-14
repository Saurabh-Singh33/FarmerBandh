namespace FarmerBandh.Application.DTOs.Admin;

public class AdminVerificationQuery
{
    public string? Status { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class AdminVerificationListItemDto
{
    public Guid Id { get; set; }
    public string RequestNumber { get; set; } = string.Empty;
    public Guid FarmerId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public string FarmName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string MaskedAadhaar { get; set; } = string.Empty;
    public List<string> FileNames { get; set; } = new();
    public DateTime SubmittedAt { get; set; }
}

public class AdminVerificationDetailDto
{
    public Guid Id { get; set; }
    public string RequestNumber { get; set; } = string.Empty;
    public Guid FarmerId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public string FarmName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string MaskedAadhaar { get; set; } = string.Empty;
    public string? LandRecordUrl { get; set; }
    public string? SelfieUrl { get; set; }
    public string? Notes { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedByName { get; set; }
}

public class RejectVerificationRequest
{
    public string Reason { get; set; } = string.Empty;
}
