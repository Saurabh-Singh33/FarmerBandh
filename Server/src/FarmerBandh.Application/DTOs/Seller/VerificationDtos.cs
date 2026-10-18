namespace FarmerBandh.Application.DTOs.Seller;

public class VerificationStatusDto
{
    public string FarmerVerified { get; set; } = "Unverified"; // Unverified | Pending | Verified
    public VerificationRequestSummaryDto? CurrentRequest { get; set; }
    public bool CanSubmit { get; set; }
    public List<VerificationRequestSummaryDto> History { get; set; } = new();
}

public class VerificationRequestSummaryDto
{
    public Guid Id { get; set; }
    public string RequestNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTime SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? RejectionReason { get; set; }
    public string? Notes { get; set; }
    public string? AadhaarNumber { get; set; }
    public string? LandRecordUrl { get; set; }
    public string? SelfieUrl { get; set; }
}

public class SubmitVerificationRequest
{
    public string? AadhaarNumber { get; set; }
    public string? LandRecordUrl { get; set; }
    public string? SelfieUrl { get; set; }
    public string? Notes { get; set; }
}

public class MockRejectVerificationRequest
{
    public string Reason { get; set; } = string.Empty;
}
